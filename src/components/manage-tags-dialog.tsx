
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
import { getTags, batchUpdateTags, Tag } from '@/services/user-story-service';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { tagConfig, type TagConfig } from '@/lib/tag-config';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ManageTagsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTagsUpdated: () => void;
}

export function ManageTagsDialog({ isOpen, onOpenChange, onTagsUpdated }: ManageTagsDialogProps) {
  const { toast } = useToast();
  const [originalTags, setOriginalTags] = React.useState<Tag[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  
  const [newTagName, setNewTagName] = React.useState('');
  const [newTagIcon, setNewTagIcon] = React.useState<TagConfig['iconName']>('Layers');
  
  const [tagsToDelete, setTagsToDelete] = React.useState<Tag[]>([]);
  const [tagPendingDelete, setTagPendingDelete] = React.useState<Tag | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const fetchInitialTags = async () => {
        const fetchedTags = await getTags();
        // Filter out any special, non-editable tags
        const editableTags = fetchedTags.filter(tag => tag.name !== 'Uncategorized' && tag.name !== 'All');
        setOriginalTags(editableTags);
        setTags(editableTags);
        setTagsToDelete([]);
      };
      fetchInitialTags();
    }
  }, [isOpen]);
  
  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: `new-${Date.now()}`, // Temporary ID
      name: newTagName.trim(),
      icon: newTagIcon,
    };
    setTags(prev => [...prev, newTag]);
    setNewTagName('');
  };
  
  const handleUpdateTag = (id: string, field: 'name' | 'icon', value: string) => {
    setTags(prev => prev.map(tag => tag.id === id ? {...tag, [field]: value} : tag));
  }

  const handleDeleteClick = (tag: Tag) => {
    setTagPendingDelete(tag);
  }
  
  const confirmDeleteTag = () => {
    if (!tagPendingDelete) return;
    setTags(prev => prev.filter(t => t.id !== tagPendingDelete.id));
    if (!tagPendingDelete.id.startsWith('new-')) {
        setTagsToDelete(prev => [...prev, tagPendingDelete]);
    }
    setTagPendingDelete(null);
  };
  
  const handleSaveChanges = async () => {
    const tagsToAdd = tags.filter(t => t.id.startsWith('new-')).map(({name, icon}) => ({name, icon}));
    const tagsToUpdate = tags.filter(t => {
      if (t.id.startsWith('new-')) return false;
      const original = originalTags.find(ot => ot.id === t.id);
      return original && (original.name !== t.name || original.icon !== t.icon);
    });

    try {
      await batchUpdateTags({
        tagsToAdd,
        tagsToUpdate,
        tagsToDelete
      });
      toast({ title: 'Success', description: 'Tags have been updated successfully.' });
      onTagsUpdated();
      onOpenChange(false);
    } catch(error) {
      console.error("Error updating tags:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update tags.'});
    }
  }


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or delete the tags used to categorize your user stories. Changes are saved when you click "Save & Close".
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
                {tags.map(tag => {
                    const tagIconConfig = tagConfig.find(c => c.iconName === tag.icon) || tagConfig[0];
                    const Icon = tagIconConfig.icon;
                    return (
                    <div key={tag.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted">
                        <Input 
                            value={tag.name}
                            onChange={(e) => handleUpdateTag(tag.id, 'name', e.target.value)}
                            className="flex-1"
                        />
                         <Select 
                            onValueChange={(value) => handleUpdateTag(tag.id, 'icon', value)} 
                            value={tag.icon}
                          >
                            <SelectTrigger className="w-[60px]">
                                <SelectValue>
                                    <Icon className={cn("h-4 w-4", tagIconConfig.color)} />
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {tagConfig.map(config => {
                                    const IconComponent = config.icon;
                                    return <SelectItem key={config.iconName} value={config.iconName}>
                                        <IconComponent className={cn("h-4 w-4", config.color)} />
                                    </SelectItem>
                                })}
                            </SelectContent>
                        </Select>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(tag)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )})}
            </ScrollArea>
        </div>
        <DialogFooter>
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={cn('dark:btn-outline-cancel')}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     <AlertDialog open={!!tagPendingDelete} onOpenChange={(open) => !open && setTagPendingDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the "{tagPendingDelete?.name}" tag. If this tag is in use, it will be removed from all user stories. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTagPendingDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteTag} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
