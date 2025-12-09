// AlignUI SidebarNavigation v0.0.0

'use client';

import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { tv, type VariantProps } from '@/utils/tv';
import { Slot } from '@radix-ui/react-slot';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';

const SIDEBAR_ROOT_NAME = 'SidebarRoot';
const SIDEBAR_HEADER_NAME = 'SidebarHeader';
const SIDEBAR_CONTENT_NAME = 'SidebarContent';
const SIDEBAR_FOOTER_NAME = 'SidebarFooter';
const SIDEBAR_NAV_NAME = 'SidebarNav';
const SIDEBAR_NAV_ITEM_NAME = 'SidebarNavItem';
const SIDEBAR_NAV_GROUP_NAME = 'SidebarNavGroup';
const SIDEBAR_NAV_GROUP_LABEL_NAME = 'SidebarNavGroupLabel';
const SIDEBAR_SEARCH_NAME = 'SidebarSearch';
const SIDEBAR_DIVIDER_NAME = 'SidebarDivider';

export const sidebarVariants = tv({
  slots: {
    root: [
      'flex h-full w-72 flex-col',
      'border-r border-stroke-soft-200 bg-bg-white-0',
    ],
    header: 'flex items-center gap-3 px-4 py-5',
    content: 'flex-1 overflow-y-auto px-3 py-2',
    footer: 'border-t border-stroke-soft-200 px-3 py-4',
    nav: 'flex flex-col gap-0.5',
    navItem: [
      'group/nav-item flex items-center gap-3 rounded-10 px-3 py-2.5',
      'text-label-sm text-text-sub-600',
      'transition duration-200 ease-out',
      'cursor-pointer outline-none',
      // hover
      'hover:bg-bg-weak-50 hover:text-text-strong-950',
      // focus
      'focus-visible:bg-bg-weak-50 focus-visible:text-text-strong-950',
    ],
    navItemIcon: 'size-5 shrink-0 text-text-soft-400 group-hover/nav-item:text-text-sub-600',
    navItemLabel: 'flex-1 truncate',
    navItemBadge: 'ml-auto',
    navGroup: 'flex flex-col gap-0.5',
    navGroupLabel: 'px-3 py-2 text-subheading-xs uppercase text-text-soft-400',
    search: [
      'flex items-center gap-2 rounded-10 px-3 py-2.5',
      'bg-bg-weak-50 text-text-soft-400',
      'ring-1 ring-inset ring-transparent',
      'transition duration-200 ease-out',
      'focus-within:bg-bg-white-0 focus-within:ring-stroke-strong-950',
    ],
    searchIcon: 'size-5 shrink-0',
    searchInput: [
      'flex-1 bg-transparent text-label-sm text-text-strong-950',
      'placeholder:text-text-soft-400',
      'outline-none',
    ],
    divider: 'my-2 h-px bg-stroke-soft-200',
  },
  variants: {
    variant: {
      default: {},
      slim: {
        root: 'w-16',
        header: 'justify-center px-2',
        content: 'px-2',
        footer: 'px-2',
        navItem: 'justify-center px-2',
        navItemLabel: 'sr-only',
        navItemBadge: 'sr-only',
      },
    },
    isActive: {
      true: {
        navItem: [
          'bg-bg-weak-50 text-text-strong-950',
          'font-medium',
        ],
        navItemIcon: 'text-primary-base',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    isActive: false,
  },
});

type SidebarContextType = VariantProps<typeof sidebarVariants> & {
  activeUrl?: string;
};

const SidebarContext = React.createContext<SidebarContextType>({
  variant: 'default',
});

const useSidebarContext = () => React.useContext(SidebarContext);

type SidebarRootProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sidebarVariants> & {
    activeUrl?: string;
  };

const SidebarRoot = React.forwardRef<HTMLElement, SidebarRootProps>(
  ({ className, variant = 'default', activeUrl, children, ...rest }, forwardedRef) => {
    const { root } = sidebarVariants({ variant });

    return (
      <SidebarContext.Provider value={{ variant, activeUrl }}>
        <aside ref={forwardedRef} className={root({ class: className })} {...rest}>
          {children}
        </aside>
      </SidebarContext.Provider>
    );
  },
);
SidebarRoot.displayName = SIDEBAR_ROOT_NAME;

type SidebarHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { variant } = useSidebarContext();
    const { header } = sidebarVariants({ variant });

    return (
      <div ref={forwardedRef} className={header({ class: className })} {...rest} />
    );
  },
);
SidebarHeader.displayName = SIDEBAR_HEADER_NAME;

