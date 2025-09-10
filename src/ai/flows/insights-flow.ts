
'use server';

import { ai } from '@/ai/genkit';
import { getProjects } from '@/services/project-service';
import { getTasksForProject } from '@/services/task-service';
import { add, isWithinInterval, parseISO } from 'date-fns';
import { z } from 'zod';

const getOpenTasksTool = ai.defineTool(
  {
    name: 'getOpenTasks',
    description: 'Get all tasks that are not in a "Complete" status.',
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
    const projects = await getProjects();
    let allOpenTasks: any[] = [];
    for (const project of projects) {
      const tasks = await getTasksForProject(project.id);
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
    description: 'Get all tasks that are due within the next 7 days.',
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
    const projects = await getProjects();
    const now = new Date();
    const sevenDaysFromNow = add(now, { days: 7 });
    let allTasksDueSoon: any[] = [];

    for (const project of projects) {
      const tasks = await getTasksForProject(project.id);
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


const insightsPrompt = ai.definePrompt({
  name: 'insightsPrompt',
  system: `You are a helpful assistant for the Insights360 application.
You can answer questions about projects and tasks.
Use the available tools to answer the user's questions.
Provide concise and helpful answers. Format your answers in markdown.
When listing items, use bullet points.`,
  tools: [getOpenTasksTool, getTasksDueSoonTool],
  input: {
    schema: z.object({
        history: z.array(z.any()),
        prompt: z.string(),
    })
  }
});

export async function getInsights(history: any[], prompt: string): Promise<string> {
    const result = await insightsPrompt({history, prompt});
    return result.text;
}
