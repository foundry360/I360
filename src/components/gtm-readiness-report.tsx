
'use client';
import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, BarChart, Clock, Target, Lightbulb, TrendingUp, Cpu, ListChecks, PieChart, Users, GanttChartSquare, ClipboardList, Milestone, LineChart, Banknote, ShieldQuestion, ArrowRight, Flag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

type GtmReadinessReportProps = {
  result: GtmReadinessOutput;
  onComplete: () => void;
};

// A class component is required by react-to-print for the ref to work reliably.
class ReportToPrint extends React.Component<{ result: GtmReadinessOutput }> {
  render() {
    const { result } = this.props;

    const reportSections = [
      { id: 'executive-summary', icon: <BarChart className="h-8 w-8 text-primary" />, title: 'Executive Summary', content: (
          <>
              <div className="grid grid-cols-2 gap-4">
                  <p><strong>Overall Readiness:</strong> <span className="font-bold text-lg text-primary">{result.executiveSummary.overallReadinessScore}%</span></p>
                  <p><strong>Company Profile:</strong> {result.executiveSummary.companyStageAndFte}</p>
                  <p><strong>Industry:</strong> {result.executiveSummary.industrySector}</p>
                  <p><strong>GTM Strategy:</strong> {result.executiveSummary.primaryGtmStrategy}</p>
              </div>
              <Separator />
              <p className="text-muted-foreground">{result.executiveSummary.briefOverviewOfFindings}</p>
          </>
      )},
      { id: 'critical-findings', icon: <Target className="h-8 w-8 text-destructive" />, title: 'Top 3 Critical Findings', content: (
          result.top3CriticalFindings.map((finding, index) => (
              <Card key={index} className="break-inside-avoid">
                  <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                          <span>{finding.findingTitle}</span>
                          <Badge variant={finding.impactLevel === 'High' ? 'destructive' : 'secondary'}>Impact: {finding.impactLevel}</Badge>
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 prose prose-sm max-w-none text-muted-foreground">
                      <p><strong>Business Impact:</strong> {finding.businessImpact}</p>
                      <p><strong>Current State:</strong> {finding.currentState}</p>
                      <p><strong>Root Cause:</strong> {finding.rootCauseAnalysis}</p>
                      <p><strong>Stakeholder Impact:</strong> {finding.stakeholderImpact}</p>
                      <p><strong>Urgency:</strong> {finding.urgencyRating}</p>
                  </CardContent>
              </Card>
          ))
      )},
      { id: 'recommendation-summary', icon: <Lightbulb className="h-8 w-8 text-primary" />, title: 'Strategic Recommendation Summary', content: renderFormattedString(result.strategicRecommendationSummary) },
      { id: 'timeline-overview', icon: <Clock className="h-8 w-8 text-primary" />, title: 'Implementation Timeline Overview', content: renderFormattedString(result.implementationTimelineOverview) },
      { id: 'current-state-assessment', icon: <PieChart className="h-8 w-8 text-primary" />, title: 'Current State Assessment', content: renderFormattedString(result.currentStateAssessment) },
      { id: 'performance-benchmarking', icon: <TrendingUp className="h-8 w-8 text-primary" />, title: 'Performance Benchmarking', content: renderFormattedString(result.performanceBenchmarking) },
      { id: 'key-findings', icon: <Flag className="h-8 w-8 text-primary" />, title: 'Key Findings & Opportunities', content: renderFormattedString(result.keyFindingsAndOpportunities) },
      { id: 'prioritized-recommendations', icon: <ListChecks className="h-8 w-8 text-primary" />, title: 'Prioritized Recommendations', content: renderFormattedString(result.prioritizedRecommendations) },
      { id: 'implementation-roadmap', icon: <GanttChartSquare className="h-8 w-8 text-primary" />, title: 'Implementation Roadmap', content: renderFormattedString(result.implementationRoadmap) },
      { id: 'investment-roi', icon: <Banknote className="h-8 w-8 text-primary" />, title: 'Investment & ROI Analysis', content: renderFormattedString(result.investmentAndRoiAnalysis) },
      { id: 'next-steps', icon: <ArrowRight className="h-8 w-8 text-primary" />, title: 'Next Steps & Decision Framework', content: renderFormattedString(result.nextStepsAndDecisionFramework) },
    ];
    
    return (
        <div className="bg-background p-8 rounded-lg shadow-sm">
            <div className="text-center pb-4 border-b mb-6 printable-section">
                <h2 className="text-3xl font-bold text-primary">GTM Readiness Assessment Report</h2>
                <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="space-y-6">
                {reportSections.map(sec => (
                    <div key={sec.id} className="printable-section">
                         <Section id={sec.id} icon={sec.icon} title={sec.title}>
                            {sec.content}
                        </Section>
                    </div>
                ))}
            </div>
        </div>
    );
  }
}

const Section: React.FC<{ id: string; icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ id, icon, title, children }) => (
  <Card className="break-inside-avoid" id={id}>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        {icon}
        <span className="text-xl">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pl-12 space-y-4">
      {children}
    </CardContent>
  </Card>
);

const renderFormattedString = (text: string) => {
    const parts = text.split(/(### .*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('### ')) {
            return <h4 key={index} className="font-semibold text-lg text-primary mt-4">{part.substring(4)}</h4>;
        }
        return (
             <ul key={index} className="prose prose-sm max-w-none text-muted-foreground list-disc pl-5 space-y-1">
                {(part || "").split(/\r?\n/).filter(line => line.trim().length > 0 && !line.startsWith('### ')).map((line, i) => (
                    <li key={i}>{line.replace(/^- /, '')}</li>
                ))}
            </ul>
        )
    });
};


export function GtmReadinessReport({ result, onComplete }: GtmReadinessReportProps) {
  const reportRef = React.useRef<ReportToPrint>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setIsExporting(true);
        resolve();
      });
    },
    onAfterPrint: () => {
      setIsExporting(false);
    },
    documentTitle: 'GTM-Readiness-Report',
  });

  if (!result || !result.executiveSummary) {
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

  return (
    <div className="bg-muted">
       <style>{`
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
      `}</style>
      <div className="space-y-6 p-6">
        <ReportToPrint ref={reportRef} result={result} />
        <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm no-print">
            <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={onComplete}>Done</Button>
                <Button onClick={handlePrint} disabled={isExporting}>
                    {isExporting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...</>
                    ) : (
                        <><Download className="mr-2 h-4 w-4" /> Export to PDF</>
                    )}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
