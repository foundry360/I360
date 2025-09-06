
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
import { Textarea } from './ui/textarea';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, UserStory } from '@/services/user-story-service';
import { createCollection } from '@/services/collection-service';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { GripVertical, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type StoryWithDateAsString = Omit<UserStory, 'createdAt'> & { createdAt: string };

const StoryCard = ({ story, index }: { story: StoryWithDateAsString, index: number }) => (
    <Draggable draggableId={story.id} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={cn(
                    "p-3 mb-2 rounded-lg border bg-card text-card-foreground shadow-sm",
                    snapshot.isDragging && "bg-primary text-primary-foreground"
                )}
            >
                <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">{story.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{story.story}</p>
                    </div>
                </div>
            </div>
        )}
    </Draggable>
);

export function NewCollectionDialog() {
    const { isNewCollectionDialogOpen, closeNewCollectionDialog, onCollectionCreated } = useQuickAction();
    const { toast } = useToast();

    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [libraryStories, setLibraryStories] = React.useState<StoryWithDateAsString[]>([]);
    const [collectionStories, setCollectionStories] = React.useState<StoryWithDateAsString[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        if (isNewCollectionDialogOpen) {
            const fetchStories = async () => {
                setLoading(true);
                const stories = await getUserStories();
                setLibraryStories(stories);
                setLoading(false);
            };
            fetchStories();
        }
    }, [isNewCollectionDialogOpen]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) return;

        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;
        
        let sourceList = sourceListId === 'library' ? [...filteredLibraryStories] : [...collectionStories];
        let destList = destListId === 'library' ? [...filteredLibraryStories] : [...collectionStories];

        const [movedStory] = sourceList.splice(source.index, 1);

        if (sourceListId === destListId) {
            // Reordering within the same list
            sourceList.splice(destination.index, 0, movedStory);
             if (sourceListId === 'library') {
                // This is tricky because we are reordering a filtered list.
                // A full implementation would need to update the original `libraryStories` array.
                // For now, we'll prevent re-ordering in the filtered library view for simplicity.
             } else {
                setCollectionStories(sourceList);
            }
        } else {
            // Moving between lists
            destList.splice(destination.index, 0, movedStory);
            
            if (sourceListId === 'library') {
                // Story moved from Library to Collection
                setLibraryStories(prev => prev.filter(s => s.id !== movedStory.id));
                setCollectionStories(destList);
            } else {
                // Story moved from Collection to Library
                setCollectionStories(sourceList);
                setLibraryStories(prev => [...prev, movedStory].sort((a,b) => a.title.localeCompare(b.title)));
            }
        }
    };
    
    const handleSave = async () => {
        if (!name.trim()) {
            toast({
                variant: 'destructive',
                title: 'Name Required',
                description: 'Please provide a name for your collection.',
            });
            return;
        }

        try {
            await createCollection({
                name,
                description,
                userStoryIds: collectionStories.map(s => s.id),
            });
            toast({
                title: 'Collection Created!',
                description: `"${name}" has been successfully created.`,
            });
            if (onCollectionCreated) {
                onCollectionCreated();
            }
            handleClose();
        } catch (error) {
            console.error("Failed to create collection:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'There was a problem creating the collection.',
            });
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setLibraryStories([]);
        setCollectionStories([]);
        setSearchTerm('');
        closeNewCollectionDialog();
    };
    
    const filteredLibraryStories = libraryStories.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.story.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isNewCollectionDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                        Give your collection a name and description, then drag stories from the library to add them.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Collection Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q3 Marketing Features" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of this collection's purpose" />
                    </div>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Story Library ({filteredLibraryStories.length})</CardTitle>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search library..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <Droppable droppableId="library">
                                        {(provided, snapshot) => (
                                            <div 
                                                ref={provided.innerRef} 
                                                {...provided.droppableProps}
                                                className={cn("p-2 rounded-md h-full transition-colors", snapshot.isDraggingOver && "bg-muted")}
                                            >
                                                {loading ? <p>Loading stories...</p> : filteredLibraryStories.map((story, index) => (
                                                    <StoryCard key={story.id} story={story} index={index} />
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                         <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>New Collection ({collectionStories.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                               <ScrollArea className="h-full">
                                    <Droppable droppableId="collection">
                                        {(provided, snapshot) => (
                                             <div 
                                                ref={provided.innerRef} 
                                                {...provided.droppableProps}
                                                className={cn("p-2 rounded-md h-full transition-colors", snapshot.isDraggingOver && "bg-muted")}
                                            >
                                                {collectionStories.map((story, index) => (
                                                    <StoryCard key={story.id} story={story} index={index} />
                                                ))}
                                                {provided.placeholder}
                                                {collectionStories.length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="h-full flex items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                                        <p>Drag stories here to add them</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </DragDropContext>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Collection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

