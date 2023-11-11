import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

type FarcasterKitProviderProps =  {
  baseURL?: string;
  children: ReactNode;
}

type FarcasterKitContextType =  {
  baseURL: string;
}

export type LatestCastsParams =  {
    fid?: number;
    fname?: string;
    parent_url?: string;
    cursor?: number;
    limit?: number;
}

export type CastParams = {
    hash?: string;
    cursor?: number;
    limit?: number;
}

export type SearchCastParams = {
    query: string;
    cursor?: number;
    limit?: number;
}

export type UserParams = {
    fid?: number;
    fname?: string;
    cursor?: number;
    limit?: number;
}

export type CastEmbed =  {
  url?: string;
  castId?: string;
}

export type Cast =  {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  timestamp: Date;
  fid: number;
  text: string;
  hash: string;
  parent_hash: string | null;
  fname: string | null;
  parent_fid: number | null;
  parent_url: string | null;
  pfp: string | null;
  embeds: CastEmbed[];
  mentions: number[];
  mentions_positions: number[];
}

export type CastResponse = {
  casts: Cast[]
};


const FarcasterKitContext = createContext<FarcasterKitContextType | undefined>(undefined);

export const FarcasterKitProvider: React.FC<FarcasterKitProviderProps> = ({ baseURL = 'https://api.farcasterkit.com', children }) => {
  return <FarcasterKitContext.Provider value={{ baseURL }}>{children}</FarcasterKitContext.Provider>;
};

export const useLatestCasts = (queryParams?: LatestCastsParams) => {
  const context = useContext(FarcasterKitContext);

  if (context === undefined) {
    throw new Error('useLatestCasts must be used within a FarcasterKitProvider');
  }

  const { baseURL } = context;
  const [data, setData] = useState<Cast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setLoading(true);

      try {
        const response = await axios.get(`${baseURL}/casts/latest`, { params: queryParams });
        const responseData = response.data as CastResponse;
        if (isMounted) {
          setData(responseData.casts || []);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching latest casts:', error);
          setLoading(false);
        }
      }
    };

    fetchData().catch((err) => {
      console.log('error', err);
    });

    return () => {
      isMounted = false;
    };
  }, [baseURL, JSON.stringify(queryParams)]);

  return { data, loading };
};

export const useCast = (queryParams?: CastParams) => {
    const context = useContext(FarcasterKitContext);
    const params = {
        cursor: queryParams?.cursor || 0,
        limit: queryParams?.limit || 100
    };
  
    if (context === undefined) {
      throw new Error('useCast must be used within a FarcasterKitProvider');
    }
  
    const { baseURL } = context;
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const getCast = async () => {
        try {
          const response = await axios.get(`${baseURL}/casts/${queryParams?.hash}`, {params: params});
          const responseData = response.data;
          if (responseData && responseData.cast) {
            setData(responseData.cast);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching cast:', error);
          setLoading(false);
        }
      };
  
      getCast();
    }, [baseURL, queryParams?.hash]);
  
    return { data, loading };
  };

// export const useReplies = (queryParams?: CastParams) => {
//     const context = useContext(FarcasterKitContext);
//     const params = {
//         cursor: queryParams?.cursor || 0,
//         limit: queryParams?.limit || 100
//     };
  
//     if (context === undefined) {
//       throw new Error('useReplies must be used within a FarcasterKitProvider');
//     }
  
//     const { baseURL } = context;
    
//     const [data, setData] = useState<any>(null);
//     const [loading, setLoading] = useState<boolean>(true);
  
//     useEffect(() => {
//       const getReplies = async () => {
//         try {
//           const response = await axios.get(`${baseURL}/casts/replies?parent_hash=${queryParams?.hash ?? ''}`, {params: params});
//           const responseData = response.data;
//           // TODO: change API response to .casts
//           if (responseData && responseData.cast) {
//             setData(responseData.cast);
//             setLoading(false);
//           }
//         } catch (error) {
//           console.error('Error fetching replies:', error);
//           setLoading(false);
//         }
//       };
  
//       getReplies();
//     }, [baseURL, queryParams?.hash]);
  
//     return { data, loading };
//   };
export const useReplies = (queryParams?: CastParams) => {
  const context = useContext(FarcasterKitContext);

  if (context === undefined) {
    throw new Error('useReplies must be used within a FarcasterKitProvider');
  }

  const { baseURL } = context;
  const [data, setData] = useState<Cast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setLoading(true);

      try {
        const response = await axios.get(`${baseURL}/casts/replies?parent_hash=${queryParams?.hash ?? ''}`, { params: queryParams });
        const responseData = response.data as CastResponse;
        if (isMounted) {
          setData(responseData.casts || []);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching cast replies:', error);
          setLoading(false);
        }
      }
    };

    fetchData().catch((err) => {
      console.log('error', err);
    });

    return () => {
      isMounted = false;
    };
  }, [baseURL, JSON.stringify(queryParams)]);

  return { data, loading };
};

  export const useSearch = (queryParams?: SearchCastParams) => {
    const context = useContext(FarcasterKitContext);
    const params = {
        cursor: queryParams?.cursor || 0,
        limit: queryParams?.limit || 100
    };
  
    if (context === undefined) {
      throw new Error('useSearch must be used within a FarcasterKitProvider');
    }
  
    const { baseURL } = context;
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const getSearch = async () => {
        try {
          const response = await axios.get(`${baseURL}/casts/search?query=${queryParams?.query}`, {params: params});
          const responseData = response.data;
          // TODO: change API response to .casts
          if (responseData && responseData.cast) {
            setData(responseData.cast);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
          setLoading(false);
        }
      };
  
      getSearch();
    }, [baseURL, queryParams?.query]);
  
    return { data, loading };
  };

  export const useUser = (queryParams?: UserParams) => {
    const context = useContext(FarcasterKitContext);
    const params = {
        cursor: queryParams?.cursor || 0,
        limit: queryParams?.limit || 100
    };
    const fidOrFname = queryParams?.fid ? `fid=${queryParams?.fid}` : `fname=${queryParams?.fname}`
  
    if (context === undefined) {
      throw new Error('useSearch must be used within a FarcasterKitProvider');
    }
  
    const { baseURL } = context;
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const getUser = async () => {
        try {
          const response = await axios.get(`${baseURL}/users/user?${fidOrFname}`, {params: params});
          const responseData = response.data;
          if (responseData && responseData.user) {
            setData(responseData.user);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setLoading(false);
        }
      };
  
      getUser();
    }, [baseURL, queryParams?.fid, queryParams?.fname]);
  
    return { data, loading };
  };