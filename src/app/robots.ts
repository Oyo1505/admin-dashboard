import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/', // Bloquer complètement l'indexation de tout le site
      },
    ],
    // Pas de sitemap car le site ne doit pas être référencé
  };
}
