// AlignUI Avatar v0.1.0 - Enhanced with avatar groups and clickable avatars

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/utils/cn';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';
import {
  IconEmptyCompany,
  IconEmptyUser,
} from '@/components/ui/avatar-empty-icons';

export const AVATAR_ROOT_NAME = 'AvatarRoot';
const AVATAR_IMAGE_NAME = 'AvatarImage';
const AVATAR_INDICATOR_NAME = 'AvatarIndicator';
const AVATAR_STATUS_NAME = 'AvatarStatus';
const AVATAR_BRAND_LOGO_NAME = 'AvatarBrandLogo';
const AVATAR_NOTIFICATION_NAME = 'AvatarNotification';

export const avatarVariants = tv({
  slots: {
    root: [
      'relative flex shrink-0 items-center justify-center rounded-full',
      'select-none text-center uppercase',
    ],
    image: 'size-full rounded-full object-cover',
    indicator:
      'absolute flex size-8 items-center justify-center drop-shadow-xs',
  },
  variants: {
    size: {
      '80': {
        root: 'size-20 text-title-h5',
      },
      '72': {
        root: 'size-[72px] text-title-h5',
      },
      '64': {
        root: 'size-16 text-title-h5',
      },
      '56': {
        root: 'size-14 text-label-lg',
      },
      '48': {
        root: 'size-12 text-label-lg',
      },
      '40': {
        root: 'size-10 text-label-md',
      },
      '32': {
        root: 'size-8 text-label-sm',
      },
      '24': {
        root: 'size-6 text-label-xs',
      },
      '20': {
        root: 'size-5 text-label-xs',
      },
    },
    color: {
      gray: {
        root: 'bg-bg-soft-200 text-static-black',
      },
      yellow: {
        root: 'bg-yellow-200 text-yellow-950',
      },
      blue: {
        root: 'bg-blue-200 text-blue-950',
      },
      sky: {
        root: 'bg-sky-200 text-sky-950',
      },
      purple: {
        root: 'bg-purple-200 text-purple-950',
      },
      red: {
        root: 'bg-red-200 text-red-950',
      },
    },
  },
  compoundVariants: [
    {
      size: ['80', '72'],
      class: {
        indicator: '-right-2',
      },
    },
    {
      size: '64',
      class: {
        indicator: '-right-2 scale-[.875]',
      },
    },
    {
      size: '56',
      class: {
        indicator: '-right-1.5 scale-75',
      },
    },
    {
      size: '48',
      class: {
        indicator: '-right-1.5 scale-[.625]',
      },
    },
    {
      size: '40',
      class: {
        indicator: '-right-1.5 scale-[.5625]',
      },
    },
    {
      size: '32',
      class: {
        indicator: '-right-1.5 scale-50',
      },
    },
    {
      size: '24',
      class: {
        indicator: '-right-1 scale-[.375]',
      },
    },
    {
      size: '20',
      class: {
        indicator: '-right-1 scale-[.3125]',
      },
    },
  ],
  defaultVariants: {
    size: '80',
    color: 'gray',
  },
});

type AvatarSharedProps = VariantProps<typeof avatarVariants>;

export type AvatarRootProps = VariantProps<typeof avatarVariants> &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
    placeholderType?: 'user' | 'company';
  };

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  (
    {
      asChild,
      children,
      size,
      color,
      className,
      placeholderType = 'user',
      ...rest
    },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';
    const { root } = avatarVariants({ size, color });

    const sharedProps: AvatarSharedProps = {
      size,
      color,
    };

    // use placeholder icon if no children provided
    if (!children) {
      return (
        <div className={root({ class: className })} {...rest}>
          <AvatarImage asChild>
            {placeholderType === 'company' ? (
              <IconEmptyCompany />
            ) : (
              <IconEmptyUser />
            )}
          </AvatarImage>
        </div>
      );
    }

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [AVATAR_IMAGE_NAME, AVATAR_INDICATOR_NAME],
      uniqueId,
      asChild,
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  },
);
AvatarRoot.displayName = AVATAR_ROOT_NAME;

type AvatarImageProps = AvatarSharedProps &
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'color'> & {
    asChild?: boolean;
  };

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ asChild, className, size, color, ...rest }, forwardedRef) => {
    const Component = asChild ? Slot : 'img';
    const { image } = avatarVariants({ size, color });

    return (
      <Component
        ref={forwardedRef}
        className={image({ class: className })}
        {...rest}
      />
    );
  },
);
AvatarImage.displayName = AVATAR_IMAGE_NAME;

function AvatarIndicator({
  size,
  color,
  className,
  position = 'bottom',
  ...rest
}: AvatarSharedProps &
  React.HTMLAttributes<HTMLDivElement> & {
    position?: 'top' | 'bottom';
  }) {
  const { indicator } = avatarVariants({ size, color });

  return (
    <div
      className={cn(indicator({ class: className }), {
        'top-0 origin-top-right': position === 'top',
        'bottom-0 origin-bottom-right': position === 'bottom',
      })}
      {...rest}
    />
  );
}
AvatarIndicator.displayName = AVATAR_INDICATOR_NAME;

export const avatarStatusVariants = tv({
  base: 'box-content size-2 rounded-full border-2 border-stroke-white-0 shadow-regular-xs',
  variants: {
    status: {
      online: 'bg-success-base',
      offline: 'bg-faded-base',
      busy: 'bg-error-base',
      away: 'bg-away-base',
    },
  },
  defaultVariants: {
    status: 'online',
  },
});

