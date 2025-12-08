'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import * as SegmentedControl from '@/components/ui/segmented-control';
import { RiEqualizer3Fill, RiMoonLine, RiSunLine } from '@remixicon/react';

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
          <RiSunLine className='size-4' />
        </SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='dark' className='aspect-square'>
          <RiMoonLine className='size-4' />
        </SegmentedControl.Trigger>
        <SegmentedControl.Trigger value='system' className='aspect-square'>
          <RiEqualizer3Fill className='size-4' />
        </SegmentedControl.Trigger>
      </SegmentedControl.List>
    </SegmentedControl.Root>
  );
}
