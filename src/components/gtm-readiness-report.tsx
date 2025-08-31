
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Clock, Target, Lightbulb, TrendingUp, PieChart, ListChecks, GanttChartSquare, Banknote, Flag, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type GtmReadinessReportProps = {
  title: string;
  result: GtmReadinessOutput;
  onComplete: () => void;
};

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

const FormattedText = ({ text }: { text?: string }) => {
  if (!text) {
    return null;
  }

  const processedText = text
    .replace(/###\s/g, '\n\n### ')
    .replace(/- \*\*/g, '\n- **')
    .replace(/\*\*([^*]+)\*\*:/g, '\n**$1**:');

  const paragraphs = processedText.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="space-y-2 text-foreground">
      {paragraphs.map((paragraph, pIndex) => {
        if (paragraph.startsWith('### ')) {
          return <h3 key={pIndex} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(4)}</h3>;
        }

        const subheadingMatch = paragraph.match(/^\*\*(.*?):\*\*(.*)/);
        if (subheadingMatch) {
            const title = subheadingMatch[1];
            const content = subheadingMatch[2].trim();
            return (
                <div key={pIndex} className="mt-2">
                    <h4 className="font-semibold text-base">{title}:</h4>
                    {content && <p className="ml-1">{content.replace(/^- /gm, '• ')}</p>}
                </div>
            );
        }
        
        if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
            return (
                <div key={pIndex} className="flex flex-row items-start">
                    <span className="mr-2 mt-1">•</span>
                    <p className="flex-1">{paragraph.substring(2)}</p>
                </div>
            );
        }

        return <p key={pIndex}>{paragraph}</p>;
      })}
    </div>
  );
};


export function GtmReadinessReport({ title, result, onComplete }: GtmReadinessReportProps) {
  
  if (!result || !result.executiveSummary || !result.top3CriticalFindings) {
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

  const handlePdfExport = () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    // Temporarily increase width for better capture
    const originalWidth = reportElement.style.width;
    reportElement.style.width = '1024px';


    html2canvas(reportElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true,
      windowWidth: 1024,
    }).then(canvas => {
      // Restore original width
      reportElement.style.width = originalWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('GTM-Readiness-Report.pdf');
    }).catch(err => {
        console.error("Failed to generate PDF", err);
    });
  };


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
              <FormattedText text={result.executiveSummary.briefOverviewOfFindings} />
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
                  <CardContent className="space-y-3 text-foreground">
                      <div><strong>Business Impact:</strong> <FormattedText text={finding.businessImpact} /></div>
                      <div><strong>Current State:</strong> <FormattedText text={finding.currentState} /></div>
                      <div><strong>Root Cause:</strong> <FormattedText text={finding.rootCauseAnalysis} /></div>
                      <div><strong>Stakeholder Impact:</strong> <FormattedText text={finding.stakeholderImpact} /></div>
                      <div><strong>Urgency:</strong> <FormattedText text={finding.urgencyRating} /></div>
                  </CardContent>
              </Card>
          ))
      )},
      { id: 'recommendation-summary', icon: <Lightbulb className="h-8 w-8 text-primary" />, title: 'Strategic Recommendation Summary', content: <FormattedText text={result.strategicRecommendationSummary} /> },
      { id: 'timeline-overview', icon: <Clock className="h-8 w-8 text-primary" />, title: 'Implementation Timeline Overview', content: <FormattedText text={result.implementationTimelineOverview} /> },
      { id: 'current-state-assessment', icon: <PieChart className="h-8 w-8 text-primary" />, title: 'Current State Assessment', content: <FormattedText text={result.currentStateAssessment} /> },
      { id: 'performance-benchmarking', icon: <TrendingUp className="h-8 w-8 text-primary" />, title: 'Performance Benchmarking', content: <FormattedText text={result.performanceBenchmarking} /> },
      { id: 'key-findings', icon: <Flag className="h-8 w-8 text-primary" />, title: 'Key Findings & Opportunities', content: <FormattedText text={result.keyFindingsAndOpportunities} /> },
      { id: 'prioritized-recommendations', icon: <ListChecks className="h-8 w-8 text-primary" />, title: 'Prioritized Recommendations', content: <FormattedText text={result.prioritizedRecommendations} /> },
      { id: 'implementation-roadmap', icon: <GanttChartSquare className="h-8 w-8 text-primary" />, title: 'Implementation Roadmap', content: <FormattedText text={result.implementationRoadmap} /> },
      { id: 'investment-roi', icon: <Banknote className="h-8 w-8 text-primary" />, title: 'Investment & ROI Analysis', content: <FormattedText text={result.investmentAndRoiAnalysis} /> },
      { id: 'next-steps', icon: <ArrowRight className="h-8 w-8 text-primary" />, title: 'Next Steps & Decision Framework', content: <FormattedText text={result.nextStepsAndDecisionFramework} /> },
    ];

  return (
    <div className="bg-muted">
        <div id="report-content" className="space-y-6 p-6">
            <div className="bg-background p-8 rounded-lg shadow-sm">
                <div className="text-center pb-4 border-b mb-6">
                    <h2 className="text-3xl font-bold text-primary">{title}</h2>
                    <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="space-y-6">
                    {reportSections.map(sec => (
                        <div key={sec.id}>
                            <Section id={sec.id} icon={sec.icon} title={sec.title}>
                                {sec.content}
                            </Section>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
          <div className="flex gap-4">
              <Button variant="outline" onClick={onComplete}>Done</Button>
              <Button onClick={handlePdfExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to PDF
              </Button>
          </div>
      </div>
    </div>
  );
};
GtmReadinessReport.displayName = "GtmReadinessReport";
