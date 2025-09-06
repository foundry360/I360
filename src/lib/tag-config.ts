
import { Layers, BookCopy, Database, Megaphone, HeartHandshake, BarChart3, Scaling, LucideIcon } from 'lucide-react';

export const tagConfig = [
    { iconName: 'BookCopy', icon: BookCopy, color: 'text-chart-1' },
    { iconName: 'Database', icon: Database, color: 'text-chart-2' },
    { iconName: 'Megaphone', icon: Megaphone, color: 'text-chart-3' },
    { iconName: 'HeartHandshake', icon: HeartHandshake, color: 'text-chart-4' },
    { iconName: 'BarChart3', icon: BarChart3, color: 'text-chart-5' },
    { iconName: 'Scaling', icon: Scaling, color: 'text-primary' },
    { iconName: 'Layers', icon: Layers, color: 'text-foreground' },
] as const;

export type TagConfig = typeof tagConfig[number];
