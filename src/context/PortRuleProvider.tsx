
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSessionStorage } from '@/hooks/use-session-storage';
import { initialServerPortData } from '@/lib/data';
import type { PortRule } from '@/components/PortRuleForm';

type ServerData = {
  serverName: string;
  publicIp: string;
  rules: PortRule[];
};

interface PortRuleContextType {
  serverData: ServerData[];
  setServerData: (data: ServerData[] | ((prevData: ServerData[]) => ServerData[])) => void;
}

const PortRuleContext = createContext<PortRuleContextType | undefined>(undefined);

export const PortRuleProvider = ({ children }: { children: ReactNode }) => {
  const [serverData, setServerData] = useSessionStorage<ServerData[]>('allPortRules', initialServerPortData);

  return (
    <PortRuleContext.Provider value={{ serverData, setServerData }}>
      {children}
    </PortRuleContext.Provider>
  );
};

export const usePortRules = () => {
  const context = useContext(PortRuleContext);
  if (!context) {
    throw new Error('usePortRules must be used within a PortRuleProvider');
  }
  return context;
};
