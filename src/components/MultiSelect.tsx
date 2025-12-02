
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({ options, selected, onChange, className, placeholder, disabled, ...props }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleAddCustom = () => {
    if (inputValue && !selected.includes(inputValue) && !options.some(o => o.value === inputValue)) {
      onChange([...selected, inputValue]);
      setInputValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-auto", className)}
            disabled={disabled}
        >
            <div className="flex gap-1 flex-wrap">
                {selected.length > 0 ? (
                    selected.map((value) => {
                        const option = options.find((o) => o.value === value);
                        return (
                            <Badge
                                key={value}
                                variant="secondary"
                                className="mr-1"
                            >
                                {option ? option.label : value}
                            </Badge>
                        );
                    })
                ) : (
                    <span className="text-muted-foreground">{placeholder || "Select..."}</span>
                )}
            </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
            <CommandInput 
                placeholder="Search or add new..."
                value={inputValue}
                onValueChange={setInputValue}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {options.map((option) => (
                    <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                    >
                        <div className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selected.includes(option.value)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                        )}>
                            <Check className={cn("h-4 w-4")} />
                        </div>
                        {option.label}
                    </CommandItem>
                    ))}
                </CommandGroup>
                {inputValue && (
                    <>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem
                                onSelect={handleAddCustom}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add "{inputValue}"
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
