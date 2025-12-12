import React, { useState, useEffect } from 'react';
import { TimelineGroup, TimelineItem, MiniEvent } from '../types';
import moment from 'moment';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TimelineItem>) => void;
  groups: TimelineGroup[];
  initialDate?: moment.Moment;
  initialGroupId?: number;
  initialTime?: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    groups, 
    initialDate,
    initialGroupId,
    initialTime
}) => {
  const [groupId, setGroupId] = useState(groups[0]?.id || 1);
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [maxMiniEvents, setMaxMiniEvents] = useState(5);

  useEffect(() => {
    if (isOpen) {
        if (initialDate) setDate(initialDate.format('YYYY-MM-DD'));
        if (initialGroupId) setGroupId(initialGroupId);
        if (initialTime) {
            setStartTime(initialTime);
            // Default 4 hour block
            const end = moment(initialTime, 'HH:mm').add(4, 'hour').format('HH:mm');
            setEndTime(end);
        }
        setMaxMiniEvents(5);
    }
  }, [isOpen, initialDate, initialGroupId, initialTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    
    const group = groups.find(g => g.id === Number(groupId));
    const className = group?.eventClassName || 'bg-slate-600 text-white border-slate-700';
    const doctorName = group?.title || 'Doctor';

    onSubmit({
      title: `${doctorName}`, // Auto-generated title
      group: Number(groupId),
      start_time: startDateTime,
      end_time: endDateTime,
      className,
      operationRoom: undefined, 
      isMainEvent: true, 
      maxMiniEvents: maxMiniEvents,
      miniEvents: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Set Doctor Availability</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Operations Limit</label>
             <input 
               type="number" 
               min="1" 
               max="20" 
               value={maxMiniEvents} 
               onChange={e => setMaxMiniEvents(parseInt(e.target.value))} 
               className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
               required
             />
             <p className="text-xs text-slate-500 mt-1">Maximum number of operations per day.</p>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor</label>
             <select value={groupId} onChange={e => setGroupId(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-white">
               {groups.map(g => (
                 <option key={g.id} value={g.id}>{g.title}</option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
             <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-bold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimelineItem;
  onUpdateEvent: (updatedEvent: TimelineItem) => void;
  onDeleteEvent?: (id: number) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event, onUpdateEvent, onDeleteEvent }) => {
  
  const [isAdding, setIsAdding] = useState(false);
  
  // Mini Event Form State
  const [miniOperation, setMiniOperation] = useState('');
  const [miniPatient, setMiniPatient] = useState('');
  const [miniRoom, setMiniRoom] = useState('OR-1');
  const [miniStartTime, setMiniStartTime] = useState('');
  const [miniEndTime, setMiniEndTime] = useState('');
  const [miniDescription, setMiniDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
        setIsAdding(false);
        // Reset Mini Event Form
        setMiniOperation('');
        setMiniPatient('');
        setMiniRoom('OR-1');
        setMiniDescription('');
        // Default time to block start
        const start = moment(event.start_time).format('HH:mm');
        setMiniStartTime(start);
        setMiniEndTime(moment(event.start_time).add(1, 'hour').format('HH:mm'));
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const addMiniEvent = () => {
      if (!miniOperation || !miniPatient || !miniStartTime || !miniEndTime) return;
      const currentMinis = event.miniEvents || [];
      const limit = event.maxMiniEvents || 0;
      
      if (currentMinis.length >= limit) {
          return; 
      }

      const newMini: MiniEvent = {
          id: Math.random().toString(36).substr(2, 9),
          title: miniOperation,
          patientName: miniPatient,
          operationRoom: miniRoom,
          startTime: miniStartTime,
          endTime: miniEndTime,
          description: miniDescription
      };

      onUpdateEvent({
          ...event,
          miniEvents: [...currentMinis, newMini]
      });

      // Clear Form fields and close form
      setMiniOperation('');
      setMiniPatient('');
      setMiniDescription('');
      setIsAdding(false); 
  };

  const removeMiniEvent = (miniId: string) => {
      const currentMinis = event.miniEvents || [];
      onUpdateEvent({
          ...event,
          miniEvents: currentMinis.filter(m => m.id !== miniId)
      });
  };

  const isLimitReached = (event.miniEvents?.length || 0) >= (event.maxMiniEvents || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 transform transition-all scale-100 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{event.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span>{moment(event.start_time).format('MMMM Do')}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{moment(event.start_time).format('HH:mm')} - {moment(event.end_time).format('HH:mm')}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
           
           {/* TOP SECTION: LIST OF OPERATIONS */}
           <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[200px]">
                <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Scheduled Operations
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isLimitReached ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {event.miniEvents?.length || 0} / {event.maxMiniEvents} Slots
                    </span>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto max-h-[250px]">
                    {event.miniEvents && event.miniEvents.length > 0 ? (
                        event.miniEvents.map(mini => (
                            <div key={mini.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between group hover:border-indigo-300 transition-colors">
                                <div className="flex-1 grid grid-cols-12 gap-2">
                                    {/* Time */}
                                    <div className="col-span-3 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded text-center h-min whitespace-nowrap">
                                        {mini.startTime && mini.endTime ? `${mini.startTime} - ${mini.endTime}` : (mini.time || '--:--')}
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="col-span-6 pl-2">
                                        <div className="font-bold text-slate-800 text-sm">{mini.title}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="font-medium text-slate-400">Patient:</span> 
                                            <span className="text-slate-700">{mini.patientName || 'N/A'}</span>
                                        </div>
                                        {mini.description && (
                                            <div className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                                                {mini.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Room */}
                                    <div className="col-span-3 flex justify-end">
                                         <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide text-center min-w-[50px] h-min">
                                            {mini.operationRoom}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeMiniEvent(mini.id)} 
                                    className="ml-3 text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Operation"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm italic flex flex-col items-center">
                            <svg className="w-10 h-10 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            <p>No operations scheduled in this block yet.</p>
                        </div>
                    )}
                </div>
           </div>

           {/* BOTTOM SECTION: ADD NEW FORM OR BUTTON */}
           <div className="bg-white border-t border-slate-200 pt-4">
                {!isLimitReached ? (
                    <>
                        {!isAdding ? (
                             <button 
                                type="button" 
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 border border-indigo-200 border-dashed font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Operation
                            </button>
                        ) : (
                            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    New Operation
                                </h4>
                                
                                <div className="grid grid-cols-12 gap-3 mb-3">
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. John Doe" 
                                            value={miniPatient}
                                            onChange={e => setMiniPatient(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operation Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Appendectomy" 
                                            value={miniOperation}
                                            onChange={e => setMiniOperation(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time</label>
                                        <input 
                                            type="time" 
                                            value={miniStartTime}
                                            onChange={e => setMiniStartTime(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                     <div className="col-span-6 sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Time</label>
                                        <input 
                                            type="time" 
                                            value={miniEndTime}
                                            onChange={e => setMiniEndTime(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-8">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                                        <input
                                            type="text"
                                            placeholder="Details..." 
                                            value={miniDescription} 
                                            onChange={e => setMiniDescription(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        />
                                    </div>
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room</label>
                                        <select 
                                            value={miniRoom} 
                                            onChange={e => setMiniRoom(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        >
                                            <option value="OR-1">Salla-1</option>
                                            <option value="OR-2">Salla-2</option>
                                            <option value="OR-3">Salla-3</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                     <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)}
                                        className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={addMiniEvent}
                                        disabled={!miniOperation || !miniPatient || !miniStartTime || !miniEndTime}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Add Operation
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100 text-center font-medium flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Block capacity reached ({event.maxMiniEvents} operations). Cannot add more.
                    </div>
                )}
           </div>

           {/* Footer Action */}
           <div className="flex justify-right items-center pt-2">
               <button type="submit" className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-bold">
                    Done
               </button>
           </div>
        </form>
      </div>
    </div>
  );
};