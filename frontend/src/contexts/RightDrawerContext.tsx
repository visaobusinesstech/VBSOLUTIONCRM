import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RightDrawerContextType {
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (isOpen: boolean) => void;
}

const RightDrawerContext = createContext<RightDrawerContextType | undefined>(undefined);

export function RightDrawerProvider({ children }: { children: ReactNode }) {
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  return (
    <RightDrawerContext.Provider value={{ isRightDrawerOpen, setIsRightDrawerOpen }}>
      {children}
    </RightDrawerContext.Provider>
  );
}

export function useRightDrawer() {
  const context = useContext(RightDrawerContext);
  if (context === undefined) {
    throw new Error('useRightDrawer must be used within a RightDrawerProvider');
  }
  return context;
}
