import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { TimelineGroup, TimelineItem } from '../types';

interface CalendarViewProps {
  groups: TimelineGroup[];
  items: TimelineItem[];
  viewMode: 'month' | 'week';
  onItemSelect: (item: TimelineItem) => void;
  // onDateClick removed to prevent creation
  onDateClick: (date: moment.Moment) => void; 
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  items, 
  groups,
  viewMode,
  onItemSelect
  // onDateClick unused
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

  const totalWeeks = Math.ceil(calendarData.length / 7);

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
      <div 
        className="grid grid-cols-7 flex-1 bg-slate-200 gap-px overflow-y-auto"
        style={{
            gridTemplateRows: isMonthView ? `repeat(${totalWeeks}, minmax(120px, 1fr))` : '1fr'
        }}
      >
        {calendarData.map((dayItem) => {
          const isCurrentMonth = isMonthView ? dayItem.month() === currentDate.month() : true;
          const isToday = dayItem.isSame(moment(), 'day');
          const dayEvents = items.filter(item => moment(item.start_time).isSame(dayItem, 'day'));

          return (
            <div 
              key={dayItem.format('YYYY-MM-DD')}
              className={`bg-white p-2 transition-colors flex flex-col gap-1 ${
                  !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                 <div className={`flex flex-col items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
                    <span className="text-sm font-medium">{dayItem.date()}</span>
                 </div>
                 {dayEvents.length > 0 && <span className="text-[10px] text-slate-400 font-medium">{dayEvents.length} ops</span>}
              </div>

              <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pt-1">
                {dayEvents.map(event => {
                   const group = groups.find(g => g.id === event.group);
                   
                   return (
                     <div 
                       key={event.id}
                       onClick={(e) => { e.stopPropagation(); onItemSelect(event); }}
                       className={`relative text-xs p-2 rounded-md border-l-4 shadow-sm cursor-pointer hover:shadow-md hover:translate-x-0.5 transition-all flex flex-col group ${event.className || 'bg-blue-100 border-blue-500 text-blue-900'}`}
                     >
                       {/* Counter Badge on Top Right for Main Events */}
                       {event.isMainEvent && (
                           <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-black/20 text-white font-bold text-[8px] leading-none shadow-sm backdrop-blur-sm z-10">
                                {event.miniEvents?.length || 0}/{event.maxMiniEvents}
                           </div>
                       )}

                       {/* Resource Title */}
                       <div className="text-[9px] font-bold uppercase tracking-wider opacity-70 mb-0.5 truncate pr-8">
                           {group?.title || 'Unknown Dr.'}
                       </div>
                       
                       {/* Event Title */}
                       <span className="truncate font-bold text-sm leading-tight pr-2">{event.title}</span>
                       
                       <div className="flex justify-between items-end mt-1.5">
                            <span className="text-[10px] opacity-80 font-medium">{moment(event.start_time).format('h:mma')}</span>
                            {event.operationRoom && !event.isMainEvent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm bg-white/30 border border-white/20">
                                    {event.operationRoom}
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