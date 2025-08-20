import { createFrames } from 'frames.js/next';

export type State = {
    count: number;
};

export const frames = createFrames<State>({
  initialState: {
    count: 0,
  },
  basePath: '/frames',
});
