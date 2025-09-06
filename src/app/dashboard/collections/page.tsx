
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
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
                <div>
                    <h1 className="text-2xl font-bold">User Story Collections</h1>
                    <p className="text-muted-foreground">
                        Create and manage curated collections of user stories to quickly populate engagement backlogs
                    </p>
                </div>
                <Separator />
                 <div className="flex justify-end items-center">
                     <Button onClick={openNewCollectionDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Collection
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map(collection => (
                            <Card key={collection.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{collection.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
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
                        ))}
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
