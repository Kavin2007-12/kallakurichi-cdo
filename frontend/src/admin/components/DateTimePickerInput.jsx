import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Parse string like "23/08/2026, 10:30 AM" or "2026-08-23" or ISO into components
export const parseDateTimeString = (str) => {
  const now = new Date();
  let day = now.getDate();
  let month = now.getMonth(); // 0-indexed
  let year = now.getFullYear();
  let hour = '10';
  let minute = '30';
  let ampm = 'AM';

  if (!str) {
    return { day, month, year, hour, minute, ampm };
  }

  // Check DD/MM/YYYY or YYYY-MM-DD
  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    day = parseInt(slashMatch[1], 10);
    month = parseInt(slashMatch[2], 10) - 1;
    year = parseInt(slashMatch[3], 10);
  } else {
    const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    } else {
      const parsedDate = new Date(str);
      if (!isNaN(parsedDate.getTime())) {
        day = parsedDate.getDate();
        month = parsedDate.getMonth();
        year = parsedDate.getFullYear();
      }
    }
  }

  // Check time HH:MM AM/PM
  const timeMatch = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    minute = timeMatch[2].padStart(2, '0');
    if (timeMatch[3]) {
      ampm = timeMatch[3].toUpperCase();
    } else {
      ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
    }
    hour = h.toString().padStart(2, '0');
  }

  return { day, month, year, hour, minute, ampm };
};

// Format components to "DD/MM/YYYY, HH:MM AM/PM"
export const formatToDateTime = (year, month, day, hour, minute, ampm) => {
  const dStr = day.toString().padStart(2, '0');
  const mStr = (month + 1).toString().padStart(2, '0');
  const hStr = hour.toString().padStart(2, '0');
  const minStr = minute.toString().padStart(2, '0');
  const apStr = ampm.toUpperCase();
  return `${dStr}/${mStr}/${year}, ${hStr}:${minStr} ${apStr}`;
};

// Format components to "DD/MM/YYYY" only
export const formatToDateOnly = (year, month, day) => {
  const dStr = day.toString().padStart(2, '0');
  const mStr = (month + 1).toString().padStart(2, '0');
  return `${dStr}/${mStr}/${year}`;
};

