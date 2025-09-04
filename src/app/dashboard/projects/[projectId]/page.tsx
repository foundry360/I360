
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
  MoreVertical,
  Pencil,
  Trash2,
  BookCopy,
  Database,
  Megaphone,
  HeartHandshake,
  BarChart3,
  Scaling,
  Rocket
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getProject, Project } from '@/services/project-service';
import { getTasksForProject, updateTaskOrderAndStatus, Task, TaskStatus } from '@/services/task-service';
import { getEpicsForProject, Epic, deleteEpic } from '@/services/epic-service';
import { getBacklogItemsForProject, BacklogItem, deleteBacklogItem, updateBacklogItem } from '@/services/backlog-item-service';
import { getSprintsForProject, Sprint, SprintStatus, startSprint } from '@/services/sprint-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type TaskType = Task['type'];

const taskTypeIcons: Record<TaskType, React.ElementType> = {
    Assessment: ClipboardList,
    Workshop: Presentation,
    Enablement: Zap,
    Planning: GanttChartSquare,
    Execution: Wrench,
    Review: SearchCheck,
};

const epicIcons: Record<string, { icon: React.ElementType, color: string }> = {
    "Foundation & Strategic Alignment": { icon: BookCopy, color: 'text-chart-1' },
    "RevOps Foundation & Data Infrastructure": { icon: Database, color: 'text-chart-2' },
    "Sales Process Enhancement & Pipeline Optimization": { icon: Megaphone, color: 'text-chart-3' },
    "Customer Experience & Lifecycle Management": { icon: HeartHandshake, color: 'text-chart-4' },
    "Performance Measurement & Continuous Optimization": { icon: BarChart3, color: 'text-chart-5' },
    "Advanced Capabilities & Scaling": { icon: Scaling, color: 'text-primary' },
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
    const [sprints, setSprints] = React.useState<Sprint[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('summary');
    const { 
        openNewBacklogItemDialog, setOnBacklogItemCreated,
        openNewEpicDialog, setOnEpicCreated,
        openEditEpicDialog, setOnEpicUpdated,
        openEditBacklogItemDialog, setOnBacklogItemUpdated,
        openNewSprintDialog, setOnSprintCreated,
    } = useQuickAction();
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<{type: 'epic' | 'backlogItem', id: string, name: string} | null>(null);

    const fetchData = React.useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, tasksData, epicsData, backlogItemsData, sprintsData] = await Promise.all([
                getProject(projectId),
                getTasksForProject(projectId),
                getEpicsForProject(projectId),
                getBacklogItemsForProject(projectId),
                getSprintsForProject(projectId),
            ]);
            setProject(projectData);
            setTasks(tasksData.sort((a, b) => a.order - b.order));
            setEpics(epicsData);
            setBacklogItems(backlogItemsData);
            setSprints(sprintsData);
        } catch (error) {
            console.error("Failed to fetch project data:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);
    
    React.useEffect(() => {
        fetchData();
        const unsubscribeBacklog = setOnBacklogItemCreated(fetchData);
        const unsubscribeEpic = setOnEpicCreated(fetchData);
        const unsubscribeEpicUpdate = setOnEpicUpdated(fetchData);
        const unsubscribeBacklogUpdate = setOnBacklogItemUpdated(fetchData);
        const unsubscribeSprint = setOnSprintCreated(fetchData);
        return () => {
            if (unsubscribeBacklog) unsubscribeBacklog();
            if (unsubscribeEpic) unsubscribeEpic();
            if (unsubscribeEpicUpdate) unsubscribeEpicUpdate();
            if (unsubscribeBacklogUpdate) unsubscribeBacklogUpdate();
            if (unsubscribeSprint) unsubscribeSprint();
        };
    }, [fetchData, setOnBacklogItemCreated, setOnEpicCreated, setOnEpicUpdated, setOnBacklogItemUpdated, setOnSprintCreated]);

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
    
    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'epic') {
                await deleteEpic(itemToDelete.id);
            } else {
                await deleteBacklogItem(itemToDelete.id);
            }
            fetchData();
        } catch (error) {
            console.error(`Failed to delete ${itemToDelete.type}:`, error);
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleMoveToSprint = async (backlogItemId: string, sprintId: string | null) => {
        try {
            await updateBacklogItem(backlogItemId, { sprintId });
            fetchData(); // or just optimistically update the UI
        } catch (error) {
            console.error("Failed to move item to sprint:", error);
        }
    };

    const handleStartSprint = async (sprintId: string) => {
        try {
            setLoading(true);
            const sprintItems = backlogItems.filter(item => item.sprintId === sprintId);
            if (sprintItems.length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Start Empty Sprint',
                    description: 'Add items to the sprint before starting it.',
                });
                return;
            }
            await startSprint(sprintId, projectId, sprintItems);
            toast({
                title: 'Sprint Started!',
                description: 'Tasks have been created on the board.',
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to start sprint:', error);
            toast({
                variant: 'destructive',
                title: 'Error Starting Sprint',
                description: 'There was a problem starting the sprint.',
            });
        } finally {
            setLoading(false);
        }
    }
    
    const upcomingSprints = sprints.filter(s => s.status === 'Not Started' || s.status === 'Active');

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
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Summary
                        </TabsTrigger>
                        <TabsTrigger 
                            value="board"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Board
                        </TabsTrigger>
                         <TabsTrigger 
                            value="backlog"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Backlog
                        </TabsTrigger>
                         <TabsTrigger 
                            value="sprints"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Sprints
                        </TabsTrigger>
                    </TabsList>
                     <div className="flex items-center gap-2">
                        {activeTab === 'backlog' && (
                             <>
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
                            </>
                        )}
                         {activeTab === 'sprints' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" onClick={() => openNewSprintDialog(projectId)}>
                                            <Rocket className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>New Sprint</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                         )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pt-6">
                    <TabsContent value="summary">
                       <p>Summary View - Under Construction</p>
                    </TabsContent>
                    <TabsContent value="board">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-6">
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
                                {epics.map(epic => {
                                    const epicConfig = epicIcons[epic.title] || { icon: Layers, color: 'text-foreground' };
                                    const IconComponent = epicConfig.icon;
                                    const itemsInEpic = backlogItems.filter(item => item.epicId === epic.id && !item.sprintId);
                                    
                                    return (
                                        <AccordionItem key={epic.id} value={epic.id}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <IconComponent className={cn("h-5 w-5", epicConfig.color)} />
                                                    <Badge variant={epic.status === 'Done' ? 'default' : 'secondary'} className={cn("whitespace-nowrap", epic.status === 'Done' ? 'bg-green-500' : '')}>{epic.status}</Badge>
                                                    <span className="font-semibold">{epic.title}</span>
                                                    <span className="text-muted-foreground text-sm">{projectPrefix}-{epic.epicId}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pl-8 pr-4 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-muted-foreground flex-1 pr-4">{epic.description}</p>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onSelect={() => openEditEpicDialog(epic)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => { setItemToDelete({type: 'epic', id: epic.id, name: epic.title}); setIsDeleteDialogOpen(true);}} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="border rounded-lg">
                                                        {itemsInEpic.length > 0 ? itemsInEpic.map(item => (
                                                            <div 
                                                                key={item.id} 
                                                                className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                                onClick={() => openEditBacklogItemDialog(item, epics, sprints)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <IconComponent className={cn("h-4 w-4", epicConfig.color)} />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Epic: {epic.title}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <span className="text-foreground text-sm font-mono">{projectPrefix}-{item.backlogId}</span>
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
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onSelect={() => openEditBacklogItemDialog(item, epics, sprints)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                            <DropdownMenuSub>
                                                                                <DropdownMenuSubTrigger>
                                                                                    <Rocket className="mr-2 h-4 w-4" />
                                                                                    <span>Move to Sprint</span>
                                                                                </DropdownMenuSubTrigger>
                                                                                <DropdownMenuPortal>
                                                                                <DropdownMenuSubContent>
                                                                                    <DropdownMenuItem onSelect={() => handleMoveToSprint(item.id, null)}>Backlog</DropdownMenuItem>
                                                                                    <Separator />
                                                                                    {upcomingSprints.map(sprint => (
                                                                                        <DropdownMenuItem key={sprint.id} onSelect={() => handleMoveToSprint(item.id, sprint.id)}>
                                                                                            {sprint.name}
                                                                                        </DropdownMenuItem>
                                                                                    ))}
                                                                                </DropdownMenuSubContent>
                                                                                </DropdownMenuPortal>
                                                                            </DropdownMenuSub>
                                                                            <DropdownMenuItem onSelect={(e) => { e.stopPropagation(); setItemToDelete({type: 'backlogItem', id: item.id, name: item.title}); setIsDeleteDialogOpen(true);}} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <p className="text-sm text-muted-foreground text-center p-4">No unassigned backlog items for this epic.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                       </div>
                    </TabsContent>
                    <TabsContent value="sprints">
                        <div className="space-y-8">
                             {(['Active', 'Not Started', 'Completed'] as SprintStatus[]).map(status => {
                                const sprintsByStatus = sprints.filter(s => s.status === status);
                                if (sprintsByStatus.length === 0) return null;

                                return (
                                <div key={status}>
                                    <h2 className="text-lg font-semibold mb-2">{status === 'Not Started' ? 'Upcoming Sprints' : `${status} Sprints`}</h2>
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        {sprintsByStatus.map(sprint => {
                                            const itemsInSprint = backlogItems.filter(item => item.sprintId === sprint.id);
                                            return (
                                                <AccordionItem key={sprint.id} value={sprint.id} className="border rounded-lg bg-card">
                                                    <AccordionTrigger className="flex p-4 hover:no-underline">
                                                        <div className="flex-1 flex items-center gap-4">
                                                            <h3 className="font-semibold text-base">{sprint.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d, yyyy')}
                                                            </p>
                                                            <Badge variant={sprint.status === 'Active' ? 'default' : 'secondary'} className={sprint.status === 'Active' ? 'bg-green-500' : ''}>{sprint.status}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-auto">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {sprint.status === 'Not Started' && (
                                                                        <DropdownMenuItem onSelect={() => handleStartSprint(sprint.id)} disabled={loading}>
                                                                            <Rocket className="mr-2 h-4 w-4" /> Start Sprint
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem>
                                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-4 pt-0">
                                                        <p className="italic text-muted-foreground mb-4">{sprint.goal}</p>
                                                        <div className="border rounded-lg">
                                                            {itemsInSprint.length > 0 ? itemsInSprint.map(item => {
                                                                 const epic = epics.find(e => e.id === item.epicId);
                                                                 const epicConfig = epic ? (epicIcons[epic.title] || { icon: Layers, color: 'text-foreground' }) : { icon: Layers, color: 'text-foreground' };
                                                                 const IconComponent = epicConfig.icon;
                                                                return (
                                                                    <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50"
                                                                        onClick={() => openEditBacklogItemDialog(item, epics, sprints)}
                                                                    >
                                                                         <div className="flex items-center gap-3">
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <IconComponent className={cn("h-4 w-4", epicConfig.color)} />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Epic: {epic?.title || 'Unknown'}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                            <span className="text-foreground text-sm font-mono">{projectPrefix}-{item.backlogId}</span>
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
                                                                )
                                                            }) : (
                                                                <p className="text-sm text-muted-foreground text-center p-4">No items in this sprint.</p>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {itemToDelete?.type} "{itemToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

