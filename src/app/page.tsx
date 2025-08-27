import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your new App!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the homepage. You can start building your application here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
