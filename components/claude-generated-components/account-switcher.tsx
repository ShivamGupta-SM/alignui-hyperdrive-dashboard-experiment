// AlignUI AccountSwitcher v0.0.0
// Workspace/Organization/Account switcher dropdown

'use client';

import * as React from 'react';
import Image from 'next/image';
import { AvatarWithFallback } from '@/components/ui/avatar';
import { tv } from '@/utils/tv';
import { cn } from '@/utils/cn';
import {
  CaretUpDown,
  User,
  Gear,
  BookOpen,
  SignOut,
  Plus,
  Check,
} from '@phosphor-icons/react/dist/ssr';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

const ACCOUNT_SWITCHER_NAME = 'AccountSwitcher';
const ACCOUNT_MENU_ITEM_NAME = 'AccountMenuItem';

export const accountSwitcherVariants = tv({
  slots: {
    trigger: [
      // base
      'relative flex w-full items-center gap-3 rounded-xl',
      'border border-stroke-soft-200 bg-bg-white-0',
      'cursor-pointer transition-colors duration-150',
      // hover
      'hover:bg-bg-weak-50',
      // focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
    ],
    avatar: 'size-10 shrink-0 rounded-full object-cover',
    avatarPlaceholder: [
      'flex size-10 shrink-0 items-center justify-center rounded-full',
      'bg-bg-soft-200 text-text-sub-600',
    ],
    info: 'flex flex-1 flex-col overflow-hidden text-left',
    name: 'truncate text-label-sm font-semibold text-text-strong-950 text-left',
    email: 'truncate text-paragraph-xs text-text-sub-600 text-left',
    expandIcon: [
      'absolute top-1.5 right-1.5',
      'flex items-center justify-center rounded-md p-1.5',
      'text-text-soft-400',
    ],
    content: [
      // base
      'z-50 w-64 rounded-xl bg-bg-white-0 shadow-lg',
      'border border-stroke-soft-200',
      // animation
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    ],
    menuSection: 'flex flex-col gap-0.5 py-1.5',
    menuSectionTitle: 'px-3 pt-1.5 pb-1 text-label-xs font-semibold text-text-soft-400',
    menuItem: [
      // base
      'flex w-full items-center justify-between gap-3 px-3 py-2',
      'cursor-pointer transition-colors duration-150 outline-none',
      // hover
      'hover:bg-bg-weak-50 focus:bg-bg-weak-50',
      // highlighted
      'data-highlighted:bg-bg-weak-50',
    ],
    menuItemIcon: 'size-5 text-text-soft-400',
    menuItemLabel: 'flex-1 text-label-sm font-semibold text-text-sub-600',
    menuItemShortcut: [
      'flex items-center rounded px-1 py-px',
      'text-label-xs font-medium text-text-soft-400',
      'border border-stroke-soft-200',
    ],
    accountItem: [
      // base
      'relative flex w-full items-center gap-3 rounded-md px-2 py-1.5',
      'cursor-pointer transition-colors duration-150 outline-none',
      // hover
      'hover:bg-bg-weak-50 focus:bg-bg-weak-50',
      // highlighted
      'data-highlighted:bg-bg-weak-50',
    ],
    accountItemAvatar: 'size-8 shrink-0 rounded-full object-cover',
    accountItemInfo: 'flex flex-1 flex-col overflow-hidden',
    accountItemName: 'truncate text-label-sm font-medium text-text-strong-950',
    accountItemEmail: 'truncate text-paragraph-xs text-text-sub-600',
    accountItemRadio: [
      'flex size-4 items-center justify-center rounded-full',
      'border border-stroke-soft-200',
      'data-[selected=true]:bg-primary-base data-[selected=true]:border-primary-base',
    ],
    statusIndicator: [
      'absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-bg-white-0',
    ],
    addButton: [
      // base
      'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2',
      'text-label-sm font-semibold text-text-sub-600',
      'border border-stroke-soft-200',
      'cursor-pointer transition-colors duration-150 outline-none',
      // hover
      'hover:bg-bg-weak-50 hover:text-text-strong-950',
      // focus
      'focus:bg-bg-weak-50 focus:text-text-strong-950',
      // highlighted
      'data-highlighted:bg-bg-weak-50',
    ],
    divider: 'h-px bg-stroke-soft-200 my-1',
  },
  variants: {
    size: {
      default: {},
      compact: {
        trigger: 'rounded-10 px-3 py-2',
        avatar: 'size-8',
        avatarPlaceholder: 'size-8',
        expandIcon: 'top-1 right-1',
        name: 'text-label-sm',
        email: 'text-paragraph-xs text-text-sub-600',
      },
    },
    //#region status
    status: {
      online: {
        statusIndicator: 'bg-success-base',
      },
      offline: {
        statusIndicator: 'bg-text-soft-400',
      },
      busy: {
        statusIndicator: 'bg-error-base',
      },
      away: {
        statusIndicator: 'bg-warning-base',
      },
    },
    //#endregion
  },
  defaultVariants: {
    size: 'default',
    status: 'online',
  },
});

