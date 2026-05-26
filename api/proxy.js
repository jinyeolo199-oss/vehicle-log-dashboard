// Vercel Serverless Function: Supabase 프록시
// 브라우저에서 secret key 노출 없이 Supabase 접근
const SUPABASE_URL = 'https://shzwqgudckkmxkaecwqu.supabase.co';
const SUPABASE_KEY  = 'sb_secret_kAfUW42t216sgeAfFsPYLQ_PET9tQaV';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { method = 'GET', table, params, body: reqBody } = req.body;
    const url = `${SUPABASE_URL}/rest/v1/${table}` + (params ? `?${params}` : '');

    const headers = {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json'
    };
    if (reqBody !== undefined) headers['Prefer'] = 'return=minimal';

    const fetchRes = await fetch(url, {
      method,
      headers,
      body: reqBody !== undefined ? JSON.stringify(reqBody) : undefined
    });

    const text = await fetchRes.text();

    if (!fetchRes.ok) {
      return res.status(200).json({
        data: null,
        error: { message: text || `HTTP ${fetchRes.status}`, status: fetchRes.status }
      });
    }

    const parsed = text ? JSON.parse(text) : [];
    const data = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    return res.status(200).json({ data, error: null });

  } catch (err) {
    return res.status(200).json({ data: null, error: { message: err.message } });
  }
}
