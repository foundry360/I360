
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
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type StoryWithDateAsString = Omit<UserStory, 'createdAt'> & { createdAt: string };

const StoryItem = ({ story, onMove, moveDirection }: { story: StoryWithDateAsString, onMove: () => void, moveDirection: 'add' | 'remove' }) => (
    <div
        className="p-3 mb-2 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center gap-2"
    >
        <div className="flex-1">
            <p className="text-sm font-medium">{story.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{story.story}</p>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onMove}>
            {moveDirection === 'add' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">{moveDirection === 'add' ? 'Add to collection' : 'Remove from collection'}</span>
        </Button>
    </div>
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
                setLibraryStories(stories.sort((a,b) => a.title.localeCompare(b.title)));
                setLoading(false);
            };
            fetchStories();
        }
    }, [isNewCollectionDialogOpen]);

    const handleMoveStory = (storyToMove: StoryWithDateAsString, direction: 'add' | 'remove') => {
        if (direction === 'add') {
            setCollectionStories(prev => [...prev, storyToMove].sort((a,b) => a.title.localeCompare(b.title)));
            setLibraryStories(prev => prev.filter(s => s.id !== storyToMove.id));
        } else {
            setLibraryStories(prev => [...prev, storyToMove].sort((a,b) => a.title.localeCompare(b.title)));
            setCollectionStories(prev => prev.filter(s => s.id !== storyToMove.id));
        }
    }
    
    const handleSave = async () => {
        if (!name.trim()) {
            toast({
                variant: 'destructive',
                title: 'Name Required',
                description: 'Please provide a name for your collection',
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

    const handleMoveAll = () => {
        setCollectionStories(prev => [...prev, ...filteredLibraryStories].sort((a, b) => a.title.localeCompare(b.title)));
        setLibraryStories(prev => prev.filter(story => !filteredLibraryStories.find(s => s.id === story.id)));
    };

    return (
        <Dialog open={isNewCollectionDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                        Give your collection a name and description, then move stories from the library to the new collection.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 px-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Collection Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q3 Marketing Features" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of this collection's purpose" />
                    </div>
                </div>
                <div className="flex-1 px-6 pt-4 pb-2 overflow-hidden">
                    <div className="flex gap-6 h-full">
                        <Card className="flex-1 flex flex-col h-full overflow-hidden">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Story Library ({filteredLibraryStories.length})</CardTitle>
                                    {filteredLibraryStories.length > 0 && (
                                        <Button variant="secondary" size="sm" onClick={handleMoveAll} className="dark:bg-[hsl(0_0%_12%)]">
                                            Add all ({filteredLibraryStories.length})
                                        </Button>
                                    )}
                                </div>
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
                                    <div className="p-1 rounded-md h-full">
                                        {loading ? <p>Loading stories...</p> : filteredLibraryStories.map((story) => (
                                            <StoryItem key={story.id} story={story} onMove={() => handleMoveStory(story, 'add')} moveDirection="add" />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 flex flex-col h-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>New Collection ({collectionStories.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-1 rounded-md h-full">
                                        {collectionStories.map((story) => (
                                            <StoryItem key={story.id} story={story} onMove={() => handleMoveStory(story, 'remove')} moveDirection="remove" />
                                        ))}
                                        {collectionStories.length === 0 && (
                                            <div className="h-full flex items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-4 bg-muted/20 dark:bg-[hsl(0_0%_12%)]">
                                                <p>Move stories from the library here to build your collection</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Collection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
