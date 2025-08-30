
'use client';
import * as React from 'react';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Clock, Target, Lightbulb, TrendingUp, PieChart, ListChecks, GanttChartSquare, Banknote, Flag, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

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

const generateMarkdownExport = (title: string, result: GtmReadinessOutput): string => {
  let markdown = `# ${title}\n\n`;
  markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`;

  const processTextForMarkdown = (text: string | undefined): string => {
    if (!text) return '';
    return text.replace(/### (.*?)\n/g, '### $1\n').replace(/- \*\*(.*?)\*\*:(.*?)(\n|$)/g, '- **$1**:$2\n');
  };

  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `**Overall Readiness:** ${result.executiveSummary.overallReadinessScore}%\n`;
  markdown += `**Company Profile:** ${result.executiveSummary.companyStageAndFte}\n`;
  markdown += `**Industry:** ${result.executiveSummary.industrySector}\n`;
  markdown += `**GTM Strategy:** ${result.executiveSummary.primaryGtmStrategy}\n\n`;
  markdown += `${processTextForMarkdown(result.executiveSummary.briefOverviewOfFindings)}\n\n`;

  // Top 3 Critical Findings
  markdown += `## Top 3 Critical Findings\n\n`;
  result.top3CriticalFindings.forEach(finding => {
    markdown += `### ${finding.findingTitle}\n\n`;
    markdown += `**Impact Level:** ${finding.impactLevel}\n\n`;
    markdown += `**Business Impact:** ${finding.businessImpact}\n\n`;
    markdown += `**Current State:** ${finding.currentState}\n\n`;
    markdown += `**Root Cause:** ${finding.rootCauseAnalysis}\n\n`;
    markdown += `**Stakeholder Impact:** ${finding.stakeholderImpact}\n\n`;
    markdown += `**Urgency:** ${finding.urgencyRating}\n\n`;
  });

  const reportSectionsMd = [
    { title: 'Strategic Recommendation Summary', content: result.strategicRecommendationSummary },
    { title: 'Implementation Timeline Overview', content: result.implementationTimelineOverview },
    { title: 'Current State Assessment', content: result.currentStateAssessment },
    { title: 'Performance Benchmarking', content: result.performanceBenchmarking },
    { title: 'Key Findings & Opportunities', content: result.keyFindingsAndOpportunities },
    { title: 'Prioritized Recommendations', content: result.prioritizedRecommendations },
    { title: 'Implementation Roadmap', content: result.implementationRoadmap },
    { title: 'Investment & ROI Analysis', content: result.investmentAndRoiAnalysis },
    { title: 'Next Steps & Decision Framework', content: result.nextStepsAndDecisionFramework },
  ];

  reportSectionsMd.forEach(section => {
    markdown += `## ${section.title}\n\n`;
    markdown += `${processTextForMarkdown(section.content)}\n\n`;
  });

  return markdown;
};

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


export const GtmReadinessReport = React.forwardRef<HTMLDivElement, GtmReadinessReportProps>(({ title, result, onComplete }, ref) => {
  
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

  const handleExport = () => {
    const markdownContent = generateMarkdownExport(title, result);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'GTM-Readiness-Report.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        </div>
      <div className="flex justify-between items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
          <p className="text-xs text-muted-foreground">PROPRIETARY & CONFIDENTIAL</p>
          <div className="flex gap-4">
              <Button variant="outline" onClick={onComplete}>Done</Button>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to Markdown
              </Button>
          </div>
      </div>
    </div>
  );
});
GtmReadinessReport.displayName = "GtmReadinessReport";

