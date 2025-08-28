'use client';
import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, CheckCircle, BarChart, Clock, Target, Lightbulb, TrendingUp, Cpu, ListChecks, PieChart, Users, GanttChartSquare, ClipboardList, Milestone, LineChart, Banknote, ShieldQuestion, ArrowRight, Flag } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

type GtmReadinessReportProps = {
  result: GtmReadinessOutput;
  onComplete: () => void;
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
  <Card>
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

const SubSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-lg text-primary">{title}</h4>
        <div className="prose prose-sm max-w-none text-muted-foreground mt-2">{children}</div>
    </div>
);


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

  const renderBulletPoints = (text: string) => (
    <ul className="list-disc pl-5 space-y-1">
      {text.split(/\r?\n/).filter(line => line.trim().length > 0).map((line, index) => (
        <li key={index}>{line.replace(/^- /, '')}</li>
      ))}
    </ul>
  );

  return (
    <div className="bg-muted">
      <div className="space-y-6 p-6">
        <div ref={reportRef} className="space-y-6 bg-background p-8 rounded-lg shadow-sm printable-content">
          <div className="text-center pb-4 border-b">
            <h2 className="text-3xl font-bold text-primary">GTM Readiness Assessment Report</h2>
            <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* 1. Executive Summary */}
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

          {/* 2. Top 3 Critical Findings */}
          <Section icon={<Target className="h-8 w-8 text-destructive" />} title="Top 3 Critical Findings">
            {result.top3CriticalFindings.map((finding, index) => (
              <Card key={index} className="break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{finding.findingTitle}</span>
                    <Badge variant={finding.impactLevel === 'High' ? 'destructive' : 'secondary'}>Impact: {finding.impactLevel}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p><strong>Business Impact:</strong> {finding.businessImpact}</p>
                  <p><strong>Current State:</strong> {finding.currentState}</p>
                  <p><strong>Root Cause:</strong> {finding.rootCauseAnalysis}</p>
                  <p><strong>Stakeholder Impact:</strong> {finding.stakeholderImpact}</p>
                  <p><strong>Urgency:</strong> {finding.urgencyRating}</p>
                </CardContent>
              </Card>
            ))}
          </Section>

          {/* 3. Strategic Recommendation Summary */}
          <Section icon={<Lightbulb className="h-8 w-8 text-primary" />} title="Strategic Recommendation Summary">
             <SubSection title="Core Recommendation Themes">
                <p>{result.strategicRecommendationSummary.coreRecommendationThemes}</p>
             </SubSection>
             <SubSection title="Expected Outcomes">
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>Revenue Impact:</strong> {renderBulletPoints(result.strategicRecommendationSummary.expectedOutcomes.revenueImpact)}</div>
                    <div><strong>Efficiency Improvements:</strong> {renderBulletPoints(result.strategicRecommendationSummary.expectedOutcomes.efficiencyImprovements)}</div>
                    <div><strong>Cost Reductions:</strong> {renderBulletPoints(result.strategicRecommendationSummary.expectedOutcomes.costReductions)}</div>
                    <div><strong>Process Optimizations:</strong> {renderBulletPoints(result.strategicRecommendationSummary.expectedOutcomes.processOptimizations)}</div>
                </div>
             </SubSection>
             <SubSection title="ROI Expectations & Timeline">
                <p>{result.strategicRecommendationSummary.roiExpectationsAndTimeline}</p>
             </SubSection>
          </Section>

          {/* 4. Implementation Timeline Overview */}
          <Section icon={<Clock className="h-8 w-8 text-primary" />} title="Implementation Timeline Overview">
            <div className="space-y-4">
              <p><strong>0-30 Days (Immediate Focus/Quick Wins):</strong> {result.implementationTimelineOverview.immediateFocus}</p>
              <p><strong>30-90 Days (Short-term Optimizations):</strong> {result.implementationTimelineOverview.shortTermOptimizations}</p>
              <p><strong>90+ Days (Long-term Strategic Changes):</strong> {result.implementationTimelineOverview.longTermStrategicChanges}</p>
            </div>
          </Section>

          {/* 5. Current State Assessment */}
          <Section icon={<PieChart className="h-8 w-8 text-primary" />} title="Current State Assessment">
            <SubSection title="Readiness Score Breakdown">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center"><span>Overall Readiness Score</span><span className="font-bold">{result.currentStateAssessment.readinessScoreBreakdown.overall.score}%</span></div>
                        <Progress value={result.currentStateAssessment.readinessScoreBreakdown.overall.score} />
                        <p className="text-xs text-muted-foreground">{result.currentStateAssessment.readinessScoreBreakdown.overall.details}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center"><span>Technology Adoption Score</span><span className="font-bold">{result.currentStateAssessment.readinessScoreBreakdown.technologyAdoption.score}%</span></div>
                        <Progress value={result.currentStateAssessment.readinessScoreBreakdown.technologyAdoption.score} />
                        <p className="text-xs text-muted-foreground">{result.currentStateAssessment.readinessScoreBreakdown.technologyAdoption.details}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center"><span>Process Maturity Score</span><span className="font-bold">{result.currentStateAssessment.readinessScoreBreakdown.processMaturity.score}%</span></div>
                        <Progress value={result.currentStateAssessment.readinessScoreBreakdown.processMaturity.score} />
                        <p className="text-xs text-muted-foreground">{result.currentStateAssessment.readinessScoreBreakdown.processMaturity.details}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center"><span>Data Management Score</span><span className="font-bold">{result.currentStateAssessment.readinessScoreBreakdown.dataManagement.score}%</span></div>
                        <Progress value={result.currentStateAssessment.readinessScoreBreakdown.dataManagement.score} />
                        <p className="text-xs text-muted-foreground">{result.currentStateAssessment.readinessScoreBreakdown.dataManagement.details}</p>
                    </div>
                </div>
            </SubSection>
            <SubSection title="Team Capability Readiness">
                <p><strong>Skill Gap Analysis:</strong> {result.currentStateAssessment.teamCapabilityReadiness.skillGapAnalysis}</p>
                <p><strong>Change Management Readiness:</strong> {result.currentStateAssessment.teamCapabilityReadiness.changeManagementReadiness}</p>
            </SubSection>
             <SubSection title="GTM Execution Readiness">
                <p><strong>Market Timing & Competitive Position:</strong> {result.currentStateAssessment.gtmExecutionReadiness.marketTimingAndCompetitivePosition}</p>
            </SubSection>
          </Section>
          
          {/* More sections to be rendered here... this component can get quite large. */}
          {/* To keep it manageable, one could break it down further, but for now this is okay. */}

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
