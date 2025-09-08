
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
  Library,
  Inbox,
  Rocket,
  BookCopy,
  CircleGauge,
  CloudDownload,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getProject, Project } from '@/services/project-service';
import { getEpicsForProject, Epic, deleteEpic } from '@/services/epic-service';
import { BacklogItem, deleteBacklogItem, updateBacklogItem, addCollectionToProjectBacklog, updateBacklogItemOrderAndStatus, BacklogItemStatus, BacklogItemPriority, BacklogItemType } from '@/services/backlog-item-service';
import { getSprintsForProject, Sprint, SprintStatus, startSprint, deleteSprint, updateSprint, completeSprint } from '@/services/sprint-service';
import { getContactsForCompany, Contact } from '@/services/contact-service';
import { getCollections, type StoryCollection } from '@/services/collection-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { add, format, formatDistanceToNow, isPast, differenceInDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Area, Dot, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TimelineView } from '@/components/timeline-view';
import Link from 'next/link';
import { getTags, type Tag } from '@/services/user-story-service';
import { tagConfig } from '@/lib/tag-config';

type BoardColumns = Record<BacklogItemStatus, BacklogItem[]>;

const backlogItemTypeIcons: Record<BacklogItemType, React.ElementType> = {
    Assessment: ClipboardList,
    Workshop: Presentation,
    Enablement: Zap,
    Planning: GanttChartSquare,
    Execution: Wrench,
    Review: SearchCheck,
};

const backlogItemTypeColors: Record<BacklogItemType, string> = {
    Assessment: 'bg-chart-1',
    Workshop: 'bg-chart-2',
    Enablement: 'bg-chart-3',
    Planning: 'bg-chart-4',
    Execution: 'bg-chart-5',
    Review: 'bg-primary',
};

const statusColors: Record<BacklogItemStatus, string> = {
    'To Do': 'bg-muted-foreground/20 text-muted-foreground',
    'In Progress': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'In Review': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    'Needs Revision': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    'Final Approval': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    'Complete': 'bg-green-500/20 text-green-600 dark:text-green-400',
};

const statusHexColors: Record<BacklogItemStatus, string> = {
    'To Do': '#a1a1aa', // zinc-400
    'In Progress': '#3b82f6', // blue-500
    'In Review': '#a855f7', // purple-500
    'Needs Revision': '#f97316', // orange-500
    'Final Approval': '#eab308', // yellow-500
    'Complete': '#22c55e', // green-500
};

const WavesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s5 2 5 2c1.3 0 1.9-.5 2.5-1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s5 2 5 2c1.3 0 1.9-.5 2.5-1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s5 2 5 2c1.3 0 1.9-.5 2.5-1" />
    </svg>
);


const BacklogItemTypeIcon = ({ type }: { type: BacklogItemType }) => {
    const Icon = type ? backlogItemTypeIcons[type] : Wrench;
    const colorClass = type ? backlogItemTypeColors[type] : 'bg-primary';
    return (
        <div className={cn("flex items-center justify-center h-6 w-6 rounded-full", colorClass)}>
            <Icon className="h-4 w-4 text-white" />
        </div>
    );
};


const priorityContainerColors: Record<BacklogItem['priority'], string> = {
    High: 'bg-danger',
    Medium: 'bg-warning',
    Low: 'bg-success',
}

const PriorityIcon = ({ priority }: { priority: BacklogItem['priority'] }) => {
    const colorClass = priorityContainerColors[priority];
    const chevronCount = priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;

    return (
        <div className={cn("flex items-center justify-center h-6 w-6 rounded-full", colorClass)}>
            <div className="flex flex-col items-center justify-center -space-y-2">
                {Array.from({ length: chevronCount }).map((_, i) => (
                    <ChevronUp key={i} className="h-3 w-3 text-primary" />
                ))}
            </div>
        </div>
    );
};

const BacklogItemCard = ({ item, itemNumber }: { item: BacklogItem; itemNumber: string }) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    return (
        <Card className="mb-4 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col w-full">
                <CardContent className="p-3">
                    <p className="text-sm font-medium flex-1">{item.title}</p>
                </CardContent>
                <CardFooter className="p-3 flex justify-between items-center bg-muted/50 mt-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground">{itemNumber}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <BacklogItemTypeIcon type={item.type} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Type: {item.type}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={item.ownerAvatarUrl} />
                        <AvatarFallback className="text-xs">{getInitials(item.owner)}</AvatarFallback>
                    </Avatar>
                </CardFooter>
            </div>
        </Card>
    );
};

