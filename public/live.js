const endpoint = '/.netlify/functions/room';
const sessionKey = 'pegasus-live-session';
const roomPattern = /^\d{6}$/;
const app = document.querySelector('#app');
const notice = document.querySelector('#notice');
const main = document.querySelector('#main');
const letters = ['A', 'B', 'C', 'D'];
const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]
);

let session = loadSession();
let state;
let busy = false;
let pendingJoin;
let selected = null;
let hintOpen = false;
let questionDeadline;
let countdownInterval;

function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey));
    if (saved && roomPattern.test(saved.code) && /^[a-f0-9]{64}$/.test(saved.token)) {
      const invitedRoom = new URL(location.href).searchParams.get('sala');
      if (!invitedRoom || invitedRoom === saved.code) return saved;
    }
  } catch {
    // A fresh session works even if the browser blocks storage.
  }
  return null;
}

function rememberSession(value) {
  session = value;
  try {
    if (value) sessionStorage.setItem(sessionKey, JSON.stringify(value));
    else sessionStorage.removeItem(sessionKey);
  } catch {
    // Keep the session available in the current page.
  }
}

function showNotice(message = '', error = false) {
  notice.textContent = message;
  notice.hidden = !message;
  notice.classList.toggle('live-error', error);
}

async function request(action, fields = {}, identity = session) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...identity, ...fields }),
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'No se pudo conectar con la partida.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function makeToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

function goToLanding() {
  rememberSession(null);
  state = undefined;
  syncCountdown();
  history.replaceState(null, '', location.pathname);
  renderLanding();
}

function renderLanding() {
  const invitedRoom = new URL(location.href).searchParams.get('sala') || '';
  app.innerHTML = `
    <section class="live-hero">
      <div class="eyebrow">Actividad de clase · Partida en vivo</div>
      <h1>Pegasus en debate<span>.</span></h1>
      <p>Diez preguntas sobre vigilancia gubernamental, seguridad y derechos fundamentales. Entrá a la sala y respondé con el grupo.</p>
    </section>
    <div class="live-grid">
      <form class="live-card live-card-player" data-form="join">
        <div class="eyebrow">Participantes</div>
        <h2>Entrar a una sala</h2>
        <label for="roomCode">Código de la sala</label>
        <input id="roomCode" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6"
          placeholder="123456" value="${roomPattern.test(invitedRoom) ? invitedRoom : ''}" required>
        <label for="playerName">Nombre o apodo</label>
        <input id="playerName" name="name" autocomplete="nickname" minlength="2" maxlength="30" required>
        <button class="primary-button" type="submit">Entrar a la sala</button>
      </form>
      <form class="live-card" data-form="create">
        <div class="eyebrow">Anfitrión</div>
        <h2>Crear una partida</h2>
        <p>Compartí el código de sala y controlá cuándo comienza y cuándo avanza cada pregunta.</p>
        <label for="hostCode">PIN privado de inicio</label>
        <input id="hostCode" name="hostCode" type="password" autocomplete="current-password"
          minlength="8" maxlength="128" required>
        <button class="secondary-button" type="submit">Crear sala</button>
      </form>
    </div>`;
}

function roster(players) {
  return players.length
    ? `<ul class="player-list">${players.map(player => `<li>${escapeHtml(player.name)}</li>`).join('')}</ul>`
    : '<p class="subtle">Todavía no hay participantes.</p>';
}

function renderLobby(view) {
  const count = `${view.playerCount} ${view.playerCount === 1 ? 'participante' : 'participantes'}`;
  if (view.role === 'player') {
    return `
      <section class="live-card live-stage">
        <div class="eyebrow">Sala ${view.code} · En espera</div>
        <h1>Ya estás en la sala</h1>
        <p>Ingresaste como <strong>${escapeHtml(view.me.name)}</strong>. La primera pregunta aparecerá cuando el anfitrión inicie la partida.</p>
        <div class="live-pill">${count} en la sala</div>
      </section>`;
  }

  return `
    <div class="live-grid lobby-grid">
      <section class="live-card live-stage">
        <div class="eyebrow">Anfitrión · Sala de espera</div>
        <h1>Tu sala está lista</h1>
        <p>Mostrá el código al grupo o compartí el enlace de acceso.</p>
        <div class="room-code" aria-label="Código de la sala">${view.code}</div>
        <div class="live-actions">
          <button class="primary-button" data-action="start" ${view.playerCount ? '' : 'disabled'}>Iniciar partida</button>
          <button class="secondary-button" data-action="copy">Copiar enlace</button>
        </div>
      </section>
      <section class="live-card lobby-roster">
        <div class="eyebrow">Sala de espera</div>
        <h2>${count}</h2>
        ${roster(view.players)}
      </section>
    </div>`;
}

