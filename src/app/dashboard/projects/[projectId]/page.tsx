
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
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
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
import { add, format, formatDistanceToNow, isPast, differenceInDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Area, Dot, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TimelineView } from '@/components/timeline-view';

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

export const epicIcons: Record<string, { icon: React.ElementType, color: string }> = {
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

const statusHexColors: Record<TaskStatus, string> = {
    'To Do': '#a1a1aa', // zinc-400
    'In Progress': '#3b82f6', // blue-500
    'In Review': '#a855f7', // purple-500
    'Needs Revisions': '#f97316', // orange-500
    'Final Approval': '#eab308', // yellow-500
    'Complete': '#22c55e', // green-500
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
    High: 'bg-danger',
    Medium: 'bg-warning',
    Low: 'bg-success',
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

const chartConfig = {
  velocity: {
    label: "Velocity",
    color: "hsl(var(--chart-1))",
  },
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-1))",
  },
  ideal: {
    label: "Ideal",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

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
            await fetchData();
        } catch (error) {
            console.error("Failed to move item to sprint:", error);
        }
    };

    const handleStartSprint = async (sprintId: string) => {
        try {
            setLoading(true);
            const itemsInSprint = backlogItems.filter(item => item.sprintId === sprintId);
            if (itemsInSprint.length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Start Empty Sprint',
                    description: 'Add items to the sprint before starting it.',
                });
                setLoading(false);
                return;
            }
            await startSprint(sprintId, projectId, itemsInSprint, tasks);
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
                description: 'Completed tasks have been archived.',
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to complete sprint:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'There was a problem completing the sprint.';
            toast({
                variant: 'destructive',
                title: 'Error Completing Sprint',
                description: errorMessage,
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

    const velocityData = React.useMemo(() => {
        const completedSprints = sprints
            .filter(s => s.status === 'Completed')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
        return completedSprints.map(sprint => {
            const itemsInSprint = backlogItems.filter(item => item.sprintId === sprint.id);
            const completedTasksInSprint = tasks.filter(task => 
                task.status === 'Complete' && 
                itemsInSprint.some(item => item.backlogId === task.backlogId)
            );
            
            const pointsThisSprint = completedTasksInSprint.reduce((acc, task) => {
                const item = itemsInSprint.find(i => i.backlogId === task.backlogId);
                return acc + (item?.points || 0);
            }, 0);
    
            return {
                name: sprint.name,
                velocity: pointsThisSprint,
            };
        });
    }, [sprints, backlogItems, tasks]);
    
    const burndownData = React.useMemo(() => {
        const totalPoints = backlogItems.reduce((acc, item) => acc + (item?.points || 0), 0);
        const completedSprints = sprints
            .filter(s => s.status === 'Completed')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        if (totalPoints === 0 || completedSprints.length === 0) {
            return [];
        }
        
        const idealPointsPerSprint = totalPoints / (sprints.filter(s => s.status !== 'Not Started').length || 1);
        let cumulativePointsCompleted = 0;
        let runningIdeal = totalPoints;

        const data = [{ name: 'Start', actual: totalPoints, ideal: totalPoints }];

        completedSprints.forEach((sprint) => {
            const itemsInSprint = backlogItems.filter(item => item.sprintId === sprint.id);
            const completedTasksInSprint = tasks.filter(task => task.status === 'Complete' && itemsInSprint.some(item => item.backlogId === task.backlogId));
            const pointsThisSprint = completedTasksInSprint.reduce((acc, task) => {
                const item = itemsInSprint.find(i => i.backlogId === task.backlogId);
                return acc + (item?.points || 0);
            }, 0);
            
            cumulativePointsCompleted += pointsThisSprint;
            runningIdeal -= idealPointsPerSprint;

            data.push({
                name: sprint.name.split(' ').slice(0,2).join(' '),
                actual: totalPoints - cumulativePointsCompleted,
                ideal: Math.max(0, Math.round(runningIdeal)),
            });
        });
        
        return data;

    }, [sprints, backlogItems, tasks]);
    
    const activeSprint = sprints.find(s => s.status === 'Active');

    const activeSprintHealthData = React.useMemo(() => {
        if (!activeSprint) return null;

        const sprintItems = backlogItems.filter(item => item.sprintId === activeSprint.id);
        if (sprintItems.length === 0) return null;
        
        const sprintItemBacklogIds = sprintItems.map(item => item.backlogId);
        const tasksInSprint = tasks.filter(task => task.backlogId && sprintItemBacklogIds.includes(task.backlogId));

        const totalTasks = tasksInSprint.length;
        if (totalTasks === 0) return null;

        const statusCounts = tasksInSprint.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);

        const segments = (Object.keys(statusColors) as TaskStatus[]).map(status => ({
            status,
            count: statusCounts[status] || 0,
            percentage: totalTasks > 0 ? ((statusCounts[status] || 0) / totalTasks) * 100 : 0,
            color: statusHexColors[status],
        })).filter(segment => segment.count > 0);
        
        const daysLeft = differenceInDays(parseISO(activeSprint.endDate), new Date());

        return { segments, daysLeft: Math.max(0, daysLeft) };

    }, [activeSprint, backlogItems, tasks]);
    
    const projectHealth = React.useMemo(() => {
        if (!project || !tasks.length) {
            return { status: 'Unknown', icon: HelpCircle, color: 'text-muted-foreground', tasksCompletedPercent: 0 };
        }

        const today = new Date();
        const startDate = parseISO(project.startDate);
        const endDate = project.endDate ? parseISO(project.endDate) : add(startDate, { months: 6 });
        
        if (isPast(endDate)) {
            return { status: 'Archived', icon: CheckCircle2, color: 'text-muted-foreground', tasksCompletedPercent: 100 };
        }

        const totalDuration = differenceInDays(endDate, startDate);
        const timeElapsed = differenceInDays(today, startDate);
        const timeElapsedPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100)) : 0;
        
        const completedTasksCount = tasks.filter(t => t.status === 'Complete').length;
        const tasksCompletedPercent = (completedTasksCount / tasks.length) * 100;
        
        const overdueTasksCount = tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'Complete').length;
        const overduePercent = (overdueTasksCount / tasks.length) * 100;

        const scheduleVariance = tasksCompletedPercent - timeElapsedPercent;

        if (scheduleVariance >= -5 && overduePercent < 10) {
            return { status: 'On Track', icon: TrendingUp, color: 'text-success', tasksCompletedPercent: tasksCompletedPercent };
        } else if (scheduleVariance < -15 || overduePercent > 25) {
            return { status: 'Needs Attention', icon: TrendingDown, color: 'text-danger', tasksCompletedPercent: tasksCompletedPercent };
        } else {
            return { status: 'At Risk', icon: AlertTriangle, color: 'text-warning', tasksCompletedPercent: tasksCompletedPercent };
        }

    }, [project, tasks]);
    
    const atRiskTasks = React.useMemo(() => {
        const today = new Date();
        return tasks.filter(task => {
            if (task.status === 'Complete' || !task.dueDate) return false;
            
            const dueDate = parseISO(task.dueDate!);
            const daysUntilDue = differenceInDays(dueDate, today);

            // Overdue or due within 3 days
            return daysUntilDue < 3;
        }).sort((a,b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime());
    }, [tasks]);

    const timelineData = React.useMemo(() => {
        if (!project || !epics.length || !sprints.length) return { items: [], projectStartDate: new Date(), projectEndDate: new Date() };

        const epicItems = epics.map(epic => {
            const itemsInEpic = backlogItems.filter(item => item.epicId === epic.id);
            const completedItemsInEpic = itemsInEpic.filter(item => item.status === 'Complete');
            const epicProgress = itemsInEpic.length > 0 ? (completedItemsInEpic.length / itemsInEpic.length) * 100 : 0;

            const sprintIdsInEpic = [...new Set(itemsInEpic.map(item => item.sprintId).filter(Boolean))];
            const sprintsInEpic = sprints.filter(sprint => sprintIdsInEpic.includes(sprint.id));

            if (sprintsInEpic.length === 0) return null;

            const epicStartDate = new Date(Math.min(...sprintsInEpic.map(s => parseISO(s.startDate).getTime())));
            const epicEndDate = new Date(Math.max(...sprintsInEpic.map(s => parseISO(s.endDate).getTime())));

            return {
                id: epic.id,
                title: epic.title,
                startDate: epicStartDate,
                endDate: epicEndDate,
                type: 'epic' as const,
                progress: epicProgress,
                children: sprintsInEpic.map(sprint => {
                    const itemsInSprint = backlogItems.filter(item => item.sprintId === sprint.id && item.epicId === epic.id);
                    const completedItemsInSprint = itemsInSprint.filter(item => item.status === 'Complete');
                    const sprintProgress = itemsInSprint.length > 0 ? (completedItemsInSprint.length / itemsInSprint.length) * 100 : 0;
                    return {
                        id: sprint.id,
                        title: sprint.name,
                        startDate: parseISO(sprint.startDate),
                        endDate: parseISO(sprint.endDate),
                        type: 'sprint' as const,
                        progress: sprintProgress,
                        children: itemsInSprint.map(item => ({
                            id: item.id,
                            title: item.title,
                            startDate: parseISO(sprint.startDate),
                            endDate: parseISO(sprint.endDate),
                            status: item.status,
                            type: 'item' as const,
                        }))
                    };
                }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
            };
        }).filter(Boolean);

        const projectStartDate = new Date(Math.min(...sprints.filter(s => s.status !== 'Not Started').map(s => parseISO(s.startDate).getTime())));
        const projectEndDate = new Date(Math.max(...sprints.filter(s => s.status !== 'Not Started').map(s => parseISO(s.endDate).getTime())));

        return { items: epicItems as any[], projectStartDate, projectEndDate };

    }, [epics, sprints, backlogItems, project]);

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
        return <p>Engagement not found.</p>;
    }
    
    const totalTasks = tasks.length;
    const inProgressTasks = columns['In Progress'].length;
    const completedTasksCount = tasks.filter(task => task.status === 'Complete').length;
    
    const overdueTasksCount = tasks.filter(task => 
        task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'Complete'
    ).length;

    const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
    const completedPercentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
    const overduePercentage = totalTasks > 0 ? (overdueTasksCount / totalTasks) * 100 : 0;
    
    const HealthIcon = projectHealth.icon;

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
                            value="timeline"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Timeline
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
                            <div className="col-span-3 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Velocity</CardTitle>
                                        <CardDescription>Story points completed per sprint</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={chartConfig} className="h-[150px] w-full">
                                            <LineChart
                                                data={velocityData}
                                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={() => ""}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    width={30}
                                                />
                                                <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                                <defs>
                                                    <linearGradient id="fillVelocity" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-velocity)" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="var(--color-velocity)" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    dataKey="velocity"
                                                    type="natural"
                                                    fill="url(#fillVelocity)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-velocity)"
                                                    stackId="a"
                                                />
                                                <Line
                                                    dataKey="velocity"
                                                    type="natural"
                                                    stroke="var(--color-velocity)"
                                                    strokeWidth={2}
                                                    dot={
                                                        <Dot
                                                            r={4}
                                                            fill="var(--background)"
                                                            stroke="var(--color-velocity)"
                                                            strokeWidth={2}
                                                        />
                                                    }
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Engagement Burndown</CardTitle>
                                        <CardDescription>Ideal vs actual work remaining</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={chartConfig} className="h-[150px] w-full">
                                            <LineChart
                                                data={burndownData}
                                                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={() => ""}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    width={30}
                                                />
                                                 <ChartLegend content={<ChartLegendContent />} />
                                                <RechartsTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                                                <Line
                                                    dataKey="actual"
                                                    type="natural"
                                                    stroke="var(--color-actual)"
                                                    strokeWidth={2}
                                                    dot
                                                />
                                                 <Line
                                                    dataKey="ideal"
                                                    type="natural"
                                                    stroke="var(--color-ideal)"
                                                    strokeWidth={2}
                                                    strokeDasharray="3 3"
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-4 space-y-6">
                                {activeSprintHealthData && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Active Sprint Health</CardTitle>
                                            <CardDescription>{activeSprint?.name}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <TooltipProvider>
                                                <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted mb-2">
                                                    {activeSprintHealthData.segments.map(segment => (
                                                        <Tooltip key={segment.status}>
                                                            <TooltipTrigger asChild>
                                                                <div 
                                                                    className="h-full"
                                                                    style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{segment.status}: {segment.count} task(s) ({Math.round(segment.percentage)}%)</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            </TooltipProvider>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                {activeSprintHealthData.segments.map(segment => (
                                                    <div key={segment.status} className="flex items-center gap-1">
                                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                                                        <span>{segment.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <p className="text-sm text-muted-foreground w-full text-center">
                                                <span className="font-bold">{activeSprintHealthData.daysLeft}</span> days remaining
                                            </p>
                                        </CardFooter>
                                    </Card>
                                )}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Epic Progress</CardTitle>
                                        <CardDescription>A summary of completion for each engagement epic</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {epicProgressData.map((epic, index) => {
                                            const epicConfig = epicIcons[epic.name] || { icon: Layers, color: 'text-foreground' };
                                            const IconComponent = epicConfig.icon;
                                            return (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between items-baseline">
                                                        <div className="flex items-center gap-2">
                                                            <IconComponent className={cn("h-4 w-4", epicConfig.color)} />
                                                            <p className="text-sm font-medium">{epic.name}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{epic.progress}% complete</p>
                                                    </div>
                                                    <Progress value={epic.progress} />
                                                </div>
                                            )
                                        })}
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
                                            <p className="text-2xl font-bold">{completedTasksCount}</p>
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
                                            <Clock className="h-4 w-4 text-danger" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold text-danger">{overdueTasksCount}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">{Math.round(overduePercentage)}% of total</p>
                                            <Progress value={overduePercentage} className="[&>div]:bg-danger" />
                                        </CardFooter>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Health</CardTitle>
                                            <HealthIcon className={cn("h-4 w-4", projectHealth.color)} />
                                        </CardHeader>
                                        <CardContent>
                                            <p className={cn("text-2xl font-bold", projectHealth.color)}>{projectHealth.status}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                            <p className="text-xs text-muted-foreground">{Math.round(projectHealth.tasksCompletedPercent)}% complete</p>
                                            <Progress value={projectHealth.tasksCompletedPercent} className={cn("[&>div]:bg-success", projectHealth.status === 'At Risk' && "[&>div]:bg-warning", projectHealth.status === 'Needs Attention' && "[&>div]:bg-danger")} />
                                        </CardFooter>
                                    </Card>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>At-Risk Tasks</CardTitle>
                                        <CardDescription>Tasks that are overdue or due within 3 days.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {atRiskTasks.length > 0 ? (
                                            atRiskTasks.map(task => {
                                                const dueDate = parseISO(task.dueDate!);
                                                const now = new Date();
                                                const daysDiff = differenceInDays(dueDate, now);
                                                const isOverdue = daysDiff < 0;

                                                let statusText = '';
                                                let statusColor = 'text-warning';

                                                if (isOverdue) {
                                                    statusText = `Overdue by ${Math.abs(daysDiff)} day(s)`;
                                                    statusColor = 'text-danger';
                                                } else {
                                                    statusText = `Due in ${daysDiff + 1} day(s)`;
                                                }

                                                return (
                                                <div 
                                                    key={task.id} 
                                                    className="flex justify-between items-center text-sm p-2 -mx-2 rounded-md hover:bg-muted cursor-pointer"
                                                    onClick={() => {
                                                        const backlogItem = backlogItems.find(item => item.backlogId === task.backlogId);
                                                        if (backlogItem) {
                                                            openEditBacklogItemDialog(backlogItem, epics, sprints, contacts);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={task.ownerAvatarUrl} />
                                                            <AvatarFallback className="text-xs">{task.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{task.title}</span>
                                                    </div>
                                                    <span className={cn("font-semibold", statusColor)}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No at-risk tasks. Great job!</p>
                                        )}
                                    </CardContent>
                                </Card>
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
                                        onTaskClick={(task) => {
                                            const backlogItem = backlogItems.find(item => item.backlogId === task.backlogId);
                                            if (backlogItem) {
                                                openEditBacklogItemDialog(backlogItem, epics, sprints, contacts);
                                            }
                                        }}
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
                                            <AccordionTrigger className="text-base font-normal">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <IconComponent className={cn("h-5 w-5", epicConfig.color)} />
                                                    <Badge variant={epic.status === 'Done' ? 'success' : 'secondary'} className="whitespace-nowrap">{epic.status}</Badge>
                                                    <span className="font-semibold text-sm">{epic.title}</span>
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
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'epic', id: epic.id, name: epic.title}); setIsDeleteDialogOpen(true);}}><Trash2 className="mr-2 h-4 w-4" /></DropdownMenuItem>
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
                                                                    <p className="text-sm font-medium">{item.title}</p>
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
                                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'backlogItem', id: item.id, name: item.title}); setIsDeleteDialogOpen(true);}}><Trash2 className="mr-2 h-4 w-4" /></DropdownMenuItem>
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
                                                            <AccordionTrigger className="p-0 hover:no-underline flex-1 text-sm font-normal" noChevron>
                                                            <div className='flex items-center flex-1 gap-4'>
                                                                <h3 className="font-semibold text-sm">{sprint.name}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d, yyyy')}
                                                                </p>
                                                                <Badge variant={sprint.status === 'Active' ? 'success' : sprint.status === 'Completed' ? 'secondary' : 'outline'}>{sprint.status}</Badge>
                                                            </div>
                                                            </AccordionTrigger>
                                                            <div className="flex items-center gap-2 ml-auto shrink-0 pl-4">
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
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'sprint', id: sprint.id, name: sprint.name}); setIsDeleteDialogOpen(true);}}><Trash2 className="mr-2 h-4 w-4" /></DropdownMenuItem>
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
                                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                                <span className="text-foreground text-sm">{projectPrefix}-{item.backlogId}</span>
                                                                                <p className="text-sm font-medium">{item.title}</p>
                                                                                {epic && (
                                                                                    <Badge variant="secondary" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveTab('backlog')}}>
                                                                                        <IconComponent className={cn("h-3 w-3 mr-1", epicConfig.color)} />
                                                                                        {epic.title}
                                                                                    </Badge>
                                                                                )}
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
                    <TabsContent value="timeline">
                        <TimelineView
                            items={timelineData.items}
                            projectStartDate={timelineData.projectStartDate}
                            projectEndDate={timelineData.projectEndDate}
                        />
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
                                                <p className="text-sm font-medium">{item.title}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {sprint && <Badge variant={sprint.status === 'Active' ? 'success' : sprint.status === 'Completed' ? 'secondary' : 'outline'}>{sprint.name}</Badge>}
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
