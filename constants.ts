import { TimelineGroup, TimelineItem } from './types';
import moment from 'moment';

export const INITIAL_GROUPS: TimelineGroup[] = [
  { id: 1, title: 'Doctor 1', category: 'Development', color: 'bg-blue-100 text-blue-800' },
  { id: 2, title: 'Doctor 2', category: 'Development', color: 'bg-indigo-100 text-indigo-800' },
  { id: 3, title: 'Doctor 3', category: 'Design', color: 'bg-pink-100 text-pink-800' },
  { id: 4, title: 'Doctor 4', category: 'Management', color: 'bg-amber-100 text-amber-800' },
  { id: 5, title: 'Doctor 5', category: 'Development', color: 'bg-green-100 text-green-800' },
];

const now = moment().startOf('hour');

export const INITIAL_ITEMS: TimelineItem[] = [
  {
    id: 1,
    group: 1,
    title: 'Sprint Planning',
    start_time: now.clone().add(-2, 'hour').valueOf(),
    end_time: now.clone().add(1, 'hour').valueOf(),
    description: 'Bi-weekly sprint planning meeting',
    className: 'bg-blue-500 text-white border-blue-600',
    maxMiniEvents: 5,
    miniEvents: [
      { id: 'm1', title: 'Review Backlog', duration: '30m', description: 'Check jira' },
      { id: 'm2', title: 'Assign Tasks', duration: '30m', description: 'Team assignment' }
    ]
  },
  {
    id: 2,
    group: 2,
    title: 'API Migration',
    start_time: now.clone().add(1, 'day').valueOf(),
    end_time: now.clone().add(1, 'day').add(4, 'hour').valueOf(),
    description: 'Migrating legacy endpoints to v2',
    className: 'bg-indigo-500 text-white border-indigo-600',
    maxMiniEvents: 3,
    miniEvents: []
  },
  {
    id: 3,
    group: 3,
    title: 'Design Review',
    start_time: now.clone().add(2, 'day').valueOf(),
    end_time: now.clone().add(2, 'day').add(2, 'hour').valueOf(),
    description: 'Review new dashboard mocks',
    className: 'bg-pink-500 text-white border-pink-600',
    maxMiniEvents: 4,
    miniEvents: []
  },
];