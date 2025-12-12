import React, { useState, useRef, useMemo } from 'react';
import moment from 'moment';
import { TimelineGroup, TimelineItem } from '../types';

interface TimelineViewProps {
  groups: TimelineGroup[];
  items: TimelineItem[];
  onItemMove: (itemId: number, newStartTime: number, newGroupId: number) => void;
  onItemSelect: (item: TimelineItem) => void;
}

const HOUR_WIDTH = 100; // px per hour
const HEADER_HEIGHT = 50;
const GROUP_HEIGHT = 70;
const SIDEBAR_WIDTH = 220;

const TimelineView: React.FC<TimelineViewProps> = ({ 
  groups, 
  items, 
  onItemMove, 
  onItemSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const [viewStart, setViewStart] = useState(moment().startOf('day')); // Start at 00:00
  const [filterText, setFilterText] = useState('');

  const totalHours = 24; // Show 24 hours
  const totalWidth = totalHours * HOUR_WIDTH;

  // Filter groups based on search text
  const filteredGroups = useMemo(() => {
      if (!filterText.trim()) return groups;
      const lowerFilter = filterText.toLowerCase();
      return groups.filter(g => 
        g.title.toLowerCase().includes(lowerFilter) || 
        g.category.toLowerCase().includes(lowerFilter)
      );
  }, [groups, filterText]);

  // Generate hour markers
  const hours = useMemo(() => {
    const h = [];
    for (let i = 0; i < totalHours; i++) {
      h.push(viewStart.clone().add(i, 'hours'));
    }
    return h;
  }, [viewStart, totalHours]);

  // Navigation
  const handleToday = () => setViewStart(moment().startOf('day'));
  const handlePrev = () => setViewStart(prev => prev.clone().subtract(1, 'day'));
  const handleNext = () => setViewStart(prev => prev.clone().add(1, 'day'));

  // Sync scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (headerRef.current) {
          headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
  };

  const timeToPixels = (timestamp: number) => {
    const startMs = viewStart.valueOf();
    const diffHours = (timestamp - startMs) / (1000 * 60 * 60);
    return diffHours * HOUR_WIDTH;
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden select-none" ref={containerRef}>
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="font-bold text-lg text-slate-800">{viewStart.format('MMMM Do, YYYY')}</div>
          <div className="flex gap-2">
            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Previous Day">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Today</button>
            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Next Day">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
      </div>

      {/* Timeline Header Row */}
      <div className="flex border-b border-slate-200 bg-slate-50 relative z-20 shadow-sm">
        {/* Doctors Filter Column */}
        <div className="flex-none border-r border-slate-200 px-3 py-2 flex items-center justify-center bg-slate-50" style={{ width: SIDEBAR_WIDTH, height: HEADER_HEIGHT }}>
            <div className="relative w-full">
                <input 
                    type="text" 
                    placeholder="Filter Doctors..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white placeholder-slate-400 text-slate-700"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative" ref={headerRef}>
          <div className="flex" style={{ width: totalWidth, height: HEADER_HEIGHT }}>
            {hours.map((h, i) => (
              <div key={i} className="border-l border-slate-200 px-2 pt-2 text-xs font-semibold text-slate-400" style={{ width: HOUR_WIDTH }}>
                {h.format('HH:mm')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-y-auto relative">
        {/* Sidebar */}
        <div className="flex-none bg-white border-r border-slate-200 z-10 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] h-min">
          {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div 
                  key={group.id} 
                  className="flex items-center px-4 border-b border-slate-100 bg-white"
                  style={{ height: GROUP_HEIGHT, width: SIDEBAR_WIDTH }}
                >
                  <div className={`w-3 h-3 rounded-full mr-3 shadow-sm ${group.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 truncate w-36" title={group.title}>{group.title}</div>
                    <div className="text-xs text-slate-400 font-medium">{group.category}</div>
                  </div>
                </div>
              ))
          ) : (
             <div className="p-4 text-center text-xs text-slate-400 italic" style={{ width: SIDEBAR_WIDTH }}>
                 No doctors found
             </div>
          )}
          {/* Fill remaining sidebar space */}
          <div className="flex-1 bg-slate-50/30"></div>
        </div>

        {/* Scrollable Timeline Grid */}
        <div 
            className="flex-1 overflow-x-auto relative no-scrollbar bg-slate-50/30" 
            ref={scrollableRef}
            onScroll={handleScroll}
        >
          <div 
            style={{ width: totalWidth, minHeight: '100%', position: 'relative' }}
          >
            
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none h-full">
              {/* Vertical Lines */}
              {hours.map((_, i) => (
                <div 
                    key={`v-${i}`} 
                    className="absolute top-0 bottom-0 border-l border-slate-200/50" 
                    style={{ left: i * HOUR_WIDTH }} 
                />
              ))}
              {/* Horizontal Lines */}
              {filteredGroups.map((_, i) => (
                <div 
                    key={`h-${i}`} 
                    className="absolute left-0 right-0 border-b border-slate-200/50" 
                    style={{ top: (i + 1) * GROUP_HEIGHT, height: 1 }} 
                />
              ))}
              {/* Current Time Indicator */}
               <div 
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                style={{ left: timeToPixels(moment().valueOf()) }}
              >
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
              </div>
            </div>

            {/* Items */}
            {items.map(item => {
              // Find index in filtered groups
              const groupIndex = filteredGroups.findIndex(g => g.id === item.group);
              if (groupIndex === -1) return null; // Hide item if group is filtered out

              const left = timeToPixels(item.start_time);
              const top = groupIndex * GROUP_HEIGHT + 8; 
              const width = ((item.end_time - item.start_time) / (1000 * 60 * 60)) * HOUR_WIDTH;

              // Rendering bounds check
              if (left + width < -50 || left > totalWidth + 50) return null;

              return (
                <div
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); onItemSelect(item); }}
                  className={`absolute rounded-lg px-2 py-1.5 text-xs text-white overflow-hidden shadow-sm transition-all cursor-pointer border-l-4 group z-10 hover:shadow-md hover:brightness-105 flex flex-col
                    ${item.className || 'bg-blue-500 border-blue-700'} 
                  `}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${Math.max(width, 40)}px`,
                    height: `${GROUP_HEIGHT - 16}px`
                  }}
                >
                  {/* Title Area */}
                  <div className="font-bold truncate text-sm leading-tight drop-shadow-md pr-8 flex justify-between items-start relative">
                      <span className="truncate">{item.title}</span>
                      {item.isMainEvent && (
                          <div className="absolute -top-0 -right-0 px-2.5 py-1 rounded-bl-xl rounded-tr-sm bg-black/20 text-small font-bold backdrop-blur-sm shadow-sm border-l border-b border-white/10">
                              {item.miniEvents?.length || 0} / {item.maxMiniEvents}
                          </div>
                      )}
                  </div>
                  
                  {/* Footer Info */}
                  <div className="mt-auto flex justify-between items-end">
                     <div className="opacity-90 truncate text-[10px] font-medium flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {moment(item.start_time).format('HH:mm')} - {moment(item.end_time).format('HH:mm')}
                     </div>
                  </div>

                  {/* Operation Room Badge */}
                  {item.operationRoom && !item.isMainEvent && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 border border-white/30 backdrop-blur-sm shadow-sm uppercase tracking-wider">
                          {item.operationRoom}
                      </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;