export * from './types';
export * from './snapchain';
export { Snapchain, SnapchainError } from './snapchain';

import { Snapchain } from './snapchain';

export const snapchain = Snapchain.getDefaultInstance();
export default snapchain;