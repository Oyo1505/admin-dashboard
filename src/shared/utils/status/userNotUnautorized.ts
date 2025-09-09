import { User } from '@/models/user/user';

export const MESSAGES_ERRORS_API = {
  400: 'Error signing up, please try again',
  401: 'Not authenticated to access this resource.',
  403: 'Not authenticated to access this resource.',
  404: 'Not found',
  409: 'Username already exists',
  429: 'Too many requests, please try again later',
  405: 'Method not allowed',
  406: 'Not acceptable',
  422: 'Sorry, the entered password is not allowed, please try a different one.',
  500: 'Internal server error',
  503: 'Service unavailable',
  504: 'Gateway timeout',
  502: 'Bad gateway',
  501: 'Not implemented',
  507: 'Insufficient storage',
  508: 'Loop detected',
  509: 'Bandwidth limit exceeded',
  510: 'Not extended',
  511: 'Network authentication required',
  512: 'Network read timeout error',
  513: 'Network connect timeout error',
  514: 'Network write timeout error',
  515: 'Network send file timeout error',
  516: 'Network receive file timeout error',
  517: 'Network authentication required',
  518: 'Network read timeout error',
};

export const userNotUnautorized = (user: User) => {
  if (user.role !== 'ADMIN')
    return {
      status: 403,
      message: 'Unautorized',
    };
};
