
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
import { createUserStory, getTags } from '@/services/user-story-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Badge } from './ui/badge';
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from '@/lib/utils';


const initialNewStoryState = {
  title: '',
  story: '',
  acceptanceCriteria: [] as string[],
  tags: [] as string[],
  points: 0,
};

export function NewUserStoryDialog() {
  const { isNewUserStoryDialogOpen, closeNewUserStoryDialog, onUserStoryCreated } =
    useQuickAction();
  const [newStory, setNewStory] = React.useState(initialNewStoryState);
  const [currentCriterion, setCurrentCriterion] = React.useState('');
  
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    if (isNewUserStoryDialogOpen) {
      const fetchTags = async () => {
        const tags = await getTags();
        setAvailableTags(tags.map(t => t.name));
      };
      fetchTags();
    }
  }, [isNewUserStoryDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewStory((prev) => ({ ...prev, [id]: id === 'points' ? Number(value) : value }));
  };

  const handleAddCriterion = () => {
    if (currentCriterion.trim()) {
      setNewStory(prev => ({
        ...prev,
        acceptanceCriteria: [...prev.acceptanceCriteria, currentCriterion.trim()]
      }));
      setCurrentCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setNewStory(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
    }));
  };

  const handleTagSelect = (tag: string) => {
    if (tag && !newStory.tags.includes(tag)) {
        setNewStory(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setInputValue("");
    setOpen(false);
  };

  const handleCreateNewTag = () => {
    if (inputValue && !newStory.tags.includes(inputValue)) {
      setNewStory(prev => ({ ...prev, tags: [...prev.tags, inputValue] }));
      setAvailableTags(prev => [...prev, inputValue]);
    }
    setInputValue("");
    setOpen(false);
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewStory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title) {
      alert('Title is required');
      return;
    }
    try {
      await createUserStory(newStory);
      handleOpenChange(false);
      if (onUserStoryCreated) {
        onUserStoryCreated();
      }
    } catch (error) {
      console.error('Failed to create user story:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewStory(initialNewStoryState);
      setCurrentCriterion('');
      closeNewUserStoryDialog();
    }
  };

  const filteredTags = availableTags.filter(tag => !newStory.tags.includes(tag));
  const showCreateOption = inputValue && !availableTags.includes(inputValue) && !newStory.tags.includes(inputValue);

  return (
    <Dialog open={isNewUserStoryDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateStory}>
          <DialogHeader>
            <DialogTitle>Create New User Story</DialogTitle>
            <DialogDescription>
              Add a reusable user story to your library
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={newStory.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="story" className="text-right pt-2">Story</Label>
              <Textarea
                id="story"
                value={newStory.story}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="As a [type of user], I want [an action] so that [a benefit]"
              />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="acceptanceCriteria" className="text-right pt-2">Acceptance Criteria</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="new-criterion"
                    value={currentCriterion}
                    onChange={(e) => setCurrentCriterion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }}
                    placeholder="Add a criterion"
                  />
                  <Button type="button" variant="outline" onClick={handleAddCriterion}>Add</Button>
                </div>
                <ScrollArea className="h-24">
                  <ul className="space-y-1 list-disc pl-5">
                    {newStory.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="text-sm flex justify-between items-center">
                        <span>{c}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveCriterion(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right pt-2">Tags</Label>
              <div className="col-span-3 space-y-2">
                 <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        >
                        Add a tag...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[375px] p-0">
                        <Command>
                           <CommandInput 
                                placeholder="Search or create tag..."
                                value={inputValue}
                                onValueChange={setInputValue}
                           />
                           <CommandList>
                                <CommandEmpty>
                                    {showCreateOption ? ' ' : 'No tags found'}
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredTags.map((tag) => (
                                        <CommandItem
                                            key={tag}
                                            value={tag}
                                            onSelect={handleTagSelect}
                                        >
                                           <Check className={cn("mr-2 h-4 w-4", newStory.tags.includes(tag) ? "opacity-100" : "opacity-0")} />
                                            {tag}
                                        </CommandItem>
                                    ))}
                                    {showCreateOption && (
                                        <CommandItem onSelect={handleCreateNewTag} value={inputValue}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Create "{inputValue}"
                                        </CommandItem>
                                    )}
                                </CommandGroup>
                           </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-1">
                    {newStory.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button type="button" className="rounded-full hover:bg-muted-foreground/20" onClick={() => handleRemoveTag(tag)}>
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">Story Points</Label>
              <Input id="points" type="number" value={newStory.points} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Story</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
