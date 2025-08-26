import { DEFAULT_SNAPCHAIN_NODE } from 'shared/dist';

export { DEFAULT_SNAPCHAIN_NODE };

// Determine if we're in production by checking hostname or NODE_ENV
const isProduction = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') || 
                    process.env.NODE_ENV === 'production';

export const SERVER_URL = isProduction
  ? (typeof window !== 'undefined' ? window.location.origin : 'https://casterscan.fly.dev')
  : 'http://localhost:3000';
