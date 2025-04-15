import { createClient } from 'redis';

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST_URL,
    port: parseInt(process.env.REDIS_PORT || '18218')
  }
});

client.on('error', err => console.log('Redis Client Error', err));

export default client; 