// AlignUI Fade v0.1.0 - Animation wrapper for smooth transitions

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const fadeVariants = tv({
  base: 'transition-all ease-out',
  variants: {
    show: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
    direction: {
      none: '',
      up: '',
      down: '',
      left: '',
      right: '',
    },
    duration: {
      fast: 'duration-150',
      normal: 'duration-300',
      slow: 'duration-500',
    },
  },
  compoundVariants: [
    // Direction transforms when hidden
    { show: false, direction: 'up', class: 'translate-y-2' },
    { show: false, direction: 'down', class: '-translate-y-2' },
    { show: false, direction: 'left', class: 'translate-x-2' },
    { show: false, direction: 'right', class: '-translate-x-2' },
    // Direction transforms when shown
    { show: true, direction: 'up', class: 'translate-y-0' },
    { show: true, direction: 'down', class: 'translate-y-0' },
    { show: true, direction: 'left', class: 'translate-x-0' },
    { show: true, direction: 'right', class: 'translate-x-0' },
  ],
  defaultVariants: {
    show: true,
    direction: 'none',
    duration: 'normal',
  },
});

type FadeVariantProps = VariantProps<typeof fadeVariants>;

interface FadeProps extends FadeVariantProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  unmountOnHide?: boolean;
}

function Fade({
  children,
  show = true,
  direction = 'none',
  duration = 'normal',
  delay = 0,
  unmountOnHide = false,
  as: Component = 'div',
  className,
  ...rest
}: FadeProps & React.HTMLAttributes<HTMLDivElement>) {
  const [shouldRender, setShouldRender] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else if (unmountOnHide) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, getDurationMs(duration));
      return () => clearTimeout(timer);
    }
  }, [show, unmountOnHide, duration]);

  if (!shouldRender && unmountOnHide) {
    return null;
  }

  return (
    <Component
      className={cn(fadeVariants({ show, direction, duration }), className)}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      aria-hidden={!show}
      {...rest}
    >
      {children}
    </Component>
  );
}
Fade.displayName = 'Fade';

// Helper to get duration in milliseconds
function getDurationMs(duration: 'fast' | 'normal' | 'slow'): number {
  switch (duration) {
    case 'fast':
      return 150;
    case 'slow':
      return 500;
    default:
      return 300;
  }
}

// Stagger animation for lists
interface FadeGroupProps {
  children: React.ReactNode;
  show?: boolean;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

function FadeGroup({
  children,
  show = true,
  staggerDelay = 50,
  direction = 'up',
  duration = 'normal',
  className,
}: FadeGroupProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <Fade
          key={index}
          show={show}
          direction={direction}
          duration={duration}
          delay={index * staggerDelay}
        >
          {child}
        </Fade>
      ))}
    </div>
  );
}
FadeGroup.displayName = 'FadeGroup';

// Scale animation variant
const scaleVariants = tv({
  base: 'transition-all ease-out',
  variants: {
    show: {
      true: 'scale-100 opacity-100',
      false: 'scale-95 opacity-0',
    },
    origin: {
      center: 'origin-center',
      top: 'origin-top',
      bottom: 'origin-bottom',
      left: 'origin-left',
      right: 'origin-right',
      'top-left': 'origin-top-left',
      'top-right': 'origin-top-right',
      'bottom-left': 'origin-bottom-left',
      'bottom-right': 'origin-bottom-right',
    },
    duration: {
      fast: 'duration-150',
      normal: 'duration-200',
      slow: 'duration-300',
    },
  },
  defaultVariants: {
    show: true,
    origin: 'center',
    duration: 'normal',
  },
});

type ScaleVariantProps = VariantProps<typeof scaleVariants>;

interface ScaleProps extends ScaleVariantProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

function Scale({
  children,
  show = true,
  origin = 'center',
  duration = 'normal',
  as: Component = 'div',
  className,
  ...rest
}: ScaleProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Component
      className={cn(scaleVariants({ show, origin, duration }), className)}
      aria-hidden={!show}
      {...rest}
    >
      {children}
    </Component>
  );
}
Scale.displayName = 'Scale';

// Collapse animation
interface CollapseProps {
  children: React.ReactNode;
  show?: boolean;
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

function Collapse({
  children,
  show = true,
  duration = 'normal',
  className,
}: CollapseProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | 'auto'>(show ? 'auto' : 0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(show ? contentRef.current.scrollHeight : 0);
    }
  }, [show]);

  const durationClass = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  }[duration];

  return (
    <div
      className={cn('overflow-hidden transition-all ease-out', durationClass, className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      aria-hidden={!show}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
Collapse.displayName = 'Collapse';

export { Fade, FadeGroup, Scale, Collapse, type FadeProps, type ScaleProps };
