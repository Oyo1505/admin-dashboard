import { google } from 'googleapis';

/**
 * Google Drive OAuth2 Authentication
 *
 * Uses OAuth2 with a refresh token to authenticate as a personal Google account.
 * This allows files to be owned by your personal account (using your 200GB quota)
 * instead of a service account (limited to 15GB).
 *
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: OAuth2 client ID
 * - GOOGLE_CLIENT_SECRET: OAuth2 client secret
 * - GOOGLE_REFRESH_TOKEN: Refresh token for your personal Google account
 */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Set the refresh token - this allows automatic token refresh
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export const auth = oauth2Client;
