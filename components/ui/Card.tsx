import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#111111] border border-[#1e1e1e] transition-shadow duration-300',
        glow && 'hover:shadow-[0_0_16px_2px_rgba(59,130,246,0.15)] hover:border-[#3b82f6]/30',
        className,
      )}
    >
      {children}
    </div>
  );
}