function renderProgress(view) {
  return `<div class="stage-progress">
    <span>Pregunta ${view.round + 1} de ${view.totalRounds}</span>
    ${view.endsAt === undefined ? '' : `<span class="round-timer">
      Tiempo <strong id="roundSeconds">${secondsRemaining()} s</strong>
    </span>`}
    <progress value="${view.round + 1}" max="${view.totalRounds}" aria-label="Avance de la partida"></progress>
  </div>`;
}

function secondsRemaining() {
  return Math.max(0, Math.ceil((questionDeadline - performance.now()) / 1000));
}

function roundExpired() {
  return questionDeadline !== undefined && secondsRemaining() === 0;
}

function updateCountdown() {
  const label = document.querySelector('#roundSeconds');
  if (!label) return;
  const seconds = secondsRemaining();
  const text = `${seconds} s`;
  if (label.textContent !== text) label.textContent = text;
  label.parentElement.classList.toggle('round-timer-low', seconds <= 5);
  if (seconds === 0) {
    for (const control of app.querySelectorAll('[data-form="answer"] input, [data-form="answer"] button[type="submit"]')) {
      control.disabled = true;
    }
  }
}

function syncCountdown(view, transition) {
  if (view?.endsAt === undefined) {
    questionDeadline = undefined;
    clearInterval(countdownInterval);
    countdownInterval = undefined;
    return;
  }

  const deadline = performance.now() + Math.max(0, view.endsAt - view.serverNow);
  questionDeadline = transition || questionDeadline === undefined
    ? deadline
    : Math.min(questionDeadline, deadline);
  countdownInterval ??= setInterval(updateCountdown, 200);
}

function answerOptions(view) {
  const reveal = view.reveal;
  return `<div class="live-options">${view.question.options.map((option, index) => {
    const content = `<span class="option-letter">${letters[index]}</span><span>${escapeHtml(option)}</span>`;
    if (reveal) {
      const tags = [];
      if (index === reveal.correct) tags.push('Correcta');
      if (index === view.me?.answer) tags.push('Tu respuesta');
      if (view.role === 'host') tags.push(String(reveal.counts[index]));
      return `<div class="live-option ${index === reveal.correct ? 'is-correct' : ''}">
        ${content} <span class="answer-tag">${tags.join(' · ')}</span>
      </div>`;
    }
    if (view.role === 'host' || view.me.answer !== null) {
      return `<div class="live-option ${view.me?.answer === index ? 'is-selected' : ''}">${content}</div>`;
    }
    return `<label class="live-option">
      <input type="radio" name="choice" value="${index}" ${selected === index ? 'checked' : ''}>
      ${content}
    </label>`;
  }).join('')}</div>`;
}

