'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-[#f5f5f5] font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          'w-full rounded-lg bg-[#111111] border border-[#1e1e1e] px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#737373] transition-colors duration-150',
          'focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]',
          error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]',
          className,
        )}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
