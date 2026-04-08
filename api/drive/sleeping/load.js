import { getDriveClientFromCookies, json, loadJsonFile } from '../../_utils.js';

export default async function handler(req, res) {
  try {
    const drive = await getDriveClientFromCookies(req);
    const sleeping = await loadJsonFile(drive, 'sleeping.json');
    return json(res, 200, { sleeping });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
