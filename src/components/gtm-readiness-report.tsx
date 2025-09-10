
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Clock, Target, Lightbulb, TrendingUp, PieChart, ListChecks, GanttChartSquare, Banknote, Flag, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type GtmReadinessReportProps = {
  title: string;
  result: GtmReadinessOutput;
  onComplete: () => void;
};

export function GtmReadinessReport({ title, result, onComplete }: GtmReadinessReportProps) {

  if (!result || !result.fullReport) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <h2 className="text-xl font-semibold">Report Not Available</h2>
            <p className="text-muted-foreground text-center">
                The data for this assessment report is incomplete or could not be loaded.
            </p>
            <Button onClick={onComplete}>Close</Button>
        </div>
    );
  }

  const handleExport = () => {
    let textContent = `GTM Readiness Report: ${title}\n`;
    textContent += `Generated on ${new Date().toLocaleDateString()}\n`;
    textContent += '============================================\n\n';
    textContent += result.fullReport;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="bg-muted">
      <div className="overflow-y-auto">
        <div id="report-content" className="space-y-6 p-6">
            <div className="bg-background p-8 rounded-lg shadow-sm prose prose-zinc dark:prose-invert max-w-none">
                <div className="text-center pb-4 border-b mb-6 not-prose">
                    <h1 className="text-3xl font-bold text-primary">{title}</h1>
                    <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between items-center not-prose mb-6">
                   <Card className="p-4 w-1/4 text-center">
                      <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-base font-medium text-muted-foreground">Readiness Score</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                          <p className="text-4xl font-bold text-primary">{result.executiveSummary.overallReadinessScore}%</p>
                      </CardContent>
                    </Card>
                    <Card className="p-4 w-1/4 text-center">
                      <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-base font-medium text-muted-foreground">GTM Strategy</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                          <p className="text-2xl font-semibold">{result.executiveSummary.primaryGtmStrategy}</p>
                      </CardContent>
                    </Card>
                     <Card className="p-4 w-1/4 text-center">
                      <CardHeader className="p-0 pb-2">
                          <CardTitle className="text-base font-medium text-muted-foreground">Company Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                          <p className="text-2xl font-semibold">{result.executiveSummary.companyStageAndFte}</p>
                      </CardContent>
                    </Card>
                </div>
                 <h2 className="not-prose text-2xl font-bold mb-4">Critical Findings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
                  {result.top3CriticalFindings.map((finding, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-base">
                                <span>{finding.findingTitle}</span>
                                <Badge variant={finding.impactLevel === 'High' ? 'destructive' : 'secondary'}>{finding.impactLevel}</Badge>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                  ))}
                </div>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.fullReport}
                </ReactMarkdown>
            </div>
        </div>
      </div>
      <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
          <div className="flex gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={onComplete}>Done</Button>
          </div>
      </div>
    </div>
  );
};
GtmReadinessReport.displayName = "GtmReadinessReport";
