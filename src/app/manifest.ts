import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nūberu Bāgu - Movie Management Platform',
    short_name: 'Nūberu Bāgu',
    description:
      'Plateforme privée de gestion de films avec favoris utilisateur et analytics',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
        type: 'image/x-icon',
        purpose: 'maskable',
      },
      {
        src: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['entertainment', 'multimedia', 'utilities'],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Accéder au tableau de bord administrateur',
        url: '/dashboard',
        icons: [
          {
            src: '/images/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Films',
        short_name: 'Films',
        description: 'Parcourir la collection de films',
        url: '/movies',
        icons: [
          {
            src: '/images/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
