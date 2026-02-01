/**
 * Script to generate a Google OAuth2 refresh token
 *
 * Usage:
 * 1. Run: node scripts/generate-refresh-token.js
 * 2. Open the URL in your browser
 * 3. Authorize and copy the code from the URL
 * 4. Paste the code when prompted
 * 5. Copy the refresh token to your .env file
 */

const http = require('http');
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '146550297779-g2tqmj2emli9lohb6ceefel4pk9hdbdb.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3333/oauth2callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

async function main() {
  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });

  console.log('\n========================================');
  console.log('1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n========================================');
  console.log('2. Waiting for authorization...\n');

  // Start local server to receive the callback
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
      const url = new URL(req.url, `http://localhost:3333`);
      const code = url.searchParams.get('code');

      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; padding: 20px;">
                <h1>✅ Success!</h1>
                <p>Copy this refresh token to your .env file:</p>
                <pre style="background: #f0f0f0; padding: 10px; word-break: break-all;">GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"</pre>
                <p>You can close this window now.</p>
              </body>
            </html>
          `);

          console.log('\n========================================');
          console.log('✅ SUCCESS! Here is your refresh token:\n');
          console.log(tokens.refresh_token);
          console.log('\n========================================');
          console.log('\nAdd this to your .env file:');
          console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
          console.log('\n');

          server.close();
          process.exit(0);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error exchanging code: ' + error.message);
          console.error('Error:', error.message);
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No code received');
      }
    }
  });

  server.listen(3333, () => {
    console.log('Local server listening on http://localhost:3333');
  });
}

main().catch(console.error);
