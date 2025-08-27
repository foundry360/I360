'use client';

import { type AnalysisResult } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaturityVisualization } from '@/components/maturity-visualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BrainCircuit, CheckCircle, Flame, Target } from 'lucide-react';

type ReportDisplayProps = {
  result: AnalysisResult;
  onReset: () => void;
};

function formatText(text: string) {
    return text.split('\n').map((line, index) => {
      // Remove numbering like "1. " or "- "
      line = line.replace(/^(?:\d+\.\s*|-\s*)/, '');
      if (line.trim() === '') return null;
      return (
        <li key={index} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <span>{line}</span>
        </li>
      );
    });
  }

export function ReportDisplay({ result, onReset }: ReportDisplayProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
            Your RevOps Analysis Report
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Here's your personalized assessment and actionable growth plan.
          </p>
        </div>
        <Button onClick={onReset} variant="outline">
          Start New Analysis
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/80">{result.executiveSummary.executiveSummary}</p>
        </CardContent>
      </Card>

      <MaturityVisualization
        stage={result.maturityAnalysis.maturityStage}
        score={result.maturityAnalysis.readinessScore}
      />

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="recommendations" className="py-2">Actionable Steps</TabsTrigger>
          <TabsTrigger value="strategic" className="py-2">Strategic Focus</TabsTrigger>
          <TabsTrigger value="ai" className="py-2">AI Opportunities</TabsTrigger>
          <TabsTrigger value="impact" className="py-2">Expected Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="w-6 h-6 text-primary" />Actionable Recommendations</CardTitle>
              <CardDescription>Your prioritized list of next steps to improve RevOps maturity.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground/90">
                {formatText(result.recommendations.actionableRecommendations)}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="strategic">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-6 h-6 text-primary" />Strategic Focus Areas</CardTitle>
              <CardDescription>Key areas to concentrate your efforts for maximum impact.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground/90">
                {formatText(result.recommendations.strategicFocusAreas)}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="shadow-md">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" />AI Integration Opportunities</CardTitle>
                    <CardDescription>Leverage AI and automation to solve specific challenges.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ul className="space-y-3 text-foreground/90">
                        {formatText(result.recommendations.aiIntegrationOpportunities)}
                    </ul>
                    </CardContent>
                </Card>
                <Card className="shadow-md">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-accent" />Suggested AI Automations</CardTitle>
                    <CardDescription>Further opportunities to automate your RevOps processes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ul className="space-y-3 text-foreground/90">
                        {formatText(result.aiOpportunities.opportunities)}
                    </ul>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="impact">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Flame className="w-6 h-6 text-primary" />Expected Impact</CardTitle>
              <CardDescription>The potential outcomes of implementing these recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-foreground/90">
                {formatText(result.recommendations.expectedImpact)}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
