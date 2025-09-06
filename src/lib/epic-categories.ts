
import { Layers, BookCopy, Database, Megaphone, HeartHandshake, BarChart3, Scaling } from 'lucide-react';

export const epicCategories = {
    "Foundation & Strategic Alignment": { icon: BookCopy, color: 'text-chart-1' },
    "RevOps Foundation & Data Infrastructure": { icon: Database, color: 'text-chart-2' },
    "Sales Process Enhancement & Pipeline Optimization": { icon: Megaphone, color: 'text-chart-3' },
    "Customer Experience & Lifecycle Management": { icon: HeartHandshake, color: 'text-chart-4' },
    "Performance Measurement & Continuous Optimization": { icon: BarChart3, color: 'text-chart-5' },
    "Advanced Capabilities & Scaling": { icon: Scaling, color: 'text-primary' },
    "Uncategorized": { icon: Layers, color: 'text-foreground' },
};

export type EpicCategory = keyof typeof epicCategories;
