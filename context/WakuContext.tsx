import React, { createContext, useContext, useState, useEffect } from 'react';
import { IWaku, Waku } from '@/services/waku';

const WakuContext = createContext<IWaku | undefined>(undefined);

export const useWaku = () => {
  const context = useContext(WakuContext);
  if (!context) {
    throw new Error('useWaku must be used within an WakuProvider');
  }
  return context;
};

export function WakuProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<IWaku>();

  useEffect(() => {
    const run = async () => {
      const _client = await Waku.create();
      
      setClient(_client);
    };

    run();
  }, [setClient]);

  return <WakuContext.Provider value={client}>{children}</WakuContext.Provider>;
}