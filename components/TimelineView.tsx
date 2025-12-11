import React, { useState, useRef, useEffect, useMemo } from 'react';
import moment from 'moment';
import { TimelineGroup, TimelineItem } from '../types';

interface TimelineViewProps {
  groups: TimelineGroup[];
  items: TimelineItem[];
  onItemMove: (itemId: number, newStartTime: number, newGroupId: number) => void;
  onItemSelect: (item: TimelineItem) => void;
  onBackgroundClick: (groupId: number, time: number) => void;
}

const HOUR_WIDTH = 100; // px per hour
const HEADER_HEIGHT = 50;
const GROUP_HEIGHT = 70;
const SIDEBAR_WIDTH = 220;

const TimelineView: React.FC<TimelineViewProps> = ({ 
  groups, 
  items, 
  onItemMove, 
  onItemSelect,
  onBackgroundClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewStart, setViewStart] = useState(moment().startOf('day').add(8, 'hours')); // Start at 8 AM
  
  // State for drag and drop
  const [dragState, setDragState] = useState<{
    itemId: number | null;
    startX: number;
    originalStartTime: number;
    currentX: number;
    originalGroupId: number;
    currentGroupId: number;
  } | null>(null);

  const totalHours = 16; // Show 16 hours
  const totalWidth = totalHours * HOUR_WIDTH;

  // Generate hour markers
  const hours = useMemo(() => {
    const h = [];
    for (let i = 0; i < totalHours; i++) {
      h.push(viewStart.clone().add(i, 'hours'));
    }
    return h;
  }, [viewStart, totalHours]);

  // Navigation
  const handleToday = () => setViewStart(moment().startOf('day').add(8, 'hours'));
  const handlePrev = () => setViewStart(prev => prev.clone().subtract(4, 'hours'));
  const handleNext = () => setViewStart(prev => prev.clone().add(4, 'hours'));

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent, item: TimelineItem) => {
    e.stopPropagation();
    
    setDragState({
      itemId: item.id,
      startX: e.clientX,
      originalStartTime: item.start_time,
      currentX: e.clientX,
      originalGroupId: item.group,
      currentGroupId: item.group
    });
  };

  // Handle Background Click (Create Event)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dragState) return; // Don't trigger if finishing a drag
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - SIDEBAR_WIDTH;
    const y = e.clientY - rect.top - HEADER_HEIGHT;

    // Check if click is in valid area
    if (x < 0 || y < 0) return;

    // Calculate Group
    const groupIndex = Math.floor(y + containerRef.current.scrollTop / GROUP_HEIGHT); // Adjust for scroll if needed (though main div scrolls)
    // Actually, containerRef handles the scroll of the grid usually, let's assume flat for now or adjust logic
    // Refined: The click is relative to the scrollable container
    
    // Simpler approach: We attach click handler to the grid container
  };

  // Handle Mouse Move (Global)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      
      if (containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         // Determine row
         // Offset y by header
         const relativeY = e.clientY - rect.top - HEADER_HEIGHT; 
         // Allow some buffer for scrolling (not implemented deep scroll here for simplicity, assuming fixed height or overflow-y on parent)
         const groupIndex = Math.floor(relativeY / GROUP_HEIGHT);
         
         if (groupIndex >= 0 && groupIndex < groups.length) {
             const targetGroup = groups[groupIndex];
             if (targetGroup.id !== dragState.currentGroupId) {
                 setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentGroupId: targetGroup.id } : null);
             } else {
                 setDragState(prev => prev ? { ...prev, currentX: e.clientX } : null);
             }
         } else {
             // Just update X if out of vertical bounds (keep last valid group or just move time)
             setDragState(prev => prev ? { ...prev, currentX: e.clientX } : null);
         }
      }
    };

    const handleMouseUp = () => {
      if (dragState && dragState.itemId) {
        const pixelDelta = dragState.currentX - dragState.startX;
        const timeDeltaMs = (pixelDelta / HOUR_WIDTH) * 60 * 60 * 1000;
        
        let newStart = dragState.originalStartTime + timeDeltaMs;
        // Snap to 15 mins
        const remainder = newStart % (15 * 60 * 1000);
        newStart = newStart - remainder;

        onItemMove(dragState.itemId, newStart, dragState.currentGroupId);
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, groups, onItemMove]);

  const timeToPixels = (timestamp: number) => {
    const startMs = viewStart.valueOf();
    const diffHours = (timestamp - startMs) / (1000 * 60 * 60);
    return diffHours * HOUR_WIDTH;
  };

  const handleGridClick = (e: React.MouseEvent) => {
      if (dragState) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const groupIndex = Math.floor(y / GROUP_HEIGHT);
      if (groupIndex < 0 || groupIndex >= groups.length) return;

      const clickTimeMs = viewStart.valueOf() + (x / HOUR_WIDTH) * 60 * 60 * 1000;
      
      // Snap to nearest 30m
      const snapMs = 30 * 60 * 1000;
      const roundedTime = Math.round(clickTimeMs / snapMs) * snapMs;

      onBackgroundClick(groups[groupIndex].id, roundedTime);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden select-none" ref={containerRef}>
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="font-bold text-lg text-slate-800">{viewStart.format('MMMM Do, YYYY')}</div>
          <div className="flex gap-2">
            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Today</button>
            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
      </div>

      {/* Timeline Header Row */}
      <div className="flex border-b border-slate-200 bg-slate-50 relative z-20 shadow-sm">
        <div className="flex-none border-r border-slate-200 p-2 font-bold text-slate-500 text-xs uppercase tracking-wider flex items-center justify-center bg-slate-50" style={{ width: SIDEBAR_WIDTH, height: HEADER_HEIGHT }}>
          Resources
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex" style={{ width: totalWidth, height: HEADER_HEIGHT }}>
            {hours.map((h, i) => (
              <div key={i} className="border-l border-slate-200 px-2 pt-2 text-xs font-semibold text-slate-400" style={{ width: HOUR_WIDTH }}>
                {h.format('h A')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-y-auto relative">
        {/* Sidebar */}
        <div className="flex-none bg-white border-r border-slate-200 z-10 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className={`flex items-center px-4 border-b border-slate-100 transition-colors ${
                 dragState?.currentGroupId === group.id ? 'bg-indigo-50/50' : 'bg-white'
              }`}
              style={{ height: GROUP_HEIGHT, width: SIDEBAR_WIDTH }}
            >
              <div className={`w-3 h-3 rounded-full mr-3 shadow-sm ${group.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
              <div>
                <div className="text-sm font-bold text-slate-700 truncate w-40">{group.title}</div>
                <div className="text-xs text-slate-400 font-medium">{group.category}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Grid */}
        <div className="flex-1 overflow-x-auto relative no-scrollbar bg-slate-50/30" style={{ cursor: dragState ? 'grabbing' : 'default' }}>
          <div 
            style={{ width: totalWidth, height: groups.length * GROUP_HEIGHT, position: 'relative' }}
            onMouseDown={handleGridClick}
          >
            
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              {/* Vertical Lines */}
              {hours.map((_, i) => (
                <div 
                    key={`v-${i}`} 
                    className="absolute top-0 bottom-0 border-l border-slate-200/50" 
                    style={{ left: i * HOUR_WIDTH }} 
                />
              ))}
              {/* Horizontal Lines */}
              {groups.map((_, i) => (
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
              const groupIndex = groups.findIndex(g => g.id === item.group);
              if (groupIndex === -1) return null;

              const isDragging = dragState?.itemId === item.id;
              
              let left = timeToPixels(item.start_time);
              let top = groupIndex * GROUP_HEIGHT + 8; 
              const width = ((item.end_time - item.start_time) / (1000 * 60 * 60)) * HOUR_WIDTH;

              // Visual update during drag
              if (isDragging && dragState) {
                  const pixelOffset = dragState.currentX - dragState.startX;
                  left += pixelOffset;
                  
                  const targetGroupIndex = groups.findIndex(g => g.id === dragState.currentGroupId);
                  if (targetGroupIndex !== -1) {
                      top = targetGroupIndex * GROUP_HEIGHT + 8;
                  }
              }

              // Rendering bounds check (optional optimization)
              if (left + width < -50 || left > totalWidth + 50) return null;

              // Calculate mini event progress
              const currentMini = item.miniEvents?.length || 0;
              const maxMini = item.maxMiniEvents || 0;
              const isFull = maxMini > 0 && currentMini >= maxMini;

              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleDragStart(e, item)}
                  onClick={(e) => { e.stopPropagation(); if(!isDragging) onItemSelect(item); }}
                  className={`absolute rounded-lg px-3 py-2 text-xs text-white overflow-hidden shadow-sm transition-all cursor-pointer border-l-4 group
                    ${item.className || 'bg-blue-500 border-blue-700'} 
                    ${isDragging ? 'z-50 shadow-2xl scale-105 opacity-90 ring-4 ring-indigo-400/30' : 'z-10 hover:shadow-md hover:brightness-105'}
                  `}
                  style={{
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${Math.max(width, 40)}px`,
                    height: `${GROUP_HEIGHT - 16}px`
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                      <div className="font-bold truncate text-sm leading-tight drop-shadow-sm">{item.title}</div>
                      
                      <div className="flex justify-between items-end">
                         <div className="opacity-90 truncate text-[10px] font-medium tracking-wide">
                             {moment(item.start_time).format('h:mm A')} - {moment(item.end_time).format('h:mm A')}
                         </div>
                         
                         {maxMini > 0 && (
                             <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm border border-white/20
                                 ${isFull ? 'bg-red-500/20 text-white' : 'bg-black/10 text-white'}
                             `}>
                                 {currentMini}/{maxMini}
                             </div>
                         )}
                      </div>
                  </div>
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