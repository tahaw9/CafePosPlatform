import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export default function Dropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'انتخاب کنید...',
  className = '',
  triggerClassName = ''
}: DropdownProps) {
  const selectedOption = options.find(o => o.value === value);

  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger asChild>
        <button 
          className={`flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3229] transition-all hover:bg-gray-50 ${triggerClassName}`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown size={16} className="text-gray-500 opacity-70" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="start"
          sideOffset={5}
          className={`z-[150] min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white rounded-lg shadow-lg border border-gray-100 p-1 data-[state=open]:radix-content-open data-[state=closed]:radix-content-closed ${className}`}
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => onChange(option.value)}
              className="relative flex items-center px-8 py-2 text-sm text-gray-700 font-medium cursor-pointer select-none rounded-md outline-none data-[highlighted]:bg-[#0f3229] data-[highlighted]:text-white transition-colors"
            >
              <div className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                {value === option.value && <Check size={16} />}
              </div>
              <span>{option.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
