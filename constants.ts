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
    title: 'Doctor Schedule',
    start_time: now.clone().add(-2, 'hour').valueOf(),
    end_time: now.clone().add(3, 'hour').valueOf(),
    description: 'Scheduled morning operations.',
    className: 'bg-blue-600 text-white border-blue-700',
    isMainEvent: true,
    maxMiniEvents: 4,
    miniEvents: [
      {
        id: 'init-1',
        title: 'Appendectomy',
        patientName: 'John Doe (45M)',
        startTime: now.clone().add(-1, 'hour').format('HH:mm'),
        endTime: now.clone().add(0, 'hour').format('HH:mm'),
        operationRoom: 'OR-1',
        description: 'Routine appendectomy.'
      },
      {
        id: 'init-2',
        title: 'Hernia Repair',
        patientName: 'Mike Ross (32M)',
        startTime: now.clone().add(1, 'hour').format('HH:mm'),
        endTime: now.clone().add(2, 'hour').format('HH:mm'),
        operationRoom: 'OR-1',
        description: 'Inguinal hernia.'
      }
    ]
  },
  {
    id: 2,
    group: 2,
    title: 'Cardio Block',
    start_time: now.clone().add(1, 'day').valueOf(),
    end_time: now.clone().add(1, 'day').add(5, 'hour').valueOf(),
    description: 'Major cardiac procedures.',
    className: 'bg-red-600 text-white border-red-700',
    isMainEvent: true,
    maxMiniEvents: 2,
    miniEvents: [
      {
        id: 'init-3',
        title: 'Coronary Bypass',
        patientName: 'Jane Smith (62F)',
        startTime: now.clone().add(1, 'day').add(0.5, 'hour').format('HH:mm'),
        endTime: now.clone().add(1, 'day').add(3.5, 'hour').format('HH:mm'),
        operationRoom: 'OR-3',
        description: 'Triple bypass.'
      }
    ]
  },
  {
    id: 3,
    group: 4,
    title: 'Ortho Surgery Block',
    start_time: now.clone().add(2, 'day').valueOf(),
    end_time: now.clone().add(2, 'day').add(4, 'hour').valueOf(),
    description: 'Joint replacements.',
    className: 'bg-green-600 text-white border-green-700',
    isMainEvent: true,
    maxMiniEvents: 3,
    miniEvents: [
      {
        id: 'init-4',
        title: 'Knee Replacement',
        patientName: 'Robert Brown (70M)',
        startTime: now.clone().add(2, 'day').add(1, 'hour').format('HH:mm'),
        endTime: now.clone().add(2, 'day').add(3, 'hour').format('HH:mm'),
        operationRoom: 'OR-2',
        description: 'Left knee.'
      }
    ]
  },
];