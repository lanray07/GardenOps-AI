import { GardenTask } from '../types';

export const mockTasks: GardenTask[] = [
  {
    id: 'water-tomatoes',
    title: 'Water tomatoes',
    dueDate: 'Today',
    priority: 'High',
    completed: false,
  },
  {
    id: 'feed-herbs',
    title: 'Feed herbs',
    dueDate: 'Tomorrow',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'check-lettuce',
    title: 'Check lettuce growth',
    dueDate: 'Wed 6 May',
    priority: 'Low',
    completed: false,
  },
  {
    id: 'prune-basil',
    title: 'Prune basil',
    dueDate: 'Fri 8 May',
    priority: 'Medium',
    completed: false,
  },
];
