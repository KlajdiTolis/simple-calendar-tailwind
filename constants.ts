import { TimelineGroup, TimelineItem } from './types';
import moment from 'moment';

export const INITIAL_GROUPS: TimelineGroup[] = [
  { 
    id: 1, 
    title: 'Dr. Arben Kodra', 
    category: 'General Surgery', 
    color: 'bg-blue-100 text-blue-800',
    eventClassName: 'bg-blue-600 text-white border-blue-700'
  },
  { 
    id: 2, 
    title: 'Dr. Ilir Dervishi', 
    category: 'Cardiology', 
    color: 'bg-red-100 text-red-800',
    eventClassName: 'bg-red-600 text-white border-red-700'
  },
  { 
    id: 3, 
    title: 'Dr. Gentiana Hoxha', 
    category: 'Neurology', 
    color: 'bg-purple-100 text-purple-800',
    eventClassName: 'bg-purple-600 text-white border-purple-700'
  },
  { 
    id: 4, 
    title: 'Dr. Blendi Shala', 
    category: 'Orthopedics', 
    color: 'bg-green-100 text-green-800',
    eventClassName: 'bg-green-600 text-white border-green-700'
  },
  { 
    id: 5, 
    title: 'Dr. Arlinda Kuqi', 
    category: 'Pediatrics', 
    color: 'bg-yellow-100 text-yellow-800',
    eventClassName: 'bg-yellow-500 text-white border-yellow-600'
  },
  { 
    id: 6, 
    title: 'Dr. Marco Bellini', 
    category: 'General Surgery', 
    color: 'bg-cyan-100 text-cyan-800',
    eventClassName: 'bg-cyan-600 text-white border-cyan-700'
  },
];

const now = moment().startOf('hour');

export const INITIAL_ITEMS: TimelineItem[] = [
  {
    id: 1,
    group: 1,
    title: 'Appendectomy',
    start_time: now.clone().add(-2, 'hour').valueOf(),
    end_time: now.clone().add(1, 'hour').valueOf(),
    description: 'Patient: John Doe (45M). Routine appendectomy.',
    className: 'bg-blue-600 text-white border-blue-700',
    operationRoom: 'OR-1'
  },
  {
    id: 2,
    group: 2,
    title: 'Coronary Bypass',
    start_time: now.clone().add(1, 'day').valueOf(),
    end_time: now.clone().add(1, 'day').add(4, 'hour').valueOf(),
    description: 'Patient: Jane Smith (62F). Triple bypass.',
    className: 'bg-red-600 text-white border-red-700',
    operationRoom: 'OR-3'
  },
  {
    id: 3,
    group: 4,
    title: 'Knee Replacement',
    start_time: now.clone().add(2, 'day').valueOf(),
    end_time: now.clone().add(2, 'day').add(2, 'hour').valueOf(),
    description: 'Patient: Robert Brown (70M). Left knee.',
    className: 'bg-green-600 text-white border-green-700',
    operationRoom: 'OR-2'
  },
];