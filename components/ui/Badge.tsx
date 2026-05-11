import { cn } from '@/lib/utils';

interface BadgeProps {
  color: string;
  children: React.ReactNode;
  className?: string;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function Badge({ color, children, className }: BadgeProps) {
  const rgb = hexToRgb(color);

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: `rgba(${rgb}, 0.15)` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{children}</span>
    </span>
  );
}