export type AccountType = {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** Avatar image URL */
  avatar?: string;
  /** Online status */
  status?: 'online' | 'offline' | 'busy' | 'away';
};

type MenuItemConfig = {
  /** Menu item label */
  label: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Click handler */
  onClick?: () => void;
};

type AccountSwitcherProps = React.HTMLAttributes<HTMLDivElement> & {
  /** List of accounts */
  accounts: AccountType[];
  /** Currently selected account ID */
  selectedAccountId: string;
  /** Callback when account is changed */
  onAccountChange?: (accountId: string) => void;
  /** Callback when add account is clicked */
  onAddAccount?: () => void;
  /** Callback when sign out is clicked */
  onSignOut?: () => void;
  /** Custom menu items */
  menuItems?: MenuItemConfig[];
  /** Dropdown placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show the add account button */
  showAddAccount?: boolean;
  /** Compact style for tighter layouts */
  compact?: boolean;
};

const defaultMenuItems: MenuItemConfig[] = [
  { label: 'View profile', icon: <User weight="duotone" className='size-5' />, shortcut: '⌘K→P' },
  { label: 'Account settings', icon: <Gear weight="duotone" className='size-5' />, shortcut: '⌘S' },
  { label: 'Documentation', icon: <BookOpen weight="duotone" className='size-5' /> },
];

