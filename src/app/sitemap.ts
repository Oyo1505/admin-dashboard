import prisma from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Dynamic movie routes - only include public/accessible movies
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      where: {
        publish: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const movieRoutes: MetadataRoute.Sitemap = movies.map((movie) => ({
      url: `${baseUrl}/movies/${movie.id}`,
      lastModified: movie.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Main movies listing page
    const movieListingRoutes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/movies`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];

    // Generate genre-based routes if needed
    const genres = await prisma.genre.findMany({
      select: {
        id: true,
        nameEN: true,
      },
    });

    const genreRoutes: MetadataRoute.Sitemap = genres.map((genre) => ({
      url: `${baseUrl}/movies?genre=${genre.nameEN}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [
      ...staticRoutes,
      ...movieListingRoutes,
      ...movieRoutes,
      ...genreRoutes,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes only if database connection fails
    return staticRoutes;
  }
}
