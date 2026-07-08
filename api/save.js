module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate session token
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer authenticated-session-ok') {
    return res.status(401).json({ error: 'Yetkisiz erişim! Lütfen tekrar giriş yapın.' });
  }

  const { path, content, message, isBase64 } = req.body || {};

  if (!path || !content) {
    return res.status(400).json({ error: 'Eksik parametreler (path ve content gereklidir).' });
  }

  const repo = process.env.GITHUB_REPO;
  const pat = process.env.GITHUB_PAT;

  if (!repo || !pat) {
    return res.status(500).json({ error: 'Sunucu yapılandırma hatası (GITHUB_REPO veya GITHUB_PAT eksik).' });
  }

  const githubUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `token ${pat}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Vercel-Serverless-Custom-CMS'
  };

  try {
    // 1. Get the existing file SHA (if it exists)
    let sha = null;
    const getRes = await fetch(githubUrl, { headers });
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Prepare content in Base64
    let base64Content = '';
    if (isBase64) {
      base64Content = content; // Already base64 encoded
    } else {
      // For text files (JSON), encode as base64
      base64Content = Buffer.from(typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8').toString('base64');
    }

    // 3. Send PUT request to GitHub
    const putBody = {
      message: message || `Update ${path} from custom admin panel`,
      content: base64Content,
      branch: 'main'
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putRes = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub API Error: ${putRes.status} - ${errText}`);
    }

    const putData = await putRes.json();

    return res.status(200).json({
      success: true,
      message: `${path} başarıyla kaydedildi.`,
      sha: putData.content.sha
    });

  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: `Kaydetme başarısız: ${error.message}` });
  }
};