function renderRound(view) {
  const host = view.role === 'host';
  const reveal = view.reveal;
  let controls = '';
  if (host) {
    const answered = view.players.filter(player => player.answered).length;
    let nextButton = '';
    if (reveal) {
      const label = view.round + 1 === view.totalRounds ? 'Ver resultados' : 'Siguiente pregunta';
      nextButton = `<button class="primary-button" data-action="next">${label}</button>`;
    } else if (view.endsAt === undefined) {
      nextButton = '<button class="primary-button" data-action="reveal">Cerrar respuestas y revelar</button>';
    }
    controls = `<div class="live-actions round-controls">
      <span class="live-pill">${answered} de ${view.playerCount} respondieron</span>
      ${nextButton}
    </div>`;
  } else if (!reveal && view.me.answer === null) {
    controls = `<p id="roundHint" class="round-hint" ${hintOpen ? '' : 'hidden'}>${escapeHtml(view.question.hint)}</p>
    <div class="live-actions round-controls">
      <button class="primary-button" type="submit" ${selected === null ? 'disabled' : ''}>Confirmar respuesta</button>
      <button class="secondary-button" type="button" data-action="hint" aria-expanded="${hintOpen}" aria-controls="roundHint">Pista</button>
    </div>`;
  } else {
    let message = 'Respuesta recibida. La solución aparecerá cuando todos respondan o termine el tiempo.';
    if (reveal) {
      const points = view.me.roundPoints ?? Number(view.me.answer === reveal.correct);
      message = `+${points} puntos en esta pregunta. Esperá a que el anfitrión avance.`;
    } else if (view.endsAt === undefined) {
      message = 'Respuesta recibida. Esperá a que el anfitrión revele la solución.';
    }
    controls = `<p class="round-wait">${message}</p>`;
  }

  const options = answerOptions(view);
  return `<section class="live-card live-stage question-stage">
    ${renderProgress(view)}
    <div class="eyebrow">${escapeHtml(view.question.topic)} · ${escapeHtml(view.question.label)}</div>
    <h1 id="prompt">${escapeHtml(view.question.prompt)}</h1>
    ${!host && !reveal && view.me.answer === null
      ? `<form data-form="answer" aria-labelledby="prompt">${options}${controls}</form>`
      : options}
    ${reveal ? `<aside class="round-explanation">
      <strong>La explicación</strong>
      <p>${escapeHtml(reveal.explanation)}</p>
      <small>Diapositiva ${reveal.slide} · ${escapeHtml(reveal.source)}</small>
    </aside>` : ''}
    ${host || reveal || view.me.answer !== null ? controls : ''}
  </section>`;
}

function rankings(players) {
  const ranked = [...players].sort((first, second) =>
    second.score - first.score || first.name.localeCompare(second.name, 'es')
  );
  let rank = 0;
  return ranked.map((player, index) => {
    if (index === 0 || player.score !== ranked[index - 1].score) rank = index + 1;
    return { ...player, rank };
  });
}

function renderResults(view) {
  const standings = rankings(view.players);
  const maxPoints = view.maxPoints ?? view.totalRounds;
  const rules = maxPoints === view.totalRounds
    ? 'Cada respuesta correcta suma un punto.'
    : 'Las respuestas correctas más rápidas suman más puntos.';
  return `<section class="live-card live-stage">
    <div class="eyebrow">Sala ${view.code} · Partida finalizada</div>
    <h1>Resultados de la partida</h1>
    <p>${view.me ? `Obtuviste <strong>${view.me.score} de ${maxPoints}</strong> puntos.` : rules}</p>
    <table class="rankings">
      <thead><tr><th scope="col">Puesto</th><th scope="col">Participante</th><th scope="col">Puntos</th></tr></thead>
      <tbody>${standings.map(player => `<tr>
        <td>${player.rank}</td><th scope="row">${escapeHtml(player.name)}</th><td>${player.score} / ${maxPoints}</td>
      </tr>`).join('')}</tbody>
    </table>
    <aside class="round-explanation">
      <strong>Para conversar con el grupo</strong>
      <p>¿Qué límites debe tener el poder de vigilancia del Estado? Elegí un control de la presentación y explicá qué derecho ayuda a proteger.</p>
    </aside>
    <div class="live-actions round-controls">
      ${view.role === 'host' ? '<button class="primary-button" data-action="csv">Descargar resultados CSV</button>' : ''}
      <button class="secondary-button" data-action="home">Volver al inicio</button>
    </div>
  </section>`;
}

function showState(view) {
  if (state && view.revision < state.revision) return;
  const transition = !state || view.phase !== state.phase || view.round !== state.round;
  const visibleChange = transition || (view.role === 'host'
    ? view.revision !== state.revision
    : view.me?.answer !== state.me?.answer || (view.phase === 'lobby' && view.playerCount !== state.playerCount));
  state = view;
  syncCountdown(view, transition);
  if (!visibleChange) return;
  const focusedAction = app.contains(document.activeElement) ? document.activeElement.dataset.action : null;
  if (transition) {
    selected = null;
    hintOpen = false;
  }
  if (view.phase === 'lobby') app.innerHTML = renderLobby(view);
  else if (view.phase === 'finished') app.innerHTML = renderResults(view);
  else app.innerHTML = renderRound(view);
  updateCountdown();
  if (transition) {
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  } else if (focusedAction) {
    app.querySelector(`[data-action="${focusedAction}"]`)?.focus({ preventScroll: true });
  }
}

