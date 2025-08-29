
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, BarChart, Clock, Target, Lightbulb, TrendingUp, Cpu, ListChecks, PieChart, Users, GanttChartSquare, ClipboardList, Milestone, LineChart, Banknote, ShieldQuestion, ArrowRight, Flag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


type GtmReadinessReportProps = {
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

const renderFormattedString = (text: string) => {
    if (!text) return null;
    const cleanedText = text.replace(/\*/g, ''); // Remove all asterisks
    const parts = cleanedText.split(/(### .*)/g);
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


export const GtmReadinessReport = React.forwardRef<HTMLDivElement, GtmReadinessReportProps>(({ result, onComplete }, ref) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrint = () => {
    setIsExporting(true);

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 40;
    let y = margin;

    const addPageIfNeeded = (spaceNeeded: number) => {
        if (y + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(111, 71, 251); // primary color
    doc.text('GTM Readiness Assessment Report', pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // muted-foreground
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 30;

    const renderSection = (title: string, content: () => void) => {
        addPageIfNeeded(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(111, 71, 251);
        doc.text(title, margin, y);
        y += 20;
        doc.setDrawColor(226, 232, 240); // border color
        doc.line(margin, y - 10, pageWidth - margin, y - 10);
        content();
        y += 20; // Space after section
    };
    
    const renderMarkdown = (text: string) => {
        if(!text) return;
        const cleanedText = text.replace(/\*/g, '');
        const lines = cleanedText.split(/\r?\n/).filter(line => line.trim().length > 0);
        lines.forEach(line => {
             if (line.startsWith('### ')) {
                addPageIfNeeded(20);
                y += 10; // Extra space before subheading
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(111, 71, 251);
                const splitTitle = doc.splitTextToSize(line.substring(4), pageWidth - margin * 2);
                doc.text(splitTitle, margin, y);
                y += (splitTitle.length * 12) + 5;

            } else {
                addPageIfNeeded(15);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(51, 65, 85); // foreground
                const bullet = '\u2022';
                const content = line.replace(/^- /, '');
                const splitText = doc.splitTextToSize(content, pageWidth - margin * 2 - 20); // Indent for bullet
                doc.text(`${bullet}`, margin, y, { baseline: 'top' });
                doc.text(splitText, margin + 20, y);
                y += splitText.length * 12;
            }
        });
    };

    // Executive Summary
    renderSection('Executive Summary', () => {
        autoTable(doc, {
            startY: y,
            theme: 'plain',
            body: [
                [{content: `Overall Readiness: ${result.executiveSummary.overallReadinessScore}%`, styles: {fontStyle: 'bold', fontSize: 12}}],
                [`Company Profile: ${result.executiveSummary.companyStageAndFte.replace(/\*/g, '')}`],
                [`Industry: ${result.executiveSummary.industrySector.replace(/\*/g, '')}`],
                [`GTM Strategy: ${result.executiveSummary.primaryGtmStrategy.replace(/\*/g, '')}`],
            ],
            didDrawPage: (data) => { y = data.cursor?.y || y; }
        });
         y = (doc as any).lastAutoTable.finalY + 10;

        addPageIfNeeded(20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(result.executiveSummary.briefOverviewOfFindings.replace(/\*/g, ''), pageWidth - margin * 2);
        doc.text(splitText, margin, y);
        y += splitText.length * 12;
    });

    // Top 3 Critical Findings
    renderSection('Top 3 Critical Findings', () => {
        result.top3CriticalFindings.forEach(finding => {
            const tableBody = [
                [{ content: `Business Impact`, styles: { fontStyle: 'bold' } }, finding.businessImpact.replace(/\*/g, '')],
                [{ content: `Current State`, styles: { fontStyle: 'bold' } }, finding.currentState.replace(/\*/g, '')],
                [{ content: `Root Cause`, styles: { fontStyle: 'bold' } }, finding.rootCauseAnalysis.replace(/\*/g, '')],
                [{ content: `Stakeholder Impact`, styles: { fontStyle: 'bold' } }, finding.stakeholderImpact.replace(/\*/g, '')],
                [{ content: `Urgency`, styles: { fontStyle: 'bold' } }, finding.urgencyRating.replace(/\*/g, '')],
            ];
            addPageIfNeeded(100);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42); // card-foreground
            doc.text(finding.findingTitle.replace(/\*/g, ''), margin, y);
            y += 15;
            autoTable(doc, {
                startY: y,
                head: [[`Impact: ${finding.impactLevel}`]],
                body: tableBody,
                theme: 'grid',
                headStyles: {
                    fillColor: finding.impactLevel === 'High' ? [239, 68, 68] : [241, 245, 249],
                    textColor: finding.impactLevel === 'High' ? [255,255,255] : [15, 23, 42],
                },
                didDrawPage: (data) => { y = data.cursor?.y || y; }
            });
            y = (doc as any).lastAutoTable.finalY + 20;
        });
    });

    renderSection('Strategic Recommendation Summary', () => renderMarkdown(result.strategicRecommendationSummary));
    renderSection('Implementation Timeline Overview', () => renderMarkdown(result.implementationTimelineOverview));
    renderSection('Current State Assessment', () => renderMarkdown(result.currentStateAssessment));
    renderSection('Performance Benchmarking', () => renderMarkdown(result.performanceBenchmarking));
    renderSection('Key Findings & Opportunities', () => renderMarkdown(result.keyFindingsAndOpportunities));
    renderSection('Prioritized Recommendations', () => renderMarkdown(result.prioritizedRecommendations));
    renderSection('Implementation Roadmap', () => renderMarkdown(result.implementationRoadmap));
    renderSection('Investment & ROI Analysis', () => renderMarkdown(result.investmentAndRoiAnalysis));
    renderSection('Next Steps & Decision Framework', () => renderMarkdown(result.nextStepsAndDecisionFramework));

    doc.save('GTM-Readiness-Report.pdf');
    setIsExporting(false);
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
                  <p><span className="font-semibold">Overall Readiness:</span> <span className="font-bold text-lg text-primary">{result.executiveSummary.overallReadinessScore}%</span></p>
                  <p><span className="font-semibold">Company Profile:</span> {result.executiveSummary.companyStageAndFte.replace(/\*/g, '')}</p>
                  <p><span className="font-semibold">Industry:</span> {result.executiveSummary.industrySector.replace(/\*/g, '')}</p>
                  <p><span className="font-semibold">GTM Strategy:</span> {result.executiveSummary.primaryGtmStrategy.replace(/\*/g, '')}</p>
              </div>
              <Separator />
              <p className="text-muted-foreground">{result.executiveSummary.briefOverviewOfFindings.replace(/\*/g, '')}</p>
          </>
      )},
      { id: 'critical-findings', icon: <Target className="h-8 w-8 text-destructive" />, title: 'Top 3 Critical Findings', content: (
          result.top3CriticalFindings.map((finding, index) => (
              <Card key={index} className="break-inside-avoid">
                  <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                          <span>{finding.findingTitle.replace(/\*/g, '')}</span>
                          <Badge variant={finding.impactLevel === 'High' ? 'destructive' : 'secondary'}>Impact: {finding.impactLevel}</Badge>
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 prose prose-sm max-w-none text-muted-foreground">
                      <p><span className="font-semibold">Business Impact:</span> {finding.businessImpact.replace(/\*/g, '')}</p>
                      <p><span className="font-semibold">Current State:</span> {finding.currentState.replace(/\*/g, '')}</p>
                      <p><span className="font-semibold">Root Cause:</span> {finding.rootCauseAnalysis.replace(/\*/g, '')}</p>
                      <p><span className="font-semibold">Stakeholder Impact:</span> {finding.stakeholderImpact.replace(/\*/g, '')}</p>
                      <p><span className="font-semibold">Urgency:</span> {finding.urgencyRating.replace(/\*/g, '')}</p>
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
    <div className="bg-muted" ref={ref}>
      <div className="space-y-6 p-6">
        <div className="bg-background p-8 rounded-lg shadow-sm">
            <div className="text-center pb-4 border-b mb-6">
                <h2 className="text-3xl font-bold text-primary">GTM Readiness Assessment Report</h2>
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
        <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
            <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={onComplete}>Done</Button>
            </div>
        </div>
      </div>
    </div>
  );
});
GtmReadinessReport.displayName = "GtmReadinessReport";
