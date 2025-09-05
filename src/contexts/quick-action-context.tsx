
'use client';

import * as React from 'react';
import type { Assessment } from '@/services/assessment-service';
import type { Epic } from '@/services/epic-service';
import type { BacklogItem } from '@/services/backlog-item-service';
import type { Sprint } from '@/services/sprint-service';
import type { Task } from '@/services/task-service';
import type { Contact } from '@/services/contact-service';
import type { Project } from '@/services/project-service';

type QuickActionContextType = {
  isNewCompanyDialogOpen: boolean;
  openNewCompanyDialog: () => void;
  closeNewCompanyDialog: () => void;
  onCompanyCreated: (() => void) | null;
  setOnCompanyCreated: (callback: (() => void) | null) => (() => void) | void;
  
  isNewContactDialogOpen: boolean;
  openNewContactDialog: () => void;
  closeNewContactDialog: () => void;
  onContactCreated: (() => void) | null;
  setOnContactCreated: (callback: (() => void) | null) => (() => void) | void;

  isAssessmentModalOpen: boolean;
  openAssessmentModal: (assessment?: Assessment | null) => void;
  closeAssessmentModal: () => void;
  assessmentToResume: Assessment | null;
  onAssessmentCompleted: (() => void) | null;
  setOnAssessmentCompleted: (callback: (() => void) | null) => (() => void) | void;

  isNewProjectDialogOpen: boolean;
  openNewProjectDialog: () => void;
  closeNewProjectDialog: () => void;
  onProjectCreated: (() => void) | null;
  setOnProjectCreated: (callback: (() => void) | null) => (() => void) | void;

  isEditProjectDialogOpen: boolean;
  openEditProjectDialog: (project: Project) => void;
  closeEditProjectDialog: () => void;
  onProjectUpdated: (() => void) | null;
  setOnProjectUpdated: (callback: (() => void) | null) => (() => void) | void;
  editProjectData: Project | null;

  isNewBacklogItemDialogOpen: boolean;
  openNewBacklogItemDialog: (projectId: string, companyId: string, epics: Epic[]) => void;
  closeNewBacklogItemDialog: () => void;
  onBacklogItemCreated: (() => void) | null;
  setOnBacklogItemCreated: (callback: (() => void) | null) => (() => void) | void;
  newBacklogItemData: { projectId: string, companyId: string, epics: Epic[] } | null;

  isNewEpicDialogOpen: boolean;
  openNewEpicDialog: (projectId: string) => void;
  closeNewEpicDialog: () => void;
  onEpicCreated: (() => void) | null;
  setOnEpicCreated: (callback: (() => void) | null) => (() => void) | void;
  newEpicData: { projectId: string } | null;

  isEditEpicDialogOpen: boolean;
  openEditEpicDialog: (epic: Epic) => void;
  closeEditEpicDialog: () => void;
  onEpicUpdated: (() => void) | null;
  setOnEpicUpdated: (callback: (() => void) | null) => (() => void) | void;
  editEpicData: Epic | null;

  isEditBacklogItemDialogOpen: boolean;
  openEditBacklogItemDialog: (item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[]) => void;
  closeEditBacklogItemDialog: () => void;
  onBacklogItemUpdated: (() => void) | null;
  setOnBacklogItemUpdated: (callback: (() => void) | null) => (() => void) | void;
  editBacklogItemData: { item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[] } | null;

  isNewSprintDialogOpen: boolean;
  openNewSprintDialog: (projectId: string) => void;
  closeNewSprintDialog: () => void;
  onSprintCreated: (() => void) | null;
  setOnSprintCreated: (callback: (() => void) | null) => (() => void) | void;
  newSprintData: { projectId: string } | null;

  isEditSprintDialogOpen: boolean;
  openEditSprintDialog: (sprint: Sprint) => void;
  closeEditSprintDialog: () => void;
  onSprintUpdated: (() => void) | null;
  setOnSprintUpdated: (callback: (() => void) | null) => (() => void) | void;
  editSprintData: Sprint | null;

  isEditTaskDialogOpen: boolean;
  openEditTaskDialog: (task: Task, contacts: Contact[]) => void;
  closeEditTaskDialog: () => void;
  onTaskUpdated: (() => void) | null;
  setOnTaskUpdated: (callback: (() => void) | null) => (() => void) | void;
  editTaskData: { task: Task, contacts: Contact[] } | null;

  isNewUserStoryDialogOpen: boolean;
  openNewUserStoryDialog: () => void;
  closeNewUserStoryDialog: () => void;
  onUserStoryCreated: (() => void) | null;
  setOnUserStoryCreated: (callback: (() => void) | null) => (() => void) | void;

  isAddFromLibraryDialogOpen: boolean;
  openAddFromLibraryDialog: (projectId: string, epics: Epic[]) => void;
  closeAddFromLibraryDialog: () => void;
  onAddFromLibrary: (() => void) | null;
  setOnAddFromLibrary: (callback: (() => void) | null) => (() => void) | void;
  addFromLibraryData: { projectId: string, epics: Epic[] } | null;

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
  
  // New Project Dialog State
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = React.useState(false);
  const [onProjectCreated, setOnProjectCreated] = React.useState<(() => void) | null>(null);

  // Edit Project Dialog State
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = React.useState(false);
  const [onProjectUpdated, setOnProjectUpdated] = React.useState<(() => void) | null>(null);
  const [editProjectData, setEditProjectData] = React.useState<Project | null>(null);

  // New Backlog Item Dialog State
  const [isNewBacklogItemDialogOpen, setIsNewBacklogItemDialogOpen] = React.useState(false);
  const [onBacklogItemCreated, setOnBacklogItemCreated] = React.useState<(() => void) | null>(null);
  const [newBacklogItemData, setNewBacklogItemData] = React.useState<{ projectId: string, companyId: string, epics: Epic[] } | null>(null);

  // New Epic Dialog State
  const [isNewEpicDialogOpen, setIsNewEpicDialogOpen] = React.useState(false);
  const [onEpicCreated, setOnEpicCreated] = React.useState<(() => void) | null>(null);
  const [newEpicData, setNewEpicData] = React.useState<{ projectId: string } | null>(null);

  // Edit Epic Dialog State
  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const [onEpicUpdated, setOnEpicUpdated] = React.useState<(() => void) | null>(null);
  const [editEpicData, setEditEpicData] = React.useState<Epic | null>(null);

  // Edit Backlog Item Dialog State
  const [isEditBacklogItemDialogOpen, setIsEditBacklogItemDialogOpen] = React.useState(false);
  const [onBacklogItemUpdated, setOnBacklogItemUpdated] = React.useState<(() => void) | null>(null);
  const [editBacklogItemData, setEditBacklogItemData] = React.useState<{ item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[] } | null>(null);

  // New Sprint Dialog State
  const [isNewSprintDialogOpen, setIsNewSprintDialogOpen] = React.useState(false);
  const [onSprintCreated, setOnSprintCreated] = React.useState<(() => void) | null>(null);
  const [newSprintData, setNewSprintData] = React.useState<{ projectId: string } | null>(null);
  
  // Edit Sprint Dialog State
  const [isEditSprintDialogOpen, setIsEditSprintDialogOpen] = React.useState(false);
  const [onSprintUpdated, setOnSprintUpdated] = React.useState<(() => void) | null>(null);
  const [editSprintData, setEditSprintData] = React.useState<Sprint | null>(null);

  // Edit Task Dialog State
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = React.useState(false);
  const [onTaskUpdated, setOnTaskUpdated] = React.useState<(() => void) | null>(null);
  const [editTaskData, setEditTaskData] = React.useState<{ task: Task, contacts: Contact[] } | null>(null);

  // New User Story Dialog State
  const [isNewUserStoryDialogOpen, setIsNewUserStoryDialogOpen] = React.useState(false);
  const [onUserStoryCreated, setOnUserStoryCreated] = React.useState<(() => void) | null>(null);
  
  // Add from Library Dialog State
  const [isAddFromLibraryDialogOpen, setIsAddFromLibraryDialogOpen] = React.useState(false);
  const [onAddFromLibrary, setOnAddFromLibrary] = React.useState<(() => void) | null>(null);
  const [addFromLibraryData, setAddFromLibraryData] = React.useState<{ projectId: string, epics: Epic[] } | null>(null);

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
      return () => setOnCompanyCreated(null);
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
       return () => setOnContactCreated(null);
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
       return () => setOnAssessmentCompleted(null);
    },
    []
  );
  
  const openNewProjectDialog = React.useCallback(() => {
    setIsNewProjectDialogOpen(true);
  }, []);

  const closeNewProjectDialog = React.useCallback(() => {
    setIsNewProjectDialogOpen(false);
  }, []);

  const handleSetOnProjectCreated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnProjectCreated(() => callback);
        return () => setOnProjectCreated(null);
    },
    []
  );

  const openEditProjectDialog = React.useCallback((project: Project) => {
    setEditProjectData(project);
    setIsEditProjectDialogOpen(true);
  }, []);

  const closeEditProjectDialog = React.useCallback(() => {
    setIsEditProjectDialogOpen(false);
    setEditProjectData(null);
  }, []);

  const handleSetOnProjectUpdated = React.useCallback(
    (callback: (() => void) | null) => {
      setOnProjectUpdated(() => callback);
      return () => setOnProjectUpdated(null);
    },
    []
  );

  const openNewBacklogItemDialog = React.useCallback((projectId: string, companyId: string, epics: Epic[]) => {
    setNewBacklogItemData({ projectId, companyId, epics });
    setIsNewBacklogItemDialogOpen(true);
  }, []);

  const closeNewBacklogItemDialog = React.useCallback(() => {
    setIsNewBacklogItemDialogOpen(false);
    setNewBacklogItemData(null);
  }, []);

  const handleSetOnBacklogItemCreated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnBacklogItemCreated(() => callback);
        return () => setOnBacklogItemCreated(null);
    },
    []
  );
  
  const openNewEpicDialog = React.useCallback((projectId: string) => {
    setNewEpicData({ projectId });
    setIsNewEpicDialogOpen(true);
  }, []);

  const closeNewEpicDialog = React.useCallback(() => {
    setIsNewEpicDialogOpen(false);
    setNewEpicData(null);
  }, []);

  const handleSetOnEpicCreated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnEpicCreated(() => callback);
        return () => setOnEpicCreated(null);
    },
    []
  );

  const openEditEpicDialog = React.useCallback((epic: Epic) => {
    setEditEpicData(epic);
    setIsEditEpicDialogOpen(true);
  }, []);

  const closeEditEpicDialog = React.useCallback(() => {
    setIsEditEpicDialogOpen(false);
    setEditEpicData(null);
  }, []);

  const handleSetOnEpicUpdated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnEpicUpdated(() => callback);
        return () => setOnEpicUpdated(null);
    },
    []
  );

  const openEditBacklogItemDialog = React.useCallback((item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[]) => {
    setEditBacklogItemData({ item, epics, sprints, contacts });
    setIsEditBacklogItemDialogOpen(true);
  }, []);

  const closeEditBacklogItemDialog = React.useCallback(() => {
    setIsEditBacklogItemDialogOpen(false);
    setEditBacklogItemData(null);
  }, []);

  const handleSetOnBacklogItemUpdated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnBacklogItemUpdated(() => callback);
        return () => setOnBacklogItemUpdated(null);
    },
    []
  );
  
  const openNewSprintDialog = React.useCallback((projectId: string) => {
    setNewSprintData({ projectId });
    setIsNewSprintDialogOpen(true);
  }, []);

  const closeNewSprintDialog = React.useCallback(() => {
    setIsNewSprintDialogOpen(false);
    setNewSprintData(null);
  }, []);

  const handleSetOnSprintCreated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnSprintCreated(() => callback);
        return () => setOnSprintCreated(null);
    },
    []
  );

  const openEditSprintDialog = React.useCallback((sprint: Sprint) => {
    setEditSprintData(sprint);
    setIsEditSprintDialogOpen(true);
  }, []);

  const closeEditSprintDialog = React.useCallback(() => {
    setIsEditSprintDialogOpen(false);
    setEditSprintData(null);
  }, []);

  const handleSetOnSprintUpdated = React.useCallback(
    (callback: (() => void) | null) => {
      setOnSprintUpdated(() => callback);
      return () => setOnSprintUpdated(null);
    },
    []
  );

  const openEditTaskDialog = React.useCallback((task: Task, contacts: Contact[]) => {
    setEditTaskData({ task, contacts });
    setIsEditTaskDialogOpen(true);
  }, []);

  const closeEditTaskDialog = React.useCallback(() => {
    setIsEditTaskDialogOpen(false);
    setEditTaskData(null);
  }, []);

  const handleSetOnTaskUpdated = React.useCallback(
    (callback: (() => void) | null) => {
      setOnTaskUpdated(() => callback);
      return () => setOnTaskUpdated(null);
    },
    []
  );

  const openNewUserStoryDialog = React.useCallback(() => {
    setIsNewUserStoryDialogOpen(true);
  }, []);

  const closeNewUserStoryDialog = React.useCallback(() => {
    setIsNewUserStoryDialogOpen(false);
  }, []);

  const handleSetOnUserStoryCreated = React.useCallback(
    (callback: (() => void) | null) => {
        setOnUserStoryCreated(() => callback);
        return () => setOnUserStoryCreated(null);
    },
    []
  );

  const openAddFromLibraryDialog = React.useCallback((projectId: string, epics: Epic[]) => {
    setAddFromLibraryData({ projectId, epics });
    setIsAddFromLibraryDialogOpen(true);
  }, []);

  const closeAddFromLibraryDialog = React.useCallback(() => {
    setIsAddFromLibraryDialogOpen(false);
    setAddFromLibraryData(null);
  }, []);

  const handleSetOnAddFromLibrary = React.useCallback(
    (callback: (() => void) | null) => {
        setOnAddFromLibrary(() => callback);
        return () => setOnAddFromLibrary(null);
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
        
        isNewProjectDialogOpen,
        openNewProjectDialog,
        closeNewProjectDialog,
        onProjectCreated,
        setOnProjectCreated: handleSetOnProjectCreated,

        isEditProjectDialogOpen,
        openEditProjectDialog,
        closeEditProjectDialog,
        onProjectUpdated,
        setOnProjectUpdated: handleSetOnProjectUpdated,
        editProjectData,

        isNewBacklogItemDialogOpen,
        openNewBacklogItemDialog,
        closeNewBacklogItemDialog,
        onBacklogItemCreated,
        setOnBacklogItemCreated: handleSetOnBacklogItemCreated,
        newBacklogItemData,

        isNewEpicDialogOpen,
        openNewEpicDialog,
        closeNewEpicDialog,
        onEpicCreated,
        setOnEpicCreated: handleSetOnEpicCreated,
        newEpicData,

        isEditEpicDialogOpen,
        openEditEpicDialog,
        closeEditEpicDialog,
        onEpicUpdated,
        setOnEpicUpdated: handleSetOnEpicUpdated,
        editEpicData,

        isEditBacklogItemDialogOpen,
        openEditBacklogItemDialog,
        closeEditBacklogItemDialog,
        onBacklogItemUpdated,
        setOnBacklogItemUpdated: handleSetOnBacklogItemUpdated,
        editBacklogItemData,

        isNewSprintDialogOpen,
        openNewSprintDialog,
        closeNewSprintDialog,
        onSprintCreated,
        setOnSprintCreated: handleSetOnSprintCreated,
        newSprintData,

        isEditSprintDialogOpen,
        openEditSprintDialog,
        closeEditSprintDialog,
        onSprintUpdated,
        setOnSprintUpdated: handleSetOnSprintUpdated,
        editSprintData,

        isEditTaskDialogOpen,
        openEditTaskDialog,
        closeEditTaskDialog,
        onTaskUpdated,
        setOnTaskUpdated: handleSetOnTaskUpdated,
        editTaskData,
        
        isNewUserStoryDialogOpen,
        openNewUserStoryDialog,
        closeNewUserStoryDialog,
        onUserStoryCreated,
        setOnUserStoryCreated: handleSetOnUserStoryCreated,
        
        isAddFromLibraryDialogOpen,
        openAddFromLibraryDialog,
        closeAddFromLibraryDialog,
        onAddFromLibrary,
        setOnAddFromLibrary: handleSetOnAddFromLibrary,
        addFromLibraryData,

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
