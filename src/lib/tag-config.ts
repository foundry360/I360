
import { Layers, BookCopy, Database, Megaphone, HeartHandshake, BarChart3, Scaling, LucideIcon, Target, Lightbulb, FileText, Users, DollarSign, GanttChartSquare, Briefcase, Network, Rocket, TrendingUp } from 'lucide-react';

export const tagConfig = [
    { iconName: 'BookCopy', icon: BookCopy, color: 'text-blue-500' },
    { iconName: 'Database', icon: Database, color: 'text-teal-500' },
    { iconName: 'Megaphone', icon: Megaphone, color: 'text-orange-500' },
    { iconName: 'HeartHandshake', icon: HeartHandshake, color: 'text-red-500' },
    { iconName: 'BarChart3', icon: BarChart3, color: 'text-green-500' },
    { iconName: 'Scaling', icon: Scaling, color: 'text-indigo-500' },
    { iconName: 'Layers', icon: Layers, color: 'text-slate-500' },
    { iconName: 'Target', icon: Target, color: 'text-red-600' },
    { iconName: 'Lightbulb', icon: Lightbulb, color: 'text-yellow-500' },
    { iconName: 'FileText', icon: FileText, color: 'text-sky-500' },
    { iconName: 'Users', icon: Users, color: 'text-lime-600' },
    { iconName: 'DollarSign', icon: DollarSign, color: 'text-emerald-500' },
    { iconName: 'GanttChartSquare', icon: GanttChartSquare, color: 'text-violet-500' },
    { iconName: 'Briefcase', icon: Briefcase, color: 'text-purple-500' },
    { iconName: 'Network', icon: Network, color: 'text-pink-500' },
    { iconName: 'Rocket', icon: Rocket, color: 'text-rose-500' },
    { iconName: 'TrendingUp', icon: TrendingUp, color: 'text-cyan-500' },
] as const;

export type TagConfig = typeof tagConfig[number];
