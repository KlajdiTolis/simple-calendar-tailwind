import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { TimelineGroup, TimelineItem } from '../types';

interface CalendarViewProps {
  groups: TimelineGroup[];
  items: TimelineItem[];
  viewMode: 'month' | 'week';
  onItemSelect: (item: TimelineItem) => void;
  onDateClick: (date: moment.Moment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  items, 
  viewMode,
  onItemSelect,
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(moment());

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const days = [];
    
    if (viewMode === 'month') {
        const startOfMonth = currentDate.clone().startOf('month');
        const endOfMonth = currentDate.clone().endOf('month');
        
        // Start from the Sunday before the 1st
        const startDate = startOfMonth.clone().startOf('week');
        const endDate = endOfMonth.clone().endOf('week');

        const day = startDate.clone();
        while (day.isBefore(endDate, 'day') || day.isSame(endDate, 'day')) {
          days.push(day.clone());
          day.add(1, 'day');
        }
    } else {
        // Week View
        const startOfWeek = currentDate.clone().startOf('week');
        const endOfWeek = currentDate.clone().endOf('week');
        
        const day = startOfWeek.clone();
        while (day.isBefore(endOfWeek, 'day') || day.isSame(endOfWeek, 'day')) {
          days.push(day.clone());
          day.add(1, 'day');
        }
    }

    return days;
  }, [currentDate, viewMode]);

  const goToToday = () => setCurrentDate(moment());
  const next = () => setCurrentDate(curr => curr.clone().add(1, viewMode));
  const prev = () => setCurrentDate(curr => curr.clone().subtract(1, viewMode));

  const isMonthView = viewMode === 'month';

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 min-w-[200px]">
            {isMonthView 
                ? currentDate.format('MMMM YYYY') 
                : `Week of ${currentDate.clone().startOf('week').format('MMM D')} - ${currentDate.clone().endOf('week').format('MMM D, YYYY')}`
            }
          </h2>
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={prev} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goToToday} className="px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm rounded transition-all mx-1">
              Today
            </button>
            <button onClick={next} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 flex-none">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 flex-1 bg-slate-200 gap-px overflow-y-auto ${isMonthView ? 'grid-rows-5 md:grid-rows-6' : 'grid-rows-1'}`}>
        {calendarData.map((dayItem) => {
          const isCurrentMonth = isMonthView ? dayItem.month() === currentDate.month() : true;
          const isToday = dayItem.isSame(moment(), 'day');
          const dayEvents = items.filter(item => moment(item.start_time).isSame(dayItem, 'day'));

          return (
            <div 
              key={dayItem.format('YYYY-MM-DD')}
              onClick={() => onDateClick(dayItem)}
              className={`bg-white p-2 transition-colors hover:bg-slate-50 cursor-pointer flex flex-col gap-1 ${
                  !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
              } ${!isMonthView ? 'min-h-[400px]' : 'min-h-[100px]'}`}
            >
              <div className="flex justify-between items-start mb-1">
                 <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
                    <span className="text-sm font-medium">{dayItem.date()}</span>
                 </div>
                 {dayEvents.length > 0 && <span className="text-[10px] text-slate-400 font-medium">{dayEvents.length} events</span>}
              </div>

              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                {dayEvents.map(event => {
                   const count = event.miniEvents?.length || 0;
                   const max = event.maxMiniEvents || 0;
                   const isFull = max > 0 && count >= max;
                   
                   return (
                     <div 
                       key={event.id}
                       onClick={(e) => { e.stopPropagation(); onItemSelect(event); }}
                       className={`text-xs p-1.5 rounded border-l-4 shadow-sm cursor-pointer hover:brightness-105 hover:translate-x-0.5 transition-all flex flex-col group ${event.className || 'bg-blue-100 border-blue-500 text-blue-800'}`}
                     >
                       <span className="truncate font-semibold">{event.title}</span>
                       <div className="flex justify-between items-center mt-0.5">
                            <span className="text-[10px] opacity-80">{moment(event.start_time).format('h:mma')}</span>
                            {max > 0 && (
                                <span className={`text-[9px] px-1 rounded-full ${isFull ? 'bg-black/20 text-white' : 'bg-white/40'} `}>
                                {count}/{max}
                                </span>
                            )}
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
