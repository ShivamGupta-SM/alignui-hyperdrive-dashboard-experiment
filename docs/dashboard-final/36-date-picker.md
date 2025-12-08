# Date Picker Component

## Purpose
Single date and date range selection with calendar interface.

## Single Date Picker

### Input Field
```
Start Date *
┌───────────────────────────────────────────────────┐
│ 📅  Jan 15, 2025                                  │
└───────────────────────────────────────────────────┘
```

### Calendar Dropdown
```
┌───────────────────────────────────────────────────┐
│                                                   │
│   ◀   January 2025   ▶                           │
│                                                   │
│   Sun  Mon  Tue  Wed  Thu  Fri  Sat              │
│   ───  ───  ───  ───  ───  ───  ───              │
│                 1    2    3    4                 │
│   5    6    7    8    9   10   11                │
│  12   13   14  [15]  16   17   18                │
│  19   20   21   22   23   24   25                │
│  26   27   28   29   30   31                     │
│                                                   │
│   [Today]                          [Clear]       │
└───────────────────────────────────────────────────┘
```

## Date Range Picker

```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ◀  January 2025        February 2025  ▶         │
│                                                   │
│  Sun Mon Tue Wed Thu Fri Sat  Sun Mon Tue Wed... │
│            1   2   3   4                      1  │
│  5   6   7   8   9  10  11    2   3   4   5   6  │
│ 12  13  14 [15][16][17][18]   9  10  11  12  13  │
│[19][20][21][22][23][24][25]  16  17  18  19  20  │
│[26][27][28][29][30][31]      23  24  25  26  27  │
│                                                   │
│  Selected: Jan 15 - Feb 15, 2025 (31 days)       │
│                                                   │
│  [Last 7 Days] [Last 30 Days] [This Month] [Custom]│
└───────────────────────────────────────────────────┘
```

## Features

### Single Date
- Calendar grid with month/year navigation
- [Today] shortcut button
- [Clear] to reset selection
- Highlight selected date with [box]

### Date Range
- Dual calendar view (2 months)
- Visual range highlight (dates between start and end)
- Range duration display
- Preset shortcuts:
  - Last 7 Days
  - Last 30 Days
  - This Month
  - Custom (manual selection)

### Validation
- Disable past dates (optional)
- Min/max date constraints
- Valid range validation

### Keyboard Support
- Arrow keys to navigate dates
- Enter to select
- Esc to close

## Usage
Used in:
- Campaign creation (start/end dates)
- Filters (date range selection)
- Invoice period selection
- Analytics date range

---
