import { callGeminiJson, json, readBody } from '../_utils.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);

    const prompt = `
あなたは非常に優秀なスポーツ栄養アドバイザーです。
ボディメイクや筋力トレーニングを行う人に対して、回復・栄養・休養の観点から、短く実用的な助言を日本語で行います。

入力された profile, selectedExercise, records をもとに、
次の JSON を日本語で返してください。

{
  "text": "100字前後の日本語アドバイス"
}

条件:
- 必ず日本語で返す
- 毎回少し違う言い回しにする
- variationSeed を参考に表現を少し変える
- profile の身体データや目標を考慮する
- records の過去履歴を踏まえて助言する
- selectedExercise の内容も考慮する
- 現実的で具体的な助言にする
- 長すぎず、すぐ行動に移せる内容にする
- JSON以外は返さない

Input:
${JSON.stringify(body)}
`;

    const parsed = await callGeminiJson({
      model: GEMINI_MODEL,
      prompt,
      schema: {
        type: 'OBJECT',
        properties: {
          text: { type: 'STRING' }
        },
        required: ['text']
      }
    });

    return json(res, 200, parsed);
  } catch (e) {
    console.error('Gemini recovery endpoint error:', {
      message: e?.message,
      status: e?.status,
      responseText: e?.responseText,
      stack: e?.stack
    });

    const status = e?.status || 500;

    return json(res, status, {
      error: e?.message || 'Unknown error',
      status
    });
  }
}
