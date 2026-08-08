import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AvailabilityCalendar({
  unavailableDates = [],
  selectedDate = null,
  onDateSelect = null, // If null, the calendar runs in read-only mode
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const isDateUnavailable = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // Disable past dates
    if (d < today) return true;

    // Disable marked unavailable ranges
    return unavailableDates.some((range) => {
      if (!range.start) return false;
      const start = new Date(range.start);
      start.setHours(0, 0, 0, 0);
      const end = range.end ? new Date(range.end) : start;
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const sel = new Date(selectedDate);
    sel.setHours(0, 0, 0, 0);
    return d.getTime() === sel.getTime();
  };

  const isDateToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const handleDateClick = (date) => {
    if (!onDateSelect || isDateUnavailable(date)) return;
    
    // Format date as YYYY-MM-DD local
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const dateString = localDate.toISOString().split('T')[0];
    onDateSelect(dateString);
  };

  const daysCount = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const cells = [];
  // Add empty spaces for previous month's padding
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  // Add current month's days
  for (let i = 1; i <= daysCount; i++) {
    cells.push(new Date(currentYear, currentMonth, i));
  }

  // Determine read-only state status
  const isReadOnly = onDateSelect === null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-white/50 p-4 font-sans select-none clay-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-bold text-[var(--text-dark)] uppercase tracking-wider">
          {months[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--clay-btn-bg-neutral)] text-[var(--text-dark)] transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-[var(--border-light)] hover:bg-[var(--clay-btn-bg-neutral)] text-[var(--text-dark)] transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isUnavailable = isDateUnavailable(date);
          const isSelected = isDateSelected(date);
          const isToday = isDateToday(date);

          let cellClass = "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition relative cursor-pointer ";
          let textClass = "font-medium ";

          if (isUnavailable) {
            // Check if the date is in the past or booked
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            if (d < today) {
              cellClass += "bg-transparent opacity-25 text-[var(--text-muted)] cursor-not-allowed";
            } else {
              cellClass += "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed";
              textClass += "line-through ";
            }
          } else if (isSelected) {
            cellClass += "bg-[#e86f8f] text-white shadow-sm font-semibold scale-105";
          } else if (isToday) {
            cellClass += "bg-[#ffd8c7]/20 text-[#e86f8f] font-semibold ring-2 ring-[#e86f8f]/30";
          } else {
            cellClass += "hover:bg-[var(--clay-btn-bg-neutral)] text-[var(--text-body)]";
          }
 
          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={cellClass}
              title={isUnavailable && date >= today ? "Booked / Unavailable" : ""}
            >
              <span className={textClass}>{date.getDate()}</span>
              {/* Dot indicator for booked dates */}
              {isUnavailable && date >= today && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
 
      {/* Legend */}
      <div className="flex gap-4 items-center justify-center mt-4 pt-3 border-t border-[var(--border-light)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffd8c7]/40 ring-1 ring-[#e86f8f]/30" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
          <span>Booked</span>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#e86f8f]" />
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
