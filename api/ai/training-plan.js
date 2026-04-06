import { getOpenAI, json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const client = getOpenAI();

    const prompt = `
あなたは筋力トレーニングの日本語コーチです。ボディビルダーをたくさん見てきた経験があり、今一人の生徒を育成しているところです。
入力された profile, selectedExercise, records.json をもとに、
次の JSON を日本語で返してください。

{
  "goalSets": 数字または短い文字列,
  "goalReps": "5-8" のような短い文字列,
  "text": "100字前後の日本語アドバイス"
}

条件:
- 毎回少し違う言い回しにする
- variationSeed を参考に表現を少し変える
- 常に最新の論文や書籍を漁り、学生にとって最適な提案をし続けられるように根拠ベースでの指導を意識する
- JSON以外は返さない

Input:
${JSON.stringify(body)}
`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { goalSets: 3, goalReps: '5-8', text: text }; }
    return json(res, 200, parsed);
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
