'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type MaturityVisualizationProps = {
  stage: 'Foundational' | 'Developing' | 'Aligned' | 'Scaled' | 'Advanced';
  score: number;
};

const stages = ['Foundational', 'Developing', 'Aligned', 'Scaled', 'Advanced'] as const;

export function MaturityVisualization({ stage, score }: MaturityVisualizationProps) {
  const currentIndex = stages.indexOf(stage);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>RevOps Maturity Level</CardTitle>
          <CardDescription>Your current stage in the RevOps journey.</CardDescription>
        </div>
        <div className="text-right">
            <p className="text-3xl font-bold text-primary">{stage}</p>
            <p className="text-sm text-muted-foreground">Readiness Score: {score}%</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                {stages.map((s, index) => (
                <div key={s} className="text-center">
                    <div
                    className={cn(
                        'h-2.5 rounded-full w-full mb-2',
                        index <= currentIndex ? 'bg-primary' : 'bg-secondary'
                    )}
                    />
                    <p
                    className={cn(
                        'text-xs md:text-sm font-medium',
                        index === currentIndex ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                    >
                    {s}
                    </p>
                </div>
                ))}
            </div>
            <Progress value={score} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}
