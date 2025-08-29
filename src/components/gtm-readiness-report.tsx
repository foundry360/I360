
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, BarChart, Clock, Target, Lightbulb, TrendingUp, Cpu, ListChecks, PieChart, Users, GanttChartSquare, ClipboardList, Milestone, LineChart, Banknote, ShieldQuestion, ArrowRight, Flag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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


export const GtmReadinessReport = React.forwardRef<HTMLDivElement, GtmReadinessReportProps>(({ result, onComplete }, ref) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handlePrint = async () => {
    setIsExporting(true);

    const pdf = new jsPDF('p', 'pt', 'a4');
    
    const styles = `
      <style>
        body { font-family: 'Helvetica', 'sans-serif'; font-size: 10px; color: #333; }
        h1 { font-size: 24px; color: #6f47fb; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 16px; color: #6f47fb; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
        h3 { font-size: 14px; color: #333; font-weight: bold; margin-top: 15px; }
        h4 { font-size: 12px; color: #6f47fb; font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
        p, li { margin-bottom: 8px; line-height: 1.4; color: #4a4a4a; }
        ul { padding-left: 20px; list-style-position: outside; }
        .section { margin-bottom: 20px; page-break-inside: avoid; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
        .finding-card { border: 1px solid #eee; border-radius: 5px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; background-color: #eee; color: #333; font-size: 10px; font-weight: bold; }
        .badge-destructive { background-color: #ffdddd; color: #b00020; }
        .text-muted { color: #666; }
      </style>
    `;

    const formatMarkdownStringForPdf = (text: string) => {
        if (!text) return '';
        return text
            .split(/(### .*)/g)
            .map(part => {
                if (part.startsWith('### ')) {
                    return `<h4>${part.substring(4)}</h4>`;
                }
                 const listItems = part.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.startsWith('### '))
                    .map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
                return listItems ? `<ul>${listItems}</ul>` : '';
            }).join('');
    };
    
    const reportHtml = `
      <html>
        <head>${styles}</head>
        <body>
          <h1>GTM Readiness Assessment Report</h1>
          <p style="text-align: center; color: #888;">Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="section">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
              <p><strong>Overall Readiness:</strong> ${result.executiveSummary.overallReadinessScore}%</p>
              <p><strong>Company Profile:</strong> ${result.executiveSummary.companyStageAndFte}</p>
              <p><strong>Industry:</strong> ${result.executiveSummary.industrySector}</p>
              <p><strong>GTM Strategy:</strong> ${result.executiveSummary.primaryGtmStrategy}</p>
            </div>
            <hr/>
            <p>${result.executiveSummary.briefOverviewOfFindings}</p>
          </div>

          <div class="section">
            <h2>Top 3 Critical Findings</h2>
            ${result.top3CriticalFindings.map(finding => `
              <div class="finding-card">
                <h3>${finding.findingTitle} <span class="badge ${finding.impactLevel === 'High' ? 'badge-destructive' : ''}">Impact: ${finding.impactLevel}</span></h3>
                <p><strong>Business Impact:</strong> ${finding.businessImpact}</p>
                <p><strong>Current State:</strong> ${finding.currentState}</p>
                <p><strong>Root Cause:</strong> ${finding.rootCauseAnalysis}</p>
                <p><strong>Stakeholder Impact:</strong> ${finding.stakeholderImpact}</p>
                <p><strong>Urgency:</strong> ${finding.urgencyRating}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Strategic Recommendation Summary</h2>
            ${formatMarkdownStringForPdf(result.strategicRecommendationSummary)}
          </div>
          <div class="section">
            <h2>Implementation Timeline Overview</h2>
            ${formatMarkdownStringForPdf(result.implementationTimelineOverview)}
          </div>
          <div class="section">
            <h2>Current State Assessment</h2>
            ${formatMarkdownStringForPdf(result.currentStateAssessment)}
          </div>
          <div class="section">
            <h2>Performance Benchmarking</h2>
            ${formatMarkdownStringForPdf(result.performanceBenchmarking)}
          </div>
          <div class="section">
            <h2>Key Findings & Opportunities</h2>
            ${formatMarkdownStringForPdf(result.keyFindingsAndOpportunities)}
          </div>
          <div class="section">
            <h2>Prioritized Recommendations</h2>
            ${formatMarkdownStringForPdf(result.prioritizedRecommendations)}
          </div>
          <div class="section">
            <h2>Implementation Roadmap</h2>
            ${formatMarkdownStringForPdf(result.implementationRoadmap)}
          </div>
           <div class="section">
            <h2>Investment & ROI Analysis</h2>
            ${formatMarkdownStringForPdf(result.investmentAndRoiAnalysis)}
          </div>
           <div class="section">
            <h2>Next Steps & Decision Framework</h2>
            ${formatMarkdownStringForPdf(result.nextStepsAndDecisionFramework)}
          </div>
        </body>
      </html>
    `;

    await pdf.html(reportHtml, {
      callback: function (doc) {
        doc.save('GTM-Readiness-Report.pdf');
        setIsExporting(false);
      },
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      width: 515, // A4 width in points minus margins
      windowWidth: 700 // Larger virtual window to help with layout
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
                      <p><strong>Current State:</strong> ${finding.currentState}</p>
                      <p><strong>Root Cause:</strong> ${finding.rootCauseAnalysis}</p>
                      <p><strong>Stakeholder Impact:</strong> ${finding.stakeholderImpact}</p>
                      <p><strong>Urgency:</strong> ${finding.urgencyRating}</p>
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
});
GtmReadinessReport.displayName = "GtmReadinessReport";
