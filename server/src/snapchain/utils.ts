export const createEventLink = (hash?: Uint8Array, id?: string): string => {
  if (hash) {
    return `/casts/0x${Buffer.from(hash).toString('hex')}`;
  }
  if (id) {
    return `/events/${id}`;
  }
  return '/404';
};

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
