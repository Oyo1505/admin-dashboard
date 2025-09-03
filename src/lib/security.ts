/**
 * Security utilities for iframe and CSP management
 */

export const TRUSTED_IFRAME_DOMAINS = [
  'drive.google.com',
  'accounts.google.com',
] as const;

export const CSP_DIRECTIVES = {
  DEFAULT: "default-src 'self'",
  SCRIPT:
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://accounts.google.com",
  STYLE: "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  FONT: "font-src 'self' https://fonts.gstatic.com",
  IMG: "img-src 'self' data: https: blob:",
  MEDIA: "media-src 'self' https://drive.google.com blob:",
  CONNECT:
    "connect-src 'self' https://api.themoviedb.org https://accounts.google.com https://www.googleapis.com https://drive.google.com wss:",
  FRAME: `frame-src 'self' ${TRUSTED_IFRAME_DOMAINS.map((domain) => `https://${domain}`).join(' ')}`,
  OBJECT: "object-src 'none'",
  BASE: "base-uri 'self'",
  FORM: "form-action 'self'",
  FRAME_ANCESTORS: "frame-ancestors 'none'",
} as const;

/**
 * Validates if an iframe URL is from a trusted domain
 */
export function isValidIframeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return TRUSTED_IFRAME_DOMAINS.some((domain) => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

/**
 * Sanitizes iframe URL for Google Drive
 */
export function sanitizeGoogleDriveUrl(fileId: string): string {
  // Remove any potentially malicious characters
  const cleanFileId = fileId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `https://drive.google.com/file/d/${cleanFileId}/preview`;
}

/**
 * Generates CSP header value
 */
export function generateCSP(additionalDirectives?: string[]): string {
  const directives = [
    CSP_DIRECTIVES.DEFAULT,
    CSP_DIRECTIVES.SCRIPT,
    CSP_DIRECTIVES.STYLE,
    CSP_DIRECTIVES.FONT,
    CSP_DIRECTIVES.IMG,
    CSP_DIRECTIVES.MEDIA,
    CSP_DIRECTIVES.CONNECT,
    CSP_DIRECTIVES.FRAME,
    CSP_DIRECTIVES.OBJECT,
    CSP_DIRECTIVES.BASE,
    CSP_DIRECTIVES.FORM,
    CSP_DIRECTIVES.FRAME_ANCESTORS,
    'upgrade-insecure-requests',
    ...(additionalDirectives || []),
  ];

  return directives.join('; ');
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;
