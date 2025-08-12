export const URL_BASE = '/';

export const URL_HOME = '/home';
export const URL_RESSOURCES = '/ressources';
export const URL_MOVIES = '/movies';
export const URL_MOVIE_ID = (id: string) => `${URL_MOVIES}/${id}`;

export const URL_PRIVACY = '/regles-de-confidentialite';
export const URL_LEGAL_MENTIONS = '/mentions-legales';

//DASHBOARD
export const URL_DASHBOARD = '/dashboard';
export const URL_MOVIE = 'movie';
export const URL_DASHBOARD_ROUTE = {
  settings: `${URL_DASHBOARD}/settings`,
  favorite: `${URL_DASHBOARD}/favorite`,
  movie: `${URL_DASHBOARD}/${URL_MOVIE}`,
  users: `${URL_DASHBOARD}/users`,
  movieAdd: `${URL_DASHBOARD}/${URL_MOVIE}/add-movie`,
  movieEdit: `${URL_DASHBOARD}/${URL_MOVIE}/edit-movie`,
  director: `${URL_DASHBOARD}/director`,
  genre: `${URL_DASHBOARD}/genre`,
  suggestion: `${URL_DASHBOARD}/suggestion`,
};

export const URL_DASHBOARD_MOVIE_ADD = (id: string) =>
  `${URL_DASHBOARD_ROUTE.movieAdd}/${id}`;
export const URL_DASHBOARD_MOVIE_EDIT = (id: string) =>
  `${URL_DASHBOARD_ROUTE.movieEdit}/${id}`;
