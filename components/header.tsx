'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from '@/hooks/use-session';
import { UserAvatar } from '@/components/user-avatar';
import * as Button from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { House } from '@phosphor-icons/react';

const DynamicThemeSwitch = dynamic(() => import('./theme-switch'), {
  ssr: false,
  loading: () => <div className='h-9 w-24' />,
});

export default function Header() {
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user;

  return (
    <div className='border-b border-stroke-soft-200'>
      <header className='mx-auto flex h-14 max-w-5xl items-center justify-between px-5'>
        <Link href='/'>
          <Logo width={140} height={32} />
        </Link>

        <div className='flex items-center gap-3'>
          <DynamicThemeSwitch />

          {isPending ? (
            <div className='h-9 w-20 animate-pulse rounded-lg bg-bg-soft-200' />
          ) : user ? (
            <div className='flex items-center gap-2'>
              <Button.Root variant='primary' size='small' asChild>
                <Link href='/dashboard'>
                  <Button.Icon as={House} />
                  Dashboard
                </Link>
              </Button.Root>
              <Link href='/dashboard'>
                <UserAvatar user={user} size='40' className='size-9' />
              </Link>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Button.Root variant='ghost' size='small' asChild>
                <Link href='/sign-in'>
                  Sign In
                </Link>
              </Button.Root>
              <Button.Root variant='primary' size='small' asChild>
                <Link href='/sign-up'>
                  Sign Up
                </Link>
              </Button.Root>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
