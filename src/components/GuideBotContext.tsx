"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type GuideBotContextType = {
  message: string | null;
  showMessage: (msg: string) => void;
  clearMessage: () => void;
  showChecklist: boolean;
  setShowChecklist: (show: boolean) => void;
};

const GuideBotContext = createContext<GuideBotContextType | undefined>(undefined);

export function GuideBotProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState<boolean>(false);

  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <GuideBotContext.Provider value={{ message, showMessage, clearMessage, showChecklist, setShowChecklist }}>
      {children}
    </GuideBotContext.Provider>
  );
}

export function useGuideBot() {
  const context = useContext(GuideBotContext);
  if (context === undefined) {
    throw new Error('useGuideBot must be used within a GuideBotProvider');
  }
  return context;
}
