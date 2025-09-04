
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
  ChevronUp,
  Plus,
  Layers,
  FilePlus,
  ChevronDown,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getProject, Project } from '@/services/project-service';
import { getTasksForProject, updateTaskOrderAndStatus, Task, TaskStatus } from '@/services/task-service';
import { getEpicsForProject, Epic } from '@/services/epic-service';
import { getBacklogItemsForProject, BacklogItem } from '@/services/backlog-item-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';

type TaskType = Task['type'];

const taskTypeIcons: Record<TaskType, React.ElementType> = {
    Assessment: ClipboardList,
    Workshop: Presentation,
    Enablement: Zap,
    Planning: GanttChartSquare,
    Execution: Wrench,
    Review: SearchCheck,
};

const taskTypeColors: Record<TaskType, string> = {
    Assessment: 'bg-chart-1',
    Workshop: 'bg-chart-2',
    Enablement: 'bg-chart-3',
    Planning: 'bg-chart-4',
    Execution: 'bg-chart-5',
    Review: 'bg-primary',
};


const TaskTypeIcon = ({ type }: { type: TaskType }) => {
    const Icon = taskTypeIcons[type];
    const colorClass = taskTypeColors[type];
    return (
        <div className={cn("flex items-center justify-center h-6 w-6 rounded-full", colorClass)}>
            <Icon className="h-4 w-4 text-white" />
        </div>
    );
};


const priorityContainerColors: Record<Task['priority'], string> = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-green-500',
}

