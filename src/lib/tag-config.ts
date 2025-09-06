
import { Layers, BookCopy, Database, Megaphone, HeartHandshake, BarChart3, Scaling, LucideIcon } from 'lucide-react';

export const tagConfig = [
    { iconName: 'BookCopy', icon: BookCopy, color: 'text-primary' },
    { iconName: 'Database', icon: Database, color: 'text-chart-2' },
    { iconName: 'Megaphone', icon: Megaphone, color: 'text-destructive' },
    { iconName: 'HeartHandshake', icon: HeartHandshake, color: 'text-warning' },
    { iconName: 'BarChart3', icon: BarChart3, color: 'text-success' },
    { iconName: 'Scaling', icon: Scaling, color: 'text-accent' },
    { iconName: 'Layers', icon: Layers, color: 'text-foreground' },
] as const;

export type TagConfig = typeof tagConfig[number];