function AvatarStatus({
  status,
  className,
  ...rest
}: VariantProps<typeof avatarStatusVariants> &
  React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={avatarStatusVariants({ status, class: className })}
      {...rest}
    />
  );
}
AvatarStatus.displayName = AVATAR_STATUS_NAME;

type AvatarBrandLogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  asChild?: boolean;
};

const AvatarBrandLogo = React.forwardRef<
  HTMLImageElement,
  AvatarBrandLogoProps
>(({ asChild, className, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'img';

  return (
    <Component
      ref={forwardedRef}
      className={cn(
        'box-content size-6 rounded-full border-2 border-bg-white-0',
        className,
      )}
      {...rest}
    />
  );
});
AvatarBrandLogo.displayName = AVATAR_BRAND_LOGO_NAME;

function AvatarNotification({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'box-content size-3 rounded-full border-2 border-bg-white-0 bg-error-base',
        className,
      )}
      {...rest}
    />
  );
}
AvatarNotification.displayName = AVATAR_NOTIFICATION_NAME;

// Avatar Group for stacking avatars
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarRootProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
  renderOverflow?: (count: number) => React.ReactNode;
}

const sizeToPixels: Record<string, number> = {
  '80': 80,
  '72': 72,
  '64': 64,
  '56': 56,
  '48': 48,
  '40': 40,
  '32': 32,
  '24': 24,
  '20': 20,
};

function AvatarGroup({
  children,
  max,
  size = '40',
  spacing = 'normal',
  renderOverflow,
  className,
  ...rest
}: AvatarGroupProps) {
  const spacingOffset = {
    tight: -0.4,
    normal: -0.3,
    loose: -0.2,
  };

  const pixelSize = sizeToPixels[size] || 40;
  const offset = pixelSize * spacingOffset[spacing];

  const childArray = React.Children.toArray(children);
  const visibleChildren = max ? childArray.slice(0, max) : childArray;
  const overflowCount = max ? Math.max(0, childArray.length - max) : 0;

  return (
    <div
      className={cn('flex items-center', className)}
      role="group"
      {...rest}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative ring-2 ring-bg-white-0 rounded-full"
          style={{
            marginLeft: index === 0 ? 0 : offset,
            zIndex: visibleChildren.length - index,
          }}
        >
          {React.isValidElement<AvatarRootProps>(child)
            ? React.cloneElement(child, { size })
            : child}
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className="relative ring-2 ring-bg-white-0 rounded-full"
          style={{
            marginLeft: offset,
            zIndex: 0,
          }}
        >
          {renderOverflow ? (
            renderOverflow(overflowCount)
          ) : (
            <AvatarRoot size={size} color="gray">
              +{overflowCount}
            </AvatarRoot>
          )}
        </div>
      )}
    </div>
  );
}
AvatarGroup.displayName = 'AvatarGroup';

// Clickable Avatar with hover effect
interface ClickableAvatarProps extends AvatarRootProps {
  onClick?: () => void;
  href?: string;
}

const ClickableAvatar = React.forwardRef<HTMLDivElement, ClickableAvatarProps>(
  ({ onClick, href, className, children, ...rest }, forwardedRef) => {
    const content = (
      <AvatarRoot
        ref={forwardedRef}
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:ring-2 hover:ring-primary-base hover:ring-offset-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2',
          className,
        )}
        tabIndex={0}
        role="button"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        {...rest}
      >
        {children}
      </AvatarRoot>
    );

    if (href) {
      return (
        <a href={href} className="inline-block">
          {content}
        </a>
      );
    }

    return content;
  },
);
ClickableAvatar.displayName = 'ClickableAvatar';

// Avatar with initials fallback
interface AvatarWithFallbackProps extends Omit<AvatarRootProps, 'children'> {
  src?: string;
  alt?: string;
  name?: string;
}

const DEFAULT_AVATAR_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'>
      <rect width='64' height='64' rx='16' fill='%23EEF2FF'/>
      <circle cx='32' cy='26' r='12' fill='%23C7D2FE'/>
      <path d='M32 38c-8.8 0-16 5-16 11v3h32v-3c0-6-7.2-11-16-11Z' fill='%2399A8FF'/>
    </svg>`
  );

const AvatarWithFallback = React.forwardRef<HTMLDivElement, AvatarWithFallbackProps>(
  ({ src, alt, name, size, color, ...rest }, forwardedRef) => {
    const [hasError, setHasError] = React.useState(false);

    const getInitials = (name: string): string => {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const fallbackSrc = DEFAULT_AVATAR_DATA_URL;

    if (src && !hasError) {
      return (
        <AvatarRoot ref={forwardedRef} size={size} color={color} {...rest}>
          <AvatarImage
            src={src}
            alt={alt || name}
            onError={() => setHasError(true)}
          />
        </AvatarRoot>
      );
    }

    if (fallbackSrc) {
      return (
        <AvatarRoot ref={forwardedRef} size={size} color={color} {...rest}>
          <AvatarImage
            src={fallbackSrc}
            alt={alt || name}
            onError={() => setHasError(true)}
          />
        </AvatarRoot>
      );
    }

    return <AvatarRoot ref={forwardedRef} size={size} color={color} {...rest} />;
  },
);
AvatarWithFallback.displayName = 'AvatarWithFallback';

export {
  AvatarRoot as Root,
  AvatarImage as Image,
  AvatarIndicator as Indicator,
  AvatarStatus as Status,
  AvatarBrandLogo as BrandLogo,
  AvatarNotification as Notification,
  AvatarGroup,
  ClickableAvatar,
  AvatarWithFallback,
};
