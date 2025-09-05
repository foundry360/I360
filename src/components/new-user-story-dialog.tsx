
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
import { createUserStory } from '@/services/user-story-service';
import { useQuickAction } from '@/contexts/quick-action-context';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

const initialNewStoryState = {
  title: '',
  story: '',
  acceptanceCriteria: [] as string[],
  tags: [] as string[],
};

export function NewUserStoryDialog() {
  const { isNewUserStoryDialogOpen, closeNewUserStoryDialog, onUserStoryCreated } =
    useQuickAction();
  const [newStory, setNewStory] = React.useState(initialNewStoryState);
  const [currentCriterion, setCurrentCriterion] = React.useState('');
  const [currentTag, setCurrentTag] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewStory((prev) => ({ ...prev, [id]: value }));
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

  const handleAddTag = () => {
    if (currentTag.trim() && !newStory.tags.includes(currentTag.trim())) {
      setNewStory(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewStory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title || !newStory.story) {
      alert('Title and Story are required');
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
      setCurrentTag('');
      closeNewUserStoryDialog();
    }
  };

  return (
    <Dialog open={isNewUserStoryDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleCreateStory}>
          <DialogHeader>
            <DialogTitle>Create New User Story</DialogTitle>
            <DialogDescription>
              Add a reusable user story to your library.
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
                placeholder="As a [type of user], I want [an action] so that [a benefit]."
                required
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
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right pt-2">Tags</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                   <Input
                    id="new-tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Add a tag"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {newStory.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                            <button type="button" className="ml-1" onClick={() => handleRemoveTag(tag)}>
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
              </div>
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
