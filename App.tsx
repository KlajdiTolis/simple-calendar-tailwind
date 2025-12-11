import React, { useState, useCallback } from 'react';
import TimelineView from './components/TimelineView';
import CalendarView from './components/CalendarView';
import AssistantPanel from './components/AssistantPanel';
import { CreateEventModal, MiniEventManagerModal } from './components/EventModals';
import { INITIAL_GROUPS, INITIAL_ITEMS } from './constants';
import { TimelineItem } from './types';
import moment from 'moment';

const App = () => {
  const [items, setItems] = useState<TimelineItem[]>(INITIAL_ITEMS);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineItem | null>(null);
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'timeline' | 'month' | 'week'>('timeline');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<moment.Moment>(moment());
  const [preselectedGroupId, setPreselectedGroupId] = useState<number | undefined>(undefined);
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>(undefined);
  
  const [isMiniEventModalOpen, setIsMiniEventModalOpen] = useState(false);

  const toggleAssistant = () => setIsAssistantOpen(!isAssistantOpen);

  const handleTimelineBackgroundClick = (groupId: number, time: number) => {
      const clickedMoment = moment(time);
      setCreateModalDate(clickedMoment);
      setPreselectedGroupId(groupId);
      setPreselectedTime(clickedMoment.format('HH:mm'));
      setIsCreateModalOpen(true);
  };

  const handleCalendarDateClick = (date: moment.Moment) => {
      setCreateModalDate(date);
      setPreselectedGroupId(undefined);
      setPreselectedTime('09:00');
      setIsCreateModalOpen(true);
  };

  const handleCreateEvent = (newItem: Partial<TimelineItem>) => {
    const event: TimelineItem = {
      id: Math.floor(Math.random() * 100000), // Simple ID gen
      group: newItem.group!,
      title: newItem.title!,
      start_time: newItem.start_time!,
      end_time: newItem.end_time!,
      description: newItem.description,
      className: newItem.className,
      maxMiniEvents: newItem.maxMiniEvents,
      miniEvents: []
    };
    setItems(prev => [...prev, event]);
  };

  const handleEventSelect = (event: TimelineItem) => {
    setSelectedEvent(event);
    setIsMiniEventModalOpen(true);
  };

  const handleUpdateEvent = (updatedEvent: TimelineItem) => {
    setItems(prev => prev.map(i => i.id === updatedEvent.id ? updatedEvent : i));
    setSelectedEvent(updatedEvent); // Update the local state for the modal
  };

  // Drag and Drop handler (Only for Timeline view)
  const handleItemMove = useCallback((itemId: number, newStartTime: number, newGroupId: number) => {
    setItems(prevItems => prevItems.map(item => {
        if (item.id === itemId) {
            const duration = item.end_time - item.start_time;
            return {
                ...item,
                start_time: newStartTime,
                end_time: newStartTime + duration,
                group: newGroupId
            };
        }
        return item;
    }));
  }, []);

  const handleAddAssistantItems = useCallback((newItems: TimelineItem[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const openGeneralCreateModal = () => {
      setCreateModalDate(moment());
      setPreselectedGroupId(undefined);
      setPreselectedTime(undefined);
      setIsCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800">SmartTimeline</h1>
                <p className="text-xs text-slate-500 font-medium">Interactive Resource Scheduler</p>
            </div>
        </div>

        <div className="flex items-center gap-6">
             {/* View Switcher */}
             <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Timeline
                </button>
                <button 
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Month
                </button>
             </div>

             <button 
                onClick={openGeneralCreateModal}
                className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Event
            </button>
            <button 
                onClick={toggleAssistant}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    isAssistantOpen 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                {isAssistantOpen ? 'Close AI' : 'AI Assistant'}
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
             <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {viewMode === 'timeline' ? (
                  <TimelineView 
                    groups={INITIAL_GROUPS}
                    items={items}
                    onItemSelect={handleEventSelect}
                    onItemMove={handleItemMove}
                    onBackgroundClick={handleTimelineBackgroundClick}
                  />
                ) : (
                  <CalendarView 
                    items={items}
                    groups={INITIAL_GROUPS}
                    viewMode={viewMode}
                    onItemSelect={handleEventSelect}
                    onDateClick={handleCalendarDateClick}
                  />
                )}
            </div>
        </main>

        {/* Floating Assistant Panel */}
        {isAssistantOpen && (
            <AssistantPanel 
                groups={INITIAL_GROUPS} 
                items={items} 
                onAddItems={handleAddAssistantItems} 
            />
        )}
      </div>

      {/* Modals */}
      <CreateEventModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateEvent}
        groups={INITIAL_GROUPS}
        initialDate={createModalDate}
        initialGroupId={preselectedGroupId}
        initialTime={preselectedTime}
      />

      {selectedEvent && (
        <MiniEventManagerModal
          isOpen={isMiniEventModalOpen}
          onClose={() => { setIsMiniEventModalOpen(false); setSelectedEvent(null); }}
          event={selectedEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      )}
    </div>
  );
};

export default App;