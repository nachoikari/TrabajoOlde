import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { makeRoomHandler } from '../game/room-api.mjs';

const entries = new Map();
const store = {
  async create(code, room) {
    if (entries.has(code)) return false;
    entries.set(code, { room: structuredClone(room), version: 1 });
    return true;
  },
  async read(code) {
    return structuredClone(entries.get(code));
  },
  async write(code, room, version) {
    if (entries.get(code)?.version !== version) return false;
    entries.set(code, { room: structuredClone(room), version: version + 1 });
    return true;
  },
};

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/individual.html', ['individual.html', 'text/html']],
  ['/activity.css', ['activity.css', 'text/css']],
  ['/live.css', ['live.css', 'text/css']],
  ['/live.js', ['live.js', 'text/javascript']],
]);
const handleRoom = makeRoomHandler(store, process.env.HOST_START_CODE);
const port = Number(process.env.PORT || 8888);

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/.netlify/functions/room') {
      const input = new Request(url, {
        method: request.method,
        headers: request.headers,
        ...(!['GET', 'HEAD'].includes(request.method) && { body: Readable.toWeb(request), duplex: 'half' }),
      });
      const result = await handleRoom(input);
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(await result.text());
    } else if (files.has(url.pathname)) {
      const [file, type] = files.get(url.pathname);
      const data = await readFile(new URL('../public/' + file, import.meta.url));
      response.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
      response.end(data);
    } else {
      response.writeHead(404).end();
    }
  } catch (error) {
    console.error(error);
    response.writeHead(500).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Pegasus en vivo: http://localhost:${port}`);
});
