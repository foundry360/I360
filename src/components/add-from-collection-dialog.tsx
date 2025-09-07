
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
import { Label } from '@/components/ui/label';
import { useQuickAction } from '@/contexts/quick-action-context';
import { addCollectionToProjectBacklog } from '@/services/backlog-item-service';
import { useToast } from '@/hooks/use-toast';
import type { StoryCollection } from '@/services/collection-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function AddFromCollectionDialog() {
    const {
        isAddFromCollectionDialogOpen,
        closeAddFromCollectionDialog,
        onCollectionAddedToProject,
        addFromCollectionData
    } = useQuickAction();
    const { toast } = useToast();
    
    const [selectedCollectionId, setSelectedCollectionId] = React.useState<string>('');
    
    React.useEffect(() => {
        if (!isAddFromCollectionDialogOpen) {
            setSelectedCollectionId('');
        }
    }, [isAddFromCollectionDialogOpen]);
    
    const handleAdd = async () => {
        if (!addFromCollectionData?.projectId || !selectedCollectionId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Project ID or Collection ID is missing.',
            });
            return;
        }

        try {
            await addCollectionToProjectBacklog(addFromCollectionData.projectId, selectedCollectionId);
            const selectedCollection = addFromCollectionData.collections.find(c => c.id === selectedCollectionId);
            toast({
                title: 'Success!',
                description: `Stories from "${selectedCollection?.name}" have been added to the backlog.`,
            });
            if (onCollectionAddedToProject) {
                onCollectionAddedToProject();
            }
            closeAddFromCollectionDialog();
        } catch (error) {
            console.error("Error adding collection to backlog:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "There was a problem adding stories from the collection.",
            });
        }
    };
    
    return (
        <Dialog open={isAddFromCollectionDialogOpen} onOpenChange={closeAddFromCollectionDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add from Collection</DialogTitle>
                    <DialogDescription>
                        Select a story collection to add all of its user stories to the project backlog.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="collection-select">Collection</Label>
                    <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                        <SelectTrigger id="collection-select">
                            <SelectValue placeholder="Select a collection..." />
                        </SelectTrigger>
                        <SelectContent>
                            {addFromCollectionData?.collections.map((collection: StoryCollection) => (
                                <SelectItem key={collection.id} value={collection.id}>
                                    {collection.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeAddFromCollectionDialog}>Cancel</Button>
                    <Button onClick={handleAdd} disabled={!selectedCollectionId}>Add to Backlog</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

