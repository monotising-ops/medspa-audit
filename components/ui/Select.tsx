'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 w-full rounded-lg bg-[#111111] border border-[#1e1e1e] px-3 py-2 text-sm text-[#f5f5f5]',
          'focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]',
          'data-[placeholder]:text-[#737373] transition-colors duration-150',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#737373]">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg bg-[#111111] border border-[#1e1e1e] shadow-xl"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex items-center px-3 py-2 text-sm text-[#f5f5f5] rounded-md cursor-pointer select-none outline-none',
                  'data-[highlighted]:bg-[#1e1e1e] data-[highlighted]:text-[#f5f5f5]',
                  'data-[state=checked]:text-[#3b82f6]',
                )}
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
