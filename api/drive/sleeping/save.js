import { getDriveClientFromCookies, json, readBody, saveJsonFile } from '../../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);
    const drive = await getDriveClientFromCookies(req);
    const saved = await saveJsonFile(drive, 'sleeping.json', body.sleeping || []);
    return json(res, 200, { ok: true, file: saved });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
