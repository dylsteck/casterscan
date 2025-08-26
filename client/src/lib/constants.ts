import { DEFAULT_SNAPCHAIN_NODE } from 'shared/dist';

export { DEFAULT_SNAPCHAIN_NODE };

export const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3000';
