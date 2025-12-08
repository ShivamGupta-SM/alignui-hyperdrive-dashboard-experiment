// AlignUI Table v0.1.0 - Enhanced with sorting, empty state, loading

import * as React from 'react';

import * as Divider from '@/components/ui/divider';
import { cn } from '@/utils/cn';
import { RiArrowUpLine, RiArrowDownLine, RiArrowUpDownLine } from '@remixicon/react';
import { Skeleton } from '@/components/ui/skeleton';

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <table 
      ref={forwardedRef} 
      className={cn('w-full border-separate border-spacing-0', className)} 
      {...rest} 
    />
  );
});
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <thead 
      ref={forwardedRef} 
      className={className} 
      {...rest} 
    />
  );
});
TableHeader.displayName = 'TableHeader';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <th
      ref={forwardedRef}
      className={cn(
        'bg-bg-weak-50 px-3 py-3.5 text-left text-label-sm font-medium text-text-sub-600',
        'border-b border-stroke-soft-200',
        className,
      )}
      {...rest}
    />
  );
});
TableHead.displayName = 'TableHead';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <tbody 
      ref={forwardedRef} 
      className={className} 
      {...rest} 
    />
  );
});
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <tr 
      ref={forwardedRef} 
      className={cn(
        'group/row',
        className
      )} 
      {...rest} 
    />
  );
});
TableRow.displayName = 'TableRow';

function TableRowDivider({
  className,
  dividerClassName,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Divider.Root> & {
  dividerClassName?: string;
}) {
  return (
    <tr aria-hidden='true' className={className}>
      <td colSpan={999} className='py-1'>
        <Divider.Root
          variant='line-spacing'
          className={dividerClassName}
          {...rest}
        />
      </td>
    </tr>
  );
}
TableRowDivider.displayName = 'TableRowDivider';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <td
      ref={forwardedRef}
      className={cn(
        'h-16 px-3 py-3 text-paragraph-sm text-text-strong-950',
        'border-b border-stroke-soft-200',
        'transition duration-200 ease-out group-hover/row:bg-bg-weak-50',
        className,
      )}
      {...rest}
    />
  );
});
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...rest }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    className={cn('mt-4 text-paragraph-sm text-text-sub-600', className)}
    {...rest}
  />
));
TableCaption.displayName = 'TableCaption';

// Sortable header cell
type SortDirection = 'asc' | 'desc' | null;

interface TableSortableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortDirection?: SortDirection;
  onSort?: () => void;
}

const TableSortableHead = React.forwardRef<HTMLTableCellElement, TableSortableHeadProps>(
  ({ className, children, sortDirection, onSort, ...rest }, forwardedRef) => {
    return (
      <th
        ref={forwardedRef}
        className={cn(
          'bg-bg-weak-50 px-3 py-2 text-left text-paragraph-sm text-text-sub-600 first:rounded-l-lg last:rounded-r-lg',
          'cursor-pointer select-none transition-colors hover:bg-bg-soft-200',
          className,
        )}
        onClick={onSort}
        aria-sort={
          sortDirection === 'asc' ? 'ascending' :
          sortDirection === 'desc' ? 'descending' : 'none'
        }
        {...rest}
      >
        <span className="flex items-center gap-1">
          {children}
          <span className="ml-auto shrink-0" aria-hidden="true">
            {sortDirection === 'asc' && <RiArrowUpLine className="size-4 text-text-strong-950" />}
            {sortDirection === 'desc' && <RiArrowDownLine className="size-4 text-text-strong-950" />}
            {!sortDirection && <RiArrowUpDownLine className="size-4 text-text-soft-400" />}
          </span>
        </span>
      </th>
    );
  },
);
TableSortableHead.displayName = 'TableSortableHead';

// Empty state
interface TableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan?: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

function TableEmpty({
  colSpan = 999,
  icon,
  title = 'No data available',
  description,
  className,
  children,
  ...rest
}: TableEmptyProps) {
  return (
    <tr className={className} {...rest}>
      <td colSpan={colSpan} className="h-48">
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          {icon && <div className="text-text-soft-400">{icon}</div>}
          {children || (
            <>
              <p className="text-label-sm text-text-strong-950">{title}</p>
              {description && (
                <p className="text-paragraph-sm text-text-sub-600">{description}</p>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
TableEmpty.displayName = 'TableEmpty';

// Loading skeleton rows
interface TableLoadingProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  rows?: number;
  columns?: number;
}

function TableLoading({
  rows = 5,
  columns = 4,
  className,
  ...rest
}: TableLoadingProps) {
  return (
    <tbody className={className} aria-busy="true" aria-live="polite" {...rest}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="group/row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td
              key={colIndex}
              className="h-16 px-3 first:rounded-l-xl last:rounded-r-xl"
            >
              <Skeleton
                variant="text"
                className={colIndex === 0 ? 'w-2/3' : 'w-full'}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
TableLoading.displayName = 'TableLoading';

export {
  Table as Root,
  TableHeader as Header,
  TableBody as Body,
  TableHead as Head,
  TableSortableHead as SortableHead,
  TableRow as Row,
  TableRowDivider as RowDivider,
  TableCell as Cell,
  TableCaption as Caption,
  TableEmpty as Empty,
  TableLoading as Loading,
  type SortDirection,
};
