module.exports = (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_GITHUB_CLIENT_ID;
  
  if (!client_id) {
    return res.status(500).send("Configuration Error: GITHUB_CLIENT_ID is missing from environment variables.");
  }
  
  const state = Math.random().toString(36).substring(2, 15);
  
  // Redirect user to Github's authorization page
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${state}`);
};
