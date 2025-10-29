/**
 * Validates if a URL is a valid YouTube URL
 * @param url - The URL to validate
 * @returns true if the URL is valid, false otherwise
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;

  // Check if the URL starts with data: (not allowed by CORS)
  if (url.startsWith('data:')) return false;

  // Check if it's a valid YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

/**
 * Cleans and validates a YouTube URL
 * @param url - The URL to clean
 * @returns The cleaned URL or null if invalid
 */
export const cleanYoutubeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // If the URL starts with data:, it's invalid
  if (url.startsWith('data:')) return null;

  // Clean the URL
  const cleanedUrl = url.trim();

  // Check if it's a valid YouTube URL
  if (isValidYoutubeUrl(cleanedUrl)) {
    return cleanedUrl;
  }

  return null;
};

/**
 * Extracts the YouTube video ID from a URL
 * @param url - The YouTube URL
 * @returns The video ID or null if invalid
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!isValidYoutubeUrl(url)) return null;

  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);

  return match ? match[1] : null;
};
