
'use client';

import * as React from 'react';
import type { Assessment } from '@/services/assessment-service';

type QuickActionContextType = {
  isNewCompanyDialogOpen: boolean;
  openNewCompanyDialog: () => void;
  closeNewCompanyDialog: () => void;
  onCompanyCreated: (() => void) | null;
  setOnCompanyCreated: (callback: (() => void) | null) => void;
  
  isNewContactDialogOpen: boolean;
  openNewContactDialog: () => void;
  closeNewContactDialog: () => void;
  onContactCreated: (() => void) | null;
  setOnContactCreated: (callback: (() => void) | null) => void;

  isAssessmentModalOpen: boolean;
  openAssessmentModal: (assessment?: Assessment | null) => void;
  closeAssessmentModal: () => void;
  assessmentToResume: Assessment | null;
  onAssessmentCompleted: (() => void) | null;
  setOnAssessmentCompleted: (callback: (() => void) | null) => void;

  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
};

const QuickActionContext = React.createContext<
  QuickActionContextType | undefined
>(undefined);

export function QuickActionProvider({ children }: { children: React.ReactNode }) {
  // New Company Dialog State
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] =
    React.useState(false);
  const [onCompanyCreated, setOnCompanyCreated] = React.useState<
    (() => void) | null
  >(null);

  // New Contact Dialog State
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] =
    React.useState(false);
  const [onContactCreated, setOnContactCreated] = React.useState<
    (() => void) | null
  >(null);

  // New Assessment Modal State
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [assessmentToResume, setAssessmentToResume] = React.useState<Assessment | null>(null);
  const [onAssessmentCompleted, setOnAssessmentCompleted] = React.useState<(() => void) | null>(null);

  // Global Search State
  const [globalSearchTerm, setGlobalSearchTerm] = React.useState('');

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

  const openNewContactDialog = React.useCallback(() => {
    setIsNewContactDialogOpen(true);
  }, []);

  const closeNewContactDialog = React.useCallback(() => {
    setIsNewContactDialogOpen(false);
  }, []);

  const handleSetOnContactCreated = React.useCallback(
    (callback: (() => void) | null) => {
      setOnContactCreated(() => callback);
    },
    []
  );

  const openAssessmentModal = React.useCallback((assessment: Assessment | null = null) => {
    setAssessmentToResume(assessment);
    setIsAssessmentModalOpen(true);
  }, []);

  const closeAssessmentModal = React.useCallback(() => {
    setIsAssessmentModalOpen(false);
    setAssessmentToResume(null);
  }, []);

  const handleSetOnAssessmentCompleted = React.useCallback(
    (callback: (() => void) | null) => {
      setOnAssessmentCompleted(() => callback);
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

        isNewContactDialogOpen,
        openNewContactDialog,
        closeNewContactDialog,
        onContactCreated,
        setOnContactCreated: handleSetOnContactCreated,
        
        isAssessmentModalOpen,
        openAssessmentModal,
        closeAssessmentModal,
        assessmentToResume,
        onAssessmentCompleted,
        setOnAssessmentCompleted: handleSetOnAssessmentCompleted,

        globalSearchTerm,
        setGlobalSearchTerm,
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
