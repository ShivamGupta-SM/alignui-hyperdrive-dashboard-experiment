// AlignUI List v0.1.0 - List component with variants

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const listVariants = tv({
  slots: {
    root: 'flex flex-col',
    item: 'flex items-center gap-3',
    icon: 'shrink-0 flex items-center justify-center',
    iconSize: '', // Size class for direct icon children only
    content: 'flex flex-1 flex-col min-w-0',
    title: 'text-label-sm text-text-strong-950',
    description: 'text-paragraph-xs text-text-sub-600',
    action: 'shrink-0',
  },
  variants: {
    variant: {
      default: {
        root: '',
        item: '',
      },
      divided: {
        root: 'divide-y divide-stroke-soft-200',
        item: 'py-3 first:pt-0 last:pb-0',
      },
      bordered: {
        root: 'rounded-xl border border-stroke-soft-200',
        item: 'px-4 py-3 border-b border-stroke-soft-200 last:border-b-0',
      },
    },
    size: {
      sm: {
        item: 'gap-2',
        iconSize: 'size-4',
        title: 'text-label-xs',
        description: 'text-paragraph-xs',
      },
      md: {
        item: 'gap-3',
        iconSize: 'size-5',
        title: 'text-label-sm',
        description: 'text-paragraph-xs',
      },
      lg: {
        item: 'gap-4',
        iconSize: 'size-6',
        title: 'text-label-md',
        description: 'text-paragraph-sm',
      },
    },
    interactive: {
      true: {
        item: 'cursor-pointer transition-colors duration-200 hover:bg-bg-weak-50',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type ListVariantProps = VariantProps<typeof listVariants>;

interface ListRootProps
  extends React.HTMLAttributes<HTMLUListElement>,
    ListVariantProps {}

const ListContext = React.createContext<ListVariantProps>({});

const ListRoot = React.forwardRef<HTMLUListElement, ListRootProps>(
  ({ className, variant, size, interactive, children, ...rest }, forwardedRef) => {
    const { root } = listVariants({ variant, size, interactive });

    return (
      <ListContext.Provider value={{ variant, size, interactive }}>
        <ul
          ref={forwardedRef}
          className={cn(root(), className)}
          role="list"
          {...rest}
        >
          {children}
        </ul>
      </ListContext.Provider>
    );
  },
);
ListRoot.displayName = 'ListRoot';

interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  asChild?: boolean;
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, children, ...rest }, forwardedRef) => {
    const context = React.useContext(ListContext);
    const { item } = listVariants(context);

    return (
      <li
        ref={forwardedRef}
        className={cn(item(), className)}
        {...rest}
      >
        {children}
      </li>
    );
  },
);
ListItem.displayName = 'ListItem';

interface ListItemIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, applies size constraints from variant. Use false when passing custom icon containers. */
  autoSize?: boolean;
}

const ListItemIcon = React.forwardRef<HTMLDivElement, ListItemIconProps>(
  ({ className, autoSize = false, children, ...rest }, forwardedRef) => {
    const context = React.useContext(ListContext);
    const { icon, iconSize } = listVariants(context);

    return (
      <div
        ref={forwardedRef}
        className={cn(
          icon(),
          'text-text-sub-600',
          // Only apply size constraints if autoSize is true (for direct icon usage)
          autoSize && iconSize(),
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
ListItemIcon.displayName = 'ListItemIcon';

const ListItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, forwardedRef) => {
  const context = React.useContext(ListContext);
  const { content } = listVariants(context);

  return (
    <div
      ref={forwardedRef}
      className={cn(content(), className)}
      {...rest}
    />
  );
});
ListItemContent.displayName = 'ListItemContent';

const ListItemTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...rest }, forwardedRef) => {
  const context = React.useContext(ListContext);
  const { title } = listVariants(context);

  return (
    <span
      ref={forwardedRef}
      className={cn(title(), 'truncate', className)}
      {...rest}
    />
  );
});
ListItemTitle.displayName = 'ListItemTitle';

const ListItemDescription = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...rest }, forwardedRef) => {
  const context = React.useContext(ListContext);
  const { description } = listVariants(context);

  return (
    <span
      ref={forwardedRef}
      className={cn(description(), 'truncate', className)}
      {...rest}
    />
  );
});
ListItemDescription.displayName = 'ListItemDescription';

const ListItemAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, forwardedRef) => {
  const context = React.useContext(ListContext);
  const { action } = listVariants(context);

  return (
    <div
      ref={forwardedRef}
      className={cn(action(), className)}
      {...rest}
    />
  );
});
ListItemAction.displayName = 'ListItemAction';

// Simple list item helper
interface SimpleListItemProps extends ListItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function SimpleListItem({
  icon,
  title,
  description,
  action,
  ...rest
}: SimpleListItemProps) {
  return (
    <ListItem {...rest}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemContent>
        <ListItemTitle>{title}</ListItemTitle>
        {description && <ListItemDescription>{description}</ListItemDescription>}
      </ListItemContent>
      {action && <ListItemAction>{action}</ListItemAction>}
    </ListItem>
  );
}
SimpleListItem.displayName = 'SimpleListItem';

// Ordered list
const OrderedList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement> & ListVariantProps
>(({ className, variant, size, children, ...rest }, forwardedRef) => {
  const { root } = listVariants({ variant, size });

  return (
    <ListContext.Provider value={{ variant, size }}>
      <ol
        ref={forwardedRef}
        className={cn(root(), 'list-decimal list-inside', className)}
        {...rest}
      >
        {children}
      </ol>
    </ListContext.Provider>
  );
});
OrderedList.displayName = 'OrderedList';

// Bulleted list
const BulletedList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & ListVariantProps
>(({ className, variant, size, children, ...rest }, forwardedRef) => {
  const { root } = listVariants({ variant, size });

  return (
    <ListContext.Provider value={{ variant, size }}>
      <ul
        ref={forwardedRef}
        className={cn(root(), 'list-disc list-inside', className)}
        {...rest}
      >
        {children}
      </ul>
    </ListContext.Provider>
  );
});
BulletedList.displayName = 'BulletedList';

export {
  ListRoot as Root,
  ListItem as Item,
  ListItemIcon as ItemIcon,
  ListItemContent as ItemContent,
  ListItemTitle as ItemTitle,
  ListItemDescription as ItemDescription,
  ListItemAction as ItemAction,
  SimpleListItem,
  OrderedList,
  BulletedList,
  listVariants,
};
