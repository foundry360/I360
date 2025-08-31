
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                    <Construction className="h-12 w-12 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="text-2xl">Projects Page</CardTitle>
                <CardDescription className="mt-2">
                    This section is currently under development. Please check back later!
                </CardDescription>
            </CardContent>
        </Card>
    </div>
  );
}
