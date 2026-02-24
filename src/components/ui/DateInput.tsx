import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Parse YYYY-MM-DD string to components (no Date object involved)
function parseLocalDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

// Format components to YYYY-MM-DD string
function formatDateString(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format YYYY-MM-DD to DD/MM/YYYY for display
function formatDisplayDate(dateStr: string): string {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return '';
  const { year, month, day } = parsed;
  return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
}

// Get number of days in a month (pure math, no Date object)
function getDaysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 1) {
    // February - check leap year
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeap ? 29 : 28;
  }
  return daysPerMonth[month];
}

// Get day of week for any date using a reference point algorithm
// Returns 0 = Sunday, 1 = Monday, ..., 6 = Saturday
function getDayOfWeek(year: number, month: number, day: number): number {
  // Using Tomohiko Sakamoto's algorithm
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let y = year;
  if (month < 2) {
    y -= 1;
  }
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[month] + day) % 7;
}

// Get the day of week for the first day of a month
function getFirstDayOfMonth(year: number, month: number): number {
  return getDayOfWeek(year, month, 1);
}

// Get today's date components without using Date for anything except getting current date
function getToday(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate()
  };
}

// Get today's date as YYYY-MM-DD string
function getTodayString(): string {
  const { year, month, day } = getToday();
  return formatDateString(year, month, day);
}

export function DateInput({ value, onChange, placeholder = 'Selecione uma data', className }: DateInputProps) {
  const [open, setOpen] = useState(false);
  
  const today = getToday();
  const parsed = parseLocalDate(value);
  const currentDate = parsed || today;
  
  const [viewYear, setViewYear] = useState(currentDate.year);
  const [viewMonth, setViewMonth] = useState(currentDate.month);

  // Update view when value changes
  useEffect(() => {
    const newParsed = parseLocalDate(value);
    if (newParsed) {
      setViewYear(newParsed.year);
      setViewMonth(newParsed.month);
    }
  }, [value]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const newDate = formatDateString(viewYear, viewMonth, day);
    onChange(newDate);
    setOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);
  
  // Previous month info
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
  
  // Build calendar grid
  type DayInfo = { day: number; isCurrentMonth: boolean; isSelected: boolean; isToday: boolean };
  const calendarDays: DayInfo[] = [];
  
  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = parsed 
      ? parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day
      : false;
    const isToday = today.year === viewYear && today.month === viewMonth && today.day === day;
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isSelected,
      isToday,
    });
  }
  
  // Next month's leading days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            'w-full justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {value ? formatDisplayDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <div className="p-3 bg-popover border-border rounded-lg min-w-[280px]">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium text-sm">
              {MONTHS[viewMonth]} {viewYear}
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((dayName) => (
              <div
                key={dayName}
                className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {dayName}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => (
              <button
                key={index}
                type="button"
                disabled={!dayInfo.isCurrentMonth}
                onClick={() => dayInfo.isCurrentMonth && selectDay(dayInfo.day)}
                className={cn(
                  'h-8 w-8 flex items-center justify-center text-sm rounded-md transition-colors',
                  !dayInfo.isCurrentMonth && 'text-muted-foreground/30 cursor-not-allowed',
                  dayInfo.isCurrentMonth && !dayInfo.isSelected && !dayInfo.isToday && 'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                  dayInfo.isToday && !dayInfo.isSelected && 'bg-accent text-accent-foreground',
                  dayInfo.isSelected && 'bg-primary text-primary-foreground font-medium'
                )}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>
          
          {/* Quick actions */}
          <div className="mt-3 pt-3 border-t border-border flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="flex-1 text-xs"
              onClick={() => {
                onChange(getTodayString());
                setOpen(false);
              }}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="flex-1 text-xs"
              onClick={() => {
                const { year, month, day } = today;
                // Calculate yesterday
                let yDay = day - 1;
                let yMonth = month;
                let yYear = year;
                if (yDay < 1) {
                  yMonth = month === 0 ? 11 : month - 1;
                  yYear = month === 0 ? year - 1 : year;
                  yDay = getDaysInMonth(yYear, yMonth);
                }
                onChange(formatDateString(yYear, yMonth, yDay));
                setOpen(false);
              }}
            >
              Ontem
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
