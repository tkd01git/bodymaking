
# LiftFlow Complete

## 1. フロント
- `index.html`
- `css/styles.css`
- `js/*`

## 2. Vercel API
- `api/ai/training-plan.js`
- `api/ai/recovery-plan.js`
- `api/drive/auth.js`
- `api/drive/callback.js`
- `api/drive/profile/load.js`
- `api/drive/profile/save.js`
- `api/drive/records/load.js`
- `api/drive/records/save.js`

## 3. 必要な環境変数
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## 4. Google Redirect URI
Vercelの本番URLに合わせて
`https://YOUR-VERCEL-DOMAIN/api/drive/callback`
をGoogle Cloud Consoleに登録してください。




