export const getLocalStorage = (key: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    const data = ls.getItem(key);
    return data;
  }

  throw new Error('Local storage is not available.');
};

export const setLocalStorage = (key: string, value: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    ls.setItem(key, value);
    return;
  }

  throw new Error('Local storage is not available.');
};