type SidebarContentProps = React.HTMLAttributes<HTMLDivElement>;

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { variant } = useSidebarContext();
    const { content } = sidebarVariants({ variant });

    return (
      <div ref={forwardedRef} className={content({ class: className })} {...rest} />
    );
  },
);
SidebarContent.displayName = SIDEBAR_CONTENT_NAME;

type SidebarFooterProps = React.HTMLAttributes<HTMLDivElement>;

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { footer } = sidebarVariants();

    return (
      <div ref={forwardedRef} className={footer({ class: className })} {...rest} />
    );
  },
);
SidebarFooter.displayName = SIDEBAR_FOOTER_NAME;

type SidebarNavProps = React.HTMLAttributes<HTMLElement>;

const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { nav } = sidebarVariants();

    return (
      <nav ref={forwardedRef} className={nav({ class: className })} {...rest} />
    );
  },
);
SidebarNav.displayName = SIDEBAR_NAV_NAME;

type SidebarNavItemProps<T extends React.ElementType = 'a'> = PolymorphicComponentProps<
  T,
  {
    icon?: React.ComponentType<{ className?: string }>;
    badge?: React.ReactNode;
    isActive?: boolean;
    asChild?: boolean;
  }
>;

function SidebarNavItem<T extends React.ElementType = 'a'>({
  className,
  as,
  icon: Icon,
  badge,
  isActive: isActiveProp,
  asChild,
  children,
  ...rest
}: SidebarNavItemProps<T>) {
  const { variant, activeUrl } = useSidebarContext();

  // Check if this item is active based on href prop or isActive prop
  const href = (rest as { href?: string }).href;
  const isActive = isActiveProp ?? (href && activeUrl ? href === activeUrl : false);

  const { navItem, navItemIcon, navItemLabel, navItemBadge } = sidebarVariants({
    variant,
    isActive,
  });

  const Component = asChild ? Slot : as || 'a';

  return (
    <Component
      className={navItem({ class: className })}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {Icon && <Icon className={navItemIcon()} />}
      <span className={navItemLabel()}>{children}</span>
      {badge && <span className={navItemBadge()}>{badge}</span>}
    </Component>
  );
}
SidebarNavItem.displayName = SIDEBAR_NAV_ITEM_NAME;

type SidebarNavGroupProps = React.HTMLAttributes<HTMLDivElement>;

const SidebarNavGroup = React.forwardRef<HTMLDivElement, SidebarNavGroupProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { navGroup } = sidebarVariants();

    return (
      <div ref={forwardedRef} className={navGroup({ class: className })} {...rest} />
    );
  },
);
SidebarNavGroup.displayName = SIDEBAR_NAV_GROUP_NAME;

type SidebarNavGroupLabelProps = React.HTMLAttributes<HTMLDivElement>;

function SidebarNavGroupLabel({ className, ...rest }: SidebarNavGroupLabelProps) {
  const { navGroupLabel } = sidebarVariants();

  return <div className={navGroupLabel({ class: className })} {...rest} />;
}
SidebarNavGroupLabel.displayName = SIDEBAR_NAV_GROUP_LABEL_NAME;

type SidebarSearchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

const SidebarSearch = React.forwardRef<HTMLInputElement, SidebarSearchProps>(
  ({ className, placeholder = 'Search...', ...rest }, forwardedRef) => {
    const { search, searchIcon, searchInput } = sidebarVariants();

    return (
      <div className={search({ class: className })}>
        <MagnifyingGlass weight="bold" className={searchIcon()} />
        <input
          ref={forwardedRef}
          type='search'
          placeholder={placeholder}
          className={searchInput()}
          {...rest}
        />
      </div>
    );
  },
);
SidebarSearch.displayName = SIDEBAR_SEARCH_NAME;

type SidebarDividerProps = React.HTMLAttributes<HTMLDivElement>;

function SidebarDivider({ className, ...rest }: SidebarDividerProps) {
  const { divider } = sidebarVariants();

  return <div className={divider({ class: className })} role='separator' {...rest} />;
}
SidebarDivider.displayName = SIDEBAR_DIVIDER_NAME;

export {
  SidebarRoot as Root,
  SidebarHeader as Header,
  SidebarContent as Content,
  SidebarFooter as Footer,
  SidebarNav as Nav,
  SidebarNavItem as NavItem,
  SidebarNavGroup as NavGroup,
  SidebarNavGroupLabel as NavGroupLabel,
  SidebarSearch as Search,
  SidebarDivider as Divider,
};
