'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import * as SegmentedControl from '@/components/ui/segmented-control';
import { Sliders, Moon, Sun } from '@phosphor-icons/react';

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-24" />;
  }

  return (
    <SegmentedControl.Root
      value={theme}
      onValueChange={setTheme}
    >
      <SegmentedControl.List>
        <SegmentedControl.Trigger value='light' className='aspect-square'>
          <Sun className='size-4' weight='duotone' />
        </SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='dark' className='aspect-square'>
          <Moon className='size-4' weight='duotone' />
        </SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='system' className='aspect-square'>
          <Sliders className='size-4' weight='duotone' />
        </SegmentedControl.Trigger>
      </SegmentedControl.List>
    </SegmentedControl.Root>
  );
}
