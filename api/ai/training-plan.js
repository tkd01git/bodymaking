
import { getOpenAI, json, readBody } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const client = getOpenAI();

    const prompt = `
あなたは筋力トレーニングのコーチです。
入力された profile, selectedExercise, records をもとに、
goalSets, goalReps, text を JSON で返してください。
安全性を重視し、無理な重量提案は避けてください。
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
    try { parsed = JSON.parse(text); } catch { parsed = { goalSets: 3, goalReps: '5-8', text: text }; }
    return json(res, 200, parsed);
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
