'use client';
import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
  <Card className="break-inside-avoid">
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
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportToPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    const reportElement = reportRef.current;
    
    // Add header
    const header = "PROPRIETARY & CONFIDENTIAL";
    pdf.setFontSize(10);
    pdf.text(header, margin, margin);

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = imgWidth / pdfWidth;
    const scaledHeight = imgHeight / ratio;

    let heightLeft = scaledHeight;
    let position = 40; // Start below header
    const pageBuffer = 20;

    pdf.addImage(imgData, 'PNG', margin, position, pdfWidth - (margin * 2), scaledHeight);
    heightLeft -= (pdfHeight - position - pageBuffer);

    let pageCount = 1;
    while (heightLeft > 0) {
      pageCount++;
      position = heightLeft - scaledHeight - pageBuffer;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth - (margin * 2), scaledHeight);
      heightLeft -= (pdfHeight - pageBuffer);
    }
    
    // Add footer to all pages
    for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i}`, pdfWidth - margin - 20, pdfHeight - margin);
    }

    pdf.save('gtm-readiness-report.pdf');
    setIsExporting(false);
  };

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
      <div className="space-y-6 p-6">
        <div ref={reportRef} className="space-y-6 bg-background p-8 rounded-lg shadow-sm printable-content">
          <div className="text-center pb-4 border-b">
            <h2 className="text-3xl font-bold text-primary">GTM Readiness Assessment Report</h2>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <Section icon={<BarChart className="h-8 w-8 text-primary" />} title="Executive Summary">
            <div className="grid grid-cols-2 gap-4">
                <p><strong>Overall Readiness:</strong> <span className="font-bold text-lg text-primary">{result.executiveSummary.overallReadinessScore}%</span></p>
                <p><strong>Company Profile:</strong> {result.executiveSummary.companyStageAndFte}</p>
                <p><strong>Industry:</strong> {result.executiveSummary.industrySector}</p>
                <p><strong>GTM Strategy:</strong> {result.executiveSummary.primaryGtmStrategy}</p>
            </div>
            <Separator />
            <p className="text-muted-foreground">{result.executiveSummary.briefOverviewOfFindings}</p>
          </Section>

          <Section icon={<Target className="h-8 w-8 text-destructive" />} title="Top 3 Critical Findings">
            {result.top3CriticalFindings.map((finding, index) => (
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
            ))}
          </Section>

          <Section icon={<Lightbulb className="h-8 w-8 text-primary" />} title="Strategic Recommendation Summary">
             {renderFormattedString(result.strategicRecommendationSummary)}
          </Section>

          <Section icon={<Clock className="h-8 w-8 text-primary" />} title="Implementation Timeline Overview">
            {renderFormattedString(result.implementationTimelineOverview)}
          </Section>
          
          <Section icon={<PieChart className="h-8 w-8 text-primary" />} title="Current State Assessment">
            {renderFormattedString(result.currentStateAssessment)}
          </Section>

           <Section icon={<TrendingUp className="h-8 w-8 text-primary" />} title="Performance Benchmarking">
            {renderFormattedString(result.performanceBenchmarking)}
          </Section>

          <Section icon={<Flag className="h-8 w-8 text-primary" />} title="Key Findings & Opportunities">
            {renderFormattedString(result.keyFindingsAndOpportunities)}
          </Section>
          
          <Section icon={<ListChecks className="h-8 w-8 text-primary" />} title="Prioritized Recommendations">
            {renderFormattedString(result.prioritizedRecommendations)}
          </Section>
          
          <Section icon={<GanttChartSquare className="h-8 w-8 text-primary" />} title="Implementation Roadmap">
            {renderFormattedString(result.implementationRoadmap)}
          </Section>

          <Section icon={<Banknote className="h-8 w-8 text-primary" />} title="Investment & ROI Analysis">
            {renderFormattedString(result.investmentAndRoiAnalysis)}
          </Section>

          <Section icon={<ArrowRight className="h-8 w-8 text-primary" />} title="Next Steps & Decision Framework">
            {renderFormattedString(result.nextStepsAndDecisionFramework)}
          </Section>
        </div>
        <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-b-lg shadow-sm">
            <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={onComplete}>Done</Button>
                <Button onClick={handleExportToPdf} disabled={isExporting}>
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
