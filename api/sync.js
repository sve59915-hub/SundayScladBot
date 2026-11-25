export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'База данных не подключена в Vercel Storage' });
  }

  const code = (req.query.code || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
  const key = `sclad_data_${code}`;

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await r.json();
      const data = json.result ? JSON.parse(json.result) : {};
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const r = await fetch(`${url}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: bodyStr
      });
      if (!r.ok) throw new Error(`Redis error ${r.status}`);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
