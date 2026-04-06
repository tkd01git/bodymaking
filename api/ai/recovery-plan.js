import { getOpenAI, json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const client = getOpenAI();

    const prompt = `
あなたは非常に優秀なスポーツ栄養アドバイザーです。ボディビルトレーナーとしての経験がたくさんあって、新しい人を育成しています。
入力された profile, selectedExercise, records.json をもとに、
次の JSON を日本語で返してください。

{
  "text": "100字前後の日本語アドバイス"
}

条件:
- 毎回少し違う言い回しにする
- variationSeed を参考に表現を少し変える
- 現実的な提案にする。具体的には、これまでrecords.jsonで見てきたデータがあると思いますが、その内容をきちんと踏まえたり、最新の論文をきちんと追いながら、正確なアドバイスをなるべく具体的にすること。
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
    try { parsed = JSON.parse(text); } catch { parsed = { protein: 120, water: 2.5, sleep: 7.5, carb: 3, text: text }; }
    return json(res, 200, parsed);
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
