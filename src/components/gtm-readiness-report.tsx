
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Clock, Target, Lightbulb, TrendingUp, PieChart, ListChecks, GanttChartSquare, Banknote, Flag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
            elements.push(<h3 key={`h3-${i}`} className="text-foreground text-lg font-semibold mt-6 mb-3">{cleanedLine.replace(/##\s?/, '')}</h3>);
        } else if (cleanedLine.startsWith('### ')) {
            flushList();
            elements.push(<h4 key={`h4-${i}`} className="text-foreground text-base font-semibold mt-4 mb-2">{cleanedLine.replace(/###\s?/, '')}</h4>);
        } else if (cleanedLine.startsWith('#### ')) {
            flushList();
            elements.push(<h5 key={`h5-${i}`} className="text-foreground text-sm font-semibold mt-3 mb-1">{cleanedLine.replace(/####\s?/, '')}</h5>);
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

  const handlePrint = () => {
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
    
    // Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(111, 71, 251); 
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 40;

    const renderMarkdownToPdf = (text: string) => {
        if (!text) return;
        const lines = text.replace(/`([^`]+)`/g, '$1').replace(/\*\*/g, '').replace(/(\S)(##|###)/g, '$1\n$2').split(/\r?\n/);
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('## ')) {
                flushList();
                y += 10;
                addPageIfNeeded(20);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42); 
                const splitTitle = doc.splitTextToSize(trimmedLine.substring(3), pageWidth - margin * 2);
                doc.text(splitTitle, margin, y);
                y += (splitTitle.length * 14) + 6;
            } else if (trimmedLine.startsWith('### ')) {
                flushList();
                y += 8;
                addPageIfNeeded(18);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(15, 23, 42);
                const splitTitle = doc.splitTextToSize(trimmedLine.substring(4), pageWidth - margin * 2);
                doc.text(splitTitle, margin, y);
                y += (splitTitle.length * 12) + 5;
            } else if (trimmedLine.startsWith('- ')) {
                listBuffer.push(trimmedLine.substring(2));
            } else if (trimmedLine.length > 0) {
                flushList();
                addPageIfNeeded(15);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(51, 65, 85);
                const splitText = doc.splitTextToSize(trimmedLine, pageWidth - margin * 2);
                doc.text(splitText, margin, y);
                y += (splitText.length * 10) + 5;
            } else {
                flushList();
                y += 6; 
            }
        });
        flushList(); // Make sure any remaining list items are printed
    };
    
    let listBuffer: string[] = [];

    const flushList = () => {
        if (listBuffer.length === 0) return;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);

        listBuffer.forEach(item => {
            const bullet = '\u2022';
            const itemParts = item.split(/:(.*)/s);
            const indent = margin + 15;
            const textWidth = pageWidth - indent - margin;

            addPageIfNeeded(15);
            doc.text(bullet, margin + 5, y);

            if (itemParts.length > 1) {
                const label = itemParts[0] + ':';
                const value = itemParts[1].trim();

                doc.setFont('helvetica', 'bold');
                doc.text(label, indent, y, { maxWidth: textWidth });
                
                const labelWidth = doc.getTextWidth(label);
                const remainingWidth = textWidth - labelWidth - 5; // 5 for spacing

                doc.setFont('helvetica', 'normal');
                if (remainingWidth > 10) { // Check if there's enough space on the same line
                    const splitValue = doc.splitTextToSize(value, remainingWidth);
                    doc.text(splitValue, indent + labelWidth + 5, y);
                    y += (splitValue.length * 10) + 5;
                } else { // If not enough space, move value to next line
                    y += 12; 
                    addPageIfNeeded(15);
                    const splitValue = doc.splitTextToSize(value, textWidth);
                    doc.text(splitValue, indent, y);
                    y += (splitValue.length * 10) + 5;
                }
            } else {
                 doc.setFont('helvetica', 'normal');
                 const splitItem = doc.splitTextToSize(item, textWidth);
                 doc.text(splitItem, indent, y);
                 y += (splitItem.length * 10) + 5;
            }
        });
        listBuffer = [];
        y += 5;
    };


    const renderSection = (title: string, content: () => void) => {
        flushList();
        y += 10;
        addPageIfNeeded(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(111, 71, 251);
        doc.text(title, margin, y);
        y += 15;
        doc.setDrawColor(226, 232, 240); 
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;
        content();
        y += 20; 
    };
    
    // --- RENDER SECTIONS ---

    renderSection('Executive Summary', () => {
        autoTable(doc, {
            startY: y,
            theme: 'plain',
            body: [
                [{content: `Overall Readiness: ${result.executiveSummary.overallReadinessScore}%`, styles: {fontStyle: 'bold', fontSize: 12, textColor: [111,71,251]}}],
                [`Company Profile: ${result.executiveSummary.companyStageAndFte}`],
                [`Industry: ${result.executiveSummary.industrySector}`],
                [`GTM Strategy: ${result.executiveSummary.primaryGtmStrategy}`],
            ],
            styles: {
                font: 'helvetica',
                fontSize: 10,
                textColor: [51, 65, 85]
            },
            didDrawPage: (data) => { y = data.cursor?.y || y; }
        });
        y = (doc as any).lastAutoTable.finalY + 10;
        
        addPageIfNeeded(20);
        renderMarkdownToPdf(result.executiveSummary.briefOverviewOfFindings);
    });

    renderSection('Top 3 Critical Findings', () => {
        result.top3CriticalFindings.forEach(finding => {
            const tableBody = [
                [{ content: `Business Impact`, styles: { fontStyle: 'bold' } }, { content: finding.businessImpact }],
                [{ content: `Current State`, styles: { fontStyle: 'bold' } }, { content: finding.currentState }],
                [{ content: `Root Cause`, styles: { fontStyle: 'bold' } }, { content: finding.rootCauseAnalysis }],
                [{ content: `Stakeholder Impact`, styles: { fontStyle: 'bold' } }, { content: finding.stakeholderImpact }],
                [{ content: `Urgency`, styles: { fontStyle: 'bold' } }, { content: finding.urgencyRating }],
            ];
            
            y += 10;
            addPageIfNeeded(120);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42); 
            const splitTitle = doc.splitTextToSize(finding.findingTitle, pageWidth - margin * 2);
            doc.text(splitTitle, margin, y);
            y += (splitTitle.length * 12) + 10;

            autoTable(doc, {
                startY: y,
                head: [[`Impact: ${finding.impactLevel}`]],
                body: tableBody,
                theme: 'grid',
                headStyles: {
                    fillColor: finding.impactLevel === 'High' ? [220, 38, 38] : finding.impactLevel === 'Medium' ? [245, 158, 11] : [241, 245, 249],
                    textColor: finding.impactLevel === 'High' || finding.impactLevel === 'Medium' ? [255,255,255] : [15, 23, 42],
                    fontStyle: 'bold'
                },
                 columnStyles: {
                    0: { cellWidth: 120, fontStyle: 'bold' },
                },
                didDrawPage: (data) => { y = data.cursor?.y || y; }
            });
            y = (doc as any).lastAutoTable.finalY + 20;
        });
    });

    renderSection('Strategic Recommendation Summary', () => renderMarkdownToPdf(result.strategicRecommendationSummary));
    renderSection('Implementation Timeline Overview', () => renderMarkdownToPdf(result.implementationTimelineOverview));
    renderSection('Current State Assessment', () => renderMarkdownToPdf(result.currentStateAssessment));
    renderSection('Performance Benchmarking', () => renderMarkdownToPdf(result.performanceBenchmarking));
    renderSection('Key Findings & Opportunities', () => renderMarkdownToPdf(result.keyFindingsAndOpportunities));
    renderSection('Prioritized Recommendations', () => renderMarkdownToPdf(result.prioritizedRecommendations));
    renderSection('Implementation Roadmap', () => renderMarkdownToPdf(result.implementationRoadmap));
    renderSection('Investment & ROI Analysis', () => renderMarkdownToPdf(result.investmentAndRoiAnalysis));
    renderSection('Next Steps & Decision Framework', () => renderMarkdownToPdf(result.nextStepsAndDecisionFramework));

    doc.save('GTM-Readiness-Report.pdf');
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

    