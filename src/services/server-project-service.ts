'use server';

import { db } from '@/lib/firebase';
import { getProjects as getProjectsFromDb } from '@/services/project-service';
import { getTasksForProject as getTasksFromDb } from '@/services/task-service';

export async function getProjectsServer() {
    return await getProjectsFromDb();
}

export async function getTasksForProjectServer(projectId: string) {
    return await getTasksFromDb(projectId);
}
