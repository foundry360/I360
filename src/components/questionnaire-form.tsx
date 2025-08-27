'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const formSchema = z.object({
  gtmStrategy: z.string().min(50, { message: 'Please provide at least 50 characters.' }),
  alignment: z.string().min(50, { message: 'Please provide at least 50 characters.' }),
  techStack: z.string().min(50, { message: 'Please provide at least 50 characters.' }),
  kpis: z.string().min(50, { message: 'Please provide at least 50 characters.' }),
  challenges: z.string().min(50, { message: 'Please provide at least 50 characters.' }),
});

type QuestionnaireFormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

export function QuestionnaireForm({ onSubmit, isLoading }: QuestionnaireFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gtmStrategy: '',
      alignment: '',
      techStack: '',
      kpis: '',
      challenges: '',
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
        <div className="space-y-2 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Unlock Your RevOps Potential
            </h1>
            <p className="text-muted-foreground md:text-xl">
            Answer a few questions about your operations to receive an AI-powered analysis and strategic recommendations.
            </p>
        </div>
      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>RevOps & GTM Questionnaire</CardTitle>
              <CardDescription>
                Provide detailed information for an accurate analysis. The more context you give, the better the recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="gtmStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Go-To-Market (GTM) Strategy</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your target audience, key messaging, and channels..." {...field} rows={5} />
                    </FormControl>
                    <FormDescription>
                      Detail your company's plan for reaching customers and achieving a competitive advantage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Sales & Marketing Alignment</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How do your sales and marketing teams collaborate? What are your shared goals and processes (e.g., lead handoff, SLAs)?" {...field} rows={5}/>
                    </FormControl>
                    <FormDescription>
                        Explain the level of integration and communication between your sales and marketing departments.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Technology Stack</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List your key RevOps tools (CRM, marketing automation, analytics platforms, etc.) and describe how they are integrated." {...field} rows={5}/>
                    </FormControl>
                     <FormDescription>
                        What are the primary software and tools you use to manage revenue operations?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kpis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Key Performance Indicators (KPIs)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What are the main metrics you track to measure success across the customer lifecycle (e.g., MQLs, SQLs, conversion rates, CAC, LTV)?" {...field} rows={5}/>
                    </FormControl>
                    <FormDescription>
                        List the metrics you use to evaluate performance and drive decision-making.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Current Challenges</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What are the biggest obstacles or pain points in your current RevOps processes (e.g., data silos, lead quality, inefficient workflows)?" {...field} rows={5}/>
                    </FormControl>
                    <FormDescription>
                        Describe the main difficulties your team is facing with revenue operations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Get My Analysis'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
