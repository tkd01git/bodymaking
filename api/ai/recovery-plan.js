import { getOpenAI, json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readBody(req);
    const client = getOpenAI();

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

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは日本語で簡潔に答えるスポーツ栄養アドバイザーです。必ずJSONのみを返してください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9
    });

    const text = completion.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        text: '今日は回復を優先して、睡眠と食事を丁寧に整えましょう。'
      };
    }

    return json(res, 200, parsed);
  } catch (e) {
    console.error('AI endpoint error:', {
      message: e?.message,
      status: e?.status,
      name: e?.name,
      responseData: e?.response?.data,
      stack: e?.stack
    });

    return json(res, 500, {
      error: e?.message || 'Unknown error',
      status: e?.status || 500
    });
  }
}
