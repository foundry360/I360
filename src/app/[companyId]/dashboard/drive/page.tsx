
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
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { File, Folder, FileText, Sheet, Presentation } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('folder')) {
    return <Folder className="h-5 w-5 text-yellow-500" />;
  }
  if (mimeType.includes('spreadsheet')) {
    return <Sheet className="h-5 w-5 text-green-500" />;
  }
  if (mimeType.includes('presentation')) {
    return <Presentation className="h-5 w-5 text-orange-500" />;
  }
  if (mimeType.includes('document')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
};


export default function DrivePage() {
  const [files, setFiles] = React.useState<DriveFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDriveFiles() {
      try {
        setLoading(true);
        const response = await fetch('/api/drive/files');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch files from Google Drive.');
        }
        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
         if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDriveFiles();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Drive</h1>
        <p className="text-muted-foreground">
          A view of your recent files from Google Drive.
        </p>
      </div>
      <Separator />

      {error && (
         <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg">
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Last Modified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length > 0 ? (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="text-center">
                      {getFileIcon(file.mimeType)}
                    </TableCell>
                    <TableCell className="font-medium">
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            {file.name}
                        </a>
                    </TableCell>
                    <TableCell>
                      {new Date(file.modifiedTime).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No files found in your Google Drive.
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
