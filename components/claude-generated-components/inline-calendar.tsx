// AlignUI InlineCalendar v0.0.0
// Inline calendar widget for date selection

'use client';

import * as React from 'react';
import { tv } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

const INLINE_CALENDAR_NAME = 'InlineCalendar';

export const inlineCalendarVariants = tv({
  slots: {
    root: 'flex flex-col gap-3',
    header: 'flex items-center justify-between',
    headerTitle: 'text-label-md font-semibold text-text-strong-950',
    navButton: [
      // base
      'flex items-center justify-center rounded-lg p-2',
      // hover
      'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
      'transition-colors duration-150',
      // focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
      // disabled
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    inputRow: 'flex gap-3',
    dateInput: [
      // base
      'flex-1 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2',
      'text-paragraph-sm text-text-strong-950',
      'placeholder:text-text-soft-400',
      // focus
      'focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent',
    ],
    presetButton: [
      // base
      'rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2',
      'text-label-sm font-medium text-text-sub-600',
      // hover
      'hover:bg-bg-weak-50 hover:text-text-strong-950',
      'transition-colors duration-150',
      // focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
    ],
    grid: 'w-full focus:outline-none',
    weekHeader: 'grid grid-cols-7 border-b border-stroke-soft-200 pb-2',
    weekDay: 'flex items-center justify-center text-label-xs font-medium text-text-sub-600',
    body: 'mt-2 grid grid-cols-7 gap-y-1',
    cell: [
      // base
      'flex items-center justify-center rounded-lg p-2',
      'text-paragraph-sm transition-colors duration-150',
      // focus
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-inset',
    ],
  },
  variants: {
    //#region cellState
    cellState: {
      default: {
        cell: 'text-text-strong-950 hover:bg-bg-weak-50 cursor-pointer',
      },
      selected: {
        cell: 'bg-primary-base text-static-white hover:bg-primary-dark cursor-pointer',
      },
      today: {
        cell: 'bg-bg-weak-50 text-primary-base font-semibold hover:bg-primary-lighter cursor-pointer',
      },
      highlighted: {
        cell: 'bg-primary-lighter text-primary-base hover:bg-primary-light cursor-pointer',
      },
      disabled: {
        cell: 'text-text-disabled-300 cursor-not-allowed',
      },
      outside: {
        cell: 'text-text-soft-400 hover:bg-bg-weak-50 cursor-pointer',
      },
    },
    //#endregion
  },
  defaultVariants: {
    cellState: 'default',
  },
});

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type DateValue = Date | null;

type InlineCalendarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  /** Selected date */
  value?: DateValue;
  /** Callback when date changes */
  onChange?: (date: DateValue) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Dates to highlight */
  highlightedDates?: Date[];
  /** Whether to show the date input */
  showInput?: boolean;
  /** Whether to show the "Today" preset button */
  showTodayButton?: boolean;
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
};

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function parseDateFromInput(value: string): Date | null {
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
}

function endOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (6 - day));
  return result;
}