const PriorityIcon = ({ priority }: { priority: Task['priority'] }) => {
    const colorClass = priorityContainerColors[priority];
    const chevronCount = priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;

    return (
        <div className={cn("flex items-center justify-center h-6 w-6 rounded-full", colorClass)}>
            <div className="flex flex-col items-center justify-center -space-y-2">
                {Array.from({ length: chevronCount }).map((_, i) => (
                    <ChevronUp key={i} className="h-3 w-3 text-white" />
                ))}
            </div>
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <TaskTypeIcon type={task.type} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Type: {task.type}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <PriorityIcon priority={task.priority} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Priority: {task.priority}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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

const BoardColumn = ({ title, tasks, projectPrefix, allTasks }: { title: string; tasks: Task[]; projectPrefix: string; allTasks: Task[]}) => (
    <div className="flex-1">
        <Card className="bg-muted border-none shadow-none">
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <Droppable droppableId={title}>
                {(provided, snapshot) => (
                    <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "p-4 transition-colors",
                            snapshot.isDraggingOver && "bg-primary-light"
                        )}
                    >
                        {tasks.map((task, index) => {
                            const originalIndex = allTasks.findIndex(t => t.id === task.id);
                            return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskCard task={task} taskNumber={`${projectPrefix}-${101 + originalIndex}`} />
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </CardContent>
                )}
            </Droppable>
        </Card>
    </div>
);


export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const [project, setProject] = React.useState<Project | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [epics, setEpics] = React.useState<Epic[]>([]);
    const [backlogItems, setBacklogItems] = React.useState<BacklogItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('board');
    const { openNewBacklogItemDialog, setOnBacklogItemCreated, openNewEpicDialog, setOnEpicCreated } = useQuickAction();

    const fetchData = React.useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, tasksData, epicsData, backlogItemsData] = await Promise.all([
                getProject(projectId),
                getTasksForProject(projectId),
                getEpicsForProject(projectId),
                getBacklogItemsForProject(projectId),
            ]);
            setProject(projectData);
            setTasks(tasksData.sort((a, b) => a.order - b.order));
            setEpics(epicsData);
            setBacklogItems(backlogItemsData);
        } catch (error) {
            console.error("Failed to fetch project data:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);
    
    React.useEffect(() => {
        fetchData();
        const unsubscribeBacklog = setOnBacklogItemCreated(() => fetchData);
        const unsubscribeEpic = setOnEpicCreated(() => fetchData);
        return () => {
            if (unsubscribeBacklog) unsubscribeBacklog();
            if (unsubscribeEpic) unsubscribeEpic();
        };
    }, [fetchData, setOnBacklogItemCreated, setOnEpicCreated]);

    const projectPrefix = project ? project.name.substring(0, project.name.indexOf('-')) : '';
    
    const columns: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Needs Revisions', 'Final Approval', 'Complete'];

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const sourceCol = source.droppableId as TaskStatus;
        const destCol = destination.droppableId as TaskStatus;

        if (sourceCol === destCol && source.index === destination.index) return;
        
        // Optimistic UI Update
        const taskToMove = tasks.find(t => t.id === draggableId)!;
        const remainingTasks = tasks.filter(t => t.id !== draggableId);
        
        let newTasks = [...remainingTasks];
        if (sourceCol === destCol) {
            // Reordering in the same column
            const columnTasks = tasks.filter(t => t.status === sourceCol).filter(t => t.id !== draggableId);
            columnTasks.splice(destination.index, 0, taskToMove);
            const otherTasks = tasks.filter(t => t.status !== sourceCol);
            
            const updatedColumnTasks = columnTasks.map((task, index) => ({...task, order: index}));
            newTasks = [...otherTasks, ...updatedColumnTasks];
        } else {
             // Moving to a different column
            taskToMove.status = destCol;
            const destColumnTasks = tasks.filter(t => t.status === destCol);
            destColumnTasks.splice(destination.index, 0, taskToMove);
            const sourceColumnTasks = tasks.filter(t => t.status === sourceCol && t.id !== draggableId);
            const otherTasks = tasks.filter(t => t.status !== sourceCol && t.status !== destCol);

            const updatedDestTasks = destColumnTasks.map((task, index) => ({...task, order: index, status: destCol}));
            const updatedSourceTasks = sourceColumnTasks.map((task, index) => ({...task, order: index}));
            newTasks = [...otherTasks, ...updatedDestTasks, ...updatedSourceTasks];
        }
        
        setTasks(newTasks.sort((a, b) => a.order - b.order));
        
        // Persist changes to Firestore
        try {
            await updateTaskOrderAndStatus(draggableId, destCol, destination.index, projectId);
        } catch (error) {
            console.error("Failed to update task:", error);
            // Revert optimistic update on failure
            setTasks(tasks); 
        }
    };
    
    if (loading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex gap-6">
                    <Skeleton className="h-[600px] flex-1" />
                    <Skeleton className="h-[600px] flex-1" />
                    <Skeleton className="h-[600px] flex-1" />
                    <Skeleton className="h-[600px] flex-1" />
                </div>
            </div>
        )
    }

    if (!project) {
        return <p>Project not found.</p>
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center">
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
            <Separator className="my-4" />

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <TabsList className="bg-transparent p-0 rounded-none justify-start h-auto">
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
                    {activeTab === 'backlog' && (
                         <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => openNewEpicDialog(projectId)}><Layers className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add Epic</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" onClick={() => openNewBacklogItemDialog(projectId, epics)}><FilePlus className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add Backlog Item</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pt-6">
                    <TabsContent value="summary">
                       <p>Summary View - Under Construction</p>
                    </TabsContent>
                    <TabsContent value="board" className="h-full">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-6 h-full">
                            {columns.map(status => (
                                    <BoardColumn 
                                        key={status}
                                        title={status}
                                        tasks={tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order)}
                                        projectPrefix={projectPrefix}
                                        allTasks={tasks}
                                    />
                            ))}
                            </div>
                        </DragDropContext>
                    </TabsContent>
                    <TabsContent value="backlog">
                       <div className="space-y-6">
                            <Accordion type="multiple" className="w-full">
                                {epics.map(epic => (
                                    <AccordionItem key={epic.id} value={epic.id}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={epic.status === 'Done' ? 'default' : 'secondary'} className={epic.status === 'Done' ? 'bg-green-500' : ''}>{epic.status}</Badge>
                                                <span className="font-semibold">{epic.title}</span>
                                                <span className="text-muted-foreground text-sm">{projectPrefix}-{epic.epicId}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-8 pr-4 space-y-4">
                                                <p className="text-muted-foreground">{epic.description}</p>
                                                <div className="border rounded-lg">
                                                    {backlogItems.filter(item => item.epicId === epic.id).map(item => (
                                                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-muted-foreground text-sm font-mono">{projectPrefix}-{item.backlogId}</span>
                                                                <p>{item.title}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge variant="outline">{item.status}</Badge>
                                                                <Badge variant="secondary">{item.points} Points</Badge>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <PriorityIcon priority={item.priority} />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Priority: {item.priority}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                       </div>
                    </TabsContent>
                    <TabsContent value="sprints">
                        <p>Sprints View - Under Construction</p>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
