
import { getDriveClientFromCookies, json, loadJsonFile } from '../../_utils.js';

export default async function handler(req, res) {
  try {
    const drive = await getDriveClientFromCookies(req);
    const profile = await loadJsonFile(drive, 'profile.json');
    return json(res, 200, { profile });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
