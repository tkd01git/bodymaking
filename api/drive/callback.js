import { getOAuth2Client } from '../_utils.js';

const CACHE_VERSION = '20260406-1';

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.statusCode = 400;
      return res.end('Missing code');
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const cookie = `liftflow_tokens=${encodeURIComponent(JSON.stringify(tokens))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
    res.setHeader('Set-Cookie', cookie);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const target = `/?v=${CACHE_VERSION}&t=${Date.now()}`;

    res.statusCode = 200;
    res.end(`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Cache-Control" content="no-store" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting...</title>
</head>
<body>
  <script>
    window.location.replace(${JSON.stringify(target)});
  </script>
  <p>Redirecting...</p>
</body>
</html>
`);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Cache-Control', 'no-store');
    res.end(e.message);
  }
}
