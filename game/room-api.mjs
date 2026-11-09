import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { questions } from './questions.mjs';

const roomLifetime = 8 * 60 * 60 * 1000;
const maxPlayers = 60;
const roomCodePattern = /^\d{6}$/;
const tokenPattern = /^[a-f0-9]{64}$/;

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function fail(status, message) {
  throw new RequestError(status, message);
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function getScore(player, throughRound) {
  return Object.entries(player.answers).filter(([round, answer]) =>
    Number(round) <= throughRound && questions[round].correct === answer
  ).length;
}

function snapshot(room, role, participant) {
  const { code, phase, round, revision, players } = room;
  const question = questions[round];
  const revealing = phase === 'reveal';
  const throughRound = revealing || phase === 'finished' ? round : round - 1;
  const state = {
    code, phase, revision, role, round,
    totalRounds: questions.length,
    playerCount: players.length,
  };

  if (phase === 'question' || revealing) {
    const { topic, label, question: prompt, options, hint } = question;
    state.question = { topic, label, prompt, options, hint };
  }

  if (revealing) {
    const { correct, feedback, slide, source } = question;
    const counts = optionsCount(players, question.options.length, round);
    state.reveal = { correct, explanation: feedback[correct], slide, source, counts };
  }

  if (participant) {
    state.me = {
      name: participant.name,
      answer: participant.answers[round] ?? null,
      score: getScore(participant, throughRound),
    };
  }

  if (role === 'host' || phase === 'finished') {
    state.players = players.map(player => ({
      name: player.name,
      answered: Object.hasOwn(player.answers, round),
      totalAnswered: Object.keys(player.answers).length,
      score: getScore(player, throughRound),
    }));
  }

  return state;
}

function optionsCount(players, length, round) {
  const counts = Array(length).fill(0);
  for (const player of players) {
    const answer = player.answers[round];
    if (answer !== undefined) counts[answer] += 1;
  }
  return counts;
}

async function createRoom(store, hostCode, data, tokenHash) {
  if (!hostCode || hostCode.length < 8) {
    fail(503, 'El código privado del anfitrión todavía no está configurado.');
  }
  if (typeof data.hostCode !== 'string' || !timingSafeEqual(
    Buffer.from(digest(hostCode)), Buffer.from(digest(data.hostCode))
  )) {
    fail(403, 'El código privado del anfitrión es incorrecto.');
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = String(randomInt(100000, 1000000));
    const room = {
      code, host: tokenHash, phase: 'lobby', round: -1, revision: 0,
      expiresAt: Date.now() + roomLifetime, players: [],
    };
    if (await store.create(code, room)) return snapshot(room, 'host');
  }
  fail(503, 'No se pudo reservar un código. Intentá crear la sala de nuevo.');
}

function addPlayer(room, data, tokenHash) {
  if (room.phase !== 'lobby') fail(409, 'La partida ya comenzó. Usá tu pestaña original para volver.');
  if (room.players.length >= maxPlayers) fail(409, 'La sala llegó a su capacidad máxima.');
  const name = typeof data.name === 'string' ? data.name.normalize('NFKC').trim().replace(/\s+/gu, ' ') : '';
  if (name.length < 2 || name.length > 30 || /[\p{C}]/u.test(name)) {
    fail(400, 'Ingresá un nombre de 2 a 30 caracteres.');
  }
  if (room.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
    fail(409, 'Ese nombre ya está en uso. Elegí otro.');
  }
  const player = { token: tokenHash, name, answers: {} };
  room.players.push(player);
  return player;
}

function advance(room, action) {
  if (action === 'start' && room.phase === 'lobby' && room.players.length > 0) {
    room.phase = 'question';
    room.round = 0;
    return;
  }

  if (action === 'reveal' && room.phase === 'question') {
    room.phase = 'reveal';
    return;
  }

  if (action === 'next' && room.phase === 'reveal') {
    if (room.round === questions.length - 1) {
      room.phase = 'finished';
    } else {
      room.round += 1;
      room.phase = 'question';
    }
    return;
  }

  fail(409, 'La partida cambió o todavía no se puede realizar esa acción.');
}

function applyAction(room, data, tokenHash) {
  const isHost = room.host === tokenHash;
  const role = isHost ? 'host' : 'player';
  let player = room.players.find(candidate => candidate.token === tokenHash);
  const result = changed => ({ changed, view: snapshot(room, role, player) });

  if (data.action === 'join') {
    if (isHost) fail(403, 'El anfitrión no ocupa un lugar de jugador.');
    if (player) return result(false);
    player = addPlayer(room, data, tokenHash);
    room.revision += 1;
    return result(true);
  }

  if (!isHost && !player) fail(403, 'Tu sesión no pertenece a esta sala.');
  if (data.action === 'state') return result(false);

  if (data.action === 'answer') {
    if (isHost) fail(403, 'El anfitrión no responde preguntas.');
    if (data.round !== room.round) fail(409, 'Esta pregunta ya cambió.');
    if (player.answers[room.round] === data.choice && Object.hasOwn(player.answers, room.round)) {
      return result(false);
    }
    if (room.phase !== 'question') fail(409, 'Esta pregunta ya está cerrada.');
    if (!Number.isInteger(data.choice) || data.choice < 0 || data.choice >= questions[room.round].options.length) {
      fail(400, 'Elegí una opción válida.');
    }
    if (Object.hasOwn(player.answers, room.round)) fail(409, 'Ya respondiste esta pregunta.');
    player.answers[room.round] = data.choice;
  } else if (['start', 'reveal', 'next'].includes(data.action)) {
    if (!isHost) fail(403, 'Solo el anfitrión puede controlar la partida.');
    if (data.round !== room.round) fail(409, 'La partida ya avanzó.');
    advance(room, data.action);
  } else {
    fail(400, 'La acción solicitada no existe.');
  }

  room.revision += 1;
  return result(true);
}

async function handleAction(store, hostCode, data) {
  if (!data || typeof data.token !== 'string' || !tokenPattern.test(data.token)) {
    fail(400, 'No se pudo identificar esta sesión.');
  }

  const tokenHash = digest(data.token);
  if (data.action === 'create') return createRoom(store, hostCode, data, tokenHash);

  const { code } = data;
  if (typeof code !== 'string' || !roomCodePattern.test(code)) fail(400, 'Ingresá un código de seis dígitos.');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const current = await store.read(code);
    if (!current || current.room.expiresAt <= Date.now()) {
      fail(404, 'La sala no existe o ya venció. Revisá el código.');
    }

    const { changed, view } = applyAction(current.room, data, tokenHash);
    if (!changed || await store.write(code, current.room, current.version)) return view;
    await wait(randomInt(20, Math.min(400, 55 * (attempt + 1))));
  }

  fail(503, 'La sala está recibiendo muchas solicitudes. Intentá de nuevo.');
}

export function makeRoomHandler(store, hostCode) {
  return async request => {
    try {
      if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
        fail(415, 'La solicitud debe enviarse en formato JSON.');
      }
      const raw = await request.text();
      if (raw.length > 2048) fail(413, 'La solicitud supera el tamaño permitido.');
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        fail(400, 'La solicitud no contiene JSON válido.');
      }
      return json(await handleAction(store, hostCode, data));
    } catch (error) {
      if (error instanceof RequestError) return json({ error: error.message }, error.status);
      console.error('Room request failed', error.name);
      return json({ error: 'No se pudo comunicar con la sala. Intentá de nuevo.' }, 500);
    }
  };
}
