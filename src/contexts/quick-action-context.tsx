
'use client';

import * as React from 'react';

type QuickActionContextType = {
  isNewCompanyDialogOpen: boolean;
  openNewCompanyDialog: () => void;
  closeNewCompanyDialog: () => void;
  onCompanyCreated: (() => void) | null;
  setOnCompanyCreated: (
    callback: (() => void) | null
  ) => void;
};

const QuickActionContext = React.createContext<
  QuickActionContextType | undefined
>(undefined);

export function QuickActionProvider({ children }: { children: React.ReactNode }) {
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] =
    React.useState(false);
  const [onCompanyCreated, setOnCompanyCreated] = React.useState<
    (() => void) | null
  >(null);

  const openNewCompanyDialog = React.useCallback(() => {
    setIsNewCompanyDialogOpen(true);
  }, []);

  const closeNewCompanyDialog = React.useCallback(() => {
    setIsNewCompanyDialogOpen(false);
  }, []);

  const handleSetOnCompanyCreated = React.useCallback(
    (callback: (() => void) | null) => {
      setOnCompanyCreated(() => callback);
    },
    []
  );

  return (
    <QuickActionContext.Provider
      value={{
        isNewCompanyDialogOpen,
        openNewCompanyDialog,
        closeNewCompanyDialog,
        onCompanyCreated,
        setOnCompanyCreated: handleSetOnCompanyCreated,
      }}
    >
      {children}
    </QuickActionContext.Provider>
  );
}

export const useQuickAction = () => {
  const context = React.useContext(QuickActionContext);
  if (context === undefined) {
    throw new Error(
      'useQuickAction must be used within a QuickActionProvider'
    );
  }
  return context;
};
