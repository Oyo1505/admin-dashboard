/**
 * Valide si une URL est une URL YouTube valide
 * @param url - L'URL à valider
 * @returns true si l'URL est valide, false sinon
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  // Vérifier si l'URL commence par data: (non autorisé par CORS)
  if (url.startsWith('data:')) return false;

  // Vérifier si c'est une URL YouTube valide
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

/**
 * Nettoie et valide une URL YouTube
 * @param url - L'URL à nettoyer
 * @returns L'URL nettoyée ou null si invalide
 */
export const cleanYoutubeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // Si l'URL commence par data:, elle est invalide
  if (url.startsWith('data:')) return null;

  // Nettoyer l'URL
  const cleanedUrl = url.trim();

  // Vérifier si c'est une URL YouTube valide
  if (isValidYoutubeUrl(cleanedUrl)) {
    return cleanedUrl;
  }

  return null;
};

/**
 * Extrait l'ID de la vidéo YouTube d'une URL
 * @param url - L'URL YouTube
 * @returns L'ID de la vidéo ou null si invalide
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!isValidYoutubeUrl(url)) return null;

  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);

  return match ? match[1] : null;
};
