
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getCollections, deleteCollection, type StoryCollection } from '@/services/collection-service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickAction } from '@/contexts/quick-action-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { tagConfig } from '@/lib/tag-config';
import { cn } from '@/lib/utils';
import { BookCopy } from 'lucide-react';

// TODO: Implement dialogs for new/edit collection

export default function CollectionsPage() {
    const [collections, setCollections] = React.useState<StoryCollection[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [collectionToDelete, setCollectionToDelete] = React.useState<StoryCollection | null>(null);
    const { openNewCollectionDialog, setOnCollectionCreated } = useQuickAction();

    const fetchCollections = React.useCallback(async () => {
        try {
            setLoading(true);
            const collectionsFromDb = await getCollections();
            setCollections(collectionsFromDb);
        } catch (error) {
            console.error('Failed to fetch collections:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCollections();
        const unsubscribe = setOnCollectionCreated(fetchCollections);
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchCollections, setOnCollectionCreated]);

    const handleDeleteCollection = async () => {
        if (!collectionToDelete) return;
        try {
            await deleteCollection(collectionToDelete.id);
            fetchCollections();
        } catch (error) {
            console.error('Failed to delete collection:', error);
        } finally {
            setCollectionToDelete(null);
        }
    };


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">User Story Collections</h1>
                        <p className="text-muted-foreground">
                            Create and manage curated collections of user stories to quickly populate engagement backlogs
                        </p>
                    </div>
                    {!loading && collections.length > 0 && (
                        <Button size="icon" onClick={openNewCollectionDialog}>
                           <Plus className="h-4 w-4" />
                           <span className="sr-only">New Collection</span>
                       </Button>
                    )}
                </div>
                <Separator />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                         <Skeleton className="h-48 w-full" />
                    </div>
                ) : collections.length === 0 ? (
                     <Card className="border-dashed col-span-full">
                        <CardContent className="p-10 text-center">
                            <h3 className="text-lg font-semibold">No Collections Yet</h3>
                            <p className="text-muted-foreground mt-2 mb-4">
                                Get started by creating your first collection of user stories
                            </p>
                             <Button onClick={openNewCollectionDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Collection
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {collections.map(collection => {
                            const config = tagConfig.find(c => c.iconName === collection.icon) || { icon: BookCopy, color: 'text-foreground' };
                            const Icon = config.icon;
                            return (
                                <Card key={collection.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Icon className={cn("h-5 w-5", config.color)} />
                                            <span>{collection.name}</span>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 pt-2">{collection.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground">
                                            Contains <strong>{collection.userStoryIds.length}</strong> user stories
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                         <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setCollectionToDelete(collection)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                        <Card
                            className="cursor-pointer bg-transparent border-dashed hover:border-primary transition-colors flex flex-col items-center justify-center min-h-[224px] border-2 border-border"
                            onClick={openNewCollectionDialog}
                        >
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <PlusCircle className="w-12 h-12 text-foreground/80 dark:text-foreground/10" />
                                <p className="text-sm text-foreground/80 dark:text-foreground/10">New Collection</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
             <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the collection "{collectionToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCollection} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

    