const InlineCalendar = React.forwardRef<HTMLDivElement, InlineCalendarProps>(
  (
    {
      className,
      value,
      onChange,
      minDate,
      maxDate,
      highlightedDates = [],
      showInput = true,
      showTodayButton = true,
      locale = 'en-US',
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = inlineCalendarVariants();
    const today = React.useMemo(() => new Date(), []);
    const gridRef = React.useRef<HTMLDivElement>(null);

    const [viewDate, setViewDate] = React.useState(() => {
      return value || today;
    });
    const [focusedDate, setFocusedDate] = React.useState<Date>(() => {
      return value || today;
    });
    const [inputValue, setInputValue] = React.useState(() => formatDateForInput(value || null));

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

    // Generate calendar grid
    const calendarDays = React.useMemo(() => {
      const days: Array<{
        date: Date;
        isCurrentMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
        isHighlighted: boolean;
        isDisabled: boolean;
        isFocused: boolean;
      }> = [];

      // Previous month days
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: value ? isSameDay(date, value) : false,
          isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
          isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false,
          isFocused: isSameDay(date, focusedDate),
        });
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        days.push({
          date,
          isCurrentMonth: true,
          isToday: isSameDay(date, today),
          isSelected: value ? isSameDay(date, value) : false,
          isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
          isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false,
          isFocused: isSameDay(date, focusedDate),
        });
      }

      // Next month days
      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(currentYear, currentMonth + 1, day);
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: value ? isSameDay(date, value) : false,
          isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
          isDisabled: (minDate && date < minDate) || (maxDate && date > maxDate) || false,
          isFocused: isSameDay(date, focusedDate),
        });
      }

      return days;
    }, [currentYear, currentMonth, daysInMonth, firstDayOfMonth, daysInPrevMonth, value, highlightedDates, minDate, maxDate, focusedDate, today]);

    const isDateDisabled = (date: Date): boolean => {
      return (minDate !== undefined && date < minDate) || (maxDate !== undefined && date > maxDate);
    };

    const focusDate = (date: Date) => {
      // Update view if needed
      if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
        setViewDate(date);
      }
      setFocusedDate(date);
    };

    const handlePrevMonth = () => {
      setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDateSelect = (date: Date) => {
      onChange?.(date);
      setInputValue(formatDateForInput(date));
      setFocusedDate(date);
    };

    const handleTodayClick = () => {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      onChange?.(todayDate);
      setViewDate(todayDate);
      setInputValue(formatDateForInput(todayDate));
      setFocusedDate(todayDate);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      const parsed = parseDateFromInput(newValue);
      if (parsed) {
        onChange?.(parsed);
        setViewDate(parsed);
        setFocusedDate(parsed);
      }
    };

    // Keyboard navigation handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
      let newDate: Date | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newDate = addDays(focusedDate, -1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newDate = addDays(focusedDate, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newDate = addDays(focusedDate, -7);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newDate = addDays(focusedDate, 7);
          break;
        case 'Home':
          e.preventDefault();
          newDate = startOfWeek(focusedDate);
          break;
        case 'End':
          e.preventDefault();
          newDate = endOfWeek(focusedDate);
          break;
        case 'PageUp':
          e.preventDefault();
          if (e.shiftKey) {
            // Previous year
            newDate = new Date(focusedDate.getFullYear() - 1, focusedDate.getMonth(), focusedDate.getDate());
          } else {
            // Previous month
            newDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth() - 1, focusedDate.getDate());
          }
          break;
        case 'PageDown':
          e.preventDefault();
          if (e.shiftKey) {
            // Next year
            newDate = new Date(focusedDate.getFullYear() + 1, focusedDate.getMonth(), focusedDate.getDate());
          } else {
            // Next month
            newDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, focusedDate.getDate());
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isDateDisabled(focusedDate)) {
            handleDateSelect(focusedDate);
          }
          return;
        default:
          return;
      }

      if (newDate) {
        // Clamp to min/max if set
        if (minDate && newDate < minDate) {
          newDate = minDate;
        }
        if (maxDate && newDate > maxDate) {
          newDate = maxDate;
        }
        focusDate(newDate);
      }
    };

    const getCellState = (day: typeof calendarDays[0]) => {
      if (day.isDisabled) return 'disabled';
      if (day.isSelected) return 'selected';
      if (day.isToday) return 'today';
      if (day.isHighlighted) return 'highlighted';
      if (!day.isCurrentMonth) return 'outside';
      return 'default';
    };

    // Focus the focused date cell when it changes
    React.useEffect(() => {
      const focusedIndex = calendarDays.findIndex(d => d.isFocused);
      if (focusedIndex !== -1 && gridRef.current) {
        const buttons = gridRef.current.querySelectorAll('button[role="gridcell"]');
        const button = buttons[focusedIndex] as HTMLButtonElement | undefined;
        button?.focus();
      }
    }, [focusedDate, currentMonth, currentYear, calendarDays]);

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        {...rest}
      >
        {/* Header */}
        <div className={styles.header()}>
          <button
            type='button'
            className={styles.navButton()}
            onClick={handlePrevMonth}
            aria-label='Previous month'
          >
            <RiArrowLeftSLine className='size-5' />
          </button>
          <span className={styles.headerTitle()} aria-live='polite'>
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            type='button'
            className={styles.navButton()}
            onClick={handleNextMonth}
            aria-label='Next month'
          >
            <RiArrowRightSLine className='size-5' />
          </button>
        </div>

        {/* Input row */}
        {(showInput || showTodayButton) && (
          <div className={styles.inputRow()}>
            {showInput && (
              <input
                type='text'
                className={styles.dateInput()}
                value={inputValue}
                onChange={handleInputChange}
                placeholder='MM/DD/YYYY'
                aria-label='Date input'
              />
            )}
            {showTodayButton && (
              <button
                type='button'
                className={styles.presetButton()}
                onClick={handleTodayClick}
              >
                Today
              </button>
            )}
          </div>
        )}

        {/* Calendar grid */}
        <div
          ref={gridRef}
          className={styles.grid()}
          role='grid'
          aria-label='Calendar'
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Weekday header */}
          <div className={styles.weekHeader()} role='row'>
            {WEEKDAYS.map((day) => (
              <div key={day} className={styles.weekDay()} role='columnheader' aria-label={day}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar body */}
          <div className={styles.body()} role='rowgroup'>
            {calendarDays.map((day, index) => {
              const cellState = getCellState(day);
              const { cell } = inlineCalendarVariants({ cellState });

              return (
                <button
                  key={index}
                  type='button'
                  className={cn(
                    cell(),
                    day.isFocused && 'ring-2 ring-primary-base ring-inset',
                  )}
                  onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                  disabled={day.isDisabled}
                  role='gridcell'
                  aria-selected={day.isSelected}
                  aria-disabled={day.isDisabled}
                  aria-label={day.date.toLocaleDateString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  tabIndex={day.isFocused ? 0 : -1}
                  data-focused={day.isFocused}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
InlineCalendar.displayName = INLINE_CALENDAR_NAME;

export { InlineCalendar };
