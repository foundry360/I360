
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, collection } from 'firebase/firestore';
import type { Company } from './company-service';
import type { Contact } from './contact-service';
import type { Task, TaskStatus, TaskType, TaskPriority } from './task-service';
import type { Epic } from './epic-service';
import type { BacklogItem } from './backlog-item-service';


const ACME_INC_ID = 'acme-inc';

const initialTasks: {
    id: string; title: string; status: TaskStatus; owner: string; ownerAvatarUrl: string; priority: TaskPriority; type: TaskType; order: number; projectId: string;
}[] = [
    { id: 'task-1', title: 'Setup project repository', status: 'Complete', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'High', type: 'Planning', order: 0, projectId: 'acme-inc-project' },
    { id: 'task-2', title: 'Design database schema', status: 'Complete', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'High', type: 'Planning', order: 1, projectId: 'acme-inc-project' },
    { id: 'task-3', title: 'Develop authentication flow', status: 'Final Approval', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'Medium', type: 'Execution', order: 0, projectId: 'acme-inc-project' },
    { id: 'task-4', title: 'Build main dashboard UI', status: 'In Progress', owner: 'Mike Johnson', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', priority: 'High', type: 'Execution', order: 0, projectId: 'acme-inc-project' },
    { id: 'task-8', title: 'Fix login button style', status: 'Needs Revisions', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'Low', type: 'Review', order: 0, projectId: 'acme-inc-project' },
    { id: 'task-5', title: 'Implement assessment generation logic', status: 'To Do', owner: 'Mike Johnson', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', priority: 'High', type: 'Assessment', order: 0, projectId: 'acme-inc-project' },
    { id: 'task-6', title: 'Write unit tests for services', status: 'To Do', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'Medium', type: 'Execution', order: 1, projectId: 'acme-inc-project' },
    { id: 'task-7', title: 'Configure deployment pipeline', status: 'To Do', owner: 'Emily White', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', priority: 'Low', type: 'Enablement', order: 2, projectId: 'acme-inc-project' },
    { id: 'task-9', title: 'Client Workshop Prep', status: 'In Progress', owner: 'Emily White', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', priority: 'Medium', type: 'Workshop', order: 1, projectId: 'acme-inc-project' },
    { id: 'task-10', title: 'Q3 Planning Session', status: 'To Do', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'High', type: 'Planning', order: 3, projectId: 'acme-inc-project' },
    { id: 'task-11', title: 'Review API endpoints', status: 'In Review', owner: 'Mike Johnson', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', priority: 'Medium', type: 'Review', order: 0, projectId: 'acme-inc-project'},
];

const initialEpics: Omit<Epic, 'id'>[] = [
    { projectId: 'acme-inc-project', epicId: 1, title: "User Authentication & Profile Management", description: "As a user, I want to be able to sign up, log in, and manage my profile information securely.", status: "In Progress" },
    { projectId: 'acme-inc-project', epicId: 2, title: "Assessment & Reporting Engine", description: "As a user, I want to be able to complete an assessment and view a detailed, insightful report based on my answers.", status: "To Do" }
];

const initialBacklogItems: Omit<BacklogItem, 'id'>[] = [
    // Epic 1
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-1', backlogId: 101, title: "User sign-up page", description: "Create the UI and logic for user registration.", status: "Done", points: 5, priority: 'High' },
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-1', backlogId: 102, title: "User login page", description: "Create the UI and logic for user authentication.", status: "Done", points: 3, priority: 'High' },
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-1', backlogId: 103, title: "User profile page", description: "Allow users to view and update their display name and avatar.", status: "To Do", points: 5, priority: 'Medium' },
    // Epic 2
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-2', backlogId: 104, title: "Assessment form creation", description: "Build the multi-step form for the GTM assessment.", status: "To Do", points: 8, priority: 'High' },
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-2', backlogId: 105, title: "AI report generation flow", description: "Create the Genkit flow to analyze form data and produce a report.", status: "To Do", points: 13, priority: 'High' },
    { projectId: 'acme-inc-project', epicId: 'acme-inc-project-epic-2', backlogId: 106, title: "Report display component", description: "Build the React component to display the generated report in a visually appealing way.", status: "To Do", points: 8, priority: 'Medium' },
];


export const seedInitialData = async () => {
    const companyDocRef = doc(db, 'companies', ACME_INC_ID);
    const companyDoc = await getDoc(companyDocRef);

    if (!companyDoc.exists()) {
        console.log("Default company 'Acme Inc' not found. Seeding data...");
        const acmeCompany: Company = {
            id: ACME_INC_ID,
            name: 'Acme Inc',
            description: 'A leading manufacturer of everything.',
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            phone: '555-123-4567',
            website: 'acmeinc.com',
            status: 'Active',
            lastActivity: new Date().toISOString(),
            contact: {
                name: 'Wile E. Coyote',
                avatar: `https://i.pravatar.cc/150?u=wile@acme.inc`
            }
        };

        const wileContact: Omit<Contact, 'id'> = {
            name: 'Wile E. Coyote',
            email: 'wile@acme.inc',
            phone: '555-123-4568',
            title: 'Chief Procurement Officer',
            companyId: ACME_INC_ID,
            lastActivity: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=wile@acme.inc`
        };

        const roadRunnerContact: Omit<Contact, 'id'> = {
            name: 'Road Runner',
            email: 'beep.beep@acme.inc',
            phone: '555-123-4569',
            title: 'Logistics Specialist',
            companyId: ACME_INC_ID,
            lastActivity: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=beep.beep@acme.inc`
        };
        
        const acmeProject = {
            id: 'acme-inc-project',
            name: 'ACME-01012024-Default Project',
            description: 'Default seed project for Acme Inc.',
            companyId: ACME_INC_ID,
            status: 'Active' as const,
            priority: 'High' as const,
            startDate: new Date().toISOString(),
            owner: 'Wile E. Coyote',
            team: 'Wile E. Coyote, Road Runner',
            category: 'Execution' as const,
        }

        try {
            const batch = writeBatch(db);

            // Set Company
            batch.set(companyDocRef, acmeCompany);
            
            // Set Contacts
            const contact1Ref = doc(db, 'contacts', 'wile-e-coyote');
            batch.set(contact1Ref, { ...wileContact, id: 'wile-e-coyote' });

            const contact2Ref = doc(db, 'contacts', 'road-runner');
            batch.set(contact2Ref, { ...roadRunnerContact, id: 'road-runner' });

            // Set Project
            const projectRef = doc(db, 'projects', 'acme-inc-project');
            batch.set(projectRef, acmeProject);

            // Set Tasks
            const tasksCollectionRef = collection(db, 'tasks');
            initialTasks.forEach(task => {
                const taskRef = doc(tasksCollectionRef, task.id);
                batch.set(taskRef, task);
            });

            // Set Epics
            const epicsCollectionRef = collection(db, 'epics');
            initialEpics.forEach((epic, index) => {
                const epicId = `${epic.projectId}-epic-${index + 1}`;
                const epicRef = doc(epicsCollectionRef, epicId);
                batch.set(epicRef, { ...epic, id: epicId });
            });

            // Set Backlog Items
            const backlogItemsCollectionRef = collection(db, 'backlogItems');
            initialBacklogItems.forEach((item, index) => {
                const itemId = `${item.projectId}-item-${index + 1}`;
                const itemRef = doc(backlogItemsCollectionRef, itemId);
                batch.set(itemRef, { ...item, id: itemId });
            });
            
            await batch.commit();

            console.log("Successfully seeded 'Acme Inc', contacts, project, tasks, epics, and backlog items.");
        } catch (error) {
            console.error("Error seeding data: ", error);
        }
    }
};
