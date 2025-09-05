
'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Plus, Trash2, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuickAction } from '@/contexts/quick-action-context';
import { getUserStories, deleteUserStory, UserStory } from '@/services/user-story-service';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';

export default function LibraryPage() {
  const [stories, setStories] = React.useState<(Omit<UserStory, 'createdAt'> & { createdAt: string })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { openNewUserStoryDialog, setOnUserStoryCreated } = useQuickAction();

  const fetchStories = React.useCallback(async () => {
    try {
      setLoading(true);
      const storiesFromDb = await getUserStories();
      setStories(storiesFromDb);
    } catch (error) {
      console.error('Failed to fetch user stories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStories();
    const unsubscribe = setOnUserStoryCreated(fetchStories);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchStories, setOnUserStoryCreated]);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserStory(id);
      fetchStories();
    } catch (error) {
      console.error('Failed to delete user story:', error);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Story Library</h1>
        <p className="text-muted-foreground">
          Browse and manage reusable user stories for your projects.
        </p>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
        <Button size="icon" onClick={openNewUserStoryDialog}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">New User Story</span>
        </Button>
      </div>
      <div className="border rounded-lg">
        {loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium max-w-sm">
                      <p className="font-bold truncate">{story.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{story.story}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {story.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>{format(parseISO(story.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View/Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(story.id)}
                            className="text-destructive focus:text-destructive-foreground"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No user stories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
