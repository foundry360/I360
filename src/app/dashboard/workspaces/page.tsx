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
import { Header } from '@/components/header';

interface Workspace {
  id: string;
  name: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([
    { id: 'acme-inc', name: 'Acme Inc' },
    { id: 'widgets-co', name: 'Widgets Co' },
  ]);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName) {
      alert('Workspace name cannot be empty.');
      return;
    }
    const companyId = newWorkspaceName.toLowerCase().replace(/\s+/g, '-');
    const newWorkspace: Workspace = {
      id: companyId,
      name: newWorkspaceName,
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
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
                <p className="text-muted-foreground">You have no workspaces yet.</p>
                <p className="text-muted-foreground mt-2">Create your first workspace to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
