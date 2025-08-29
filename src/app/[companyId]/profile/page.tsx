
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
import { updateUserProfile, signInWithGoogle } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CompanyProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setAvatarPreview(user.photoURL || null);
      
      // Check if the user has a Google connection
      const googleProvider = user.providerData.find(
        (p) => p.providerId === 'google.com'
      );
      setIsGoogleConnected(!!googleProvider);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
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
            photoFile: avatarFile || undefined,
        });
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
        // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setAvatarFile(null); 
    }
  };
  
  const handleConnectGoogle = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Success!',
        description: 'Your Google account has been connected.',
      });
      setIsGoogleConnected(true);
    } catch (error) {
      console.error('Error connecting Google account:', error);
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: 'Could not connect your Google account.',
      });
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
              <Avatar
                className="h-24 w-24 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <AvatarImage
                  src={avatarPreview ?? ''}
                  data-ai-hint="user avatar"
                />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                 <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                    Change Avatar
                 </Button>
                 <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
              </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected third-party accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h3 className="font-medium">Google Workspace</h3>
                    <p className="text-sm text-muted-foreground">
                        {isGoogleConnected ? "Connected" : "Not Connected"}
                    </p>
                </div>
                {isGoogleConnected ? (
                    <Button variant="destructive" disabled>Disconnect</Button>
                ) : (
                    <Button onClick={handleConnectGoogle}>Connect</Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
