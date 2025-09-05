
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
  const onCompanyCreatedRef = React.useRef<(() => void) | null>(null);

  // New Contact Dialog State
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] =
    React.useState(false);
  const onContactCreatedRef = React.useRef<(() => void) | null>(null);

  // New Assessment Modal State
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [assessmentToResume, setAssessmentToResume] = React.useState<Assessment | null>(null);
  const onAssessmentCompletedRef = React.useRef<(() => void) | null>(null);
  
  // New Project Dialog State
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = React.useState(false);
  const onProjectCreatedRef = React.useRef<(() => void) | null>(null);

  // Edit Project Dialog State
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = React.useState(false);
  const onProjectUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editProjectData, setEditProjectData] = React.useState<Project | null>(null);

  // New Backlog Item Dialog State
  const [isNewBacklogItemDialogOpen, setIsNewBacklogItemDialogOpen] = React.useState(false);
  const onBacklogItemCreatedRef = React.useRef<(() => void) | null>(null);
  const [newBacklogItemData, setNewBacklogItemData] = React.useState<{ projectId: string, companyId: string, epics: Epic[] } | null>(null);

  // New Epic Dialog State
  const [isNewEpicDialogOpen, setIsNewEpicDialogOpen] = React.useState(false);
  const onEpicCreatedRef = React.useRef<(() => void) | null>(null);
  const [newEpicData, setNewEpicData] = React.useState<{ projectId: string } | null>(null);

  // Edit Epic Dialog State
  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const onEpicUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editEpicData, setEditEpicData] = React.useState<Epic | null>(null);

  // Edit Backlog Item Dialog State
  const [isEditBacklogItemDialogOpen, setIsEditBacklogItemDialogOpen] = React.useState(false);
  const onBacklogItemUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editBacklogItemData, setEditBacklogItemData] = React.useState<{ item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[] } | null>(null);

  // New Sprint Dialog State
  const [isNewSprintDialogOpen, setIsNewSprintDialogOpen] = React.useState(false);
  const onSprintCreatedRef = React.useRef<(() => void) | null>(null);
  const [newSprintData, setNewSprintData] = React.useState<{ projectId: string } | null>(null);
  
  // Edit Sprint Dialog State
  const [isEditSprintDialogOpen, setIsEditSprintDialogOpen] = React.useState(false);
  const onSprintUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editSprintData, setEditSprintData] = React.useState<Sprint | null>(null);

  // Edit Task Dialog State
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = React.useState(false);
  const onTaskUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editTaskData, setEditTaskData] = React.useState<{ task: Task, contacts: Contact[] } | null>(null);

  // New User Story Dialog State
  const [isNewUserStoryDialogOpen, setIsNewUserStoryDialogOpen] = React.useState(false);
  const onUserStoryCreatedRef = React.useRef<(() => void) | null>(null);
  
  // Add from Library Dialog State
  const [isAddFromLibraryDialogOpen, setIsAddFromLibraryDialogOpen] = React.useState(false);
  const onAddFromLibraryRef = React.useRef<(() => void) | null>(null);
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
      onCompanyCreatedRef.current = callback;
      return () => { onCompanyCreatedRef.current = null; };
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
      onContactCreatedRef.current = callback;
       return () => { onContactCreatedRef.current = null; };
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
      onAssessmentCompletedRef.current = callback;
       return () => { onAssessmentCompletedRef.current = null; };
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
        onProjectCreatedRef.current = callback;
        return () => { onProjectCreatedRef.current = null; };
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
      onProjectUpdatedRef.current = callback;
      return () => { onProjectUpdatedRef.current = null; };
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
        onBacklogItemCreatedRef.current = callback;
        return () => { onBacklogItemCreatedRef.current = null; };
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
        onEpicCreatedRef.current = callback;
        return () => { onEpicCreatedRef.current = null; };
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
        onEpicUpdatedRef.current = callback;
        return () => { onEpicUpdatedRef.current = null; };
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
        onBacklogItemUpdatedRef.current = callback;
        return () => { onBacklogItemUpdatedRef.current = null; };
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
        onSprintCreatedRef.current = callback;
        return () => { onSprintCreatedRef.current = null; };
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
      onSprintUpdatedRef.current = callback;
      return () => { onSprintUpdatedRef.current = null; };
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
      onTaskUpdatedRef.current = callback;
      return () => { onTaskUpdatedRef.current = null; };
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
        onUserStoryCreatedRef.current = callback;
        return () => { onUserStoryCreatedRef.current = null; };
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
        onAddFromLibraryRef.current = callback;
        return () => { onAddFromLibraryRef.current = null; };
    },
    []
  );


  return (
    <QuickActionContext.Provider
      value={{
        isNewCompanyDialogOpen,
        openNewCompanyDialog,
        closeNewCompanyDialog,
        onCompanyCreated: onCompanyCreatedRef.current,
        setOnCompanyCreated: handleSetOnCompanyCreated,

        isNewContactDialogOpen,
        openNewContactDialog,
        closeNewContactDialog,
        onContactCreated: onContactCreatedRef.current,
        setOnContactCreated: handleSetOnContactCreated,
        
        isAssessmentModalOpen,
        openAssessmentModal,
        closeAssessmentModal,
        assessmentToResume,
        onAssessmentCompleted: onAssessmentCompletedRef.current,
        setOnAssessmentCompleted: handleSetOnAssessmentCompleted,
        
        isNewProjectDialogOpen,
        openNewProjectDialog,
        closeNewProjectDialog,
        onProjectCreated: onProjectCreatedRef.current,
        setOnProjectCreated: handleSetOnProjectCreated,

        isEditProjectDialogOpen,
        openEditProjectDialog,
        closeEditProjectDialog,
        onProjectUpdated: onProjectUpdatedRef.current,
        setOnProjectUpdated: handleSetOnProjectUpdated,
        editProjectData,

        isNewBacklogItemDialogOpen,
        openNewBacklogItemDialog,
        closeNewBacklogItemDialog,
        onBacklogItemCreated: onBacklogItemCreatedRef.current,
        setOnBacklogItemCreated: handleSetOnBacklogItemCreated,
        newBacklogItemData,

        isNewEpicDialogOpen,
        openNewEpicDialog,
        closeNewEpicDialog,
        onEpicCreated: onEpicCreatedRef.current,
        setOnEpicCreated: handleSetOnEpicCreated,
        newEpicData,

        isEditEpicDialogOpen,
        openEditEpicDialog,
        closeEditEpicDialog,
        onEpicUpdated: onEpicUpdatedRef.current,
        setOnEpicUpdated: handleSetOnEpicUpdated,
        editEpicData,

        isEditBacklogItemDialogOpen,
        openEditBacklogItemDialog,
        closeEditBacklogItemDialog,
        onBacklogItemUpdated: onBacklogItemUpdatedRef.current,
        setOnBacklogItemUpdated: handleSetOnBacklogItemUpdated,
        editBacklogItemData,

        isNewSprintDialogOpen,
        openNewSprintDialog,
        closeNewSprintDialog,
        onSprintCreated: onSprintCreatedRef.current,
        setOnSprintCreated: handleSetOnSprintCreated,
        newSprintData,

        isEditSprintDialogOpen,
        openEditSprintDialog,
        closeEditSprintDialog,
        onSprintUpdated: onSprintUpdatedRef.current,
        setOnSprintUpdated: handleSetOnSprintUpdated,
        editSprintData,

        isEditTaskDialogOpen,
        openEditTaskDialog,
        closeEditTaskDialog,
        onTaskUpdated: onTaskUpdatedRef.current,
        setOnTaskUpdated: handleSetOnTaskUpdated,
        editTaskData,
        
        isNewUserStoryDialogOpen,
        openNewUserStoryDialog,
        closeNewUserStoryDialog,
        onUserStoryCreated: onUserStoryCreatedRef.current,
        setOnUserStoryCreated: handleSetOnUserStoryCreated,
        
        isAddFromLibraryDialogOpen,
        openAddFromLibraryDialog,
        closeAddFromLibraryDialog,
        onAddFromLibrary: onAddFromLibraryRef.current,
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
