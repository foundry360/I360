
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  ArrowLeft,
  ClipboardList,
  GanttChartSquare,
  Presentation,
  SearchCheck,
  Wrench,
  Zap,
  ArrowUp,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Needs Revisions' | 'Complete';
type TaskPriority = 'Low' | 'Medium' | 'High';
type TaskType = 'Assessment' | 'Workshop' | 'Enablement' | 'Planning' | 'Execution' | 'Review';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  owner: string;
  ownerAvatarUrl: string;
  priority: TaskPriority;
  type: TaskType;
};

const initialTasks: Task[] = [
    { id: 'task-1', title: 'Setup project repository', status: 'Complete', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'High', type: 'Planning' },
    { id: 'task-2', title: 'Design database schema', status: 'Complete', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'High', type: 'Planning' },
    { id: 'task-3', title: 'Develop authentication flow', status: 'In Review', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'Medium', type: 'Execution' },
    { id: 'task-4', title: 'Build main dashboard UI', status: 'In Progress', owner: 'Mike Johnson', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', priority: 'High', type: 'Execution' },
    { id: 'task-8', title: 'Fix login button style', status: 'Needs Revisions', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'Low', type: 'Review' },
    { id: 'task-5', title: 'Implement assessment generation logic', status: 'To Do', owner: 'Mike Johnson', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d', priority: 'High', type: 'Assessment' },
    { id: 'task-6', title: 'Write unit tests for services', status: 'To Do', owner: 'John Doe', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', priority: 'Medium', type: 'Execution' },
    { id: 'task-7', title: 'Configure deployment pipeline', status: 'To Do', owner: 'Emily White', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', priority: 'Low', type: 'Enablement' },
    { id: 'task-9', title: 'Client Workshop Prep', status: 'In Progress', owner: 'Emily White', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', priority: 'Medium', type: 'Workshop' },
    { id: 'task-10', title: 'Q3 Planning Session', status: 'To Do', owner: 'Jane Smith', ownerAvatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', priority: 'High', type: 'Planning' },
];

const taskTypeIcons: Record<TaskType, React.ElementType> = {
    Assessment: ClipboardList,
    Workshop: Presentation,
    Enablement: Zap,
    Planning: GanttChartSquare,
    Execution: Wrench,
    Review: SearchCheck,
};

const TaskTypeIcon = ({ type }: { type: TaskType }) => {
    const Icon = taskTypeIcons[type];
    return (
        <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center">
            <Icon className="h-3 w-3 text-muted-foreground" />
        </div>
    );
};


const priorityIcons: Record<TaskPriority, React.ElementType> = {
    High: ArrowUp,
    Medium: ArrowRight,
    Low: ArrowDown,
};

const priorityIconColors: Record<TaskPriority, string> = {
    High: 'text-red-500',
    Medium: 'text-yellow-500',
    Low: 'text-green-500',
}

const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
    const Icon = priorityIcons[priority];
    const colorClass = priorityIconColors[priority];
    return (
        <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center">
            <Icon className={cn("h-3 w-3", colorClass)} />
        </div>
    );
};

const TaskCard = ({ task, taskNumber }: { task: Task; taskNumber: string }) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    return (
        <Card className="mb-4 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col w-full">
                <CardContent className="p-3">
                    <p className="text-sm font-medium flex-1">{task.title}</p>
                </CardContent>
                <CardFooter className="p-3 flex justify-between items-center bg-muted/50 mt-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{taskNumber}</span>
                        <TaskTypeIcon type={task.type} />
                        <PriorityIcon priority={task.priority} />
                    </div>
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={task.ownerAvatarUrl} />
                        <AvatarFallback className="text-xs">{getInitials(task.owner)}</AvatarFallback>
                    </Avatar>
                </CardFooter>
            </div>
        </Card>
    );
};

const BoardColumn = ({ title, tasks, projectPrefix }: { title: string; tasks: Task[]; projectPrefix: string; }) => (
    <div className="flex-1">
        <Card className="bg-muted border-none shadow-none">
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {tasks.map((task, index) => {
                    const originalIndex = initialTasks.findIndex(t => t.id === task.id);
                    return <TaskCard key={task.id} task={task} taskNumber={`${projectPrefix}-${100 + originalIndex}`} />;
                })}
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
    const projectPrefix = project.name.substring(0, 2).toUpperCase();
    
    const columns: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Needs Revisions', 'Complete'];

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
                                    projectPrefix={projectPrefix}
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