const AccountSwitcher = React.forwardRef<HTMLDivElement, AccountSwitcherProps>(
  (
    {
      className,
      accounts,
      selectedAccountId,
      onAccountChange,
      onAddAccount,
      onSignOut,
      menuItems = defaultMenuItems,
      placement = 'right',
      showAddAccount = true,
      compact = false,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = accountSwitcherVariants({ size: compact ? 'compact' : 'default' });

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

    if (!selectedAccount) {
      console.warn(`Account with ID ${selectedAccountId} not found`);
      return null;
    }

    const handleAccountSelect = (accountId: string) => {
      onAccountChange?.(accountId);
    };

    return (
      <div ref={forwardedRef} className={className} {...rest}>
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <button type='button' className={styles.trigger()}>
              <div className='relative'>
                <AvatarWithFallback
                  src={selectedAccount.avatar}
                  name={selectedAccount.name}
                  size={compact ? '32' : '40'}
                  className={styles.avatarPlaceholder()}
                />
                {selectedAccount.status && (
                  <span
                    className={accountSwitcherVariants({ status: selectedAccount.status }).statusIndicator()}
                    aria-hidden='true'
                  />
                )}
              </div>

              <div className={styles.info()}>
                <span className={styles.name()}>{selectedAccount.name}</span>
                <span className={styles.email()}>{selectedAccount.email}</span>
              </div>

              <span className={styles.expandIcon()} aria-hidden='true'>
                <CaretUpDown weight="bold" className='size-4' />
              </span>
            </button>
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              className={styles.content()}
              side={placement}
              sideOffset={8}
              align='start'
            >
              {/* Menu items */}
              <DropdownMenuPrimitive.Group className={styles.menuSection()}>
                {menuItems.map((item, index) => (
                  <DropdownMenuPrimitive.Item
                    key={index}
                    className={styles.menuItem()}
                    onSelect={item.onClick}
                  >
                    <div className='flex items-center gap-2'>
                      {item.icon && (
                        <span className={styles.menuItemIcon()}>{item.icon}</span>
                      )}
                      <span className={styles.menuItemLabel()}>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <kbd className={styles.menuItemShortcut()}>{item.shortcut}</kbd>
                    )}
                  </DropdownMenuPrimitive.Item>
                ))}
              </DropdownMenuPrimitive.Group>

              <DropdownMenuPrimitive.Separator className={styles.divider()} />

              {/* Account switcher section */}
              <DropdownMenuPrimitive.Group className={styles.menuSection()}>
                <DropdownMenuPrimitive.Label className={styles.menuSectionTitle()}>
                  Switch account
                </DropdownMenuPrimitive.Label>

                <DropdownMenuPrimitive.RadioGroup
                  value={selectedAccountId}
                  onValueChange={handleAccountSelect}
                  className='flex flex-col gap-0.5 px-1.5'
                >
                  {accounts.map((account) => (
                    <DropdownMenuPrimitive.RadioItem
                      key={account.id}
                      value={account.id}
                      className={cn(
                        styles.accountItem(),
                        account.id === selectedAccountId && 'bg-bg-weak-50',
                      )}
                    >
                      <div className='relative'>
                        <AvatarWithFallback
                          src={account.avatar}
                          name={account.name}
                          size='32'
                          className={styles.accountItemAvatar()}
                        />
                        {account.status && (
                          <span
                            className={cn(
                              accountSwitcherVariants({ status: account.status }).statusIndicator(),
                              'size-2',
                            )}
                            aria-hidden='true'
                          />
                        )}
                      </div>

                      <div className={styles.accountItemInfo()}>
                        <span className={styles.accountItemName()}>{account.name}</span>
                        <span className={styles.accountItemEmail()}>{account.email}</span>
                      </div>

                      <DropdownMenuPrimitive.ItemIndicator asChild>
                        <div
                          className={styles.accountItemRadio()}
                          data-selected={account.id === selectedAccountId}
                        >
                          <Check weight="bold" className='size-3 text-static-white' />
                        </div>
                      </DropdownMenuPrimitive.ItemIndicator>
                      {account.id !== selectedAccountId && (
                        <div
                          className={styles.accountItemRadio()}
                          data-selected={false}
                        />
                      )}
                    </DropdownMenuPrimitive.RadioItem>
                  ))}
                </DropdownMenuPrimitive.RadioGroup>
              </DropdownMenuPrimitive.Group>

              {/* Add account button */}
              {showAddAccount && (
                <div className='px-2 pt-0.5 pb-2'>
                  <DropdownMenuPrimitive.Item
                    className={styles.addButton()}
                    onSelect={onAddAccount}
                  >
                    <Plus weight="bold" className='size-4' />
                    Add account
                  </DropdownMenuPrimitive.Item>
                </div>
              )}

              <DropdownMenuPrimitive.Separator className={styles.divider()} />

              {/* Sign out */}
              <DropdownMenuPrimitive.Group className='py-1.5'>
                <DropdownMenuPrimitive.Item
                  className={styles.menuItem()}
                  onSelect={onSignOut}
                >
                  <div className='flex items-center gap-2'>
                    <SignOut weight="duotone" className='size-5 text-text-soft-400' />
                    <span className={styles.menuItemLabel()}>Sign out</span>
                  </div>
                  <kbd className={styles.menuItemShortcut()}>⌥⇧Q</kbd>
                </DropdownMenuPrimitive.Item>
              </DropdownMenuPrimitive.Group>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
    );
  },
);
AccountSwitcher.displayName = ACCOUNT_SWITCHER_NAME;

// Simple account menu item for building custom menus
type AccountMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  /** Menu item label */
  label: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string;
};

const AccountMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  AccountMenuItemProps
>(({ className, label, icon, shortcut, ...rest }, forwardedRef) => {
  const styles = accountSwitcherVariants();

  return (
    <DropdownMenuPrimitive.Item
      ref={forwardedRef}
      className={cn(styles.menuItem(), className)}
      {...rest}
    >
      <div className='flex items-center gap-2'>
        {icon && <span className={styles.menuItemIcon()}>{icon}</span>}
        <span className={styles.menuItemLabel()}>{label}</span>
      </div>
      {shortcut && <kbd className={styles.menuItemShortcut()}>{shortcut}</kbd>}
    </DropdownMenuPrimitive.Item>
  );
});
AccountMenuItem.displayName = ACCOUNT_MENU_ITEM_NAME;

export { AccountSwitcher, AccountMenuItem };
