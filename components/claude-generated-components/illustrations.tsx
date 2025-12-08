// AlignUI Illustrations v0.0.0
// SVG illustrations for empty states, onboarding, etc. - zero dependencies

import * as React from 'react';
import { cn } from '@/utils/cn';

type IllustrationProps = React.SVGProps<SVGSVGElement> & {
  /** Size of the illustration */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  color?: 'gray' | 'primary' | 'success' | 'warning' | 'error';
};

const illustrationSizes = {
  small: { width: 80, height: 80 },
  medium: { width: 120, height: 120 },
  large: { width: 160, height: 160 },
};

const colorClasses = {
  gray: 'text-text-soft-400',
  primary: 'text-primary-base',
  success: 'text-success-base',
  warning: 'text-warning-base',
  error: 'text-error-base',
};

export function CloudIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Cloud body */}
      <path
        d='M95 65C95 51.193 83.807 40 70 40C63.5 40 57.5 42.5 53 46.5C50.5 38 42.5 32 33 32C21.402 32 12 41.402 12 53C12 54.7 12.2 56.35 12.55 57.93C8.5 61.5 6 67 6 73C6 84.046 14.954 93 26 93H89C102.255 93 113 82.255 113 69C113 58.5 106 50 95 50V65Z'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='2'
      />
      {/* Arrow up */}
      <path
        d='M60 85V55M60 55L50 65M60 55L70 65'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function FolderIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Folder back */}
      <path
        d='M15 35C15 31.686 17.686 29 21 29H45L55 39H99C102.314 39 105 41.686 105 45V85C105 88.314 102.314 91 99 91H21C17.686 91 15 88.314 15 85V35Z'
        fill='currentColor'
        fillOpacity='0.1'
      />
      {/* Folder front */}
      <path
        d='M15 45C15 41.686 17.686 39 21 39H99C102.314 39 105 41.686 105 45V85C105 88.314 102.314 91 99 91H21C17.686 91 15 88.314 15 85V45Z'
        fill='currentColor'
        fillOpacity='0.15'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='2'
      />
      {/* Folder tab */}
      <path
        d='M15 35C15 31.686 17.686 29 21 29H42C43.326 29 44.598 29.527 45.536 30.464L53.536 38.464C54.473 39.402 55.674 40 57 40H99C102.314 40 105 42.686 105 46'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function DocumentIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Document background */}
      <rect
        x='25'
        y='15'
        width='70'
        height='90'
        rx='6'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='2'
      />
      {/* Folded corner */}
      <path
        d='M75 15V30C75 33.314 77.686 36 81 36H95'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        d='M75 15L95 36'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='2'
      />
      {/* Text lines */}
      <rect
        x='38'
        y='50'
        width='44'
        height='4'
        rx='2'
        fill='currentColor'
        fillOpacity='0.3'
      />
      <rect
        x='38'
        y='62'
        width='32'
        height='4'
        rx='2'
        fill='currentColor'
        fillOpacity='0.2'
      />
      <rect
        x='38'
        y='74'
        width='38'
        height='4'
        rx='2'
        fill='currentColor'
        fillOpacity='0.2'
      />
      <rect
        x='38'
        y='86'
        width='24'
        height='4'
        rx='2'
        fill='currentColor'
        fillOpacity='0.15'
      />
    </svg>
  );
}

export function SearchIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Magnifying glass circle */}
      <circle
        cx='52'
        cy='52'
        r='30'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.3'
        strokeWidth='4'
      />
      {/* Handle */}
      <path
        d='M75 75L100 100'
        stroke='currentColor'
        strokeOpacity='0.3'
        strokeWidth='8'
        strokeLinecap='round'
      />
      {/* Shine */}
      <path
        d='M38 38C42 34 48 32 52 32'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function InboxIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Inbox box */}
      <path
        d='M15 50L30 25H90L105 50V90C105 93.314 102.314 96 99 96H21C17.686 96 15 93.314 15 90V50Z'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.2'
        strokeWidth='2'
      />
      {/* Inbox divider */}
      <path
        d='M15 50H40C40 58 48 65 60 65C72 65 80 58 80 50H105'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='2'
      />
      {/* Inner shadow */}
      <path
        d='M40 50C40 58 48 65 60 65C72 65 80 58 80 50'
        fill='currentColor'
        fillOpacity='0.05'
      />
    </svg>
  );
}

export function LockIllustration({
  size = 'medium',
  color = 'gray',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Lock body */}
      <rect
        x='30'
        y='50'
        width='60'
        height='50'
        rx='8'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='3'
      />
      {/* Lock shackle */}
      <path
        d='M40 50V38C40 27 49 20 60 20C71 20 80 27 80 38V50'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='4'
        strokeLinecap='round'
      />
      {/* Keyhole */}
      <circle
        cx='60'
        cy='72'
        r='6'
        fill='currentColor'
        fillOpacity='0.3'
      />
      <rect
        x='57'
        y='76'
        width='6'
        height='12'
        rx='2'
        fill='currentColor'
        fillOpacity='0.3'
      />
    </svg>
  );
}

export function ErrorIllustration({
  size = 'medium',
  color = 'error',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Circle */}
      <circle
        cx='60'
        cy='60'
        r='45'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='3'
      />
      {/* X mark */}
      <path
        d='M45 45L75 75M75 45L45 75'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function SuccessIllustration({
  size = 'medium',
  color = 'success',
  className,
  ...props
}: IllustrationProps) {
  const { width, height } = illustrationSizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(colorClasses[color], className)}
      {...props}
    >
      {/* Circle */}
      <circle
        cx='60'
        cy='60'
        r='45'
        fill='currentColor'
        fillOpacity='0.1'
        stroke='currentColor'
        strokeOpacity='0.25'
        strokeWidth='3'
      />
      {/* Checkmark */}
      <path
        d='M40 60L55 75L80 45'
        stroke='currentColor'
        strokeWidth='5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

// Export all illustrations as a collection
export const Illustrations = {
  Cloud: CloudIllustration,
  Folder: FolderIllustration,
  Document: DocumentIllustration,
  Search: SearchIllustration,
  Inbox: InboxIllustration,
  Lock: LockIllustration,
  Error: ErrorIllustration,
  Success: SuccessIllustration,
};
