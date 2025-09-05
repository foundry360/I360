
'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, UserStory } from '@/services/user-story-service';
import { bulkCreateBacklogItems } from '@/services/backlog-item-service';
import { Epic } from '@/services/epic-service';
import { Search, Library, Layers } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { epicIcons } from '@/app/dashboard/projects/[projectId]/page';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';


type StoryWithDateAsString = Omit<UserStory, 'createdAt'> & { createdAt: string };

const getIconForTag = (tag: string) => {
    const lowerCaseTag = tag.toLowerCase();
    if (lowerCaseTag.includes('foundation') || lowerCaseTag.includes('strategy')) {
      return epicIcons['Foundation & Strategic Alignment'];
    }
    if (lowerCaseTag.includes('data') || lowerCaseTag.includes('revops')) {
      return epicIcons['RevOps Foundation & Data Infrastructure'];
    }
    if (lowerCaseTag.includes('sales') || lowerCaseTag.includes('pipeline')) {
      return epicIcons['Sales Process Enhancement & Pipeline Optimization'];
    }
    if (lowerCaseTag.includes('customer') || lowerCaseTag.includes('cx')) {
      return epicIcons['Customer Experience & Lifecycle Management'];
    }
    if (lowerCaseTag.includes('performance') || lowerCaseTag.includes('optimization')) {
      return epicIcons['Performance Measurement & Continuous Optimization'];
    }
    if (lowerCaseTag.includes('scaling') || lowerCaseTag.includes('advanced')) {
      return epicIcons['Advanced Capabilities & Scaling'];
    }
    return { icon: Layers, color: 'text-foreground' };
}


export function AddFromLibraryDialog() {
  const {
    isAddFromLibraryDialogOpen,
    closeAddFromLibraryDialog,
    onAddFromLibrary,
    addFromLibraryData,
  } = useQuickAction();
  
  const [stories, setStories] = React.useState<StoryWithDateAsString[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStories, setSelectedStories] = React.useState<Set<string>>(new Set());
  const [targetEpicId, setTargetEpicId] = React.useState<string>('');


  React.useEffect(() => {
    const fetchStories = async () => {
        setLoading(true);
        const storiesFromDb = await getUserStories();
        setStories(storiesFromDb);
        setLoading(false);
    };

    if (isAddFromLibraryDialogOpen) {
      fetchStories();
    }
  }, [isAddFromLibraryDialogOpen]);

  const handleSelectStory = (storyId: string) => {
    setSelectedStories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
            newSet.delete(storyId);
        } else {
            newSet.add(storyId);
        }
        return newSet;
    })
  };

  const handleCreateItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEpicId || selectedStories.size === 0 || !addFromLibraryData) return;

    try {
        const storiesToAdd = stories.filter(story => selectedStories.has(story.id));
        await bulkCreateBacklogItems(addFromLibraryData.projectId, targetEpicId, storiesToAdd);
        handleOpenChange(false);
        if (onAddFromLibrary) {
            onAddFromLibrary();
        }
    } catch (error) {
      console.error('Failed to create backlog items from library:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedStories(new Set());
      setTargetEpicId('');
      closeAddFromLibraryDialog();
    }
  };

  const storiesByTag = React.useMemo(() => {
    const filtered = stories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const grouped: Record<string, StoryWithDateAsString[]> = {};
    filtered.forEach(story => {
      if (story.tags.length === 0) {
        if (!grouped['Uncategorized']) {
          grouped['Uncategorized'] = [];
        }
        grouped['Uncategorized'].push(story);
      } else {
        story.tags.forEach(tag => {
          if (!grouped[tag]) {
            grouped[tag] = [];
          }
          grouped[tag].push(story);
        });
      }
    });
    return grouped;
  }, [stories, searchTerm]);
  
  const allTags = Object.keys(storiesByTag).sort();
  
  return (
    <Dialog open={isAddFromLibraryDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[800px] h-[90vh] flex flex-col p-0">
        <form onSubmit={handleCreateItems} className="flex flex-col h-full">
          <DialogHeader className="p-6">
            <DialogTitle>Add from User Story Library</DialogTitle>
            <DialogDescription>
              Select user stories to add as new backlog items to your engagement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 pb-4">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="epicId" className="text-right">Add to Epic</Label>
                 <Select onValueChange={setTargetEpicId} value={targetEpicId} required>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an epic" />
                    </SelectTrigger>
                    <SelectContent>
                        {addFromLibraryData?.epics.map((epic) => (
                            <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <ScrollArea className="flex-1 px-6">
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <Accordion type="multiple" className="w-full" defaultValue={allTags}>
                {allTags.length > 0 ? (
                    allTags.map(tag => {
                    const { icon: Icon, color } = getIconForTag(tag);
                    return (
                        <AccordionItem value={tag} key={tag}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2 flex-1">
                            <Icon className={cn("h-5 w-5", color)} />
                            <h3 className="text-base font-semibold">{tag}</h3>
                            <Badge variant="secondary">{storiesByTag[tag].length}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 pl-4">
                            {storiesByTag[tag].map(story => (
                                <div 
                                    key={story.id} 
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer"
                                    onClick={() => handleSelectStory(story.id)}
                                >
                                <div className="flex-1 flex items-center gap-3">
                                    <Checkbox 
                                        id={`story-${story.id}`}
                                        checked={selectedStories.has(story.id)}
                                        onCheckedChange={() => handleSelectStory(story.id)}
                                    />
                                    <Icon className={cn("h-4 w-4", color)} />
                                    <div>
                                        <p className="font-medium text-sm">{story.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{story.story}</p>
                                    </div>
                                    </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <Badge variant="outline">{story.points || 0} Points</Badge>
                                </div>
                                </div>
                            ))}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    )
                    })
                ) : (
                    <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    No user stories found.
                    </div>
                )}
                </Accordion>
            )}
          </ScrollArea>
          <DialogFooter className="pt-4 p-6 border-t mt-auto">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedStories.size === 0 || !targetEpicId}>
                Add {selectedStories.size > 0 ? `(${selectedStories.size})` : ''} Selected
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
