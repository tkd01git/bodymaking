
import { getOpenAI, json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const client = getOpenAI();

    const prompt = `
あなたはスポーツ栄養アドバイザーです。
入力された profile, selectedExercise, records をもとに、
protein, water, sleep, carb, text を JSON で返してください。
JSON以外は返さないでください。
Input:
${JSON.stringify(body)}
`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { protein: 120, water: 2.5, sleep: 7.5, carb: 3, text: text }; }
    return json(res, 200, parsed);
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
