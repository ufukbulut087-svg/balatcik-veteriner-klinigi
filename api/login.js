module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body || {};
  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, token: 'authenticated-session-ok' });
  }

  return res.status(401).json({ success: false, error: 'Hatalı şifre!' });
};
