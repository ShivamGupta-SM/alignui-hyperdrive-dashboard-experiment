// AlignUI MeetingCard v0.0.0
// Event/Meeting card with colored left border indicator

'use client';

import * as React from 'react';
import Image from 'next/image';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { Clock, MapPin, User, VideoCamera } from '@phosphor-icons/react/dist/ssr';

const MEETING_CARD_NAME = 'MeetingCard';
const MEETING_CARD_LIST_NAME = 'MeetingCardList';

export const meetingCardVariants = tv({
  slots: {
    root: [
      // base
      'relative flex gap-3 rounded-lg bg-bg-white-0 p-4',
      'border border-stroke-soft-200',
      // hover
      'transition-shadow duration-150 hover:shadow-md',
    ],
    indicator: 'absolute left-0 top-0 h-full w-1 rounded-l-lg',
    content: 'flex flex-1 flex-col gap-2',
    header: 'flex items-start justify-between gap-2',
    title: 'text-label-md font-semibold text-text-strong-950 line-clamp-1',
    badge: [
      // base
      'inline-flex items-center rounded-full px-2 py-0.5',
      'text-label-xs font-medium',
    ],
    time: 'flex items-center gap-1.5 text-paragraph-sm text-text-sub-600',
    timeIcon: 'size-4 text-text-soft-400',
    meta: 'flex flex-wrap items-center gap-3',
    metaItem: 'flex items-center gap-1.5 text-paragraph-xs text-text-sub-600',
    metaIcon: 'size-3.5 text-text-soft-400',
    actions: 'flex items-center gap-2',
    actionButton: [
      // base
      'flex items-center justify-center rounded-md p-1.5',
      // hover
      'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
      'transition-colors duration-150',
      // focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
    ],
  },
  variants: {
    //#region color
    color: {
      primary: {
        indicator: 'bg-primary-base',
        badge: 'bg-primary-lighter text-primary-base',
      },
      success: {
        indicator: 'bg-success-base',
        badge: 'bg-success-lighter text-success-base',
      },
      warning: {
        indicator: 'bg-warning-base',
        badge: 'bg-warning-lighter text-warning-base',
      },
      error: {
        indicator: 'bg-error-base',
        badge: 'bg-error-lighter text-error-base',
      },
      purple: {
        indicator: 'bg-purple-500',
        badge: 'bg-purple-100 text-purple-700',
      },
      cyan: {
        indicator: 'bg-cyan-500',
        badge: 'bg-cyan-100 text-cyan-700',
      },
      orange: {
        indicator: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-700',
      },
      pink: {
        indicator: 'bg-pink-500',
        badge: 'bg-pink-100 text-pink-700',
      },
    },
    //#endregion

    //#region status
    status: {
      upcoming: {},
      ongoing: {},
      completed: {
        root: 'opacity-60',
      },
      cancelled: {
        root: 'opacity-50',
        title: 'line-through',
      },
    },
    //#endregion
  },
  defaultVariants: {
    color: 'primary',
    status: 'upcoming',
  },
});

type MeetingCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof meetingCardVariants> & {
    /** Meeting title */
    title: string;
    /** Start time */
    startTime: string;
    /** End time */
    endTime?: string;
    /** Location or meeting link */
    location?: string;
    /** Number of attendees */
    attendees?: number;
    /** Whether it's a video call */
    isVideoCall?: boolean;
    /** Category/type badge text */
    category?: string;
    /** Custom actions */
    actions?: React.ReactNode;
    /** Click handler */
    onCardClick?: () => void;
  };