export const DateTimePickerInput = ({
  label = 'Date & Time *',
  value = '',
  onChange,
  disablePast = false,
  placeholder,
  className = '',
  includeTime = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hourColRef = useRef(null);
  const minColRef = useRef(null);

  const initial = parseDateTimeString(value);
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedAmpm, setSelectedAmpm] = useState(initial.ampm);

  // Month navigation view
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // Sync state if value prop changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseDateTimeString(value);
      setSelectedYear(parsed.year);
      setSelectedMonth(parsed.month);
      setSelectedDay(parsed.day);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedAmpm(parsed.ampm);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Scroll active hour and minute into view inside their internal containers when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourColRef.current) {
          const activeHourBtn = hourColRef.current.querySelector('[data-selected="true"]');
          if (activeHourBtn) {
            activeHourBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        if (minColRef.current) {
          const activeMinBtn = minColRef.current.querySelector('[data-selected="true"]');
          if (activeMinBtn) {
            activeMinBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
      }, 50);
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = (e) => {
    e.stopPropagation();
    if (disablePast && (viewYear < todayYear || (viewYear === todayYear && viewMonth <= todayMonth))) {
      return;
    }
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Build calendar matrix (42 cells)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const isPast = disablePast && new Date(prevY, prevM, dayNum) < new Date(todayYear, todayMonth, todayDate);
    calendarDays.push({ day: dayNum, month: prevM, year: prevY, isCurrentMonth: false, isPast });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const isPast = disablePast && new Date(viewYear, viewMonth, i) < new Date(todayYear, todayMonth, todayDate);
    calendarDays.push({ day: i, month: viewMonth, year: viewYear, isCurrentMonth: true, isPast });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({ day: i, month: nextM, year: nextY, isCurrentMonth: false, isPast: false });
  }

  const defaultPlaceholder = includeTime ? 'Select Date & Time (DD/MM/YYYY, HH:MM AM/PM)' : 'Select Date (DD/MM/YYYY)';
  const effectivePlaceholder = placeholder || defaultPlaceholder;

  const currentFormatted = includeTime 
    ? formatToDateTime(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute, selectedAmpm)
    : formatToDateOnly(selectedYear, selectedMonth, selectedDay);

  const handleApply = (e) => {
    if (e) e.stopPropagation();
    if (onChange) {
      onChange(currentFormatted);
    }
    setIsOpen(false);
  };

  const isPrevDisabled = disablePast && (viewYear < todayYear || (viewYear === todayYear && viewMonth <= todayMonth));

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Input Field */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white hover:border-[#800000] focus-within:border-[#800000] focus-within:ring-2 focus-within:ring-red-100 flex items-center justify-between cursor-pointer transition shadow-2xs"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <Calendar className="w-4 h-4 text-[#800000] flex-shrink-0" />
          <span className={`text-xs font-bold truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || effectivePlaceholder}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-[#800000] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex-shrink-0 ml-1">
          {isOpen ? 'Close ✕' : 'Select ▾'}
        </span>
      </div>

      {/* Popover / Calendar & Time Picker Modal (Contained, Compact & Right-Aligned) */}
      {isOpen && (
        <div 
          className={`absolute z-50 top-full mt-1.5 right-0 w-[260px] sm:w-[270px] max-w-[calc(100vw-32px)] bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-200 shadow-2xl animate-fadeIn space-y-2 text-left overscroll-contain`}
          style={{ maxHeight: 'calc(100vh - 120px)' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Calendar Header: Month & Year + Arrows */}
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-gray-900 tracking-wide flex items-center space-x-1">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <span className="font-bold text-gray-700">{viewYear}</span>
            </h4>
            <div className="flex items-center space-x-0.5">
              <button
                type="button"
                disabled={isPrevDisabled}
                onClick={prevMonth}
                className={`p-1 rounded-lg transition ${
                  isPrevDisabled
                    ? 'opacity-20 cursor-not-allowed text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEK_DAYS.map(wd => (
              <span key={wd} className="text-[7.5px] font-black text-gray-400 uppercase tracking-wider py-0.5">
                {wd}
              </span>
            ))}
          </div>

          {/* 42 Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarDays.map((item, idx) => {
              const isSelected = selectedYear === item.year && selectedMonth === item.month && selectedDay === item.day;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.isPast}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.isPast) {
                      setSelectedYear(item.year);
                      setSelectedMonth(item.month);
                      setSelectedDay(item.day);
                      if (!includeTime && onChange) {
                        onChange(formatToDateOnly(item.year, item.month, item.day));
                      }
                    }
                  }}
                  className={`h-6 w-6 sm:h-6.5 sm:w-6.5 mx-auto rounded-full flex items-center justify-center text-[10px] sm:text-[10.5px] font-bold transition ${
                    item.isPast
                      ? 'opacity-20 cursor-not-allowed text-gray-300 line-through'
                      : isSelected
                      ? 'bg-[#800000] text-[#FFCC00] shadow-xs scale-105 ring-2 ring-amber-300 cursor-pointer font-black'
                      : item.isCurrentMonth
                      ? 'text-gray-900 hover:bg-amber-50 cursor-pointer'
                      : 'text-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* 12-Hour Time Section: Strictly Contained Internal Scroll Boxes (Optional) */}
          {includeTime && (
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#800000]" />
                  <span>Time (12-Hour)</span>
                </span>
                <span className="text-[10px] font-black text-[#800000] font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {selectedHour}:{selectedMinute} {selectedAmpm}
                </span>
              </div>

              {/* 3 Contained Scroll Columns */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200/80">
                
                {/* 1. Hours Scroll Box (Scrolls ONLY inside this 72px box) */}
                <div 
                  ref={hourColRef}
                  className="h-[72px] overflow-y-auto overscroll-contain no-scrollbar flex flex-col items-center py-0.5 space-y-0.5 bg-white rounded-lg border border-gray-200/60 shadow-2xs"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <span className="text-[8px] font-black text-gray-400 uppercase sticky top-0 bg-white/95 w-full text-center py-0.5 border-b border-gray-100 z-10">
                    HR
                  </span>
                  {HOURS.map((h) => {
                    const isSel = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        data-selected={isSel}
                        onClick={(e) => { e.stopPropagation(); setSelectedHour(h); }}
                        className={`w-full py-0.5 text-center text-xs font-black transition cursor-pointer ${
                          isSel
                            ? 'bg-[#800000] text-[#FFCC00] rounded font-black shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>

                {/* 2. Minutes Scroll Box (Scrolls ONLY inside this 72px box) */}
                <div 
                  ref={minColRef}
                  className="h-[72px] overflow-y-auto overscroll-contain no-scrollbar flex flex-col items-center py-0.5 space-y-0.5 bg-white rounded-lg border border-gray-200/60 shadow-2xs"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <span className="text-[8px] font-black text-gray-400 uppercase sticky top-0 bg-white/95 w-full text-center py-0.5 border-b border-gray-100 z-10">
                    MIN
                  </span>
                  {MINUTES.map((m) => {
                    const isSel = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        data-selected={isSel}
                        onClick={(e) => { e.stopPropagation(); setSelectedMinute(m); }}
                        className={`w-full py-0.5 text-center text-xs font-black transition cursor-pointer ${
                          isSel
                            ? 'bg-[#800000] text-[#FFCC00] rounded font-black shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>

                {/* 3. AM / PM Column */}
                <div className="flex flex-col justify-center gap-1 p-1 bg-white rounded-lg border border-gray-200/60 shadow-2xs">
                  {['AM', 'PM'].map((ap) => {
                    const isSel = selectedAmpm === ap;
                    return (
                      <button
                        key={ap}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedAmpm(ap); }}
                        className={`w-full py-1 text-center text-[11px] font-black transition cursor-pointer rounded ${
                          isSel
                            ? 'bg-[#800000] text-[#FFCC00] shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                      >
                        {ap}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Row: Apply Button */}
          <div className="pt-1 flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-extrabold text-emerald-700 truncate">
              {currentFormatted}
            </span>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 rounded-xl bg-[#800000] hover:bg-[#660000] text-white text-xs font-black transition cursor-pointer shadow-xs"
            >
              Done & Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePickerInput;
