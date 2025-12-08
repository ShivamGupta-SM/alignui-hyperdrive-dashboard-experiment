// AlignUI AppStoreButtons v0.0.0
// iOS App Store and Google Play Store download buttons

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const APP_STORE_BUTTON_NAME = 'AppStoreButton';
const PLAY_STORE_BUTTON_NAME = 'PlayStoreButton';

export const appStoreButtonVariants = tv({
  base: [
    // base
    'inline-flex items-center gap-2 rounded-lg px-4 py-2',
    'transition-colors duration-200',
    // focus
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  ],
  variants: {
    //#region variant
    variant: {
      filled: [
        // base
        'bg-static-black text-static-white',
        // hover
        'hover:bg-gray-800',
        // focus
        'focus-visible:ring-gray-500',
      ],
      outline: [
        // base
        'bg-transparent ring-1 ring-inset ring-stroke-strong-950 text-text-strong-950',
        // hover
        'hover:bg-bg-weak-50',
        // focus
        'focus-visible:ring-primary-base',
      ],
    },
    //#endregion

    //#region size
    size: {
      small: 'h-10 px-3 text-xs',
      medium: 'h-12 px-4',
      large: 'h-14 px-5',
    },
    //#endregion
  },
  defaultVariants: {
    variant: 'filled',
    size: 'medium',
  },
});

// Apple Logo SVG
function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
    </svg>
  );
}

// Google Play Logo SVG
function PlayStoreLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z'
        fill='#4285F4'
      />
      <path
        d='M17.17 8.63l-3.377 3.37 3.377 3.37 3.812-2.18c.56-.32.56-1.13 0-1.46l-3.812-2.1z'
        fill='#FBBC05'
      />
      <path
        d='M3.609 1.814A1.003 1.003 0 014.39 1.5l9.403 5.37-3.377 3.37-6.807-8.426z'
        fill='#34A853'
      />
      <path
        d='M3.609 22.186l6.807-8.426 3.377 3.37-9.403 5.37a1.003 1.003 0 01-.781-.314z'
        fill='#EA4335'
      />
    </svg>
  );
}

type AppStoreButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof appStoreButtonVariants> & {
    /** App Store URL */
    href: string;
  };

const AppStoreButton = React.forwardRef<HTMLAnchorElement, AppStoreButtonProps>(
  ({ className, variant = 'filled', size = 'medium', href, ...rest }, forwardedRef) => {
    const iconSize = size === 'small' ? 'size-5' : size === 'large' ? 'size-8' : 'size-6';

    return (
      <a
        ref={forwardedRef}
        href={href}
        className={appStoreButtonVariants({ variant, size, class: className })}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Download on the App Store'
        {...rest}
      >
        <AppleLogo className={iconSize} />
        <div className='flex flex-col items-start'>
          <span
            className={cn(
              'text-[10px] leading-tight opacity-80',
              size === 'small' && 'text-[8px]',
              size === 'large' && 'text-xs',
            )}
          >
            Download on the
          </span>
          <span
            className={cn(
              'font-semibold leading-tight',
              size === 'small' && 'text-sm',
              size === 'medium' && 'text-base',
              size === 'large' && 'text-lg',
            )}
          >
            App Store
          </span>
        </div>
      </a>
    );
  },
);
AppStoreButton.displayName = APP_STORE_BUTTON_NAME;

type PlayStoreButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof appStoreButtonVariants> & {
    /** Play Store URL */
    href: string;
  };

const PlayStoreButton = React.forwardRef<
  HTMLAnchorElement,
  PlayStoreButtonProps
>(({ className, variant = 'filled', size = 'medium', href, ...rest }, forwardedRef) => {
  const iconSize = size === 'small' ? 'size-5' : size === 'large' ? 'size-8' : 'size-6';

  return (
    <a
      ref={forwardedRef}
      href={href}
      className={appStoreButtonVariants({ variant, size, class: className })}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Get it on Google Play'
      {...rest}
    >
      <PlayStoreLogo className={iconSize} />
      <div className='flex flex-col items-start'>
        <span
          className={cn(
            'text-[10px] leading-tight opacity-80',
            size === 'small' && 'text-[8px]',
            size === 'large' && 'text-xs',
          )}
        >
          GET IT ON
        </span>
        <span
          className={cn(
            'font-semibold leading-tight',
            size === 'small' && 'text-sm',
            size === 'medium' && 'text-base',
            size === 'large' && 'text-lg',
          )}
        >
          Google Play
        </span>
      </div>
    </a>
  );
});
PlayStoreButton.displayName = PLAY_STORE_BUTTON_NAME;

// Combined button group component
type AppStoreButtonGroupProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof appStoreButtonVariants> & {
    appStoreUrl?: string;
    playStoreUrl?: string;
  };

function AppStoreButtonGroup({
  className,
  variant,
  size,
  appStoreUrl,
  playStoreUrl,
  ...rest
}: AppStoreButtonGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)} {...rest}>
      {appStoreUrl && (
        <AppStoreButton href={appStoreUrl} variant={variant} size={size} />
      )}
      {playStoreUrl && (
        <PlayStoreButton href={playStoreUrl} variant={variant} size={size} />
      )}
    </div>
  );
}

export {
  AppStoreButton,
  PlayStoreButton,
  AppStoreButtonGroup,
};
