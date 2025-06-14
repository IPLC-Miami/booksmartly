const {google} = require('googleapis');
const fs = require('fs');
// const process = require('process')
const path = require('path')
const TOKEN_PATH = path.join(__dirname, 'token.json')
const scopes = ['https://www.googleapis.com/auth/calendar']
const oauth2client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
)
function loadTokens()
{
if (fs.existsSync(TOKEN_PATH)) {
  try{
  const token = fs.readFileSync(TOKEN_PATH)
  oauth2client.setCredentials(JSON.parse(token))
  }
  catch(e){
    console.error("Error reading token:", e)
  }
}
else{
  console.log("Token file not found.")
}
};
async function refreshAccessToken() {
  try {
    // Check if we have a refresh token before attempting refresh
    if (!oauth2client.credentials || !oauth2client.credentials.refresh_token) {
      console.log('No Google refresh token available - skipping refresh');
      return;
    }
    
    const { credentials } = await oauth2client.refreshAccessToken();
    oauth2client.setCredentials(credentials);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
    console.log('Google access token refreshed and saved.');
  } catch (error) {
    console.error('Error refreshing Google access token:', error.message);
  }
}
oauth2client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Refresh token saved to file');
  }
});
loadTokens();
module.exports = { oauth2client , loadTokens, refreshAccessToken};
