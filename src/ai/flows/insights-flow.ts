
'use server';

import { ai } from '@/ai/genkit';
import { getProjectsServer, getTasksForProjectServer } from '@/services/server-project-service';
import { getContacts } from '@/services/contact-service';
import { getCompanies } from '@/services/company-service';
import { getUserStories } from '@/services/user-story-service';
import { getCollections } from '@/services/collection-service';
import { getBacklogItems } from '@/services/backlog-item-service';
import { getAssessments } from '@/services/assessment-service';
import { add, isWithinInterval, parseISO } from 'date-fns';
import { z } from 'zod';
import type { Message } from 'genkit';

const getOpenTasksTool = ai.defineTool(
  {
    name: 'getOpenTasks',
    description: 'Get all tasks that are not in a "Complete" status across all projects.',
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        status: z.string(),
        projectId: z.string(),
        owner: z.string(),
        dueDate: z.string().optional().nullable(),
      })
    ),
  },
  async () => {
    const projects = await getProjectsServer();
    let allOpenTasks: any[] = [];
    for (const project of projects) {
      const tasks = await getTasksForProjectServer(project.id);
      const openTasks = tasks
        .filter((task) => task.status !== 'Complete')
        .map((task) => ({
          title: task.title,
          status: task.status,
          projectId: task.projectId,
          owner: task.owner,
          dueDate: task.dueDate,
        }));
      allOpenTasks = allOpenTasks.concat(openTasks);
    }
    return allOpenTasks;
  }
);

const getTasksDueSoonTool = ai.defineTool(
  {
    name: 'getTasksDueSoon',
    description: 'Get all tasks that are due within the next 7 days across all projects.',
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        status: z.string(),
        projectId: z.string(),
        owner: z.string(),
        dueDate: z.string().optional().nullable(),
      })
    ),
  },
  async () => {
    const projects = await getProjectsServer();
    const now = new Date();
    const sevenDaysFromNow = add(now, { days: 7 });
    let allTasksDueSoon: any[] = [];

    for (const project of projects) {
      const tasks = await getTasksForProjectServer(project.id);
      const tasksDueSoon = tasks
        .filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = parseISO(task.dueDate);
          return isWithinInterval(dueDate, { start: now, end: sevenDaysFromNow });
        })
        .map((task) => ({
          title: task.title,
          status: task.status,
          projectId: task.projectId,
          owner: task.owner,
          dueDate: task.dueDate,
        }));
      allTasksDueSoon = allTasksDueSoon.concat(tasksDueSoon);
    }
    return allTasksDueSoon;
  }
);

const getContactsTool = ai.defineTool({
    name: 'getContacts',
    description: 'Get a list of all contacts.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
        name: z.string(),
        email: z.string(),
        companyName: z.string().optional(),
    })),
}, getContacts);

const getCompaniesTool = ai.defineTool({
    name: 'getCompanies',
    description: 'Get a list of all companies.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
        name: z.string(),
        status: z.string(),
        website: z.string(),
    })),
}, getCompanies);

const getEngagementsTool = ai.defineTool({
    name: 'getEngagements',
    description: 'Get a list of engagements (also known as projects), optionally filtering by company name.',
    inputSchema: z.object({
        companyName: z.string().optional().describe('The name of the company to filter engagements by.'),
    }),
    outputSchema: z.array(z.object({
        name: z.string(),
        companyName: z.string().optional(),
        status: z.string(),
        owner: z.string(),
    })),
}, async ({ companyName }) => {
    const allProjects = await getProjectsServer();
    if (companyName) {
        return allProjects.filter(p => p.companyName?.toLowerCase() === companyName.toLowerCase());
    }
    return allProjects;
});

const getUserStoriesTool = ai.defineTool({
    name: 'getUserStories',
    description: 'Get a list of all user stories from the library.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
        title: z.string(),
        tags: z.array(z.string()),
        points: z.number().optional(),
    })),
}, getUserStories);

const getCollectionsTool = ai.defineTool({
    name: 'getCollections',
    description: 'Get a list of all user story collections.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
        name: z.string(),
        description: z.string(),
        userStoryIds: z.array(z.string()),
    })),
}, getCollections);

const getBacklogItemsTool = ai.defineTool({
    name: 'getBacklogItems',
    description: 'Get a list of all backlog items across all projects.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.object({
        title: z.string(),
        projectId: z.string(),
        status: z.string(),
        priority: z.string(),
        owner: z.string(),
    })),
}, getBacklogItems);

const getAssessmentsTool = ai.defineTool({
    name: 'getAssessments',
    description: 'Get a list of all assessments, optionally filtering by company name.',
    inputSchema: z.object({
        companyName: z.string().optional().describe('The name of the company to filter assessments by.'),
    }),
    outputSchema: z.array(z.object({
        name: z.string(),
        companyName: z.string().optional(),
        status: z.string(),
        type: z.string(),
    })),
}, async ({ companyName }) => {
    const allAssessments = await getAssessments();
    if (companyName) {
        return allAssessments.filter(a => a.companyName?.toLowerCase() === companyName.toLowerCase());
    }
    return allAssessments;
});

const getAssessmentDetailsTool = ai.defineTool({
    name: 'getAssessmentDetails',
    description: 'Get the detailed form data and inputs for a specific assessment.',
    inputSchema: z.object({
        assessmentName: z.string().describe('The name of the assessment to get details for.'),
        companyName: z.string().optional().describe('The name of the company the assessment belongs to, for filtering.'),
    }),
    outputSchema: z.any().nullable(),
}, async ({ assessmentName, companyName }) => {
    const allAssessments = await getAssessments();
    let targetAssessment = allAssessments.find(a => a.name.toLowerCase() === assessmentName.toLowerCase());

    if (companyName) {
        targetAssessment = allAssessments.find(a => 
            a.name.toLowerCase() === assessmentName.toLowerCase() &&
            a.companyName?.toLowerCase() === companyName.toLowerCase()
        );
    }
    
    if (targetAssessment) {
        return targetAssessment.formData || null;
    }

    return null;
});


export async function getInsights(history: Message[], prompt: string): Promise<string> {
    const messages: Message[] = [...history, { role: 'user', content: [{ text: prompt }] }];
    
    const result = await ai.generate({
        messages: messages,
        tools: [
            getOpenTasksTool, 
            getTasksDueSoonTool,
            getContactsTool,
            getCompaniesTool,
            getEngagementsTool,
            getUserStoriesTool,
            getCollectionsTool,
            getBacklogItemsTool,
            getAssessmentsTool,
            getAssessmentDetailsTool
        ],
        system: `You are a helpful assistant for the Insights360 application.
You can answer questions about projects, tasks, contacts, companies, engagements, the user story library, collections, backlog items, and assessments.
When asked about the contents or details of a specific assessment, you must use the getAssessmentDetailsTool to retrieve the information.
Use the available tools to answer the user's questions.
Provide concise and helpful answers. Format your answers in markdown.
When listing items, use bullet points.`
    });

    return result.text;
}
