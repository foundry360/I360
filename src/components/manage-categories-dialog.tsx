
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
import { getUniqueTags, createTag, updateTag, deleteTag } from '@/services/user-story-service';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Save, Trash2, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface ManageCategoriesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCategoriesUpdated: () => void;
}

export function ManageCategoriesDialog({ isOpen, onOpenChange, onCategoriesUpdated }: ManageCategoriesDialogProps) {
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');
  const [tagToUpdate, setTagToUpdate] = React.useState<Record<string, string>>({});
  const [tagToDelete, setTagToDelete] = React.useState<string | null>(null);

  const fetchTags = React.useCallback(async () => {
    const uniqueTags = await getUniqueTags();
    setTags(uniqueTags);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, fetchTags]);
  
  const handleAddNewTag = async () => {
    if (!newTag.trim()) return;
    try {
        await createTag(newTag.trim());
        setNewTag('');
        await fetchTags();
        onCategoriesUpdated();
    } catch(error) {
        console.error("Error creating tag:", error);
    }
  };

  const handleUpdateTag = async (oldTag: string) => {
    const newTagName = tagToUpdate[oldTag]?.trim();
    if (!newTagName || newTagName === oldTag) {
        setTagToUpdate(prev => ({...prev, [oldTag]: oldTag}));
        return;
    };
    try {
        await updateTag(oldTag, newTagName);
        await fetchTags();
        onCategoriesUpdated();
    } catch (error) {
        console.error("Error updating tag:", error);
    } finally {
        setTagToUpdate(prev => {
            const { [oldTag]: _, ...rest } = prev;
            return rest;
        });
    }
  };
  
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete);
      await fetchTags();
      onCategoriesUpdated();
    } catch (error) {
        console.error("Error deleting tag:", error);
    } finally {
        setTagToDelete(null);
    }
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or delete the tags used to categorize your user stories.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Label>New Category</Label>
            <div className="flex gap-2">
                <Input 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter new category name..."
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTag(); } }}
                />
                <Button onClick={handleAddNewTag} size="icon">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
            <Label>Existing Categories</Label>
            <ScrollArea className="h-64 border rounded-md p-2">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted">
                        <Input 
                            value={tagToUpdate[tag] ?? tag}
                            onChange={(e) => setTagToUpdate(prev => ({ ...prev, [tag]: e.target.value }))}
                            onBlur={() => handleUpdateTag(tag)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTag(tag); }}
                            className="flex-1"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => setTagToDelete(tag)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the "{tagToDelete}" tag from all user stories. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTagToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
