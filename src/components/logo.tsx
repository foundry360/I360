import { Activity } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <Activity className="h-6 w-6 text-accent" />
      <span>Insights360</span>
    </div>
  );
}
