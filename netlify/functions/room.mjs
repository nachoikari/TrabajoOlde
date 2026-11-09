import { getStore } from '@netlify/blobs';
import { makeRoomHandler } from '../../game/room-api.mjs';

export default function room(request) {
  const blobs = getStore({ name: 'pegasus-live-rooms', consistency: 'strong' });
  const store = {
    async create(code, data) {
      const result = await blobs.setJSON(code, data, { onlyIfNew: true });
      return result.modified;
    },
    async read(code) {
      const entry = await blobs.getWithMetadata(code, { type: 'json' });
      if (!entry) return null;
      if (!entry.etag) throw new Error('Room blob has no ETag');
      return { room: entry.data, version: entry.etag };
    },
    async write(code, data, version) {
      const result = await blobs.setJSON(code, data, { onlyIfMatch: version });
      return result.modified;
    },
  };
  return makeRoomHandler(store, process.env.HOST_START_CODE)(request);
}
