
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, Search, Upload, FilePlus, Layers } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, deleteUserStory, UserStory, bulkCreateUserStories as bulkCreateLibraryStories, getUniqueTags } from '@/services/user-story-service';
import { bulkCreateBacklogItems } from '@/services/backlog-item-service';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { epicCategories } from '@/lib/epic-categories';


type StoryWithDateAsString = Omit<UserStory, 'createdAt'> & { createdAt: string };


export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [stories, setStories] = React.useState<StoryWithDateAsString[]>([]);
  const [allTags, setAllTags] = React.useState<string[]>([]);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStories, setSelectedStories] = React.useState<string[]>([]);
  
  const { openNewUserStoryDialog, setOnUserStoryCreated } = useQuickAction();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadResultDialogOpen, setIsUploadResultDialogOpen] = React.useState(false);
  const [uploadStats, setUploadStats] = React.useState<{ importedCount: number, skippedCount: number } | null>(null);

  const fetchLibraryData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [storiesFromDb, tagsFromDb] = await Promise.all([
        getUserStories(),
        getUniqueTags()
      ]);
      setStories(storiesFromDb);
      // Ensure "Uncategorized" is an option if there are stories without tags.
      const hasUncategorized = storiesFromDb.some(s => s.tags.length === 0);
      const uniqueTags = ['All', ...tagsFromDb];
      if(hasUncategorized && !uniqueTags.includes('Uncategorized')) {
        uniqueTags.push('Uncategorized');
      }
      setAllTags(uniqueTags);
      setSelectedTag('All');
    } catch (error) {
      console.error('Failed to fetch library data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (!projectId || selectedStories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select at least one user story to add.',
      });
      return;
    }
    
    try {
        setLoading(true);
        const storiesToAdd = stories.filter(story => selectedStories.includes(story.id));
        await bulkCreateBacklogItems(projectId, null, storiesToAdd);
        toast({
            title: 'Success!',
            description: `${storiesToAdd.length} user stor${storiesToAdd.length > 1 ? 'ies' : 'y'} added to the project backlog.`,
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

  const filteredStories = React.useMemo(() => {
    return stories.filter(story => {
      let tagMatch = false;
      if (selectedTag === 'All') {
        tagMatch = true;
      } else if (selectedTag === 'Uncategorized') {
        tagMatch = story.tags.length === 0;
      } else {
        tagMatch = story.tags.includes(selectedTag!);
      }

      const searchMatch = 
          story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return tagMatch && searchMatch;
    });
  }, [stories, selectedTag, searchTerm]);

  const handleSelectStory = (storyId: string) => {
    setSelectedStories(prev => 
        prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]
    );
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
      <div className="flex flex-col h-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Story Library</h1>
          <p className="text-muted-foreground">
            {projectId 
                ? "Select stories to add to your project's backlog."
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
                  <Button onClick={handleAddToBacklog} disabled={selectedStories.length === 0 || loading}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Add to Backlog ({selectedStories.length})
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
        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          <div className="col-span-3">
             <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-22rem)]">
                        <div className="space-y-1 pr-4">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                            ) : (
                                allTags.map(tag => {
                                    const categoryConfig = epicCategories[tag as keyof typeof epicCategories] || epicCategories['Uncategorized'];
                                    const Icon = categoryConfig.icon;
                                    return (
                                        <Button 
                                            key={tag} 
                                            variant="ghost" 
                                            className={cn(
                                                "w-full justify-start",
                                                selectedTag === tag && "bg-muted font-bold"
                                            )}
                                            onClick={() => setSelectedTag(tag)}
                                        >
                                          <Icon className={cn("h-4 w-4 mr-2", tag !== 'All' && categoryConfig.color)} />
                                          {tag}
                                        </Button>
                                    )
                                })
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
             </Card>
          </div>
          <div className="col-span-9">
            <ScrollArea className="h-[calc(100vh-18rem)]">
                <div className="pr-4 space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                           <Card key={i}>
                                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
                           </Card>
                        ))
                    ) : filteredStories.length > 0 ? (
                        filteredStories.map(story => {
                           const primaryTag = story.tags[0] as keyof typeof epicCategories;
                           const categoryConfig = epicCategories[primaryTag] || epicCategories['Uncategorized'];
                           const Icon = categoryConfig.icon;
                           return (
                           <Card key={story.id} className="flex">
                             {projectId && (
                                <div className="p-4 flex items-center justify-center border-r">
                                    <Checkbox
                                        id={`select-${story.id}`}
                                        checked={selectedStories.includes(story.id)}
                                        onCheckedChange={() => handleSelectStory(story.id)}
                                    />
                                </div>
                             )}
                             <div className="flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="flex items-center gap-2">
                                            <Icon className={cn("h-4 w-4", categoryConfig.color)} />
                                            {story.title}
                                        </CardTitle>
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
                                    <div className="flex items-center gap-2 pt-1">
                                        {story.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                        <Badge variant="outline">{story.points || 0} Points</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <p className="text-sm text-muted-foreground">{story.story}</p>
                                </CardContent>
                             </div>
                           </Card>
                           )
                        })
                    ) : (
                         <div className="h-64 text-center flex items-center justify-center text-muted-foreground">
                            No user stories found.
                        </div>
                    )}
                </div>
            </ScrollArea>
          </div>
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
