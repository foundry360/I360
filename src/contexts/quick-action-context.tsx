
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

  onAddFromLibrary: (() => void) | null;
  setOnAddFromLibrary: (callback: (() => void) | null) => (() => void) | void;
  
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
};

const QuickActionContext = React.createContext<
  QuickActionContextType | undefined
>(undefined);

export function QuickActionProvider({ children }: { children: React.ReactNode }) {
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = React.useState(false);
  const onCompanyCreatedRef = React.useRef<(() => void) | null>(null);

  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = React.useState(false);
  const onContactCreatedRef = React.useRef<(() => void) | null>(null);

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = React.useState(false);
  const [assessmentToResume, setAssessmentToResume] = React.useState<Assessment | null>(null);
  const onAssessmentCompletedRef = React.useRef<(() => void) | null>(null);
  
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = React.useState(false);
  const onProjectCreatedRef = React.useRef<(() => void) | null>(null);

  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = React.useState(false);
  const onProjectUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editProjectData, setEditProjectData] = React.useState<Project | null>(null);

  const [isNewBacklogItemDialogOpen, setIsNewBacklogItemDialogOpen] = React.useState(false);
  const onBacklogItemCreatedRef = React.useRef<(() => void) | null>(null);
  const [newBacklogItemData, setNewBacklogItemData] = React.useState<{ projectId: string, companyId: string, epics: Epic[] } | null>(null);

  const [isNewEpicDialogOpen, setIsNewEpicDialogOpen] = React.useState(false);
  const onEpicCreatedRef = React.useRef<(() => void) | null>(null);
  const [newEpicData, setNewEpicData] = React.useState<{ projectId: string } | null>(null);

  const [isEditEpicDialogOpen, setIsEditEpicDialogOpen] = React.useState(false);
  const onEpicUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editEpicData, setEditEpicData] = React.useState<Epic | null>(null);

  const [isEditBacklogItemDialogOpen, setIsEditBacklogItemDialogOpen] = React.useState(false);
  const onBacklogItemUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editBacklogItemData, setEditBacklogItemData] = React.useState<{ item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[] } | null>(null);

  const [isNewSprintDialogOpen, setIsNewSprintDialogOpen] = React.useState(false);
  const onSprintCreatedRef = React.useRef<(() => void) | null>(null);
  const [newSprintData, setNewSprintData] = React.useState<{ projectId: string } | null>(null);
  
  const [isEditSprintDialogOpen, setIsEditSprintDialogOpen] = React.useState(false);
  const onSprintUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editSprintData, setEditSprintData] = React.useState<Sprint | null>(null);

  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = React.useState(false);
  const onTaskUpdatedRef = React.useRef<(() => void) | null>(null);
  const [editTaskData, setEditTaskData] = React.useState<{ task: Task, contacts: Contact[] } | null>(null);

  const [isNewUserStoryDialogOpen, setIsNewUserStoryDialogOpen] = React.useState(false);
  const onUserStoryCreatedRef = React.useRef<(() => void) | null>(null);
  
  const onAddFromLibraryRef = React.useRef<(() => void) | null>(null);

  const [globalSearchTerm, setGlobalSearchTerm] = React.useState('');

  const openNewCompanyDialog = React.useCallback(() => setIsNewCompanyDialogOpen(true), []);
  const closeNewCompanyDialog = React.useCallback(() => setIsNewCompanyDialogOpen(false), []);
  const setOnCompanyCreated = React.useCallback((callback: (() => void) | null) => {
    onCompanyCreatedRef.current = callback;
    return () => { onCompanyCreatedRef.current = null; };
  }, []);

  const openNewContactDialog = React.useCallback(() => setIsNewContactDialogOpen(true), []);
  const closeNewContactDialog = React.useCallback(() => setIsNewContactDialogOpen(false), []);
  const setOnContactCreated = React.useCallback((callback: (() => void) | null) => {
    onContactCreatedRef.current = callback;
    return () => { onContactCreatedRef.current = null; };
  }, []);

  const openAssessmentModal = React.useCallback((assessment: Assessment | null = null) => {
    setAssessmentToResume(assessment);
    setIsAssessmentModalOpen(true);
  }, []);
  const closeAssessmentModal = React.useCallback(() => {
    setIsAssessmentModalOpen(false);
    setAssessmentToResume(null);
  }, []);
  const setOnAssessmentCompleted = React.useCallback((callback: (() => void) | null) => {
    onAssessmentCompletedRef.current = callback;
    return () => { onAssessmentCompletedRef.current = null; };
  }, []);
  
  const openNewProjectDialog = React.useCallback(() => setIsNewProjectDialogOpen(true), []);
  const closeNewProjectDialog = React.useCallback(() => setIsNewProjectDialogOpen(false), []);
  const setOnProjectCreated = React.useCallback((callback: (() => void) | null) => {
    onProjectCreatedRef.current = callback;
    return () => { onProjectCreatedRef.current = null; };
  }, []);

  const openEditProjectDialog = React.useCallback((project: Project) => {
    setEditProjectData(project);
    setIsEditProjectDialogOpen(true);
  }, []);
  const closeEditProjectDialog = React.useCallback(() => {
    setIsEditProjectDialogOpen(false);
    setEditProjectData(null);
  }, []);
  const setOnProjectUpdated = React.useCallback((callback: (() => void) | null) => {
    onProjectUpdatedRef.current = callback;
    return () => { onProjectUpdatedRef.current = null; };
  }, []);

  const openNewBacklogItemDialog = React.useCallback((projectId: string, companyId: string, epics: Epic[]) => {
    setNewBacklogItemData({ projectId, companyId, epics });
    setIsNewBacklogItemDialogOpen(true);
  }, []);
  const closeNewBacklogItemDialog = React.useCallback(() => {
    setIsNewBacklogItemDialogOpen(false);
    setNewBacklogItemData(null);
  }, []);
  const setOnBacklogItemCreated = React.useCallback((callback: (() => void) | null) => {
    onBacklogItemCreatedRef.current = callback;
    return () => { onBacklogItemCreatedRef.current = null; };
  }, []);
  
  const openNewEpicDialog = React.useCallback((projectId: string) => {
    setNewEpicData({ projectId });
    setIsNewEpicDialogOpen(true);
  }, []);
  const closeNewEpicDialog = React.useCallback(() => {
    setIsNewEpicDialogOpen(false);
    setNewEpicData(null);
  }, []);
  const setOnEpicCreated = React.useCallback((callback: (() => void) | null) => {
    onEpicCreatedRef.current = callback;
    return () => { onEpicCreatedRef.current = null; };
  }, []);

  const openEditEpicDialog = React.useCallback((epic: Epic) => {
    setEditEpicData(epic);
    setIsEditEpicDialogOpen(true);
  }, []);
  const closeEditEpicDialog = React.useCallback(() => {
    setIsEditEpicDialogOpen(false);
    setEditEpicData(null);
  }, []);
  const setOnEpicUpdated = React.useCallback((callback: (() => void) | null) => {
    onEpicUpdatedRef.current = callback;
    return () => { onEpicUpdatedRef.current = null; };
  }, []);

  const openEditBacklogItemDialog = React.useCallback((item: BacklogItem, epics: Epic[], sprints: Sprint[], contacts: Contact[]) => {
    setEditBacklogItemData({ item, epics, sprints, contacts });
    setIsEditBacklogItemDialogOpen(true);
  }, []);
  const closeEditBacklogItemDialog = React.useCallback(() => {
    setIsEditBacklogItemDialogOpen(false);
    setEditBacklogItemData(null);
  }, []);
  const setOnBacklogItemUpdated = React.useCallback((callback: (() => void) | null) => {
    onBacklogItemUpdatedRef.current = callback;
    return () => { onBacklogItemUpdatedRef.current = null; };
  }, []);
  
  const openNewSprintDialog = React.useCallback((projectId: string) => {
    setNewSprintData({ projectId });
    setIsNewSprintDialogOpen(true);
  }, []);
  const closeNewSprintDialog = React.useCallback(() => {
    setIsNewSprintDialogOpen(false);
    setNewSprintData(null);
  }, []);
  const setOnSprintCreated = React.useCallback((callback: (() => void) | null) => {
    onSprintCreatedRef.current = callback;
    return () => { onSprintCreatedRef.current = null; };
  }, []);

  const openEditSprintDialog = React.useCallback((sprint: Sprint) => {
    setEditSprintData(sprint);
    setIsEditSprintDialogOpen(true);
  }, []);
  const closeEditSprintDialog = React.useCallback(() => {
    setIsEditSprintDialogOpen(false);
    setEditSprintData(null);
  }, []);
  const setOnSprintUpdated = React.useCallback((callback: (() => void) | null) => {
    onSprintUpdatedRef.current = callback;
    return () => { onSprintUpdatedRef.current = null; };
  }, []);

  const openEditTaskDialog = React.useCallback((task: Task, contacts: Contact[]) => {
    setEditTaskData({ task, contacts });
    setIsEditTaskDialogOpen(true);
  }, []);
  const closeEditTaskDialog = React.useCallback(() => {
    setIsEditTaskDialogOpen(false);
    setEditTaskData(null);
  }, []);
  const setOnTaskUpdated = React.useCallback((callback: (() => void) | null) => {
    onTaskUpdatedRef.current = callback;
    return () => { onTaskUpdatedRef.current = null; };
  }, []);

  const openNewUserStoryDialog = React.useCallback(() => setIsNewUserStoryDialogOpen(true), []);
  const closeNewUserStoryDialog = React.useCallback(() => setIsNewUserStoryDialogOpen(false), []);
  const setOnUserStoryCreated = React.useCallback((callback: (() => void) | null) => {
    onUserStoryCreatedRef.current = callback;
    return () => { onUserStoryCreatedRef.current = null; };
  }, []);
  
  const setOnAddFromLibrary = React.useCallback((callback: (() => void) | null) => {
    onAddFromLibraryRef.current = callback;
    return () => { onAddFromLibraryRef.current = null; };
  }, []);

  const contextValue = React.useMemo(() => ({
    isNewCompanyDialogOpen,
    openNewCompanyDialog,
    closeNewCompanyDialog,
    onCompanyCreated: onCompanyCreatedRef.current,
    setOnCompanyCreated,

    isNewContactDialogOpen,
    openNewContactDialog,
    closeNewContactDialog,
    onContactCreated: onContactCreatedRef.current,
    setOnContactCreated,
    
    isAssessmentModalOpen,
    openAssessmentModal,
    closeAssessmentModal,
    assessmentToResume,
    onAssessmentCompleted: onAssessmentCompletedRef.current,
    setOnAssessmentCompleted,
    
    isNewProjectDialogOpen,
    openNewProjectDialog,
    closeNewProjectDialog,
    onProjectCreated: onProjectCreatedRef.current,
    setOnProjectCreated,

    isEditProjectDialogOpen,
    openEditProjectDialog,
    closeEditProjectDialog,
    onProjectUpdated: onProjectUpdatedRef.current,
    setOnProjectUpdated,
    editProjectData,

    isNewBacklogItemDialogOpen,
    openNewBacklogItemDialog,
    closeNewBacklogItemDialog,
    onBacklogItemCreated: onBacklogItemCreatedRef.current,
    setOnBacklogItemCreated,
    newBacklogItemData,

    isNewEpicDialogOpen,
    openNewEpicDialog,
    closeNewEpicDialog,
    onEpicCreated: onEpicCreatedRef.current,
    setOnEpicCreated,
    newEpicData,

    isEditEpicDialogOpen,
    openEditEpicDialog,
    closeEditEpicDialog,
    onEpicUpdated: onEpicUpdatedRef.current,
    setOnEpicUpdated,
    editEpicData,

    isEditBacklogItemDialogOpen,
    openEditBacklogItemDialog,
    closeEditBacklogItemDialog,
    onBacklogItemUpdated: onBacklogItemUpdatedRef.current,
    setOnBacklogItemUpdated,
    editBacklogItemData,

    isNewSprintDialogOpen,
    openNewSprintDialog,
    closeNewSprintDialog,
    onSprintCreated: onSprintCreatedRef.current,
    setOnSprintCreated,
    newSprintData,

    isEditSprintDialogOpen,
    openEditSprintDialog,
    closeEditSprintDialog,
    onSprintUpdated: onSprintUpdatedRef.current,
    setOnSprintUpdated,
    editSprintData,

    isEditTaskDialogOpen,
    openEditTaskDialog,
    closeEditTaskDialog,
    onTaskUpdated: onTaskUpdatedRef.current,
    setOnTaskUpdated,
    editTaskData,
    
    isNewUserStoryDialogOpen,
    openNewUserStoryDialog,
    closeNewUserStoryDialog,
    onUserStoryCreated: onUserStoryCreatedRef.current,
    setOnUserStoryCreated,
    
    onAddFromLibrary: onAddFromLibraryRef.current,
    setOnAddFromLibrary,
    
    globalSearchTerm,
    setGlobalSearchTerm,
  }), [
    isNewCompanyDialogOpen, openNewCompanyDialog, closeNewCompanyDialog, setOnCompanyCreated,
    isNewContactDialogOpen, openNewContactDialog, closeNewContactDialog, setOnContactCreated,
    isAssessmentModalOpen, openAssessmentModal, closeAssessmentModal, assessmentToResume, setOnAssessmentCompleted,
    isNewProjectDialogOpen, openNewProjectDialog, closeNewProjectDialog, setOnProjectCreated,
    isEditProjectDialogOpen, openEditProjectDialog, closeEditProjectDialog, editProjectData, setOnProjectUpdated,
    isNewBacklogItemDialogOpen, openNewBacklogItemDialog, closeNewBacklogItemDialog, newBacklogItemData, setOnBacklogItemCreated,
    isNewEpicDialogOpen, openNewEpicDialog, closeNewEpicDialog, newEpicData, setOnEpicCreated,
    isEditEpicDialogOpen, openEditEpicDialog, closeEditEpicDialog, editEpicData, setOnEpicUpdated,
    isEditBacklogItemDialogOpen, openEditBacklogItemDialog, closeEditBacklogItemDialog, editBacklogItemData, setOnBacklogItemUpdated,
    isNewSprintDialogOpen, openNewSprintDialog, closeNewSprintDialog, newSprintData, setOnSprintCreated,
    isEditSprintDialogOpen, openEditSprintDialog, closeEditSprintDialog, editSprintData, setOnSprintUpdated,
    isEditTaskDialogOpen, openEditTaskDialog, closeEditTaskDialog, editTaskData, setOnTaskUpdated,
    isNewUserStoryDialogOpen, openNewUserStoryDialog, closeNewUserStoryDialog, setOnUserStoryCreated,
    setOnAddFromLibrary,
    globalSearchTerm,
  ]);

  return (
    <QuickActionContext.Provider value={contextValue}>
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
