// AlignUI SlideoutMenu v0.0.0

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/ssr';
import { tv, type VariantProps } from '@/utils/tv';
import * as CompactButton from '@/components/ui/compact-button';

const SLIDEOUT_MENU_ROOT_NAME = 'SlideoutMenuRoot';
const SLIDEOUT_MENU_TRIGGER_NAME = 'SlideoutMenuTrigger';
const SLIDEOUT_MENU_CLOSE_NAME = 'SlideoutMenuClose';
const SLIDEOUT_MENU_CONTENT_NAME = 'SlideoutMenuContent';
const SLIDEOUT_MENU_HEADER_NAME = 'SlideoutMenuHeader';
const SLIDEOUT_MENU_TITLE_NAME = 'SlideoutMenuTitle';
const SLIDEOUT_MENU_DESCRIPTION_NAME = 'SlideoutMenuDescription';
const SLIDEOUT_MENU_BODY_NAME = 'SlideoutMenuBody';
const SLIDEOUT_MENU_FOOTER_NAME = 'SlideoutMenuFooter';

export const slideoutMenuVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-overlay backdrop-blur-xs',
      // animation
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    ],
    content: [
      'fixed z-50 overflow-y-auto bg-bg-white-0',
      // animation
      'data-[state=open]:duration-300 data-[state=open]:ease-out data-[state=open]:animate-in',
      'data-[state=closed]:duration-200 data-[state=closed]:ease-in data-[state=closed]:animate-out',
    ],
    header: [
      'flex items-center gap-3 border-b border-stroke-soft-200 p-5',
    ],
    title: 'flex-1 text-label-lg text-text-strong-950',
    description: 'text-paragraph-sm text-text-sub-600',
    body: 'flex-1 overflow-y-auto',
    footer: [
      'flex items-center gap-4 border-t border-stroke-soft-200 p-5',
    ],
  },
  variants: {
    side: {
      right: {
        content: [
          'inset-y-0 right-0 h-full w-full max-w-md border-l border-stroke-soft-200',
          'data-[state=open]:slide-in-from-right-full',
          'data-[state=closed]:slide-out-to-right-full',
        ],
      },
      left: {
        content: [
          'inset-y-0 left-0 h-full w-full max-w-md border-r border-stroke-soft-200',
          'data-[state=open]:slide-in-from-left-full',
          'data-[state=closed]:slide-out-to-left-full',
        ],
      },
      top: {
        content: [
          'inset-x-0 top-0 h-auto max-h-[80vh] w-full border-b border-stroke-soft-200',
          'data-[state=open]:slide-in-from-top-full',
          'data-[state=closed]:slide-out-to-top-full',
        ],
      },
      bottom: {
        content: [
          'inset-x-0 bottom-0 h-auto max-h-[80vh] w-full border-t border-stroke-soft-200',
          'data-[state=open]:slide-in-from-bottom-full',
          'data-[state=closed]:slide-out-to-bottom-full',
        ],
      },
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

type SlideoutMenuContextType = VariantProps<typeof slideoutMenuVariants>;

const SlideoutMenuContext = React.createContext<SlideoutMenuContextType>({
  side: 'right',
});

const SlideoutMenuRoot = ({
  side = 'right',
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> &
  SlideoutMenuContextType) => {
  return (
    <SlideoutMenuContext.Provider value={{ side }}>
      <DialogPrimitive.Root {...props} />
    </SlideoutMenuContext.Provider>
  );
};
SlideoutMenuRoot.displayName = SLIDEOUT_MENU_ROOT_NAME;

const SlideoutMenuTrigger = DialogPrimitive.Trigger;
SlideoutMenuTrigger.displayName = SLIDEOUT_MENU_TRIGGER_NAME;

const SlideoutMenuClose = DialogPrimitive.Close;
SlideoutMenuClose.displayName = SLIDEOUT_MENU_CLOSE_NAME;

const SlideoutMenuPortal = DialogPrimitive.Portal;

const SlideoutMenuOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, forwardedRef) => {
  const { overlay } = slideoutMenuVariants();

  return (
    <DialogPrimitive.Overlay
      ref={forwardedRef}
      className={overlay({ class: className })}
      {...rest}
    />
  );
});
SlideoutMenuOverlay.displayName = 'SlideoutMenuOverlay';

const SlideoutMenuContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...rest }, forwardedRef) => {
  const { side } = React.useContext(SlideoutMenuContext);
  const { content } = slideoutMenuVariants({ side });

  return (
    <SlideoutMenuPortal>
      <SlideoutMenuOverlay />
      <DialogPrimitive.Content
        ref={forwardedRef}
        className={content({ class: className })}
        {...rest}
      >
        <div className='relative flex size-full flex-col'>{children}</div>
      </DialogPrimitive.Content>
    </SlideoutMenuPortal>
  );
});
SlideoutMenuContent.displayName = SLIDEOUT_MENU_CONTENT_NAME;

type SlideoutMenuHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  showCloseButton?: boolean;
};

function SlideoutMenuHeader({
  className,
  children,
  showCloseButton = true,
  ...rest
}: SlideoutMenuHeaderProps) {
  const { header } = slideoutMenuVariants();

  return (
    <div className={header({ class: className })} {...rest}>
      {children}

      {showCloseButton && (
        <SlideoutMenuClose asChild>
          <CompactButton.Root
            variant='ghost'
            size='large'
            aria-label='Close slideout menu'
          >
            <CompactButton.Icon as={X} />
          </CompactButton.Root>
        </SlideoutMenuClose>
      )}
    </div>
  );
}
SlideoutMenuHeader.displayName = SLIDEOUT_MENU_HEADER_NAME;

const SlideoutMenuTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, forwardedRef) => {
  const { title } = slideoutMenuVariants();

  return (
    <DialogPrimitive.Title
      ref={forwardedRef}
      className={title({ class: className })}
      {...rest}
    />
  );
});
SlideoutMenuTitle.displayName = SLIDEOUT_MENU_TITLE_NAME;

const SlideoutMenuDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...rest }, forwardedRef) => {
  const { description } = slideoutMenuVariants();

  return (
    <DialogPrimitive.Description
      ref={forwardedRef}
      className={description({ class: className })}
      {...rest}
    />
  );
});
SlideoutMenuDescription.displayName = SLIDEOUT_MENU_DESCRIPTION_NAME;

function SlideoutMenuBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { body } = slideoutMenuVariants();

  return <div className={body({ class: className })} {...rest} />;
}
SlideoutMenuBody.displayName = SLIDEOUT_MENU_BODY_NAME;

function SlideoutMenuFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { footer } = slideoutMenuVariants();

  return <div className={footer({ class: className })} {...rest} />;
}
SlideoutMenuFooter.displayName = SLIDEOUT_MENU_FOOTER_NAME;

export {
  SlideoutMenuRoot as Root,
  SlideoutMenuTrigger as Trigger,
  SlideoutMenuClose as Close,
  SlideoutMenuContent as Content,
  SlideoutMenuHeader as Header,
  SlideoutMenuTitle as Title,
  SlideoutMenuDescription as Description,
  SlideoutMenuBody as Body,
  SlideoutMenuFooter as Footer,
};
