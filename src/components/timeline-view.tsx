
'use client';

import * as React from 'react';
import { addMonths, differenceInDays, differenceInMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { epicIcons } from '@/app/dashboard/projects/[projectId]/page';
import { Layers, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import type { TaskStatus } from '@/services/task-service';
import { Badge } from './ui/badge';

interface TimelineItem {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: 'epic' | 'sprint' | 'item';
    status?: TaskStatus;
    progress?: number;
    children?: TimelineItem[];
    dueDate?: string | null;
}

interface TimelineViewProps {
    items: TimelineItem[];
    projectStartDate: Date;
    projectEndDate: Date;
}

const statusToProgress: Record<TaskStatus, number> = {
    'To Do': 0,
    'In Progress': 25,
    'In Review': 50,
    'Needs Revisions': 65,
    'Final Approval': 80,
    'Complete': 100,
};

const statusColors: Record<TaskStatus, string> = {
    'To Do': 'bg-muted-foreground/20 text-muted-foreground',
    'In Progress': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    'In Review': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    'Needs Revisions': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    'Final Approval': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    'Complete': 'bg-green-500/20 text-green-600 dark:text-green-400',
};


const getMonthHeaders = (startDate: Date, endDate: Date) => {
    const months = [];
    let currentDate = startOfMonth(startDate);
    const finalDate = endOfMonth(endDate);

    while (currentDate <= finalDate) {
        months.push({
            name: format(currentDate, 'MMM yyyy'),
            days: differenceInDays(endOfMonth(currentDate), startOfMonth(currentDate)) + 1
        });
        currentDate = addMonths(currentDate, 1);
    }
    return months;
};

export const TimelineView: React.FC<TimelineViewProps> = ({ items, projectStartDate, projectEndDate }) => {
    if (items.length === 0 || !projectStartDate || !projectEndDate || isNaN(projectStartDate.getTime()) || isNaN(projectEndDate.getTime())) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No sprints planned yet. Add items to sprints to see the timeline.
            </div>
        );
    }

    const monthHeaders = getMonthHeaders(projectStartDate, projectEndDate);
    const totalDays = differenceInDays(endOfMonth(projectEndDate), startOfMonth(projectStartDate)) + 1;
    const today = new Date();

    const getBarPosition = (itemStartDate: Date) => {
        const offset = differenceInDays(itemStartDate, startOfMonth(projectStartDate));
        return (offset / totalDays) * 100;
    };

    const getBarWidth = (itemStartDate: Date, itemEndDate: Date) => {
        const duration = differenceInDays(itemEndDate, itemStartDate) + 1;
        return (duration / totalDays) * 100;
    };
    
    const todayPosition = getBarPosition(today);

    const renderItemRow = (item: TimelineItem, level: number) => {
        const epicConfig = epicIcons[item.title] || { icon: Layers, color: 'text-foreground' };
        const IconComponent = epicConfig.icon;
        const progress = item.progress ?? (item.status ? statusToProgress[item.status] : 0);

        return (
            <React.Fragment key={item.id}>
                <div className="grid grid-cols-[300px_120px_120px_1fr] border-b border-border/50">
                    {/* Work Item Column */}
                    <div
                        className={cn(
                            "py-2 px-2 border-r border-border/50 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2",
                            item.type === 'epic' && 'font-semibold',
                            item.type === 'sprint' && 'text-sm font-medium',
                            item.type === 'item' && 'text-xs text-muted-foreground'
                        )}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                    >
                         {item.type === 'epic' && <IconComponent className={cn("h-4 w-4 shrink-0", epicConfig.color)} />}
                         {item.type === 'item' && <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                        {item.title}
                    </div>

                    {/* Status Column */}
                    <div className="py-2 px-2 border-r border-border/50 flex items-center">
                        {item.type === 'item' && item.status && (
                             <Badge variant="outline" className={cn("text-xs", statusColors[item.status])}>
                                {item.status}
                             </Badge>
                        )}
                    </div>
                    
                    {/* Due Date Column */}
                    <div className="py-2 px-2 border-r border-border/50 flex items-center text-xs text-muted-foreground">
                        {item.type === 'item' && item.dueDate && format(parseISO(item.dueDate), 'MMM dd, yyyy')}
                    </div>

                    {/* Timeline Bar Column */}
                    <div className="relative py-2 px-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "h-6 rounded cursor-pointer relative bg-muted",
                                        )}
                                        style={{
                                            position: 'absolute',
                                            left: `${getBarPosition(item.startDate)}%`,
                                            width: `${getBarWidth(item.startDate, item.endDate)}%`,
                                        }}
                                    >
                                      <div className="relative h-full w-full">
                                          <Progress 
                                            value={progress} 
                                            className={cn(
                                                "h-full w-full bg-transparent",
                                                item.type === 'epic' && 'bg-[hsl(240,2%,12%)]'
                                            )}
                                            indicatorClassName={
                                                cn({
                                                    'bg-[hsl(126,68%,40%)]': item.type === 'epic',
                                                    'bg-[hsl(38,92%,55%)]': item.type === 'sprint'
                                                })
                                            }
                                          />
                                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary-foreground mix-blend-difference">
                                              {Math.round(progress)}%
                                          </span>
                                      </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{item.title}</p>
                                    <p>{format(item.startDate, 'MMM d, yyyy')} - {format(item.endDate, 'MMM d, yyyy')}</p>
                                    <p>Progress: {Math.round(progress)}%</p>
                                    {item.type === 'item' && item.status && <p>Status: {item.status}</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                {item.children && item.children.map(child => renderItemRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="w-full overflow-x-auto border rounded-lg bg-card">
            <div className="min-w-max">
                {/* Header */}
                <div className="grid grid-cols-[300px_120px_120px_1fr] sticky top-0 bg-muted z-10 border-b">
                    <div className="p-2 font-semibold border-r">Work Item</div>
                    <div className="p-2 font-semibold border-r">Status</div>
                    <div className="p-2 font-semibold border-r">Due Date</div>
                    <div className="relative flex">
                        {monthHeaders.map((month, index) => {
                             const monthWidth = (month.days / totalDays) * 100;
                             return (
                                <div key={index} className="p-2 font-semibold text-center border-r" style={{ width: `${monthWidth}%` }}>
                                    {month.name}
                                </div>
                             )
                        })}
                    </div>
                </div>

                {/* Body */}
                 <div className="relative">
                    {/* Grid lines */}
                    <div className="absolute top-0 left-0 h-full w-full grid grid-cols-[300px_120px_120px_1fr]">
                        <div className="border-r border-border/50"></div>
                        <div className="border-r border-border/50"></div>
                        <div className="border-r border-border/50"></div>
                        <div className="relative flex">
                            {monthHeaders.map((month, index) => {
                                 const monthWidth = (month.days / totalDays) * 100;
                                return (
                                    <div key={index} className="border-r" style={{ width: `${monthWidth}%`}}></div>
                                )
                            })}
                        </div>
                    </div>
                    
                    {/* Today line */}
                    {today >= startOfMonth(projectStartDate) && today <= endOfMonth(projectEndDate) && (
                         <div
                            className="absolute top-0 h-full border-l-2 border-destructive"
                            style={{ left: `calc(300px + 120px + 120px + ${todayPosition}%)` }}
                        >
                             <div className="absolute -top-5 -left-2.5 text-xs font-semibold text-destructive">Today</div>
                        </div>
                    )}
                   
                    <div className="relative">
                        {items.map(item => renderItemRow(item, 0))}
                    </div>
                </div>
            </div>
        </div>
    );
};
