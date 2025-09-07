
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
import { getCollections, updateCollection, deleteCollection, createCollection, type StoryCollection } from '@/services/collection-service';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { tagConfig, type TagConfig } from '@/lib/tag-config';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ManageCollectionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCollectionsUpdated: () => void;
}

export function ManageCollectionsDialog({ isOpen, onOpenChange, onCollectionsUpdated }: ManageCollectionsDialogProps) {
  const { toast } = useToast();
  const [collections, setCollections] = React.useState<StoryCollection[]>([]);
  
  const [newCollectionName, setNewCollectionName] = React.useState('');
  const [newCollectionDescription, setNewCollectionDescription] = React.useState('');
  const [newCollectionIcon, setNewCollectionIcon] = React.useState<TagConfig['iconName']>('BookCopy');
  
  const [collectionToDelete, setCollectionToDelete] = React.useState<StoryCollection | null>(null);

  const fetchCollections = React.useCallback(async () => {
    const fetchedCollections = await getCollections();
    setCollections(fetchedCollections);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen, fetchCollections]);
  
  const handleAddNewCollection = async () => {
    if (!newCollectionName.trim()) {
        toast({ title: "Name is required", variant: "destructive" });
        return;
    }
    try {
        await createCollection({ 
            name: newCollectionName.trim(),
            description: newCollectionDescription.trim(),
            icon: newCollectionIcon,
            userStoryIds: [],
        });
        setNewCollectionName('');
        setNewCollectionDescription('');
        await fetchCollections();
        onCollectionsUpdated();
    } catch(error) {
        console.error("Error creating collection:", error);
        toast({ title: "Error creating collection", variant: "destructive" });
    }
  };

  const handleUpdateCollection = async (collection: StoryCollection) => {
    try {
        await updateCollection(collection.id, { 
            name: collection.name, 
            description: collection.description, 
            icon: collection.icon 
        });
        toast({ title: `Updated "${collection.name}"` });
        onCollectionsUpdated();
    } catch (error) {
        console.error("Error updating collection:", error);
        toast({ title: "Error updating collection", variant: "destructive" });
    }
  };

  const handleFieldChange = (id: string, field: 'name' | 'description' | 'icon', value: string) => {
      setCollections(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }
  
  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection(collectionToDelete.id);
      await fetchCollections();
      onCollectionsUpdated();
    } catch (error) {
        console.error("Error deleting collection:", error);
        toast({ title: "Error deleting collection", variant: "destructive" });
    } finally {
        setCollectionToDelete(null);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
          <DialogDescription>
            Add, edit, or delete user story collections.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Label>New Collection</Label>
            <div className="p-4 border rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Enter new collection name..."
                        className="flex-1"
                    />
                    <Textarea
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        placeholder="Description..."
                        className="flex-1 h-10 min-h-[40px] resize-y"
                    />
                    <Select onValueChange={(value) => setNewCollectionIcon(value as TagConfig['iconName'])} value={newCollectionIcon}>
                        <SelectTrigger className="w-[60px] shrink-0">
                            <SelectValue>
                                {(() => {
                                    const Icon = tagConfig.find(c => c.iconName === newCollectionIcon)?.icon || 'BookCopy';
                                    const color = tagConfig.find(c => c.iconName === newCollectionIcon)?.color;
                                    return <Icon className={cn("h-4 w-4", color)} />;
                                })()}
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
                    <Button onClick={handleAddNewCollection} size="icon" className="shrink-0">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Label className="pt-2 block">Existing Collections</Label>
            <ScrollArea className="h-72 border rounded-md p-2">
                {collections.map(collection => {
                    const collectionIconConfig = tagConfig.find(c => c.iconName === collection.icon) || tagConfig.find(c => c.iconName === 'BookCopy');
                    const Icon = collectionIconConfig?.icon || 'BookCopy';
                    return (
                        <div key={collection.id} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted">
                            <Input 
                                value={collection.name}
                                onChange={(e) => handleFieldChange(collection.id, 'name', e.target.value)}
                                onBlur={() => handleUpdateCollection(collection)}
                                className="flex-1 font-medium"
                            />
                            <Textarea 
                                value={collection.description}
                                onChange={(e) => handleFieldChange(collection.id, 'description', e.target.value)}
                                onBlur={() => handleUpdateCollection(collection)}
                                className="flex-1 text-sm text-muted-foreground h-10 min-h-[40px] resize-y"
                                placeholder="No description"
                            />
                             <Select 
                                onValueChange={(value) => {
                                    handleFieldChange(collection.id, 'icon', value);
                                    const updatedCollection = { ...collection, icon: value as TagConfig['iconName'] };
                                    handleUpdateCollection(updatedCollection);
                                }}
                                value={collection.icon}
                              >
                                <SelectTrigger className="w-[60px] shrink-0">
                                    <SelectValue>
                                        <Icon className={cn("h-4 w-4", collectionIconConfig?.color)} />
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
                                onClick={() => setCollectionToDelete(collection)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )
                })}
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the "{collectionToDelete?.name}" collection. The user stories within it will NOT be deleted from the library.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCollection} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
