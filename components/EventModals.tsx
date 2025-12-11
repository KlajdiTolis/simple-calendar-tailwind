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
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || 1);
  const [maxMiniEvents, setMaxMiniEvents] = useState(5);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (isOpen) {
        if (initialDate) setDate(initialDate.format('YYYY-MM-DD'));
        if (initialGroupId) setGroupId(initialGroupId);
        if (initialTime) {
            setStartTime(initialTime);
            // Default 1 hour duration
            const end = moment(initialTime, 'HH:mm').add(1, 'hour').format('HH:mm');
            setEndTime(end);
        }
    }
  }, [isOpen, initialDate, initialGroupId, initialTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    
    // Determine color based on group
    const group = groups.find(g => g.id === Number(groupId));
    let className = 'bg-slate-500 text-white border-slate-600';
    if (group?.category === 'Development') className = 'bg-blue-500 text-white border-blue-600';
    if (group?.category === 'Design') className = 'bg-pink-500 text-white border-pink-600';
    if (group?.category === 'Marketing') className = 'bg-purple-500 text-white border-purple-600';
    if (group?.category === 'Management') className = 'bg-amber-500 text-white border-amber-600';

    onSubmit({
      title,
      group: Number(groupId),
      maxMiniEvents: Number(maxMiniEvents),
      description,
      start_time: startDateTime,
      end_time: endDateTime,
      className,
      miniEvents: []
    });
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Create New Event</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Project Kickoff" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resource / Group</label>
                <select value={groupId} onChange={e => setGroupId(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Mini-Events</label>
                <input type="number" min="1" max="20" value={maxMiniEvents} onChange={e => setMaxMiniEvents(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
             <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none" placeholder="Details about this event..." />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MiniEventManagerProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimelineItem;
  onUpdateEvent: (updatedEvent: TimelineItem) => void;
}

export const MiniEventManagerModal: React.FC<MiniEventManagerProps> = ({ isOpen, onClose, event, onUpdateEvent }) => {
  // Creation State
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('30m');
  const [newDesc, setNewDesc] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDesc, setEditDesc] = useState('');

  if (!isOpen) return null;

  const currentCount = event.miniEvents?.length || 0;
  const maxCount = event.maxMiniEvents || 0;
  const isFull = maxCount > 0 && currentCount >= maxCount;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;

    const newMini: MiniEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      duration: newDuration,
      description: newDesc
    };

    onUpdateEvent({
      ...event,
      miniEvents: [...(event.miniEvents || []), newMini]
    });

    setNewTitle('');
    setNewDesc('');
    setNewDuration('30m');
  };

  const handleDelete = (id: string) => {
    onUpdateEvent({
      ...event,
      miniEvents: (event.miniEvents || []).filter(m => m.id !== id)
    });
  };

  const startEdit = (mini: MiniEvent) => {
    setEditingId(mini.id);
    setEditTitle(mini.title);
    setEditDuration(mini.duration);
    setEditDesc(mini.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDuration('');
    setEditDesc('');
  };

  const saveEdit = (id: string) => {
    const updatedMiniEvents = (event.miniEvents || []).map(m => {
      if (m.id === id) {
        return { ...m, title: editTitle, duration: editDuration, description: editDesc };
      }
      return m;
    });

    onUpdateEvent({ ...event, miniEvents: updatedMiniEvents });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 h-[80vh] flex flex-col transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{event.title}</h2>
            <div className="text-sm text-slate-500 mt-1">{event.description}</div>
            <div className="mt-3 flex items-center gap-2">
               <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm border ${isFull ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                 Capacity: {currentCount} / {maxCount}
               </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
           {(!event.miniEvents || event.miniEvents.length === 0) && (
             <div className="flex flex-col items-center justify-center h-40 text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                No mini-events yet. Add one below!
             </div>
           )}
           <div className="space-y-3">
             {event.miniEvents?.map(mini => (
               <div key={mini.id} className="bg-white border border-slate-200 rounded-lg p-3 group hover:border-indigo-300 hover:shadow-sm transition-all">
                 {editingId === mini.id ? (
                   <div className="flex flex-col gap-2">
                     <div className="flex gap-2">
                       <input 
                         className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm" 
                         value={editTitle} 
                         onChange={e => setEditTitle(e.target.value)} 
                         placeholder="Title"
                       />
                       <input 
                         className="w-20 border border-slate-300 rounded px-2 py-1 text-sm" 
                         value={editDuration} 
                         onChange={e => setEditDuration(e.target.value)} 
                         placeholder="Duration"
                       />
                     </div>
                     <textarea 
                        className="w-full border border-slate-300 rounded px-2 py-1 text-sm resize-none h-16" 
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        placeholder="Description"
                     />
                     <div className="flex justify-end gap-2 mt-1">
                        <button onClick={cancelEdit} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        <button onClick={() => saveEdit(mini.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Save</button>
                     </div>
                   </div>
                 ) : (
                   <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => startEdit(mini)}>
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                            {mini.title} 
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{mini.duration}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-slate-300 text-xs ml-2">✎ Click to edit</span>
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">{mini.description}</div>
                      </div>
                      <button onClick={() => handleDelete(mini.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-50 rounded-lg ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                      </button>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Mini-Event
          </h3>
          {isFull ? (
             <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg text-sm border border-amber-200 flex items-center gap-2">
               <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
               Maximum capacity reached. Delete existing mini-events to add new ones.
             </div>
          ) : (
             <form onSubmit={handleAdd} className="flex flex-col gap-3">
               <div className="flex gap-3">
                 <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                 <input type="text" value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="Duration" className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
               </div>
               <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
               <button type="submit" className="self-end bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm">Add Item</button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};