const MeetingCard = React.forwardRef<HTMLDivElement, MeetingCardProps>(
  (
    {
      className,
      color = 'primary',
      status = 'upcoming',
      title,
      startTime,
      endTime,
      location,
      attendees,
      isVideoCall,
      category,
      actions,
      onCardClick,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = meetingCardVariants({ color, status });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onCardClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onCardClick();
      }
    };

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        onClick={onCardClick}
        onKeyDown={handleKeyDown}
        role={onCardClick ? 'button' : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        {...rest}
      >
        {/* Color indicator */}
        <div className={styles.indicator()} aria-hidden='true' />

        {/* Content */}
        <div className={styles.content()}>
          {/* Header */}
          <div className={styles.header()}>
            <h3 className={styles.title()}>{title}</h3>
            {category && <span className={styles.badge()}>{category}</span>}
          </div>

          {/* Time */}
          <div className={styles.time()}>
            <Clock weight="duotone" className={styles.timeIcon()} aria-hidden='true' />
            <span>
              {startTime}
              {endTime && ` - ${endTime}`}
            </span>
          </div>

          {/* Meta info */}
          {(location || attendees !== undefined || isVideoCall) && (
            <div className={styles.meta()}>
              {location && (
                <div className={styles.metaItem()}>
                  <MapPin weight="duotone" className={styles.metaIcon()} aria-hidden='true' />
                  <span>{location}</span>
                </div>
              )}
              {attendees !== undefined && (
                <div className={styles.metaItem()}>
                  <User weight="duotone" className={styles.metaIcon()} aria-hidden='true' />
                  <span>
                    {attendees} {attendees === 1 ? 'attendee' : 'attendees'}
                  </span>
                </div>
              )}
              {isVideoCall && (
                <div className={styles.metaItem()}>
                  <VideoCamera weight="duotone" className={styles.metaIcon()} aria-hidden='true' />
                  <span>Video call</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && <div className={styles.actions()}>{actions}</div>}
      </div>
    );
  },
);
MeetingCard.displayName = MEETING_CARD_NAME;

// Meeting card list wrapper
type MeetingCardListProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Date header */
  date?: string;
  /** Whether to show the date header */
  showDateHeader?: boolean;
};

function MeetingCardList({
  className,
  date,
  showDateHeader = true,
  children,
  ...rest
}: MeetingCardListProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {showDateHeader && date && (
        <h4 className='text-label-sm font-medium text-text-sub-600'>{date}</h4>
      )}
      <div className='flex flex-col gap-2'>{children}</div>
    </div>
  );
}
MeetingCardList.displayName = MEETING_CARD_LIST_NAME;

// Activity card variant (from Untitled UI's ActivityFeed)
type ActivityCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof activityCardVariants> & {
    /** Activity title */
    title: string;
    /** Activity description */
    description: string;
    /** Time string */
    time: string;
    /** Icon to display */
    icon?: React.ReactNode;
    /** Avatar image URL */
    avatar?: string;
  };

const activityCardVariants = tv({
  slots: {
    root: [
      'relative flex gap-4 rounded-lg bg-bg-white-0 p-4',
      'transition-colors duration-150 hover:bg-bg-weak-50',
    ],
    iconWrapper: 'flex size-10 shrink-0 items-center justify-center rounded-lg',
    avatarWrapper: 'relative shrink-0',
    avatar: 'size-10 rounded-full object-cover',
    content: 'flex flex-1 flex-col gap-1',
    title: 'text-label-sm font-medium text-text-strong-950',
    description: 'text-paragraph-sm text-text-sub-600',
    time: 'flex items-center gap-1 text-paragraph-xs text-text-soft-400',
  },
  variants: {
    color: {
      primary: {
        iconWrapper: 'bg-primary-lighter text-primary-base',
      },
      success: {
        iconWrapper: 'bg-success-lighter text-success-base',
      },
      warning: {
        iconWrapper: 'bg-warning-lighter text-warning-base',
      },
      error: {
        iconWrapper: 'bg-error-lighter text-error-base',
      },
      purple: {
        iconWrapper: 'bg-purple-100 text-purple-600',
      },
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

function ActivityCard({
  className,
  color = 'primary',
  title,
  description,
  time,
  icon,
  avatar,
  ...rest
}: ActivityCardProps) {
  const styles = activityCardVariants({ color });

  return (
    <div className={styles.root({ class: className })} {...rest}>
      {avatar ? (
        <div className={styles.avatarWrapper()}>
          <Image src={avatar} alt='' width={40} height={40} className={styles.avatar()} />
        </div>
      ) : icon ? (
        <div className={styles.iconWrapper()}>{icon}</div>
      ) : null}

      <div className={styles.content()}>
        <p className={styles.title()}>{title}</p>
        <p className={styles.description()}>{description}</p>
        <div className={styles.time()}>
          <Clock weight="duotone" className='size-3' aria-hidden='true' />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export {
  MeetingCard,
  MeetingCardList,
  ActivityCard,
  activityCardVariants,
};
