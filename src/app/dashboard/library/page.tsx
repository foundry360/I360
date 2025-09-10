

'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, Search, Upload, FilePlus, Layers, Library, Pencil, BookCopy, ChevronsUpDown, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, deleteUserStory, UserStory, bulkCreateUserStories as bulkCreateLibraryStories, getTags, Tag, deleteUserStories } from '@/services/user-story-service';
import { bulkCreateBacklogItems } from '@/services/backlog-item-service';
import { getCollections, addStoriesToCollection, type StoryCollection } from '@/services/collection-service';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { tagConfig } from '@/lib/tag-config';
import { ManageTagsDialog } from '@/components/manage-tags-dialog';
import { ManageCollectionsDialog } from '@/components/manage-collections-dialog';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type StoryWithDateAsString = Omit<UserStory, 'createdAt'> & { createdAt: string };


export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [stories, setStories] = React.useState<StoryWithDateAsString[]>([]);
  const [allTags, setAllTags] = React.useState<(Tag | {id: string, name: string, icon: any})[]>([]);
  const [collections, setCollections] = React.useState<StoryCollection[]>([]);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStories, setSelectedStories] = React.useState<string[]>([]);
  const [isManageTagsOpen, setIsManageTagsOpen] = React.useState(false);
  const [isManageCollectionsOpen, setIsManageCollectionsOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  const { openNewUserStoryDialog, setOnUserStoryCreated, openEditUserStoryDialog, setOnUserStoryUpdated, openManageCollectionsDialog, isManageCollectionsDialogOpen, closeManageCollectionsDialog, onCollectionsUpdated, setOnCollectionsUpdated } = useQuickAction();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadResultDialogOpen, setIsUploadResultDialogOpen] = React.useState(false);
  const [uploadStats, setUploadStats] = React.useState<{ importedCount: number, skippedCount: number } | null>(null);

  const fetchLibraryData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [storiesFromDb, tagsFromDb, collectionsFromDb] = await Promise.all([
        getUserStories(),
        getTags(),
        getCollections(),
      ]);
      setStories(storiesFromDb);
      setCollections(collectionsFromDb);

      const hasUncategorized = storiesFromDb.some(s => s.tags.length === 0);
      let tagsWithOptions: (Tag | {id: string, name: string, icon: any})[] = [{id: 'All', name: 'All', icon: 'Library'}, ...tagsFromDb];
      
      if(hasUncategorized) {
        tagsWithOptions.push({id: 'Uncategorized', name: 'Uncategorized', icon: 'Layers'});
      }
      setAllTags(tagsWithOptions);
      setSelectedTag(prev => {
        const tagExists = tagsWithOptions.some(t => t.name === prev);
        return prev && tagExists ? prev : 'All';
      });

    } catch (error) {
      console.error('Failed to fetch library data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLibraryData();
    const unsubscribeCreated = setOnUserStoryCreated(fetchLibraryData);
    const unsubscribeUpdated = setOnUserStoryUpdated(fetchLibraryData);
    const unsubscribeCollections = setOnCollectionsUpdated(fetchLibraryData);
    return () => {
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeUpdated) unsubscribeUpdated();
      if (unsubscribeCollections) unsubscribeCollections();
    };
  }, [fetchLibraryData, setOnUserStoryCreated, setOnUserStoryUpdated, setOnCollectionsUpdated]);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserStory(id);
      fetchLibraryData();
    } catch (error) {
      console.error('Failed to delete user story:', error);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
        await deleteUserStories(selectedStories);
        setSelectedStories([]);
        fetchLibraryData();
    } catch (error) {
        console.error("Failed to delete stories:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem deleting the selected stories.",
        });
    } finally {
        setIsDeleteDialogOpen(false);
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
        description: 'Please select at least one user story to add',
      });
      return;
    }
    
    try {
        setLoading(true);
        const storiesToAdd = stories.filter(story => selectedStories.includes(story.id));
        await bulkCreateBacklogItems(projectId, null, storiesToAdd);
        toast({
            title: 'Success!',
            description: `${storiesToAdd.length} user stor${storiesToAdd.length > 1 ? 'ies' : 'y'} added to the project backlog`,
        });
        router.push(`/dashboard/projects/${projectId}?tab=backlog`);
    } catch (error) {
        console.error("Error adding stories to backlog:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem adding the stories to the engagement",
        });
    } finally {
        setLoading(false);
    }
  };
  
  const handleAddToCollection = async (collectionId: string) => {
    if (selectedStories.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select at least one user story to add to the collection',
      });
      return;
    }
    try {
      await addStoriesToCollection(collectionId, selectedStories);
      toast({
        title: 'Success!',
        description: `${selectedStories.length} user stor${selectedStories.length > 1 ? 'ies were' : 'y was'} added to the collection`,
      });
      setSelectedStories([]);
      fetchLibraryData();
    } catch (error) {
      console.error("Error adding stories to collection:", error);
      toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem adding stories to the collection",
        });
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
              description: 'CSV file is empty or does not have a "title" column',
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
            description: "There was a problem importing your user stories",
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
            description: "Could not parse the CSV file. Please check its format",
          });
      }
    });
  };

  const filteredStories = React.useMemo(() => {
    return stories.filter(story => {
      let tagMatch = false;
      if (selectedTag === 'All' || selectedTag === null) {
        tagMatch = true;
      } else if (selectedTag.startsWith('coll:')) {
          const collectionId = selectedTag.split(':')[1];
          const collection = collections.find(c => c.id === collectionId);
          if (collection) {
              tagMatch = collection.userStoryIds.includes(story.id);
          }
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
  }, [stories, selectedTag, searchTerm, collections]);

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
        <div className="flex items-center gap-4">
            {projectId && (
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            )}
            <div>
                <h1 className="text-2xl font-bold">User Story Library</h1>
            </div>
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
            {selectedStories.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedStories.length})
                </Button>
            )}
            {projectId && (
                <Button onClick={handleAddToBacklog} disabled={selectedStories.length === 0 || loading}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add to Backlog ({selectedStories.length})
                </Button>
            )}
            {!projectId && selectedStories.length > 0 && !selectedTag?.startsWith('coll:') && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Add to Collection ({selectedStories.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {collections.map(collection => (
                             <DropdownMenuItem key={collection.id} onSelect={() => handleAddToCollection(collection.id)}>
                                {collection.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
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
        <div className="grid grid-cols-12 gap-6 flex-1">
          <div className="col-span-3">
            <Card className="bg-muted/50 h-full flex flex-col">
              <ScrollArea className="flex-1">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tags">
                    <AccordionTrigger className="px-4 py-2 text-base font-semibold no-underline hover:no-underline hover:bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Tags
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pr-4 pl-6 pb-4">
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))
                        ) : (
                          allTags.map((tag) => {
                            const isActive = selectedTag === tag.name;
                            const config = tagConfig.find(
                              (c) => c.iconName === tag.icon
                            );
                            let Icon: React.ElementType = Layers;
                            let color = 'text-foreground';
                            if (tag.name === 'All') {
                                Icon = Library;
                                color = 'text-purple-500';
                            } else if (config) {
                                Icon = config.icon;
                                color = config.color;
                            }
                            const bgColor = color.replace('text-', 'bg-');

                            return (
                              <Button
                                key={tag.id}
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start relative',
                                  isActive && 'bg-background font-bold'
                                )}
                                onClick={() => setSelectedTag(tag.name)}
                              >
                                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />}
                                 <div className={cn("flex items-center justify-center h-6 w-6 rounded-md mr-2", bgColor)}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                {tag.name}
                              </Button>
                            );
                          })
                        )}
                      </div>
                      <div className="px-6 pb-4">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => setIsManageTagsOpen(true)}>
                              <Pencil className="h-3 w-3 mr-2" /> Manage Tags
                          </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="collections">
                    <AccordionTrigger className="px-4 py-2 text-base font-semibold no-underline hover:no-underline hover:bg-muted/50 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <BookCopy className="h-4 w-4" /> Collections
                       </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pr-4 pl-6 pb-4">
                        {collections.map((collection) => {
                          const isActive = selectedTag === `coll:${collection.id}`;
                          const config =
                            tagConfig.find((c) => c.iconName === collection.icon) ||
                            tagConfig.find((c) => c.iconName === 'BookCopy');
                          const Icon = config?.icon || BookCopy;
                          const color = config?.color || 'text-foreground';
                          const bgColor = color.replace('text-', 'bg-');
                          return (
                            <Button
                              key={collection.id}
                              variant="ghost"
                              className={cn(
                                'w-full justify-start relative',
                                isActive && 'bg-background font-bold'
                              )}
                              onClick={() => setSelectedTag(`coll:${collection.id}`)}
                            >
                              {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />}
                              <div className={cn("flex items-center justify-center h-6 w-6 rounded-md mr-2", bgColor)}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              {collection.name}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="px-6 pb-4">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => openManageCollectionsDialog()}>
                              <Pencil className="h-3 w-3 mr-2" /> Manage Collections
                          </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </Card>
          </div>
          <div className="md:col-span-9 min-w-0">
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
                           const primaryTag = allTags.find(t => t.name === story.tags[0]);
                           const config = tagConfig.find(c => c.iconName === primaryTag?.icon) || tagConfig.find(t => t.iconName === 'Layers');
                           const Icon = config?.icon || Layers;
                           const color = config?.color || 'text-foreground';
                           const bgColor = color.replace('text-', 'bg-');
                           return (
                           <label htmlFor={`select-${story.id}`} key={story.id} className="block cursor-pointer">
                             <Card className={cn("flex hover:border-primary", selectedStories.includes(story.id) && "border-primary ring-2 ring-primary")}>
                               <div className="p-4 flex items-center justify-center border-r">
                                  <Checkbox
                                      id={`select-${story.id}`}
                                      checked={selectedStories.includes(story.id)}
                                      onCheckedChange={() => handleSelectStory(story.id)}
                                      aria-label={`Select story ${story.title}`}
                                  />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <CardHeader className="py-2">
                                      <div className="flex justify-between items-center gap-4">
                                          <div className="flex items-center gap-2 min-w-0">
                                              <div className={cn("flex items-center justify-center h-6 w-6 rounded-md", bgColor)}>
                                                  <Icon className="h-4 w-4 text-white" />
                                              </div>
                                              <CardTitle className="text-sm font-medium truncate flex-1" title={story.title}>
                                                  {story.title}
                                              </CardTitle>
                                              {story.tags.map(tag => <Badge key={tag} variant="secondary" className="whitespace-nowrap">{tag}</Badge>)}
                                              <Badge variant="outline" className="whitespace-nowrap">{story.points || 0} Points</Badge>
                                          </div>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onSelect={() => openEditUserStoryDialog(story)}>View/Edit</DropdownMenuItem>
                                                  <DropdownMenuItem
                                                      onClick={() => handleDelete(story.id)}
                                                      className="text-destructive focus:text-destructive-foreground"
                                                  >
                                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                  </DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 pb-2">
                                      <p className="text-sm text-muted-foreground line-clamp-2">{story.story}</p>
                                  </CardContent>
                               </div>
                             </Card>
                           </label>
                           )
                        })
                    ) : (
                         <div className="h-64 text-center flex items-center justify-center text-muted-foreground">
                            No user stories found
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
            <p><strong>Successfully Imported:</strong> {uploadStats?.importedCount || 0} user stories</p>
            <p><strong>Duplicates Skipped:</strong> {uploadStats?.skippedCount || 0} user stories</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsUploadResultDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the {selectedStories.length} selected user stor{selectedStories.length === 1 ? 'y' : 'ies'}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ManageTagsDialog
        isOpen={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
        onTagsUpdated={fetchLibraryData}
      />
      <ManageCollectionsDialog
        isOpen={isManageCollectionsDialogOpen}
        onOpenChange={closeManageCollectionsDialog}
        onCollectionsUpdated={fetchLibraryData}
      />
    </>
  );
}

