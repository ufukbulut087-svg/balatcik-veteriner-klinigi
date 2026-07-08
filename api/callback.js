module.exports = async (req, res) => {
  const code = req.query.code;
  const client_id = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET || process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res.status(500).send("Configuration Error: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing.");
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send(`Error: ${data.error_description || data.error}`);
    }

    const token = data.access_token;

    // Send token back to the opener window (Decap CMS)
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Giriş Başarılı</title>
      </head>
      <body>
        <script>
          const token = "${token}";
          const provider = "github";
          
          function postMessage() {
            window.opener.postMessage(
              'authorization:' + provider + ':success:' + JSON.stringify({ token, provider }),
              window.location.origin
            );
          }
          
          postMessage();
          window.close();
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`OAuth Error: ${error.message}`);
  }
};
