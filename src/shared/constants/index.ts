// Constantes globales de l'application

export const APP_CONFIG = {
  name: 'Admin Dashboard',
  version: '1.0.0',
  description: 'Plateforme de gestion de films',
} as const;

export const API_ENDPOINTS = {
  movies: '/api/movies',
  users: '/api/users',
  auth: '/api/auth',
  upload: '/api/upload',
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
} as const;

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  JP: 'jp',
} as const;

export const MOVIE_STATUS = {
  PUBLISHED: true,
  DRAFT: false,
} as const;
