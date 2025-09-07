
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
import { useQuickAction } from '@/contexts/quick-action-context';
import { addCollectionsToProjectBacklog } from '@/services/backlog-item-service';
import { useToast } from '@/hooks/use-toast';
import type { StoryCollection } from '@/services/collection-service';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from './ui/input';

const CollectionItem = ({ collection, onMove, moveDirection }: { collection: StoryCollection, onMove: () => void, moveDirection: 'add' | 'remove' }) => (
    <div
        className="p-3 mb-2 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center gap-2"
    >
        <div className="flex-1">
            <p className="text-sm font-medium">{collection.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onMove}>
            {moveDirection === 'add' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">{moveDirection === 'add' ? 'Add to selection' : 'Remove from selection'}</span>
        </Button>
    </div>
);

export function AddFromCollectionDialog() {
    const {
        isAddFromCollectionDialogOpen,
        closeAddFromCollectionDialog,
        onCollectionAddedToProject,
        addFromCollectionData
    } = useQuickAction();
    const { toast } = useToast();
    
    const [availableCollections, setAvailableCollections] = React.useState<StoryCollection[]>([]);
    const [selectedCollections, setSelectedCollections] = React.useState<StoryCollection[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        if (isAddFromCollectionDialogOpen && addFromCollectionData?.collections) {
            setAvailableCollections(addFromCollectionData.collections.sort((a,b) => a.name.localeCompare(b.name)));
            setSelectedCollections([]);
        }
    }, [isAddFromCollectionDialogOpen, addFromCollectionData]);
    
    const handleMoveCollection = (collectionToMove: StoryCollection, direction: 'add' | 'remove') => {
        if (direction === 'add') {
            setSelectedCollections(prev => [...prev, collectionToMove].sort((a,b) => a.name.localeCompare(b.name)));
            setAvailableCollections(prev => prev.filter(c => c.id !== collectionToMove.id));
        } else {
            setAvailableCollections(prev => [...prev, collectionToMove].sort((a,b) => a.name.localeCompare(b.name)));
            setSelectedCollections(prev => prev.filter(c => c.id !== collectionToMove.id));
        }
    };

    const handleAdd = async () => {
        if (!addFromCollectionData?.projectId || selectedCollections.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Project ID or selected collections are missing.',
            });
            return;
        }

        try {
            const collectionIds = selectedCollections.map(c => c.id);
            await addCollectionsToProjectBacklog(addFromCollectionData.projectId, collectionIds);
            
            toast({
                title: 'Success!',
                description: `${selectedCollections.length} collection(s) have been added to the backlog.`,
            });
            if (onCollectionAddedToProject) {
                onCollectionAddedToProject();
            }
            handleClose();
        } catch (error) {
            console.error("Error adding collections to backlog:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "There was a problem adding stories from the collections.",
            });
        }
    };
    
    const handleClose = () => {
        setAvailableCollections([]);
        setSelectedCollections([]);
        setSearchTerm('');
        closeAddFromCollectionDialog();
    };

    const filteredAvailableCollections = availableCollections.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isAddFromCollectionDialogOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Add from Collections</DialogTitle>
                    <DialogDescription>
                        Select collections from the library to add all of their user stories to the project backlog.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 px-6 pt-4 pb-2 overflow-hidden">
                    <div className="flex gap-6 h-full">
                        <Card className="flex-1 flex flex-col h-full overflow-hidden">
                             <CardHeader>
                                <CardTitle>Available Collections ({filteredAvailableCollections.length})</CardTitle>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search collections..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-1 rounded-md h-full">
                                        {filteredAvailableCollections.map((collection) => (
                                            <CollectionItem key={collection.id} collection={collection} onMove={() => handleMoveCollection(collection, 'add')} moveDirection="add" />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 flex flex-col h-full overflow-hidden">
                            <CardHeader>
                                <CardTitle>Selected to Add ({selectedCollections.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-1 rounded-md h-full">
                                        {selectedCollections.map((collection) => (
                                            <CollectionItem key={collection.id} collection={collection} onMove={() => handleMoveCollection(collection, 'remove')} moveDirection="remove" />
                                        ))}
                                        {selectedCollections.length === 0 && (
                                            <div className="h-full flex items-center justify-center text-center text-muted-foreground bg-muted border-2 border-dashed border-card rounded-lg p-4">
                                                <p>Move collections from the left here to add them to the backlog.</p>
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
                    <Button onClick={handleAdd} disabled={selectedCollections.length === 0}>Add to Backlog ({selectedCollections.length})</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
