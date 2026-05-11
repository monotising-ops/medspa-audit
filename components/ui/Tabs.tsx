'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <RadixTabs.List
        className={cn(
          'flex border-b border-[#1e1e1e] gap-0',
          className,
        )}
      >
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.id}
            value={tab.id}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px focus:outline-none',
              'data-[state=active]:text-[#f5f5f5] data-[state=active]:border-[#3b82f6]',
              'data-[state=inactive]:text-[#737373] data-[state=inactive]:border-transparent',
              'hover:text-[#f5f5f5]',
            )}
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}
