
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, Search, Upload, FilePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, deleteUserStory, UserStory, bulkCreateUserStories as bulkCreateLibraryStories } from '@/services/user-story-service';
import { getEpicsForProject, Epic } from '@/services/epic-service';
import { bulkCreateBacklogItems } from '@/services/backlog-item-service';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { epicIcons } from '@/app/dashboard/projects/[projectId]/page';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as AccordionPrimitive from "@radix-ui/react-accordion"


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


export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [stories, setStories] = React.useState<StoryWithDateAsString[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStories, setSelectedStories] = React.useState<string[]>([]);
  const [epics, setEpics] = React.useState<Epic[]>([]);
  const [targetEpicId, setTargetEpicId] = React.useState<string>('');

  const { openNewUserStoryDialog, setOnUserStoryCreated } = useQuickAction();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadResultDialogOpen, setIsUploadResultDialogOpen] = React.useState(false);
  const [uploadStats, setUploadStats] = React.useState<{ importedCount: number, skippedCount: number } | null>(null);

  const fetchLibraryData = React.useCallback(async () => {
    try {
      setLoading(true);
      const storiesFromDb = await getUserStories();
      setStories(storiesFromDb);
      
      if (projectId) {
        const projectEpics = await getEpicsForProject(projectId);
        setEpics(projectEpics);
        if (projectEpics.length > 0) {
          setTargetEpicId(projectEpics[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch library data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchLibraryData();
    const unsubscribe = setOnUserStoryCreated(fetchLibraryData);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchLibraryData, setOnUserStoryCreated]);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserStory(id);
      fetchLibraryData();
    } catch (error) {
      console.error('Failed to delete user story:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleAddToBacklog = async () => {
    if (!projectId || !targetEpicId || selectedStories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select an epic and at least one user story to add.',
      });
      return;
    }
    
    try {
        setLoading(true);
        const storiesToAdd = stories.filter(story => selectedStories.includes(story.id));
        await bulkCreateBacklogItems(projectId, targetEpicId, storiesToAdd);
        toast({
            title: 'Success!',
            description: `${storiesToAdd.length} user stor${storiesToAdd.length > 1 ? 'ies' : 'y'} added to the engagement backlog.`,
        });
        router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
        console.error("Error adding stories to backlog:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem adding the stories to the engagement.",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.toLowerCase().trim(),
      complete: async (results) => {
        try {
          const storiesToCreate = results.data.map((row: any) => ({
            title: row.title || '',
            story: row.story || '',
            acceptanceCriteria: (row['acceptance criteria'] || '').split('\n').filter(Boolean),
            tags: (row.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
            points: Number(row.points) || 0,
          })).filter(story => story.title);
          
          if (storiesToCreate.length === 0) {
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: 'CSV file is empty or does not have a "title" column.',
            });
            return;
          }

          const { importedCount, skippedCount } = await bulkCreateLibraryStories(storiesToCreate);
          setUploadStats({ importedCount, skippedCount });
          setIsUploadResultDialogOpen(true);
          fetchLibraryData();
        } catch (error) {
          console.error("Failed to upload stories:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was a problem importing your user stories.",
          });
        } finally {
          // Reset file input
          if(fileInputRef.current) {
              fileInputRef.current.value = "";
          }
        }
      },
      error: (error: any) => {
         console.error("CSV Parsing Error:", error);
          toast({
            variant: "destructive",
            title: "Parsing Failed",
            description: "Could not parse the CSV file. Please check its format.",
          });
      }
    });
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
  
  const handleSelectStory = (storyId: string) => {
    setSelectedStories(prev => 
        prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]
    );
  };
  
  const handleSelectAllForTag = (tag: string, isSelected: boolean) => {
    const storyIdsInTag = storiesByTag[tag].map(s => s.id);
    if (isSelected) {
      setSelectedStories(prev => [...new Set([...prev, ...storyIdsInTag])]);
    } else {
      setSelectedStories(prev => prev.filter(id => !storyIdsInTag.includes(id)));
    }
  };


  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Story Library</h1>
          <p className="text-muted-foreground">
            {projectId 
                ? "Select stories to add to your engagement's backlog."
                : "Browse and manage reusable user stories for your projects."
            }
          </p>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            {projectId && (
                <>
                 <Select value={targetEpicId} onValueChange={setTargetEpicId}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select an Epic to add to" />
                    </SelectTrigger>
                    <SelectContent>
                      {epics.map(epic => (
                        <SelectItem key={epic.id} value={epic.id}>{epic.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddToBacklog} disabled={selectedStories.length === 0 || loading}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Add to Engagement ({selectedStories.length})
                  </Button>
                </>
            )}
            <Button variant="outline" size="icon" onClick={handleUploadClick}>
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload CSV</span>
            </Button>
            <Button size="icon" onClick={openNewUserStoryDialog}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">New User Story</span>
            </Button>
          </div>
        </div>
        <div className="border rounded-lg p-2">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Accordion type="multiple" className="w-full" defaultValue={allTags}>
              {allTags.length > 0 ? (
                allTags.map(tag => {
                  const { icon: Icon, color } = getIconForTag(tag);
                  const storyIdsInTag = storiesByTag[tag].map(s => s.id);
                  const allInTagSelected = storyIdsInTag.every(id => selectedStories.includes(id));

                  return (
                    <AccordionItem value={tag} key={tag}>
                        <AccordionPrimitive.Header className="flex items-center">
                            {projectId && (
                                <Checkbox
                                    id={`select-all-${tag}`}
                                    checked={allInTagSelected}
                                    onCheckedChange={(checked) => handleSelectAllForTag(tag, checked as boolean)}
                                    className="mr-2 ml-4"
                                />
                            )}
                            <AccordionTrigger className={cn(!projectId && "ml-4")}>
                                <div className="flex items-center gap-2 flex-1">
                                    <Icon className={cn("h-5 w-5", color)} />
                                    <h3 className="text-base font-semibold">{tag}</h3>
                                    <Badge variant="secondary">{storiesByTag[tag].length}</Badge>
                                </div>
                            </AccordionTrigger>
                        </AccordionPrimitive.Header>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {storiesByTag[tag].map(story => (
                            <div key={story.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted">
                              <div className="flex-1 flex items-center gap-3">
                                  {projectId && (
                                    <Checkbox
                                        id={story.id}
                                        checked={selectedStories.includes(story.id)}
                                        onCheckedChange={() => handleSelectStory(story.id)}
                                    />
                                  )}
                                  <Icon className={cn("h-4 w-4", color)} />
                                  <div>
                                        <p className="font-medium text-sm">{story.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{story.story}</p>
                                    </div>
                                </div>
                              <div className="flex items-center gap-4 ml-4">
                                  <Badge variant="outline">{story.points || 0} Points</Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View/Edit</DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(story.id)}
                                        className="text-destructive focus:text-destructive-foreground"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
        </div>
      </div>
      <AlertDialog open={isUploadResultDialogOpen} onOpenChange={setIsUploadResultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Your CSV file has been processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p><strong>Successfully Imported:</strong> {uploadStats?.importedCount || 0} user stories.</p>
            <p><strong>Duplicates Skipped:</strong> {uploadStats?.skippedCount || 0} user stories.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsUploadResultDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
