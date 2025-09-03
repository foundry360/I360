
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// This is a placeholder for a real task type
type Task = {
  id: string;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
};

const initialTasks: Task[] = [
    { id: 'task-1', title: 'Setup project repository', status: 'Done' },
    { id: 'task-2', title: 'Design database schema', status: 'Done' },
    { id: 'task-3', title: 'Develop authentication flow', status: 'In Progress' },
    { id: 'task-4', title: 'Build main dashboard UI', status: 'In Progress' },
    { id: 'task-5', title: 'Implement assessment generation logic', status: 'Todo' },
    { id: 'task-6', title: 'Write unit tests for services', status: 'Todo' },
    { id: 'task-7', title: 'Configure deployment pipeline', status: 'Todo' },
];


const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-4 bg-card shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 flex items-start gap-2">
             <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
            <p className="text-sm font-medium flex-1">{task.title}</p>
        </CardContent>
    </Card>
);

const BoardColumn = ({ title, tasks }: { title: string; tasks: Task[] }) => (
    <div className="flex-1">
        <Card className="bg-muted border-none shadow-none">
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </CardContent>
        </Card>
    </div>
);


export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const [tasks, setTasks] = React.useState(initialTasks);

    // In a real app, you would fetch project details here
    const project = { name: 'New Initiative' }; 
    
    const columns: ('Todo' | 'In Progress' | 'Done')[] = ['Todo', 'In Progress', 'Done'];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <Button onClick={() => router.back()} variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-muted-foreground">Project Details</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="board" className="flex-1 flex flex-col">
                <TabsList className="bg-transparent p-0 border-b-2 border-border rounded-none justify-start h-auto">
                    <TabsTrigger 
                        value="summary"
                        className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-primary"
                    >
                        Summary
                    </TabsTrigger>
                    <TabsTrigger 
                        value="board"
                        className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-primary"
                    >
                        Board
                    </TabsTrigger>
                     <TabsTrigger 
                        value="backlog"
                        className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-primary"
                    >
                        Backlog
                    </TabsTrigger>
                     <TabsTrigger 
                        value="sprints"
                        className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-primary"
                    >
                        Sprints
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto pt-6">
                    <TabsContent value="summary">
                       <p>Summary View - Under Construction</p>
                    </TabsContent>
                    <TabsContent value="board" className="h-full">
                         <div className="flex gap-6 h-full">
                           {columns.map(status => (
                                <BoardColumn 
                                    key={status}
                                    title={status}
                                    tasks={tasks.filter(t => t.status === status)}
                                />
                           ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="backlog">
                        <p>Backlog View - Under Construction</p>
                    </TabsContent>
                    <TabsContent value="sprints">
                        <p>Sprints View - Under Construction</p>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

