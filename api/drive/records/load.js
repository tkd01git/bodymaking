
import { getDriveClientFromCookies, json, loadJsonFile } from '../../_utils.js';

export default async function handler(req, res) {
  try {
    const drive = await getDriveClientFromCookies(req);
    const records = await loadJsonFile(drive, 'records.json');
    return json(res, 200, { records });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
