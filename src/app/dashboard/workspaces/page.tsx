'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { Header } from '@/components/header';

interface Workspace {
  id: string;
  name: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const fetchWorkspaces = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'companies'));
        const fetchedWorkspaces = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.id,
        }));
        setWorkspaces(fetchedWorkspaces);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName || !db) {
      alert('Workspace name cannot be empty.');
      return;
    }
    const companyId = newWorkspaceName.toLowerCase().replace(/\s+/g, '-');
    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await setDoc(companyDocRef, {
        name: newWorkspaceName,
        createdAt: serverTimestamp(),
      });
      setWorkspaces([...workspaces, { id: companyId, name: newWorkspaceName }]);
      setNewWorkspaceName('');
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleEnterWorkspace = (companyId: string) => {
    router.push(`/${companyId}/dashboard`);
  };
  
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Workspaces</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Workspace</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new workspace</DialogTitle>
                  <DialogDescription>
                    Give your new workspace a name.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. Acme Inc"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleCreateWorkspace}>Create</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <Card key={ws.id}>
                  <CardHeader>
                    <CardTitle>{ws.name}</CardTitle>
                    <CardDescription>ID: {ws.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage members and settings for this workspace.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleEnterWorkspace(ws.id)}>Enter Workspace</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">You are not a member of any workspaces yet.</p>
                <p className="text-muted-foreground mt-2">Create your first workspace to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