async function submit(action, fields, button) {
  if (busy) return;
  busy = true;
  if (button) button.disabled = true;
  showNotice();
  try {
    const isEntry = action === 'create' || action === 'join';
    let identity = session;
    if (action === 'create') identity = { token: makeToken() };
    if (action === 'join') {
      const key = JSON.stringify([fields.code, fields.name]);
      if (pendingJoin?.key !== key) pendingJoin = { key, token: makeToken() };
      identity = { token: pendingJoin.token };
    }
    const view = await request(action, fields, identity);
    if (isEntry) {
      rememberSession({ token: identity.token, code: view.code });
      pendingJoin = undefined;
    }
    showState(view);
  } catch (error) {
    showNotice(error.status ? error.message : 'No se pudo conectar con la sala. Intentá de nuevo.', true);
    if (session && error.status === 409) {
      try {
        showState(await request('state'));
      } catch {
        // The next scheduled refresh will retry.
      }
    }
  } finally {
    busy = false;
    if (button?.isConnected) button.disabled = action === 'answer' && roundExpired();
  }
}

function downloadCsv() {
  const cell = value => {
    const text = String(value);
    const escaped = /^[=+@-]/.test(text) ? "'" + text : text;
    return '"' + escaped.replaceAll('"', '""') + '"';
  };
  const lines = [['Puesto', 'Participante', 'Puntos', 'Preguntas respondidas', 'Total de preguntas', 'Puntaje máximo']];
  for (const player of rankings(state.players)) {
    lines.push([player.rank, player.name, player.score, player.totalAnswered, state.totalRounds, state.maxPoints ?? state.totalRounds]);
  }
  const data = lines.map(line => line.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', data], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `pegasus-sala-${state.code}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyInvite() {
  const url = new URL('/', location.origin);
  url.searchParams.set('sala', state.code);
  try {
    await navigator.clipboard.writeText(url.href);
    showNotice('Enlace de la sala copiado.');
  } catch {
    showNotice('Compartí el enlace ' + url.href);
  }
}

app.addEventListener('submit', event => {
  const { target: form, submitter } = event;
  const action = form.dataset.form;
  if (!action) return;
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(form));
  if (action === 'answer') {
    if (selected !== null && !roundExpired()) submit(action, { round: state.round, choice: selected }, submitter);
  } else {
    submit(action, fields, submitter);
  }
});

app.addEventListener('change', event => {
  if (event.target.name === 'choice') {
    selected = Number(event.target.value);
    if (!busy && !roundExpired()) event.target.form.querySelector('button[type="submit"]').disabled = false;
  }
});

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const { action } = button.dataset;
  if (action === 'hint') {
    hintOpen = !hintOpen;
    button.setAttribute('aria-expanded', String(hintOpen));
    const hint = document.querySelector('#roundHint');
    hint.hidden = !hintOpen;
    if (hintOpen) hint.scrollIntoView({ block: 'nearest' });
  } else if (action === 'copy') {
    copyInvite();
  } else if (action === 'csv') {
    downloadCsv();
  } else if (action === 'home') {
    showNotice();
    goToLanding();
  } else {
    submit(action, { round: state.round }, button);
  }
});

let hadConnectionError = false;
async function poll() {
  if (session && !busy && state?.phase !== 'finished') {
    const identity = session;
    try {
      const view = await request('state', {}, identity);
      if (session === identity && !busy) {
        showState(view);
        if (hadConnectionError) showNotice();
        hadConnectionError = false;
      }
    } catch (error) {
      if (session !== identity || busy) {
        // Ignore requests from a previous session or overtaken by an action.
      } else if (error.status === 403 || error.status === 404) {
        goToLanding();
        showNotice(error.message, true);
      } else {
        showNotice('Se perdió la conexión con la sala. Reconectando…', true);
        hadConnectionError = true;
      }
    }
  }

  const delay = document.hidden ? 10000 : 1000 + Math.random() * 650;
  setTimeout(poll, delay);
}

if (session) app.innerHTML = '<p class="live-card" role="status">Reconectando con la sala…</p>';
else renderLanding();
poll();
