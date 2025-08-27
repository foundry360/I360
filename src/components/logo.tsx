import { Target } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
      <Target className="h-7 w-7" />
      <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
        Insights360
      </span>
    </div>
  );
}
