/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useState, type ReactNode } from 'react';

interface SearchContextValue {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const SearchContext = createContext<SearchContextValue>({
  searchValue: '',
  setSearchValue: () => {},
});

interface SearchContextProviderProps {
  children: ReactNode;
}

export const SearchContextProvider = ({ children }: SearchContextProviderProps) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <SearchContext.Provider
      value={{
        searchValue,
        setSearchValue,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};