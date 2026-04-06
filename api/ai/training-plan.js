import { callGeminiJson, json, readBody } from '../_utils.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);

    const prompt = `
あなたは筋力トレーニングの日本語コーチです。ボディビルダーをたくさん見てきた経験があり、今一人の生徒を育成しているところです。
入力された profile, selectedExercise, records.json をもとに、
次の JSON を日本語で返してください。

{
  "goalSets": 数字または短い文字列,
  "goalReps": "5-8" のような短い文字列,
  "text": "100字前後の日本語アドバイス+有益そうな事実を論文など信頼できるデータからとってくること"
}

条件:
- 必ず日本語で返す
- 毎回少し違う言い回しにする
- variationSeed を参考に表現を少し変える
- 常に根拠ベースで、学生にとって現実的で実行しやすい提案にする
- profile の身体データや目標を考慮する
- records の過去履歴を踏まえる
- selectedExercise の内容も考慮する
- JSON以外は返さない
- 論文や書籍等を参考に、この100字程度の内容の出力の根拠となる話をきちんと調べた上で出力すること

Input:
${JSON.stringify(body)}
`;

    const parsed = await callGeminiJson({
      model: GEMINI_MODEL,
      prompt,
      schema: {
        type: 'OBJECT',
        properties: {
          goalSets: { type: 'STRING' },
          goalReps: { type: 'STRING' },
          text: { type: 'STRING' }
        },
        required: ['goalSets', 'goalReps', 'text']
      }
    });

    return json(res, 200, parsed);
  } catch (e) {
    console.error('Gemini training endpoint error:', {
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
