export const URL_BASE = '/'

export const URL_HOME = '/home'
export const URL_RESSOURCES = '/ressources'
export const URL_MOVIES = '/movies'
export const URL_MOVIE_ID = (id:string) => `${URL_MOVIES}/${id}`

export const URL_PRIVACY = '/regles-de-confidentialite'
export const URL_LEGAL_MENTIONS = '/mentions-legales'

//DASHBOARD
export const URL_DASHBOARD = '/dashboard'
export const URL_SETTINGS = `${URL_DASHBOARD}/settings`
export const URL_FAVORITE = `${URL_DASHBOARD}/favorite`
export const URL_DASHBOARD_MOVIE = `${URL_DASHBOARD}/movie`
export const URL_DASHBOARD_USERS = `${URL_DASHBOARD}/users`
export const URL_DASHBOARD_MOVIE_ADD = (id:string) =>  `${URL_DASHBOARD}/movie/add-movie/${id}`
export const URL_DASHBOARD_MOVIE_EDIT = (id:string) => `${URL_DASHBOARD}/movie/edit-movie/${id}`
export const URL_USERS = `${URL_DASHBOARD}/users`
export const URL_DIRECTOR_SECTION = `${URL_DASHBOARD}/director`
export const URL_GENRE_SECTION = `${URL_DASHBOARD}/genre`
export const URL_SUGGESTION = `${URL_DASHBOARD}/suggestion`