const BoardColumn = ({ title, items, projectPrefix, onItemClick }: { title: string; items: BacklogItem[]; projectPrefix: string; onItemClick: (item: BacklogItem) => void;}) => (
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
                        {items.map((item, index) => {
                            return (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => onItemClick(item)}
                                            className="cursor-pointer"
                                        >
                                            <BacklogItemCard item={item} itemNumber={`${projectPrefix}-${item.backlogId}`} />
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
    'Needs Revision': [],
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
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const [project, setProject] = React.useState<Project | null>(null);
    const [columns, setColumns] = React.useState<BoardColumns>(initialColumns);
    const [epics, setEpics] = React.useState<Epic[]>([]);
    const { backlogItems, getProjects } = useQuickAction();
    const [sprints, setSprints] = React.useState<Sprint[]>([]);
    const [contacts, setContacts] = React.useState<Contact[]>([]);
    const [allTags, setAllTags] = React.useState<Tag[]>([]);
    const [collections, setCollections] = React.useState<StoryCollection[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('summary');
    const { 
        openNewBacklogItemDialog,
        openNewEpicDialog,
        openEditEpicDialog,
        openEditBacklogItemDialog,
        openNewSprintDialog,
        openEditSprintDialog,
        openAddFromCollectionDialog,
        setOnBacklogItemCreated,
        setOnEpicCreated,
        setOnSprintCreated,
        setOnBacklogItemUpdated,
        setOnEpicUpdated,
        setOnSprintUpdated,
    } = useQuickAction();
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<{type: 'epic' | 'backlogItem' | 'sprint', id: string, name: string} | null>(null);
    const [allWorkSearchTerm, setAllWorkSearchTerm] = React.useState('');
    const [activeEpicAccordion, setActiveEpicAccordion] = React.useState<string[]>([]);
    
    const projectBacklogItems = React.useMemo(() => {
        return backlogItems.filter(item => item.projectId === projectId);
    }, [backlogItems, projectId]);


    const fetchData = React.useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, epicsData, sprintsData, tagsData, collectionsData] = await Promise.all([
                getProject(projectId),
                getEpicsForProject(projectId),
                getSprintsForProject(projectId),
                getTags(),
                getCollections(),
            ]);
            setProject(projectData);
            setEpics(epicsData);
            setSprints(sprintsData);
            setAllTags(tagsData);
            setCollections(collectionsData);
            
            if (projectData?.companyId) {
                const companyContacts = await getContactsForCompany(projectData.companyId);
                setContacts(companyContacts);
            }
        } catch (error) {
            console.error("Failed to fetch project data:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    React.useEffect(() => {
        fetchData();
        const unsub1 = setOnBacklogItemCreated(fetchData);
        const unsub2 = setOnEpicCreated(fetchData);
        const unsub3 = setOnSprintCreated(fetchData);
        const unsub4 = setOnBacklogItemUpdated(fetchData);
        const unsub5 = setOnEpicUpdated(fetchData);
        const unsub6 = setOnSprintUpdated(fetchData);
        return () => {
            if(unsub1) unsub1();
            if(unsub2) unsub2();
            if(unsub3) unsub3();
            if(unsub4) unsub4();
            if(unsub5) unsub5();
            if(unsub6) unsub6();
        };
    }, [
        fetchData, 
        setOnBacklogItemCreated, 
        setOnEpicCreated, 
        setOnSprintCreated, 
        setOnBacklogItemUpdated,
        setOnEpicUpdated,
        setOnSprintUpdated,
    ]);

     React.useEffect(() => {
        const activeOrCompletedSprintIds = sprints
            .filter(s => s.status === 'Active' || s.status === 'Completed')
            .map(s => s.id);
        
        const itemsForBoard = projectBacklogItems.filter(item => 
            item.sprintId && activeOrCompletedSprintIds.includes(item.sprintId)
        );
        
        const sortedItems = itemsForBoard.sort((a, b) => a.order - b.order);
        
        const newColumns = sortedItems.reduce((acc, item) => {
            const status = item.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(item);
            return acc;
        }, JSON.parse(JSON.stringify(initialColumns)) as BoardColumns);

        for (const status in initialColumns) {
            if (!newColumns[status as BacklogItemStatus]) {
                newColumns[status as BacklogItemStatus] = [];
            }
        }

        setColumns(newColumns);
    }, [projectBacklogItems, sprints]);


    const projectPrefix = project ? project.name.substring(0, project.name.indexOf('-')) : '';
    
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        
        const itemId = draggableId;
        const sourceColId = source.droppableId as BacklogItemStatus;
        const destColId = destination.droppableId as BacklogItemStatus;
        
        // Optimistic UI Update
        const newColumnsState = { ...columns };
        const sourceCol = newColumnsState[sourceColId];
        const destCol = newColumnsState[destColId];
        const [movedItem] = sourceCol.splice(source.index, 1);

        if (sourceColId === destColId) {
            // Moving within the same column
            sourceCol.splice(destination.index, 0, movedItem);
        } else {
            // Moving to a different column
            destCol.splice(destination.index, 0, movedItem);
        }
        
        setColumns(newColumnsState);

        // Persist changes to Firestore
        try {
            await updateBacklogItemOrderAndStatus(itemId, destColId, destination.index, projectId);
            // No need to fetch data here, as the listener will pick up changes
        } catch (error) {
            console.error("Failed to update item:", error);
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
        } catch (error) {
            console.error("Failed to move item to sprint:", error);
        }
    };

    const handleStartSprint = async (sprintId: string) => {
        try {
            setLoading(true);
            const itemsInSprint = projectBacklogItems.filter(item => item.sprintId === sprintId);
            if (itemsInSprint.length === 0) {
                toast({
                    variant: 'destructive',
                    title: 'Cannot Start Empty Wave',
                    description: 'Add items to the wave before starting it.',
                });
                setLoading(false);
                return;
            }
            await startSprint(sprintId, projectId, itemsInSprint);
            toast({
                title: 'Wave Started!',
                description: 'Items are now on the board.',
            });
        } catch (error) {
            console.error('Failed to start wave:', error);
            toast({
                variant: 'destructive',
                title: 'Error Starting Wave',
                description: 'There was a problem starting the wave.',
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
                title: 'Wave Completed!',
                description: 'Completed items have been archived.',
            });
        } catch (error) {
            console.error('Failed to complete wave:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'There was a problem completing the wave.';
            toast({
                variant: 'destructive',
                title: 'Error Completing Wave',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }

    const handleAddToBacklogFromCollection = async (collectionId: string) => {
        try {
            setLoading(true);
            await addCollectionToProjectBacklog(projectId, collectionId);
            const selectedCollection = collections.find(c => c.id === collectionId);
            toast({
                title: 'Success!',
                description: `Stories from "${selectedCollection?.name}" have been added to the backlog.`,
            });
        } catch (error) {
            console.error("Error adding collection to backlog:", error);
             toast({
                variant: "destructive",
                title: "Error",
                description: "There was a problem adding stories from the collection.",
            });
        } finally {
            setLoading(false);
        }
    };

    const upcomingSprints = sprints.filter(s => s.status === 'Not Started' || s.status === 'Active');

    const allSprintItems = React.useMemo(() => {
        if (!projectBacklogItems) return [];
        return projectBacklogItems
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
    }, [projectBacklogItems, sprints, allWorkSearchTerm, epics, projectPrefix]);
    
    const epicProgressData = React.useMemo(() => {
        return epics.map(epic => {
            const itemsInEpic = projectBacklogItems.filter(item => item.epicId === epic.id);
            const completedItems = itemsInEpic.filter(item => item.status === 'Complete');
            const progress = itemsInEpic.length > 0 ? (completedItems.length / itemsInEpic.length) * 100 : 0;
            return {
                id: epic.id,
                name: epic.title,
                progress: Math.round(progress),
                category: epic.category,
            }
        });
    }, [epics, projectBacklogItems]);

    const velocityData = React.useMemo(() => {
        const completedSprints = sprints
            .filter(s => s.status === 'Completed')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
        return completedSprints.map(sprint => {
            const itemsInSprint = projectBacklogItems.filter(item => item.sprintId === sprint.id && item.status === 'Complete');
            const pointsThisSprint = itemsInSprint.reduce((acc, item) => acc + (item?.points || 0), 0);
    
            return {
                name: sprint.name,
                velocity: pointsThisSprint,
            };
        });
    }, [sprints, projectBacklogItems]);
    
    const burndownData = React.useMemo(() => {
        const totalPoints = projectBacklogItems.reduce((acc, item) => acc + (item?.points || 0), 0);
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
            const itemsInSprint = projectBacklogItems.filter(item => item.sprintId === sprint.id && item.status === 'Complete');
            const pointsThisSprint = itemsInSprint.reduce((acc, item) => acc + (item?.points || 0), 0);
            
            cumulativePointsCompleted += pointsThisSprint;
            runningIdeal -= idealPointsPerSprint;

            data.push({
                name: sprint.name.split(' ').slice(0,2).join(' '),
                actual: totalPoints - cumulativePointsCompleted,
                ideal: Math.max(0, Math.round(runningIdeal)),
            });
        });
        
        return data;

    }, [sprints, projectBacklogItems]);
    
    const activeSprint = sprints.find(s => s.status === 'Active');

    const activeSprintHealthData = React.useMemo(() => {
        if (!activeSprint) return null;

        const sprintItems = projectBacklogItems.filter(item => item.sprintId === activeSprint.id);
        if (sprintItems.length === 0) return null;
        
        const totalItems = sprintItems.length;
        if (totalItems === 0) return null;

        const statusCounts = sprintItems.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<BacklogItemStatus, number>);

        const segments = (Object.keys(statusColors) as BacklogItemStatus[]).map(status => ({
            status,
            count: statusCounts[status] || 0,
            percentage: totalItems > 0 ? ((statusCounts[status] || 0) / totalItems) * 100 : 0,
            color: statusHexColors[status],
        })).filter(segment => segment.count > 0);
        
        const daysLeft = differenceInDays(parseISO(activeSprint.endDate), new Date());

        return { segments, daysLeft: Math.max(0, daysLeft) };

    }, [activeSprint, projectBacklogItems]);
    
    const projectHealth = React.useMemo(() => {
        if (!project || projectBacklogItems.length === 0) {
            return { status: 'Unknown', icon: HelpCircle, color: 'text-muted-foreground', itemsCompletedPercent: 0 };
        }

        const today = new Date();
        const startDate = parseISO(project.startDate);
        const endDate = project.endDate ? parseISO(project.endDate) : add(startDate, { months: 6 });
        
        if (isPast(endDate)) {
            return { status: 'Archived', icon: CheckCircle2, color: 'text-muted-foreground', itemsCompletedPercent: 100 };
        }

        const totalDuration = differenceInDays(endDate, startDate);
        const timeElapsed = differenceInDays(today, startDate);
        const timeElapsedPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100)) : 0;
        
        const completedItemsCount = projectBacklogItems.filter(t => t.status === 'Complete').length;
        const itemsCompletedPercent = (completedItemsCount / projectBacklogItems.length) * 100;
        
        const overdueItemsCount = projectBacklogItems.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'Complete').length;
        const overduePercent = (overdueItemsCount / projectBacklogItems.length) * 100;

        const scheduleVariance = itemsCompletedPercent - timeElapsedPercent;

        if (scheduleVariance >= -5 && overduePercent < 10) {
            return { status: 'On Track', icon: TrendingUp, color: 'text-success', itemsCompletedPercent: itemsCompletedPercent };
        } else if (scheduleVariance < -15 || overduePercent > 25) {
            return { status: 'Needs Attention', icon: TrendingDown, color: 'text-danger', itemsCompletedPercent: itemsCompletedPercent };
        } else {
            return { status: 'At Risk', icon: AlertTriangle, color: 'text-warning', itemsCompletedPercent: itemsCompletedPercent };
        }

    }, [project, projectBacklogItems]);
    
    const atRiskItems = React.useMemo(() => {
        const today = new Date();
        return projectBacklogItems.filter(item => {
            if (item.status === 'Complete' || !item.dueDate) return false;
            
            const dueDate = parseISO(item.dueDate!);
            const daysUntilDue = differenceInDays(dueDate, today);

            // Overdue or due within 3 days
            return daysUntilDue < 3;
        }).sort((a,b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime());
    }, [projectBacklogItems]);

    const timelineData = React.useMemo(() => {
    if (!project || !epics.length || !sprints.length) return { items: [], projectStartDate: new Date(), projectEndDate: new Date() };

    const epicItems = epics.map(epic => {
        const itemsInEpic = projectBacklogItems.filter(item => item.epicId === epic.id);
        const sprintIdsInEpic = [...new Set(itemsInEpic.map(item => item.sprintId).filter(Boolean))];
        const sprintsInEpic = sprints.filter(sprint => sprintIdsInEpic.includes(sprint.id));

        if (sprintsInEpic.length === 0) return null;

        const epicStartDate = new Date(Math.min(...sprintsInEpic.map(s => parseISO(s.startDate).getTime())));
        const epicEndDate = new Date(Math.max(...sprintsInEpic.map(s => parseISO(s.endDate).getTime())));
        
        const epicChildren = sprintsInEpic.map(sprint => {
            const itemsInSprint = projectBacklogItems.filter(item => item.sprintId === sprint.id && item.epicId === epic.id);
            
            const sprintIsUnstarted = sprint.status === 'Not Started';
            
            const completedItemsInSprint = itemsInSprint.filter(item => item.status === 'Complete');
            
            let sprintProgress = sprintIsUnstarted ? 0 : (itemsInSprint.length > 0 ? (completedItemsInSprint.length / itemsInSprint.length) * 100 : 0);

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
                    dueDate: item.dueDate,
                    progress: sprintIsUnstarted ? 0 : undefined,
                }))
            };
        }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        
        const totalSprintProgress = epicChildren.reduce((acc, child) => acc + child.progress, 0);
        const epicProgress = epicChildren.length > 0 ? totalSprintProgress / epicChildren.length : 0;

        return {
            id: epic.id,
            title: epic.title,
            startDate: epicStartDate,
            endDate: epicEndDate,
            type: 'epic' as const,
            progress: epicProgress,
            children: epicChildren,
            category: epic.category,
        };
    }).filter(Boolean);

    const allSprints = sprints;
    if (allSprints.length === 0) {
        return { items: [], projectStartDate: new Date(), projectEndDate: new Date() };
    }

    const projectStartDate = new Date(Math.min(...allSprints.map(s => parseISO(s.startDate).getTime())));
    const projectEndDate = new Date(Math.max(...allSprints.map(s => parseISO(s.endDate).getTime())));


    return { items: epicItems as any[], projectStartDate, projectEndDate };

}, [epics, sprints, projectBacklogItems, project]);

    const getInitials = (name: string) => {
      if (!name) return '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    const unassignedBacklogItems = projectBacklogItems.filter(item => !item.epicId);
    const unassignedAndUnscheduledBacklogItems = unassignedBacklogItems.filter(item => !item.sprintId);

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
    
    const totalItems = projectBacklogItems.length;
    const inProgressItems = columns['In Progress'].length;
    const completedItemsCount = projectBacklogItems.filter(item => item.status === 'Complete').length;
    
    const overdueItemsCount = projectBacklogItems.filter(item => 
        item.dueDate && isPast(parseISO(item.dueDate)) && item.status !== 'Complete'
    ).length;

    const inProgressPercentage = totalItems > 0 ? (inProgressItems / totalItems) * 100 : 0;
    const completedPercentage = totalItems > 0 ? (completedItemsCount / totalItems) * 100 : 0;
    const overduePercentage = totalItems > 0 ? (overdueItemsCount / totalItems) * 100 : 0;
    
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
                            value="backlog"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Backlog
                        </TabsTrigger>
                        <TabsTrigger 
                            value="board"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Board
                        </TabsTrigger>
                        <TabsTrigger 
                            value="epics"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Epics
                        </TabsTrigger>
                         <TabsTrigger 
                            value="sprints"
                            className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-4 data-[state=active]:text-foreground data-[state=active]:font-bold"
                        >
                            Waves
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
                        {(activeTab === 'backlog' || activeTab === 'epics') && unassignedAndUnscheduledBacklogItems.length > 0 && (
                             <div className="flex items-center gap-2">
                                 <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                           <Button variant="outline" size="icon" onClick={() => openAddFromCollectionDialog(projectId, collections)}><BookCopy className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add from Collection</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/dashboard/library?projectId=${projectId}`}>
                                                    <Library className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add from Library</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {activeTab === 'epics' && (
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
                                )}
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
                            </div>
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
                                        <p>New Wave</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                         )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pt-6">
                    <TabsContent value="summary">
                       <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                                        <Loader className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{inProgressItems}</p>
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
                                        <p className="text-2xl font-bold">{completedItemsCount}</p>
                                    </CardContent>
                                     <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                        <p className="text-xs text-muted-foreground">{Math.round(completedPercentage)}% of total</p>
                                        <Progress value={completedPercentage} />
                                    </CardFooter>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Items</CardTitle>
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-danger">{overdueItemsCount}</p>
                                    </CardContent>
                                    <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                        <p className="text-xs text-muted-foreground">{Math.round(overduePercentage)}% of total</p>
                                        <Progress value={overduePercentage} className="[&>div]:bg-danger" />
                                    </CardFooter>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Health</CardTitle>
                                        <HealthIcon className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className={cn("text-xl font-bold", projectHealth.color)}>{projectHealth.status}</p>
                                    </CardContent>
                                    <CardFooter className="flex-col items-start gap-1 p-4 pt-0">
                                        <p className="text-xs text-muted-foreground">{Math.round(projectHealth.itemsCompletedPercent)}% complete</p>
                                        <Progress value={projectHealth.itemsCompletedPercent} className={cn("[&>div]:bg-success", projectHealth.status === 'At Risk' && "[&>div]:bg-warning", projectHealth.status === 'Needs Attention' && "[&>div]:bg-danger")} />
                                    </CardFooter>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               <div className="col-span-1 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Velocity</CardTitle>
                                            {velocityData.length > 0 && <CardDescription>Story points completed per wave</CardDescription>}
                                        </CardHeader>
                                        <CardContent>
                                            {velocityData.length > 0 ? (
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
                                            ) : (
                                                <div className="h-[150px] flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                                                    <CircleGauge className="h-10 w-10 mb-2 text-muted-foreground" />
                                                    Complete a wave to see your team's velocity.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Burndown</CardTitle>
                                            {burndownData.length > 0 && <CardDescription>Ideal vs actual work remaining</CardDescription>}
                                        </CardHeader>
                                        <CardContent>
                                            {burndownData.length > 0 ? (
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
                                                            stroke="hsl(142 71% 45%)"
                                                            strokeWidth={2}
                                                            strokeDasharray="3 3"
                                                            dot={false}
                                                        />
                                                    </LineChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="h-[150px] flex flex-col items-center justify-center text-center text-muted-foreground text-sm p-4">
                                                <CloudDownload className="h-10 w-10 mb-2 text-muted-foreground" />
                                                Complete a wave with estimated story points to generate a burndown chart.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                               </div>
                               <div className="col-span-1 space-y-6">
                                    {activeSprintHealthData && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Active Wave Health</CardTitle>
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
                                                                    <p>{segment.status}: {segment.count} item(s) ({Math.round(segment.percentage)}%)</p>
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
                                            {epicProgressData.length === 0 ? null : <CardDescription>A summary of completion for each engagement epic</CardDescription>}
                                        </CardHeader>
                                        <CardContent>
                                            {epicProgressData.length > 0 ? (
                                                <Accordion type="multiple" className="w-full">
                                                    {epicProgressData.map((epic, index) => {
                                                        const config = tagConfig.find(c => c.iconName === epic.category) || tagConfig.find(t => t.iconName === 'Layers');
                                                        const IconComponent = config?.icon || Layers;
                                                        const color = config?.color || 'text-foreground';
                                                        return (
                                                            <AccordionItem value={epic.id} key={epic.id} className="border-none mb-2">
                                                                <AccordionTrigger className="text-base font-normal no-underline hover:no-underline p-2 -m-2 rounded-md hover:bg-muted" noChevron>
                                                                    <div className="space-y-2 w-full">
                                                                        <div className="flex justify-between items-baseline w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <IconComponent className={cn("h-4 w-4", color)} />
                                                                                <p className="text-sm font-medium">{epic.name}</p>
                                                                            </div>
                                                                            <p className="text-sm text-muted-foreground">{epic.progress}% complete</p>
                                                                        </div>
                                                                        <Progress value={epic.progress} />
                                                                    </div>
                                                                </AccordionTrigger>
                                                            </AccordionItem>
                                                        )
                                                    })}
                                                </Accordion>
                                            ) : (
                                                <div className="h-[150px] flex flex-col items-center justify-center text-center text-muted-foreground text-sm p-4">
                                                    <Loader className="h-10 w-10 mb-2 text-muted-foreground animate-spin" />
                                                    No epic progress to display. Add items with points to epics.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                               </div>
                               <div className="col-span-1 space-y-6">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>At-Risk Items</CardTitle>
                                            {atRiskItems.length === 0 ? null : <CardDescription>Items that are overdue or due within 3 days.</CardDescription>}
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {atRiskItems.length > 0 ? (
                                                atRiskItems.map(item => {
                                                    const dueDate = parseISO(item.dueDate!);
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
                                                        key={item.id} 
                                                        className="flex justify-between items-center text-sm p-2 -mx-2 rounded-md hover:bg-muted cursor-pointer"
                                                        onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <Avatar className="h-6 w-6">
                                                            <AvatarImage src={item.ownerAvatarUrl} />
                                                            <AvatarFallback className="text-xs">{getInitials(item.owner)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="font-medium truncate">
                                                                    <span className="text-muted-foreground mr-2">{projectPrefix}-{item.backlogId}</span>
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className={cn("flex items-center gap-2 text-xs font-semibold shrink-0 ml-2", statusColor)}>
                                                        <Calendar className="h-4 w-4" />
                                                            <span className="truncate">Due {format(dueDate, 'MMM dd')}</span>
                                                        </div>
                                                    </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="h-[150px] flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                                                    <AlertTriangle className="h-10 w-10 mb-2 text-muted-foreground" />
                                                    No at-risk items. Great job!
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                               </div>
                            </div>
                       </div>
                    </TabsContent>
                    <TabsContent value="board">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="flex gap-6">
                            {Object.entries(columns).map(([status, items]) => (
                                    <BoardColumn 
                                        key={status}
                                        title={status}
                                        items={items}
                                        projectPrefix={projectPrefix}
                                        onItemClick={(item) => openEditBacklogItemDialog(item, epics, sprints, contacts)}
                                    />
                            ))}
                            </div>
                        </DragDropContext>
                    </TabsContent>
                    <TabsContent value="epics">
                        <div className="space-y-6">
                            {epics.length === 0 && unassignedBacklogItems.length === 0 ? (
                                 <div className="p-10 text-center rounded-lg border-2 border-dashed border-border">
                                     <div className="flex justify-center mb-4">
                                        <Layers className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">No Epics Yet!</h3>
                                    <p className="text-muted-foreground mt-2 mb-4">
                                        Epics are large bodies of work that can be broken down into smaller stories. Get started by creating your first one.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Button onClick={() => openNewEpicDialog(projectId)}><Plus className="h-4 w-4 mr-2" /> Create Epic</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {epics.map(epic => {
                                        const config = tagConfig.find(c => c.iconName === epic.category) || tagConfig.find(t => t.iconName === 'Layers');
                                        const IconComponent = config?.icon || Layers;
                                        const color = config?.color || 'text-foreground';
                                        const itemsInEpic = projectBacklogItems.filter(item => item.epicId === epic.id);
                                        
                                        return (
                                            <Accordion type="multiple" className="w-full" key={epic.id} defaultValue={[epic.id]}>
                                                <AccordionItem value={epic.id}>
                                                    <AccordionTrigger className="text-base font-normal">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <IconComponent className={cn("h-5 w-5", color)} />
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
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'epic', id: epic.id, name: epic.title}); setIsDeleteDialogOpen(true);}} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
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
                                                                                        <IconComponent className={cn("h-4 w-4", color)} />
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
                                                                                            <span>Move to Wave</span>
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
                                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'backlogItem', id: item.id, name: item.title}); setIsDeleteDialogOpen(true);}} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </div>
                                                                )) : (
                                                                    <p className="text-sm text-muted-foreground text-center p-4">No backlog items for this epic.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        )
                                    })}
                                </>
                            )}
                       </div>
                    </TabsContent>
                    <TabsContent value="backlog">
                       <div className="space-y-6">
                            {unassignedAndUnscheduledBacklogItems.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="p-10 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="bg-primary rounded-full p-3">
                                                <Inbox className="h-8 w-8 text-primary-foreground" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold">The backlog is empty!</h3>
                                        <p className="text-muted-foreground mt-2 mb-4">
                                            This space is for user stories that haven't been assigned to an epic or wave yet.
                                        </p>
                                         <div className="flex justify-center gap-4">
                                            <Button variant="outline" onClick={() => openAddFromCollectionDialog(projectId, collections)}><BookCopy className="h-4 w-4 mr-2" /> Add from Collection</Button>
                                            <Button variant="outline" asChild>
                                                <Link href={`/dashboard/library?projectId=${projectId}`}><Library className="h-4 w-4 mr-2" /> Add from Library</Link>
                                            </Button>
                                            <Button variant="outline" onClick={() => openNewBacklogItemDialog(projectId, project.companyId, epics)}>
                                                <FilePlus className="mr-2 h-4 w-4" /> Create new item
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Unassigned Backlog Items</CardTitle>
                                        <CardDescription>Items that are not yet assigned to an epic or wave.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg">
                                            {unassignedAndUnscheduledBacklogItems.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
                                                >
                                                    <div className="flex items-center gap-3">
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
                                                                        <span>Move to Wave</span>
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
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'backlogItem', id: item.id, name: item.title}); setIsDeleteDialogOpen(true);}} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                       </div>
                    </TabsContent>
                    <TabsContent value="sprints">
                        <div className="space-y-8">
                            {(['Active', 'Not Started', 'Completed'] as SprintStatus[]).map(status => {
                                const sprintsByStatus = sprints.filter(s => s.status === status);
                                if (sprintsByStatus.length === 0 && status === 'Active') {
                                    return null;
                                }

                                return (
                                <div key={status}>
                                    {sprintsByStatus.length > 0 && <h2 className="text-lg font-semibold mb-2">{status === 'Not Started' ? 'Upcoming Waves' : `${status} Waves`}</h2>}
                                    {sprintsByStatus.length === 0 ? (
                                        status !== 'Active' && (
                                            <>
                                            <h2 className="text-lg font-semibold mb-2">{status === 'Not Started' ? 'Upcoming Waves' : `${status} Waves`}</h2>
                                            <div className="p-10 text-center rounded-lg border-2 border-dashed border-border">
                                                <div className="flex justify-center mb-4">
                                                    <div className="flex items-center justify-center h-16 w-16 text-muted-foreground">
                                                        {status === 'Not Started' ? <WavesIcon className="h-8 w-8" /> : <WavesIcon className="h-8 w-8" />}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground">{status === 'Completed' ? 'No Waves Completed Yet' : 'No Upcoming Waves'}</h3>
                                                <p className="text-muted-foreground mt-2 mb-4">
                                                    {status === 'Completed'
                                                    ? 'Completed waves and their metrics will appear here.'
                                                    : 'Plan your next cycle of work by creating a new wave.'}
                                                </p>
                                                {status !== 'Completed' && (
                                                    <Button onClick={() => openNewSprintDialog(projectId)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        New Wave
                                                    </Button>
                                                )}
                                            </div>
                                            </>
                                        )
                                    ) : (
                                        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={status === 'Active' && activeSprint ? activeSprint.id : undefined}>
                                            {sprintsByStatus.map(sprint => {
                                                const itemsInSprint = projectBacklogItems.filter(item => item.sprintId === sprint.id);
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
                                                                                <Rocket className="mr-2 h-4 w-4" /> Start Wave
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {sprint.status === 'Active' && (
                                                                            <DropdownMenuItem onSelect={() => handleCompleteSprint(sprint.id)} disabled={loading}>
                                                                                <CheckCircle className="mr-2 h-4 w-4" /> Complete Wave
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {sprint.status !== 'Completed' && (
                                                                        <DropdownMenuItem onSelect={() => openEditSprintDialog(sprint)}>
                                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'sprint', id: sprint.id, name: sprint.name}); setIsDeleteDialogOpen(true);}} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
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
                                                                    const tag = epic ? allTags.find(t => t.name === epic.category) : undefined;
                                                                    const config = tag ? (tagConfig.find(c => c.iconName === tag.icon) || tagConfig.find(t => t.iconName === 'Layers')) : tagConfig.find(t => t.iconName === 'Layers');
                                                                    const IconComponent = config?.icon || Layers;
                                                                    return (
                                                                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                                                            onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
                                                                        >
                                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                                <span className="text-foreground text-sm">{projectPrefix}-{item.backlogId}</span>
                                                                                <p className="text-sm font-medium">{item.title}</p>
                                                                                {epic && (
                                                                                    <Badge variant="secondary" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveTab('backlog')}}>
                                                                                        <IconComponent className={cn("h-3 w-3 mr-1", config?.color)} />
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
                                                                    <p className="text-sm text-muted-foreground text-center p-4">No items in this wave.</p>
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
                                    const config = epic ? (tagConfig.find(c => c.iconName === epic.category) || tagConfig.find(t => t.iconName === 'Layers')) : tagConfig.find(t => t.iconName === 'Layers');
                                    const IconComponent = config?.icon || Layers;
                                    return (
                                        <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => openEditBacklogItemDialog(item, epics, sprints, contacts)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <IconComponent className={cn("h-4 w-4", config?.color)} />
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
                                        {allWorkSearchTerm ? 'No matching items found.' : 'No items assigned to any waves.'}
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



    
