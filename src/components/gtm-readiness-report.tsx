
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Clock, Target, Lightbulb, TrendingUp, PieChart, ListChecks, GanttChartSquare, Banknote, Flag } from 'lucide-react';
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

const renderContent = (text: string | undefined) => {
    if (!text) return null;

    const processedText = text.replace(/(\S)(##|###)/g, '$1\n$2');
    const lines = processedText.split(/\r?\n/);
    const elements: (JSX.Element | string)[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2">
                    {listItems.map((item, index) => {
                         const parts = item.split(/:(.*)/s);
                         if (parts.length > 1) {
                             return (
                                 <li key={`li-${index}`} className="text-foreground">
                                     <strong>{parts[0]}:</strong>
                                     {parts[1]}
                                 </li>
                             );
                         }
                         return <li key={`li-${index}`} className="text-foreground">{item}</li>;
                    })}
                </ul>
            );
            listItems = [];
        }
    };

    lines.forEach((line, i) => {
        const cleanedLine = line.replace(/`([^`]+)`/g, '$1').replace(/\*\*/g, '');

        if (cleanedLine.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={`h3-${i}`} className="text-foreground text-lg mt-6 mb-3">{cleanedLine.replace(/##\s?/, '')}</h3>);
        } else if (cleanedLine.startsWith('### ')) {
            flushList();
            elements.push(<h4 key={`h4-${i}`} className="text-foreground text-base mt-4 mb-2">{cleanedLine.replace(/###\s?/, '')}</h4>);
        } else if (cleanedLine.startsWith('#### ')) {
            flushList();
            elements.push(<h5 key={`h5-${i}`} className="text-foreground text-sm mt-3 mb-1">{cleanedLine.replace(/####\s?/, '')}</h5>);
        } else if (cleanedLine.trim().startsWith('- ')) {
            const itemText = cleanedLine.trim().substring(2);
            listItems.push(itemText);
        } else if (cleanedLine.trim().length > 0) {
            flushList();
            elements.push(<p key={i} className="text-foreground">{cleanedLine}</p>);
        } else {
             flushList();
             elements.push(<div key={`br-${i}`} className="h-4" />);
        }
    });

    flushList();

    return <div className="prose max-w-none text-foreground space-y-2">{elements}</div>;
};

export const GtmReadinessReport = React.forwardRef<HTMLDivElement, GtmReadinessReportProps>(({ title, result, onComplete }, ref) => {
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
      const input = reportContentRef.current;
      if (!input) {
          console.error("Report content ref not found");
          return;
      }

      html2canvas(input, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: true,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
      }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;
          const imgWidth = pdfWidth;
          const imgHeight = imgWidth / ratio;
          
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;
          }
          pdf.save('GTM-Readiness-Report.pdf');
      });
  };

  React.useImperativeHandle(ref, () => ({
      handlePrint
  }));

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

    const reportSections = [
      { id: 'executive-summary', icon: <BarChart className="h-8 w-8 text-primary" />, title: 'Executive Summary', content: (
          <>
              <div className="grid grid-cols-2 gap-4">
                  <p><strong>Overall Readiness:</strong> <span className="font-bold text-lg text-primary">{result.executiveSummary.overallReadinessScore}%</span></p>
                  <p><strong className="text-primary">Company Profile:</strong> {result.executiveSummary.companyStageAndFte}</p>
                  <p><strong className="text-primary">Industry:</strong> {result.executiveSummary.industrySector}</p>
                  <p><strong className="text-primary">GTM Strategy:</strong> {result.executiveSummary.primaryGtmStrategy}</p>
              </div>
              <Separator />
              <p className="text-foreground">{result.executiveSummary.briefOverviewOfFindings}</p>
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
                  <CardContent className="space-y-3 prose max-w-none text-foreground">
                      <p><strong>Business Impact:</strong> {finding.businessImpact}</p>
                      <p><strong>Current State:</strong> {finding.currentState}</p>
                      <p><strong>Root Cause:</strong> {finding.rootCauseAnalysis}</p>
                      <p><strong>Stakeholder Impact:</strong> {finding.stakeholderImpact}</p>
                      <p><strong>Urgency:</strong> {finding.urgencyRating}</p>
                  </CardContent>
              </Card>
          ))
      )},
      { id: 'recommendation-summary', icon: <Lightbulb className="h-8 w-8 text-primary" />, title: 'Strategic Recommendation Summary', content: renderContent(result.strategicRecommendationSummary) },
      { id: 'timeline-overview', icon: <Clock className="h-8 w-8 text-primary" />, title: 'Implementation Timeline Overview', content: renderContent(result.implementationTimelineOverview) },
      { id: 'current-state-assessment', icon: <PieChart className="h-8 w-8 text-primary" />, title: 'Current State Assessment', content: renderContent(result.currentStateAssessment) },
      { id: 'performance-benchmarking', icon: <TrendingUp className="h-8 w-8 text-primary" />, title: 'Performance Benchmarking', content: renderContent(result.performanceBenchmarking) },
      { id: 'key-findings', icon: <Flag className="h-8 w-8 text-primary" />, title: 'Key Findings & Opportunities', content: renderContent(result.keyFindingsAndOpportunities) },
      { id: 'prioritized-recommendations', icon: <ListChecks className="h-8 w-8 text-primary" />, title: 'Prioritized Recommendations', content: renderContent(result.prioritizedRecommendations) },
      { id: 'implementation-roadmap', icon: <GanttChartSquare className="h-8 w-8 text-primary" />, title: 'Implementation Roadmap', content: renderContent(result.implementationRoadmap) },
      { id: 'investment-roi', icon: <Banknote className="h-8 w-8 text-primary" />, title: 'Investment & ROI Analysis', content: renderContent(result.investmentAndRoiAnalysis) },
      { id: 'next-steps', icon: <ArrowRight className="h-8 w-8 text-primary" />, title: 'Next Steps & Decision Framework', content: renderContent(result.nextStepsAndDecisionFramework) },
    ];

  return (
    <div className="bg-muted" ref={ref}>
       <div ref={reportContentRef}>
        <div className="space-y-6 p-6">
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
      </div>
      <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
          <div className="flex gap-4">
              <Button variant="outline" onClick={onComplete}>Done</Button>
          </div>
      </div>
    </div>
  );
});
GtmReadinessReport.displayName = "GtmReadinessReport";
