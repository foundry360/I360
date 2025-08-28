'use client';
import * as React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { GtmReadinessOutput } from '@/ai/flows/gtm-readiness-flow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, TrendingUp, Cpu, ListChecks, Download } from 'lucide-react';
import { Badge } from './ui/badge';

type GtmReadinessReportProps = {
  result: GtmReadinessOutput;
  onComplete: () => void;
};

export function GtmReadinessReport({ result, onComplete }: GtmReadinessReportProps) {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportToPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('gtm-readiness-report.pdf');
    } catch (error) {
        console.error("Error exporting to PDF:", error);
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
        <div ref={reportRef} className="space-y-6 bg-background p-4 rounded-lg">
            <div className="text-center pb-4 border-b">
                <h2 className="text-2xl font-bold text-primary">GTM Readiness Assessment Report</h2>
                <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <span>Prioritized Recommendations</span>
                </CardTitle>
                <CardDescription>Your actionable next steps to improve GTM readiness, sorted by priority.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {result.recommendations.sort((a, b) => a.priority - b.priority).map((rec) => (
                    <div key={rec.priority} className="p-4 border rounded-lg break-inside-avoid">
                    <h4 className="font-bold text-lg">{rec.priority}. {rec.title}</h4>
                    <p className="text-muted-foreground mt-1">{rec.justification}</p>
                    <div className="flex items-center gap-6 mt-3">
                        <Badge variant="outline">Impact: {rec.estimatedImpact}</Badge>
                        <Badge variant="outline">Effort: {rec.estimatedEffort}</Badge>
                    </div>
                    </div>
                ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>Strategic Focus Areas</span>
                </CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">{result.strategicFocusAreas}</p></CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-6 w-6 text-primary" />
                    <span>AI & Automation Opportunities</span>
                </CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">{result.aiAutomationOpportunities}</p></CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary" />
                    <span>Key Metrics to Monitor</span>
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-wrap gap-2">
                    {result.keyMetricsToMonitor.split(',').map(metric => (
                    <Badge key={metric.trim()} variant="secondary">{metric.trim()}</Badge>
                    ))}
                </div>
                </CardContent>
            </Card>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 border-t">
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
  );
}
