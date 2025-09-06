
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProjects, Project } from '@/services/project-service';
import { getAssessments, Assessment } from '@/services/assessment-service';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, ClipboardList, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

type StarredItem = (Project | Assessment) & { itemType: 'Engagement' | 'Assessment' };

export function StarredItemsDialog() {
  const { isStarredItemsDialogOpen, closeStarredItemsDialog } = useQuickAction();
  const [items, setItems] = React.useState<StarredItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (isStarredItemsDialogOpen) {
      const fetchStarredItems = async () => {
        setLoading(true);
        const [projects, assessments] = await Promise.all([getProjects(), getAssessments()]);
        
        const starredProjects = projects
            .filter(p => p.isStarred)
            .map(p => ({ ...p, itemType: 'Engagement' as const }));
            
        const starredAssessments = assessments
            .filter(a => a.isStarred)
            .map(a => ({ ...a, itemType: 'Assessment' as const }));

        setItems([...starredProjects, ...starredAssessments].sort((a,b) => a.name.localeCompare(b.name)));
        setLoading(false);
      };
      fetchStarredItems();
    }
  }, [isStarredItemsDialogOpen]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleItemClick = (item: StarredItem) => {
    closeStarredItemsDialog();
    if (item.itemType === 'Engagement') {
      router.push(`/dashboard/projects/${item.id}`);
    } else {
      router.push(`/dashboard/assessments`);
    }
  };

  return (
    <Dialog open={isStarredItemsDialogOpen} onOpenChange={closeStarredItemsDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Starred Items</DialogTitle>
          <DialogDescription>
            Quickly access your starred engagements and assessments.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search starred items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <ScrollArea className="h-72">
            <div className="space-y-2 pr-4">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <div 
                            key={`${item.itemType}-${item.id}`} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => handleItemClick(item)}
                        >
                            {item.itemType === 'Engagement' ? 
                                <FolderKanban className="h-5 w-5 text-primary" /> : 
                                <ClipboardList className="h-5 w-5 text-primary" />
                            }
                            <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.itemType}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No starred items found.</p>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
