
'use client';

import * as React from 'react';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import type { Project } from '@/services/project-service';
import { ScrollArea } from './ui/scroll-area';

interface EngagementInsightsPanelProps {
    projects: Project[];
}

export function EngagementInsightsPanel({ projects }: EngagementInsightsPanelProps) {
    
    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b border-sidebar-border">
                <SheetTitle>Active Engagement Insights</SheetTitle>
                <SheetDescription className="text-sidebar-foreground/80">
                    AI-powered summary of trends, risks, and opportunities across your active engagements.
                </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
                <div className="p-6">
                    {/* Placeholder content. We will implement the AI insights generation next. */}
                    <p className="text-sidebar-foreground/60 text-center py-10">
                        Insights are being generated. This content will be replaced by an AI-powered analysis of your active projects.
                    </p>
                </div>
            </ScrollArea>
        </div>
    )
}
