import { Session } from 'next-auth';

export type SelectUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  accounts?: unknown;
  sessions?: Session;
  role: 'USER' | 'ADMIN';
};
