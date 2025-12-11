import React, { useState, useEffect } from 'react';
import { TimelineGroup, TimelineItem } from '../types';
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
  const [operationRoom, setOperationRoom] = useState('OR-1');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  useEffect(() => {
    if (isOpen) {
        if (initialDate) setDate(initialDate.format('YYYY-MM-DD'));
        if (initialGroupId) setGroupId(initialGroupId);
        if (initialTime) {
            setStartTime(initialTime);
            // Default 2 hour duration for operations
            const end = moment(initialTime, 'HH:mm').add(2, 'hour').format('HH:mm');
            setEndTime(end);
        }
    }
  }, [isOpen, initialDate, initialGroupId, initialTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').valueOf();
    
    // Determine color based on specific group definition
    const group = groups.find(g => g.id === Number(groupId));
    const className = group?.eventClassName || 'bg-slate-600 text-white border-slate-700';

    onSubmit({
      title,
      group: Number(groupId),
      description,
      start_time: startDateTime,
      end_time: endDateTime,
      className,
      operationRoom
    });
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setOperationRoom('OR-1');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Schedule Operation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Operation Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Appendectomy" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
                <select value={groupId} onChange={e => setGroupId(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                <select value={operationRoom} onChange={e => setOperationRoom(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                   <option value="OR-1">OR-1</option>
                   <option value="OR-2">OR-2</option>
                   <option value="OR-3">OR-3</option>
                   <option value="OR-4">OR-4</option>
                   <option value="ICU">ICU</option>
                   <option value="ER">ER</option>
                </select>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient / Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="Patient info, procedure details..." />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Schedule</button>
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
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [room, setRoom] = useState(event.operationRoom || 'OR-1');

  useEffect(() => {
    if (isOpen) {
        setTitle(event.title);
        setDescription(event.description || '');
        setRoom(event.operationRoom || 'OR-1');
    }
  }, [isOpen, event]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent({
        ...event,
        title,
        description,
        operationRoom: room
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Operation Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Operation Title</label>
             <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
           </div>

           <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Time</label>
                  <div className="text-sm font-medium text-slate-800">
                      {moment(event.start_time).format('MMM D, HH:mm')} - {moment(event.end_time).format('HH:mm')}
                  </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Room</label>
                <select value={room} onChange={e => setRoom(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                   <option value="OR-1">OR-1</option>
                   <option value="OR-2">OR-2</option>
                   <option value="OR-3">OR-3</option>
                   <option value="OR-4">OR-4</option>
                   <option value="ICU">ICU</option>
                   <option value="ER">ER</option>
                </select>
              </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Patient / Notes</label>
             <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" />
           </div>

           <div className="flex justify-between pt-2">
               {onDeleteEvent ? (
                 <button type="button" onClick={() => onDeleteEvent(event.id)} className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors">
                    Delete Operation
                 </button>
               ) : <div></div>}
               
               <div className="flex gap-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                 <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">Save Changes</button>
               </div>
           </div>
        </form>
      </div>
    </div>
  );
};