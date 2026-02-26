import { google } from 'googleapis';

/**
 * Google Drive Service Account Authentication
 *
 * Uses a service account instead of OAuth2 - no token expiry, no Google app approval needed.
 * The target Google Drive folder must be shared with the service account email:
 * CLIENT_EMAIL_GOOGLE_DRIVE (id-y0-884@y0flix-auth.iam.gserviceaccount.com)
 *
 * Required environment variables:
 * - CLIENT_EMAIL_GOOGLE_DRIVE: Service account email
 * - PRIVATE_KEY: Service account private key
 *
 * Scopes:
 * - drive.readonly: list and read files (used for movie list)
 * - drive.file: create/delete files (used for upload when re-enabled)
 */
export const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL_GOOGLE_DRIVE,
    private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ],
});
