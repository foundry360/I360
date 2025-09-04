
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
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
  Rocket,
  CheckCircle,
  Search,
  Clock,
  Loader,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getProject, Project } from '@/services/project-service';
import { getTasksForProject, updateTaskOrderAndStatus, Task, TaskStatus, updateTask, createTask, deleteTask } from '@/services/task-service';
import { getEpicsForProject, Epic, deleteEpic } from '@/services/epic-service';
import { getBacklogItemsForProject, BacklogItem, deleteBacklogItem, updateBacklogItem } from '@/services/backlog-item-service';
import { getSprintsForProject, Sprint, SprintStatus, startSprint, deleteSprint, updateSprint, completeSprint } from '@/services/sprint-service';
import { getContactsForCompany, Contact } from '@/services/contact-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, parseISO, isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type TaskType = Task['type'];
type BoardColumns = Record<TaskStatus, Task[]>;

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

const statusColors: Record<TaskStatus, string> = {
    'To Do': 'bg-muted-foreground/20 text-muted-foreground',
    'In Progress': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'In Review': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    'Needs Revisions': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    'Final Approval': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    'Complete': 'bg-green-500/20 text-green-600 dark:text-green-400',
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
                        <span className="text-xs text-foreground">{taskNumber}</span>
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

const BoardColumn = ({ title, tasks, projectPrefix, onTaskClick }: { title: string; tasks: Task[]; projectPrefix: string; onTaskClick: (task: Task) => void;}) => (
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
                            "p-4 transition-colors min-h-[300px]",
                            snapshot.isDraggingOver && "bg-muted/50"
                        )}
                    >
                        {tasks.map((task, index) => {
                            return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => onTaskClick(task)}
                                            className="cursor-pointer"
                                        >
                                            <TaskCard task={task} taskNumber={`${projectPrefix}-${task.backlogId}`} />
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

const initialColumns: BoardColumns = {
    'To Do': [],
    'In Progress': [],
    'In Review': [],
    'Needs Revisions': [],
    'Final Approval': [],
    'Complete': [],
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const [project, setProject] = React.useState<Project | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [columns, setColumns] = React.useState<BoardColumns>(initialColumns);
    const [epics, setEpics] = React.useState<Epic[]>([]);
    const [backlogItems, setBacklogItems] = React.useState<BacklogItem[]>([]);
    const [sprints, setSprints] = React.useState<Sprint[]>([]);
    const [contacts, setContacts] = React.useState<Contact[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('summary');
    const { 
        openNewBacklogItemDialog, setOnBacklogItemCreated,
        openNewEpicDialog, setOnEpicCreated,
        openEditEpicDialog, setOnEpicUpdated,
        openEditBacklogItemDialog, setOnBacklogItemUpdated,
        openNewSprintDialog, setOnSprintCreated,
        openEditSprintDialog, setOnSprintUpdated,
        openEditTaskDialog, setOnTaskUpdated,
    } = useQuickAction();
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<{type: 'epic' | 'backlogItem' | 'sprint', id: string, name: string} | null>(null);
    const [allWorkSearchTerm, setAllWorkSearchTerm] = React.useState('');

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
            setTasks(tasksData);
            
            if (projectData?.companyId) {
                const companyContacts = await getContactsForCompany(projectData.companyId);
                setContacts(companyContacts);
            }
            
            const sortedTasks = tasksData.sort((a, b) => a.order - b.order);
            
            const newColumns = sortedTasks.reduce((acc, task) => {
                const status = task.status;
                if (!acc[status]) {
                    acc[status] = [];
                }
                acc[status].push(task);
                return acc;
            }, JSON.parse(JSON.stringify(initialColumns)) as BoardColumns);

            // Ensure all columns are present, even if empty
            for (const status in initialColumns) {
                if (!newColumns[status as TaskStatus]) {
                    newColumns[status as TaskStatus] = [];
                }
            }

            setColumns(newColumns);

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
        const unsubscribeSprintUpdate = setOnSprintUpdated(fetchData);
        const unsubscribeTask = setOnTaskUpdated(fetchData);
        return () => {
            if (unsubscribeBacklog) unsubscribeBacklog();
            if (unsubscribeEpic) unsubscribeEpic();
            if (unsubscribeEpicUpdate) unsubscribeEpicUpdate();
            if (unsubscribeBacklogUpdate) unsubscribeBacklogUpdate();
            if (unsubscribeSprint) unsubscribeSprint();
            if (unsubscribeSprintUpdate) unsubscribeSprintUpdate();
            if (unsubscribeTask) unsubscribeTask();
        };
    }, [fetchData, setOnBacklogItemCreated, setOnEpicCreated, setOnEpicUpdated, setOnBacklogItemUpdated, setOnSprintCreated, setOnSprintUpdated, setOnTaskUpdated]);

    const projectPrefix = project ? project.name.substring(0, project.name.indexOf('-')) : '';
    
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        
        const taskId = draggableId;
        const sourceColId = source.droppableId as TaskStatus;
        const destColId = destination.droppableId as TaskStatus;
        
        // Optimistic UI Update
        const newColumnsState = { ...columns };
        const sourceCol = newColumnsState[sourceColId];
        const destCol = newColumnsState[destColId];
        const [movedTask] = sourceCol.splice(source.index, 1);

        if (sourceColId === destColId) {
            // Moving within the same column
            sourceCol.splice(destination.index, 0, movedTask);
        } else {
            // Moving to a different column
            destCol.splice(destination.index, 0, movedTask);
        }
        
        setColumns(newColumnsState);

        // Persist changes to Firestore
        try {
            await updateTaskOrderAndStatus(taskId, destColId, destination.index, projectId);
            await fetchData(); // Refresh all data to ensure sync
        } catch (error) {
            console.error("Failed to update task:", error);
            // Revert optimistic update on failure by re-fetching
            fetchData();
        }
    };
    
    const handleDelete = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) e.stopPropagation();
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'epic') {
                await deleteEpic(itemToDelete.id);
            } else if (itemToDelete.type === 'backlogItem') {
                await deleteBacklogItem(itemToDelete.id);
            } else if (itemToDelete.type === 'sprint') {
                await deleteSprint(itemToDelete.id);
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
            
            const sprint = sprints.find(s => s.id === sprintId);
            const item = backlogItems.find(bi => bi.id === backlogItemId);

            if (item && sprint && sprint.status !== 'Completed') {
                const taskExists = tasks.some(t => t.backlogId === item?.backlogId);

                if (!taskExists) {
                    const toDoColumn = columns['To Do'] || [];
                    const newTaskData = {
                        projectId: projectId,
                        title: item.title,
                        status: 'To Do' as TaskStatus,
                        order: toDoColumn.length,
                        owner: item.owner || 'Unassigned',
                        ownerAvatarUrl: item.ownerAvatarUrl || '',
                        priority: item.priority,
                        type: 'Execution' as TaskType,
                        backlogId: item.backlogId,
                        dueDate: item.dueDate,
                    };
                    const newTaskId = await createTask(newTaskData);
                    const newTask: Task = { ...newTaskData, id: newTaskId };
                    
                    setColumns(prevColumns => {
                        const newColumns = { ...prevColumns };
                        newColumns['To Do'] = [...newColumns['To Do'], newTask];
                        return newColumns;
                    });
                }
            }
    
            await fetchData();
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
                setLoading(false);
                return;
            }
            await startSprint(sprintId, projectId, sprintItems, tasks);
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
    
    const handleCompleteSprint = async (sprintId: string) => {
        try {
            setLoading(true);
            await completeSprint(sprintId, projectId);
            toast({
                title: 'Sprint Completed!',
                description: 'Unfinished items have been moved back to the backlog.',
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to complete sprint:', error);
            toast({
                variant: 'destructive',
                title: 'Error Completing Sprint',
                description: 'There was a problem completing the sprint.',
            });
        } finally {
            setLoading(false);
        }
    }

    const upcomingSprints = sprints.filter(s => s.status === 'Not Started' || s.status === 'Active');

    const allSprintItems = React.useMemo(() => 
        backlogItems
            .filter(item => item.sprintId)
            .filter(item => {
                if (!allWorkSearchTerm) return true;
                const searchTermLower = allWorkSearchTerm.toLowerCase();
                const epic = epics.find(e => e.id === item.epicId);
                return (
                    item.title.toLowerCase().includes(searchTermLower) ||
                    item.owner.toLowerCase().includes(searchTermLower) ||
                    (epic && epic.title.toLowerCase().includes(searchTermLower)) ||
                    (`${projectPrefix}-${item.backlogId}`).toLowerCase().includes(searchTermLower)
                );
            })
            .sort((a,b) => (sprints.find(s => s.id === b.sprintId)?.endDate || '').localeCompare(sprints.find(s => s.id === a.sprintId)?.endDate || ''))
    , [backlogItems, sprints, allWorkSearchTerm, epics, projectPrefix]);
    
    const epicProgressData = React.useMemo(() => {
        return epics.map(epic => {
            const itemsInEpic = backlogItems.filter(item => item.epicId === epic.id);
            const completedItems = itemsInEpic.filter(item => {
                const task = tasks.find(t => t.backlogId === item.backlogId);
                return task?.status === 'Complete';
            });
            const progress = itemsInEpic.length > 0 ? (completedItems.length / itemsInEpic.length) * 100 : 0;
            return {
                name: epic.title,
                progress: Math.round(progress),
            }
        });
    }, [epics, backlogItems, tasks]);


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

    const activeSprint = sprints.find(s => s.status === 'Active');
    
    const totalTasks = tasks.length;
    const inProgressTasks = columns['In Progress'].length;
    const completedTasks = columns['Complete'].length;
    
    const overdueTasks = tasks.filter(task => 
        task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'Complete'
    ).length;

    const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
    const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const overduePercentage = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

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
                        <TabsTrigger 
                            value="all-work"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            All Work
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
                                            <Button size="icon" onClick={() => openNewBacklogItemDialog(projectId, project.companyId, epics)}><FilePlus className="h-4 w-4" /></Button>
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
                       <div className="grid grid-cols-10 gap-6">
                            <div className="col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Column 1</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>30% width placeholder.</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Epic Progress</CardTitle>
                                        <CardDescription>A summary of completion for each project epic.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {epicProgressData.map((epic, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="text-sm font-medium">{epic.name}</p>
                                                    <p className="text-sm text-muted-foreground">{epic.progress}% complete</p>
                                                </div>
                                                <Progress value={epic.progress} />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-3 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                                            <Loader className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{inProgressTasks}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">{Math.round(inProgressPercentage)}% of total</p>
                                            <Progress value={inProgressPercentage} />
                                        </CardFooter>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{completedTasks}</p>
                                        </CardContent>
                                         <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">{Math.round(completedPercentage)}% of total</p>
                                            <Progress value={completedPercentage} />
                                        </CardFooter>
                                    </Card>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Tasks</CardTitle>
                                            <Clock className="h-4 w-4 text-destructive" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold text-destructive">{overdueTasks}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">{Math.round(overduePercentage)}% of total</p>
                                            <Progress value={overduePercentage} className="[&>div]:bg-destructive" />
                                        </CardFooter>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">Placeholder 2</CardTitle>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">-</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">0% of total</p>
                                            <Progress value={0} />
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                       </div>
                    </TabsContent>
                    <TabsContent value="board">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-6">
                            {Object.entries(columns).map(([status, tasks]) => (
                                    <BoardColumn 
                                        key={status}
                                        title={status}
                                        tasks={tasks}
                                        projectPrefix={projectPrefix}
                                        onTaskClick={(task) => openEditTaskDialog(task, contacts)}
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
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"><MoreVertical className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onSelect={() => openEditEpicDialog(epic)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'epic', id: epic.id, name: epic.title}); setIsDeleteDialogOpen(true);}} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="border rounded-lg">
                                                        {itemsInEpic.length > 0 ? itemsInEpic.map(item => (
                                                            <div 
                                                                key={item.id} 
                                                                className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                                onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
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
                                                                    <span className="text-foreground text-sm">{projectPrefix}-{item.backlogId}</span>
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
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onSelect={(e) => { e.stopPropagation(); openEditBacklogItemDialog(item, epics, sprints, contacts); }}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
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
                                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'backlogItem', id: item.id, name: item.title}); setIsDeleteDialogOpen(true);}} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
                                const isHidden = sprintsByStatus.length === 0 && status === 'Active';

                                if (isHidden) return null;

                                return (
                                <div key={status}>
                                    <h2 className="text-lg font-semibold mb-2">{status === 'Not Started' ? 'Upcoming Sprints' : `${status} Sprints`}</h2>
                                    {sprintsByStatus.length === 0 ? (
                                        <Card className="border-dashed">
                                            <CardContent className="p-6 text-center text-muted-foreground">
                                                {status === 'Completed' ? 'No sprints have been completed yet.' : 'No upcoming sprints have been planned.'}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={status === 'Active' && activeSprint ? activeSprint.id : undefined}>
                                            {sprintsByStatus.map(sprint => {
                                                const itemsInSprint = backlogItems.filter(item => item.sprintId === sprint.id);
                                                return (
                                                    <AccordionItem key={sprint.id} value={sprint.id} className="border rounded-lg bg-card">
                                                        <div className="flex items-center p-4">
                                                            <AccordionTrigger className="p-0 hover:no-underline flex-1" noChevron>
                                                            <div className='flex items-center flex-1 gap-4'>
                                                                <h3 className="font-semibold text-base">{sprint.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d, yyyy')}
                                                                </p>
                                                                <Badge variant={sprint.status === 'Active' ? 'default' : sprint.status === 'Completed' ? 'secondary' : 'outline'} className={sprint.status === 'Active' ? 'bg-green-500' : ''}>{sprint.status}</Badge>
                                                            </div>
                                                            </AccordionTrigger>
                                                            <div className="flex items-center gap-2 ml-auto shrink-0 pl-4">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"><MoreVertical className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        {sprint.status === 'Not Started' && (
                                                                            <DropdownMenuItem onSelect={() => handleStartSprint(sprint.id)} disabled={loading}>
                                                                                <Rocket className="mr-2 h-4 w-4" /> Start Sprint
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {sprint.status === 'Active' && (
                                                                            <DropdownMenuItem onSelect={() => handleCompleteSprint(sprint.id)} disabled={loading}>
                                                                                <CheckCircle className="mr-2 h-4 w-4" /> Complete Sprint
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {sprint.status !== 'Completed' && (
                                                                        <DropdownMenuItem onSelect={() => openEditSprintDialog(sprint)}>
                                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'sprint', id: sprint.id, name: sprint.name}); setIsDeleteDialogOpen(true);}}>
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <AccordionContent className="p-4 pt-0">
                                                            <p className="italic text-muted-foreground mb-4">{sprint.goal}</p>
                                                            <div className="border rounded-lg">
                                                                {itemsInSprint.length > 0 ? itemsInSprint.map(item => {
                                                                    const epic = epics.find(e => e.id === item.epicId);
                                                                    const epicConfig = epic ? (epicIcons[epic.title] || { icon: Layers, color: 'text-foreground' }) : { icon: Layers, color: 'text-foreground' };
                                                                    const IconComponent = epicConfig.icon;
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                                            onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
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
                                                                                <span className="text-foreground text-sm">{projectPrefix}-{item.backlogId}</span>
                                                                                <p>{item.title}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-4">
                                                                                <Badge variant="outline" className={cn(statusColors[item.status])}>{item.status}</Badge>
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
                                    )}
                                </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                     <TabsContent value="all-work">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search all work items..."
                                    value={allWorkSearchTerm}
                                    onChange={(e) => setAllWorkSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                             <div className="border rounded-lg">
                                {allSprintItems.length > 0 ? allSprintItems.map(item => {
                                    const epic = epics.find(e => e.id === item.epicId);
                                    const sprint = sprints.find(s => s.id === item.sprintId);
                                    const epicConfig = epic ? (epicIcons[epic.title] || { icon: Layers, color: 'text-foreground' }) : { icon: Layers, color: 'text-foreground' };
                                    const IconComponent = epicConfig.icon;
                                    return (
                                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
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
                                                <span className="text-foreground text-sm">{projectPrefix}-{item.backlogId}</span>
                                                <p>{item.title}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {sprint && <Badge variant={sprint.status === 'Active' ? 'default' : sprint.status === 'Completed' ? 'secondary' : 'outline'} className={cn(sprint.status === 'Active' && 'bg-green-500')}>{sprint.name}</Badge>}
                                                <Badge variant="outline" className={cn(statusColors[item.status])}>{item.status}</Badge>
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
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={item.ownerAvatarUrl} />
                                                    <AvatarFallback className="text-xs">{item.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-sm text-muted-foreground text-center p-6">
                                        {allWorkSearchTerm ? 'No matching items found.' : 'No items assigned to any sprints.'}
                                    </p>
                                )}
                            </div>
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
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => handleDelete(e)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}



    

    








