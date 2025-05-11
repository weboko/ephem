import React, { createContext, useContext, useState, useEffect } from 'react';
import { IWaku, Waku } from '@/services/waku';
import { LoadingScreen } from '../components/LoadingScreen';

type WakuContextType = {
  client: IWaku | undefined;
  isLoading: boolean;
};

const WakuContext = createContext<WakuContextType | undefined>(undefined);

export const useWaku = () => {
  const context = useContext(WakuContext);
  if (!context) {
    throw new Error('useWaku must be used within an WakuProvider');
  }
  return context;
};

export function WakuProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<IWaku>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // Start loading
        setIsLoading(true);
        
        // Create Waku client
        const _client = await Waku.create();
        
        setClient(_client);
      } catch (error) {
        console.error('Failed to initialize Waku client:', error);
      } finally {
        // End loading after a minimum time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    run();
  }, []);

  const contextValue: WakuContextType = {
    client,
    isLoading,
  };

  if (isLoading) {
    return <LoadingScreen message="ESTABLISHING SECURE CONNECTION" />;
  }

  return <WakuContext.Provider value={contextValue}>{children}</WakuContext.Provider>;
}