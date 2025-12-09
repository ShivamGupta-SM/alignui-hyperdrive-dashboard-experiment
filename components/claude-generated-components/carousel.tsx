// AlignUI Carousel v0.0.0

'use client';

import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { tv } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { Slot } from '@radix-ui/react-slot';

const CAROUSEL_ROOT_NAME = 'CarouselRoot';
const CAROUSEL_CONTENT_NAME = 'CarouselContent';
const CAROUSEL_ITEM_NAME = 'CarouselItem';
const CAROUSEL_PREV_TRIGGER_NAME = 'CarouselPrevTrigger';
const CAROUSEL_NEXT_TRIGGER_NAME = 'CarouselNextTrigger';
const CAROUSEL_INDICATOR_NAME = 'CarouselIndicator';
const CAROUSEL_INDICATOR_GROUP_NAME = 'CarouselIndicatorGroup';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

export const carouselVariants = tv({
  slots: {
    root: 'relative',
    content: 'flex max-h-full',
    item: 'min-w-0 shrink-0 grow-0 basis-full',
    trigger: [
      'inline-flex size-10 items-center justify-center rounded-full',
      'bg-bg-white-0 text-text-sub-600 shadow-md ring-1 ring-inset ring-stroke-soft-200',
      'transition duration-200 ease-out',
      'hover:bg-bg-weak-50 hover:text-text-strong-950',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    indicatorGroup: 'flex items-center justify-center gap-2',
    indicator: [
      'size-2 rounded-full bg-bg-soft-200',
      'transition duration-200 ease-out',
      'hover:bg-bg-sub-300',
      'data-[selected=true]:bg-primary-base',
    ],
  },
  variants: {
    orientation: {
      horizontal: {
        content: 'flex-row',
      },
      vertical: {
        content: 'flex-col',
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

type CarouselContextType = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
  orientation: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextType | null>(null);

export const useCarousel = () => {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
};

type CarouselRootProps = React.HTMLAttributes<HTMLDivElement> & {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

const CarouselRoot = React.forwardRef<HTMLDivElement, CarouselRootProps>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const { root } = carouselVariants({ orientation });

    const onInit = React.useCallback((emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = React.useCallback((emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;

      onInit(api);
      onSelect(api);

      api.on('reInit', onInit);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onInit, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
        }}
      >
        <div
          ref={forwardedRef}
          onKeyDownCapture={handleKeyDown}
          className={root({ class: className })}
          role='region'
          aria-roledescription='carousel'
          {...rest}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
CarouselRoot.displayName = CAROUSEL_ROOT_NAME;

type CarouselContentProps = React.HTMLAttributes<HTMLDivElement> & {
  overflowHidden?: boolean;
};

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, overflowHidden = true, ...rest }, forwardedRef) => {
    const { carouselRef, orientation } = useCarousel();
    const { content } = carouselVariants({ orientation });

    return (
      <div
        ref={carouselRef}
        className={cn('h-full w-full', overflowHidden && 'overflow-hidden')}
      >
        <div ref={forwardedRef} className={content({ class: className })} {...rest} />
      </div>
    );
  },
);
CarouselContent.displayName = CAROUSEL_CONTENT_NAME;

type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { item } = carouselVariants();

    return (
      <div
        ref={forwardedRef}
        role='group'
        aria-roledescription='slide'
        className={item({ class: className })}
        {...rest}
      />
    );
  },
);
CarouselItem.displayName = CAROUSEL_ITEM_NAME;

type CarouselTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const CarouselPrevTrigger = React.forwardRef<HTMLButtonElement, CarouselTriggerProps>(
  ({ className, asChild, children, ...rest }, forwardedRef) => {
    const { scrollPrev, canScrollPrev } = useCarousel();
    const { trigger } = carouselVariants();
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={forwardedRef}
        className={trigger({ class: className })}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        aria-label='Previous slide'
        {...rest}
      >
        {children ?? <CaretLeft weight="bold" className='size-5' />}
      </Component>
    );
  },
);
CarouselPrevTrigger.displayName = CAROUSEL_PREV_TRIGGER_NAME;

const CarouselNextTrigger = React.forwardRef<HTMLButtonElement, CarouselTriggerProps>(
  ({ className, asChild, children, ...rest }, forwardedRef) => {
    const { scrollNext, canScrollNext } = useCarousel();
    const { trigger } = carouselVariants();
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={forwardedRef}
        className={trigger({ class: className })}
        disabled={!canScrollNext}
        onClick={scrollNext}
        aria-label='Next slide'
        {...rest}
      >
        {children ?? <CaretRight weight="bold" className='size-5' />}
      </Component>
    );
  },
);
CarouselNextTrigger.displayName = CAROUSEL_NEXT_TRIGGER_NAME;

type CarouselIndicatorProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  index: number;
};

const CarouselIndicator = React.forwardRef<HTMLButtonElement, CarouselIndicatorProps>(
  ({ className, index, ...rest }, forwardedRef) => {
    const { api, selectedIndex } = useCarousel();
    const { indicator } = carouselVariants();
    const isSelected = selectedIndex === index;

    const handleClick = () => {
      api?.scrollTo(index);
    };

    return (
      <button
        ref={forwardedRef}
        className={indicator({ class: className })}
        data-selected={isSelected}
        onClick={handleClick}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={isSelected ? 'true' : undefined}
        {...rest}
      />
    );
  },
);
CarouselIndicator.displayName = CAROUSEL_INDICATOR_NAME;

type CarouselIndicatorGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children?: React.ReactNode | ((props: { index: number }) => React.ReactNode);
};

function CarouselIndicatorGroup({
  className,
  children,
  ...rest
}: CarouselIndicatorGroupProps) {
  const { scrollSnaps } = useCarousel();
  const { indicatorGroup } = carouselVariants();

  return (
    <nav className={indicatorGroup({ class: className })} {...rest}>
      {typeof children === 'function'
        ? scrollSnaps.map((_, index) => children({ index }))
        : children}
    </nav>
  );
}
CarouselIndicatorGroup.displayName = CAROUSEL_INDICATOR_GROUP_NAME;

export {
  CarouselRoot as Root,
  CarouselContent as Content,
  CarouselItem as Item,
  CarouselPrevTrigger as PrevTrigger,
  CarouselNextTrigger as NextTrigger,
  CarouselIndicator as Indicator,
  CarouselIndicatorGroup as IndicatorGroup,
};
