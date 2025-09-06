
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
import { getTags, createTag, updateTag, deleteTag, Tag } from '@/services/user-story-service';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Save, Trash2, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { tagConfig, type TagConfig } from '@/lib/tag-config';
import { cn } from '@/lib/utils';


interface ManageTagsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTagsUpdated: () => void;
}

export function ManageTagsDialog({ isOpen, onOpenChange, onTagsUpdated }: ManageTagsDialogProps) {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [newTagName, setNewTagName] = React.useState('');
  const [newTagIcon, setNewTagIcon] = React.useState<TagConfig['iconName']>('Layers');
  const [tagToUpdate, setTagToUpdate] = React.useState<Record<string, Partial<Tag>>>({});
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null);

  const fetchTags = React.useCallback(async () => {
    const uniqueTags = await getTags();
    setTags(uniqueTags);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, fetchTags]);
  
  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    try {
        await createTag({ name: newTagName.trim(), icon: newTagIcon });
        setNewTagName('');
        await fetchTags();
        onTagsUpdated();
    } catch(error) {
        console.error("Error creating tag:", error);
    }
  };

  const handleUpdateTag = async (tag: Tag) => {
    const updatedData = tagToUpdate[tag.id];
    if (!updatedData || (updatedData.name === tag.name && updatedData.icon === tag.icon)) {
      setTagToUpdate(prev => {
          const { [tag.id]: _, ...rest } = prev;
          return rest;
      });
      return;
    }
    
    try {
        await updateTag(tag.id, updatedData);
        await fetchTags();
        onTagsUpdated();
    } catch (error) {
        console.error("Error updating tag:", error);
    } finally {
        setTagToUpdate(prev => {
            const { [tag.id]: _, ...rest } = prev;
            return rest;
        });
    }
  };
  
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id, tagToDelete.name);
      await fetchTags();
      onTagsUpdated();
    } catch (error) {
        console.error("Error deleting tag:", error);
    } finally {
        setTagToDelete(null);
    }
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or delete the tags used to categorize your user stories.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Label>New Tag</Label>
            <div className="flex gap-2">
                <Input 
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter new tag name..."
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTag(); } }}
                />
                <Select onValueChange={(value) => setNewTagIcon(value as TagConfig['iconName'])} value={newTagIcon}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                        {tagConfig.map(config => {
                            const Icon = config.icon;
                            return <SelectItem key={config.iconName} value={config.iconName}>
                                <div className="flex items-center gap-2">
                                   <Icon className={cn("h-4 w-4", config.color)} /> {config.iconName}
                                </div>
                            </SelectItem>
                        })}
                    </SelectContent>
                </Select>
                <Button onClick={handleAddNewTag} size="icon">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
            <Label className="pt-4 block">Existing Tags</Label>
            <ScrollArea className="h-64 border rounded-md p-2">
                {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted">
                        <Input 
                            value={tagToUpdate[tag.id]?.name ?? tag.name}
                            onChange={(e) => setTagToUpdate(prev => ({ ...prev, [tag.id]: {...prev[tag.id], name: e.target.value} }))}
                            onBlur={() => handleUpdateTag(tag)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateTag(tag); }}
                            className="flex-1"
                        />
                         <Select onValueChange={(value) => {
                             setTagToUpdate(prev => ({ ...prev, [tag.id]: {...prev[tag.id], icon: value as TagConfig['iconName']} }));
                             handleUpdateTag({ ...tag, icon: value as TagConfig['iconName'] });
                         }} value={tagToUpdate[tag.id]?.icon ?? tag.icon}>
                            <SelectTrigger className="w-[60px]">
                                <SelectValue>
                                    {React.createElement(tagConfig.find(c => c.iconName === (tagToUpdate[tag.id]?.icon ?? tag.icon))?.icon || tagConfig[0].icon, {className: "h-4 w-4"})}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {tagConfig.map(config => {
                                    const Icon = config.icon;
                                    return <SelectItem key={config.iconName} value={config.iconName}>
                                        <Icon className={cn("h-4 w-4", config.color)} />
                                    </SelectItem>
                                })}
                            </SelectContent>
                        </Select>
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
                    This will permanently delete the "{tagToDelete?.name}" tag. This action cannot be undone.
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
