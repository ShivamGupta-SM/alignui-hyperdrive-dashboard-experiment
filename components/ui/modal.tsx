// AlignUI Modal v0.2.0 - Enhanced with full-screen variant and accessibility
// Improvements: auto-generated aria-labelledby, aria-describedby support, JSDoc

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import * as CompactButton from '@/components/ui/compact-button';
import { cn } from '@/utils/cn';
import { tv, type VariantProps } from '@/utils/tv';
import { type RemixiconComponentType, RiCloseLine } from '@remixicon/react';

const modalVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-overlay backdrop-blur-[10px]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=open]:duration-200 data-[state=closed]:duration-150',
    ],
    content: [
      'relative w-full',
      'bg-bg-white-0 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200',
      'focus:outline-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=open]:duration-300 data-[state=closed]:duration-200',
    ],
  },
  variants: {
    variant: {
      default: {
        overlay: 'p-4',
        content: [
          'max-w-[400px] rounded-20',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        ],
      },
      large: {
        overlay: 'p-4',
        content: [
          'max-w-[600px] rounded-20',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        ],
      },
      fullscreen: {
        overlay: 'p-0',
        content: [
          'h-full max-w-none rounded-none',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        ],
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ModalVariantProps = VariantProps<typeof modalVariants>;

// Context for sharing IDs between modal parts for accessibility
type ModalContextType = {
  titleId?: string;
  descriptionId?: string;
  hasTitleBeenRendered: boolean;
  setHasTitleBeenRendered: (value: boolean) => void;
};

const ModalContext = React.createContext<ModalContextType>({
  hasTitleBeenRendered: false,
  setHasTitleBeenRendered: () => {},
});
const useModalContext = () => React.useContext(ModalContext);

const ModalRoot = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;
const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & ModalVariantProps
>(({ className, variant, ...rest }, forwardedRef) => {
  const { overlay } = modalVariants({ variant });
  return (
    <DialogPrimitive.Overlay
      ref={forwardedRef}
      className={overlay({ class: className })}
      {...rest}
    />
  );
});
ModalOverlay.displayName = 'ModalOverlay';

/**
 * ModalContent - The main content container for the modal
 *
 * @example
 * <Modal.Root>
 *   <Modal.Trigger asChild>
 *     <Button>Open Modal</Button>
 *   </Modal.Trigger>
 *   <Modal.Content>
 *     <Modal.Header title="Modal Title" description="Modal description" />
 *     <Modal.Body>Content here</Modal.Body>
 *     <Modal.Footer>Footer actions</Modal.Footer>
 *   </Modal.Content>
 * </Modal.Root>
 */
const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    ModalVariantProps & {
      overlayClassName?: string;
      showClose?: boolean;
      /** Fallback title for accessibility when no visible title is provided */
      accessibilityTitle?: string;
    }
>(
  (
    { className, overlayClassName, children, showClose = true, variant, accessibilityTitle = 'Modal', ...rest },
    forwardedRef,
  ) => {
    const { content } = modalVariants({ variant });
    // Generate unique IDs for aria-labelledby and aria-describedby
    const titleId = React.useId();
    const descriptionId = React.useId();
    const [hasTitleBeenRendered, setHasTitleBeenRendered] = React.useState(false);

    return (
      <ModalContext.Provider value={{ titleId, descriptionId, hasTitleBeenRendered, setHasTitleBeenRendered }}>
        <ModalPortal>
          <ModalOverlay className={overlayClassName} variant={variant}>
            <DialogPrimitive.Content
              ref={forwardedRef}
              className={content({ class: className })}
              aria-modal="true"
              {...rest}
            >
              {/* Always render a DialogTitle for accessibility - visually hidden if no title rendered */}
              <VisuallyHidden asChild>
                <DialogPrimitive.Title>{accessibilityTitle}</DialogPrimitive.Title>
              </VisuallyHidden>
              {children}
              {showClose && (
                <ModalClose asChild>
                  <CompactButton.Root
                    variant='ghost'
                    size='large'
                    className={cn(
                      'absolute right-4 top-4',
                      variant === 'fullscreen' && 'right-6 top-6',
                    )}
                    aria-label='Close modal'
                  >
                    <CompactButton.Icon as={RiCloseLine} />
                  </CompactButton.Root>
                </ModalClose>
              )}
            </DialogPrimitive.Content>
          </ModalOverlay>
        </ModalPortal>
      </ModalContext.Provider>
    );
  },
);
ModalContent.displayName = 'ModalContent';

function ModalHeader({
  className,
  children,
  icon: Icon,
  title,
  description,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  icon?: RemixiconComponentType;
  title?: string;
  description?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex items-start gap-3.5 py-4 pl-5 pr-14',
        'before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-stroke-soft-200',
        className,
      )}
      {...rest}
    >
      {children || (
        <>
          {Icon && (
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200'>
              <Icon className='size-5 text-text-sub-600' />
            </div>
          )}
          {(title || description) && (
            <div className='flex-1 space-y-1'>
              {title && <ModalTitle>{title}</ModalTitle>}
              {description && (
                <ModalDescription>{description}</ModalDescription>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
ModalHeader.displayName = 'ModalHeader';

/**
 * ModalTitle - The visible title element for the modal
 * Note: A visually hidden DialogTitle is already rendered in ModalContent for accessibility
 */
const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <h2
      ref={forwardedRef}
      className={cn('text-label-sm text-text-strong-950', className)}
      {...rest}
    />
  );
});
ModalTitle.displayName = 'ModalTitle';

/**
 * ModalDescription - The description element for the modal
 */
const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <p
      ref={forwardedRef}
      className={cn('text-paragraph-xs text-text-sub-600', className)}
      {...rest}
    />
  );
});
ModalDescription.displayName = 'ModalDescription';

function ModalBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...rest} />;
}
ModalBody.displayName = 'ModalBody';

function ModalFooter({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-stroke-soft-200 px-5 py-4',
        className,
      )}
      {...rest}
    />
  );
}

ModalFooter.displayName = 'ModalFooter';

export {
  ModalRoot as Root,
  ModalTrigger as Trigger,
  ModalClose as Close,
  ModalPortal as Portal,
  ModalOverlay as Overlay,
  ModalContent as Content,
  ModalHeader as Header,
  ModalTitle as Title,
  ModalDescription as Description,
  ModalBody as Body,
  ModalFooter as Footer,
  modalVariants,
  type ModalVariantProps,
};
