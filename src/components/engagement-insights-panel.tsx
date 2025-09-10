
'use client';

import * as React from 'react';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import type { Project } from '@/services/project-service';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Epic } from '@/services/epic-service';
import type { Sprint } from '@/services/sprint-service';
import type { BacklogItem } from '@/services/backlog-item-service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface EngagementInsightsPanelProps {
    project: Project | null;
    epics: Epic[];
    sprints: Sprint[];
    backlogItems: BacklogItem[];
}

export function EngagementInsightsPanel({ project, epics, sprints, backlogItems }: EngagementInsightsPanelProps) {
    if (!project) {
        return (
             <div className="flex flex-col h-full">
                <SheetHeader className="p-6 border-b border-sidebar-border">
                    <SheetTitle className="text-sidebar-foreground">Engagement Insights</SheetTitle>
                </SheetHeader>
                <div className="p-6">
                    <p className="text-sidebar-foreground/60 text-center py-10">No engagement data available.</p>
                </div>
            </div>
        );
    }
    
    const summaryStats = {
        totalEpics: epics.length,
        totalSprints: sprints.length,
        totalBacklogItems: backlogItems.length,
        completedItems: backlogItems.filter(item => item.status === 'Complete').length,
    };
    
    const projectPrefix = project.name.substring(0, project.name.indexOf('-')) || project.name.substring(0, 4).toUpperCase();

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b border-sidebar-border">
                <SheetTitle className="text-sidebar-foreground">Insights for: {project.name}</SheetTitle>
                <SheetDescription className="text-sidebar-foreground/80">
                   A complete overview of your engagement in a single glance.
                </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Engagement Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-sidebar-foreground/80">Total Epics:</span>
                                    <span className="font-bold">{summaryStats.totalEpics}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-sidebar-foreground/80">Total Waves:</span>
                                    <span className="font-bold">{summaryStats.totalSprints}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sidebar-foreground/80">Total Items:</span>
                                    <span className="font-bold">{summaryStats.totalBacklogItems}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-sidebar-foreground/80">Completed Items:</span>
                                    <span className="font-bold">{summaryStats.completedItems}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Epics</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-3">
                                {epics.map(epic => (
                                    <div key={epic.id} className="p-3 rounded-md bg-sidebar-background border border-sidebar-divider">
                                        <p className="font-semibold text-sm">{epic.title}</p>
                                        <p className="text-xs text-sidebar-foreground/60 line-clamp-2">{epic.description}</p>
                                    </div>
                                ))}
                                {epics.length === 0 && <p className="text-xs text-sidebar-foreground/60 text-center">No epics found.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Waves</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sprints.map(sprint => (
                                     <div key={sprint.id} className="p-3 rounded-md bg-sidebar-background border border-sidebar-divider">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-sm">{sprint.name}</p>
                                            <Badge variant="secondary" className="text-xs">{sprint.status}</Badge>
                                        </div>
                                        <p className="text-xs text-sidebar-foreground/60">{sprint.goal}</p>
                                    </div>
                                ))}
                                {sprints.length === 0 && <p className="text-xs text-sidebar-foreground/60 text-center">No waves found.</p>}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Backlog Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {backlogItems.map(item => (
                                     <div key={item.id} className="p-2 rounded-md bg-sidebar-background border border-sidebar-divider">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium flex-1 pr-2">
                                                <span className="text-sidebar-foreground/50 mr-2">{projectPrefix}-{item.backlogId}</span>
                                                {item.title}
                                            </p>
                                            <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {backlogItems.length === 0 && <p className="text-xs text-sidebar-foreground/60 text-center">No backlog items found.</p>}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </ScrollArea>
        </div>
    )
}
