import OpenAI from 'openai';
import { google } from 'googleapis';

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY');
  return apiKey;
}

export async function callGeminiJson({ model, prompt, schema }) {
  const apiKey = getGeminiApiKey();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.9
        }
      })
    }
  );

  const text = await response.text();

  if (!response.ok) {
    const err = new Error(`Gemini API error: ${response.status} ${text}`);
    err.status = response.status;
    err.responseText = text;
    throw err;
  }

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    const err = new Error(`Gemini API returned non-JSON envelope: ${text}`);
    err.status = 500;
    err.responseText = text;
    throw err;
  }

  const modelText =
    raw?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';

  if (!modelText) {
    const err = new Error(`Gemini API returned empty candidate text: ${text}`);
    err.status = 500;
    err.responseText = text;
    throw err;
  }

  try {
    return JSON.parse(modelText);
  } catch {
    const err = new Error(`Gemini model returned invalid JSON text: ${modelText}`);
    err.status = 500;
    err.responseText = modelText;
    throw err;
  }
}

export function getOAuth2Client() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Missing Google OAuth env vars');
  }
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

export function parseCookie(cookieHeader = '') {
  const out = {};
  cookieHeader.split(';').forEach(part => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

export async function getDriveClientFromCookies(req) {
  const cookies = parseCookie(req.headers.cookie || '');
  if (!cookies.liftflow_tokens) throw new Error('Not authenticated with Google Drive');
  const tokens = JSON.parse(cookies.liftflow_tokens);
  const auth = getOAuth2Client();
  auth.setCredentials(tokens);
  return google.drive({ version: 'v3', auth });
}

export async function findFileByName(drive, name) {
  const q = `name='${name.replace(/'/g, "\\'")}' and trashed=false`;
  const res = await drive.files.list({
    q,
    fields: 'files(id,name)',
    spaces: 'drive',
    pageSize: 1
  });
  return res.data.files?.[0] || null;
}

export async function saveJsonFile(drive, name, data) {
  const existing = await findFileByName(drive, name);
  const media = {
    mimeType: 'application/json',
    body: JSON.stringify(data, null, 2)
  };

  if (existing?.id) {
    const res = await drive.files.update({
      fileId: existing.id,
      media,
      fields: 'id,name'
    });
    return res.data;
  }

  const res = await drive.files.create({
    requestBody: { name, mimeType: 'application/json' },
    media,
    fields: 'id,name'
  });
  return res.data;
}

export async function loadJsonFile(drive, name) {
  const existing = await findFileByName(drive, name);
  if (!existing?.id) return null;

  const res = await drive.files.get(
    { fileId: existing.id, alt: 'media' },
    { responseType: 'text' }
  );

  const raw = typeof res.data === 'string' ? res.data : '';
  return raw ? JSON.parse(raw) : null;
}
