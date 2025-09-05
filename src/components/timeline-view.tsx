
'use client';

import * as React from 'react';
import { addMonths, differenceInDays, differenceInMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { epicIcons } from '@/app/dashboard/projects/[projectId]/page';
import { Layers, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import type { TaskStatus } from '@/services/task-service';

interface TimelineItem {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: 'epic' | 'sprint' | 'item';
    status?: TaskStatus;
    children?: TimelineItem[];
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
    if (items.length === 0 || !projectStartDate || !projectEndDate) {
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
        const progress = item.status ? statusToProgress[item.status] : 0;

        return (
            <React.Fragment key={item.id}>
                <div className="grid grid-cols-[300px_1fr] border-b border-border/50">
                    {/* Left Column: Title */}
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

                    {/* Right Column: Bar */}
                    <div className="relative py-2 px-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "h-6 rounded cursor-pointer relative",
                                            item.type === 'item' && 'bg-muted'
                                        )}
                                        style={{
                                            position: 'absolute',
                                            left: `${getBarPosition(item.startDate)}%`,
                                            width: `${getBarWidth(item.startDate, item.endDate)}%`,
                                            backgroundColor: item.type === 'epic' ? 'hsl(160, 55%, 52%)' : item.type === 'sprint' ? 'hsl(38, 92%, 55%)' : undefined
                                        }}
                                    >
                                      {item.type === 'item' && (
                                        <div className="relative h-full w-full">
                                            <Progress value={progress} className="h-full w-full bg-transparent" />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary-foreground mix-blend-difference">
                                                {progress}%
                                            </span>
                                        </div>
                                      )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{item.title}</p>
                                    <p>{format(item.startDate, 'MMM d, yyyy')} - {format(item.endDate, 'MMM d, yyyy')}</p>
                                    {item.type === 'item' && item.status && <p>Status: {item.status} ({progress}%)</p>}
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
                <div className="grid grid-cols-[300px_1fr] sticky top-0 bg-muted z-10 border-b">
                    <div className="p-2 font-semibold border-r">Work Item</div>
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
                    <div className="absolute top-0 left-0 h-full w-full grid grid-cols-[300px_1fr]">
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
                            style={{ left: `calc(300px + ${todayPosition}%)` }}
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
