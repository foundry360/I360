
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/app-layout';
import { useUser } from '@/contexts/user-context';
import { updateUserProfile } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const { user, loading: userLoading, reloadUser } = useUser();
  const { toast } = useToast();

  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to update your profile.',
        });
        return;
    }
    setLoading(true);
    try {
        await updateUserProfile(user, {
            displayName: displayName,
        });
        await reloadUser();
        toast({
            title: 'Success!',
            description: 'Your profile has been updated.',
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        toast({
            variant: 'destructive',
            title: 'Update failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
    } finally {
        setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (userLoading) {
      return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              View and edit your personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar
                className="h-24 w-24"
              >
                <AvatarImage
                  src={user?.photoURL ?? ''}
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(123) 456-7890" />
              </div>
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
