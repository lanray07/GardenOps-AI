import { GardenPlan } from '../types';

export const mockGardenPlans: GardenPlan[] = [
  {
    id: 'starter-urban-food',
    title: 'Starter Food Garden',
    summary:
      'A simple high-yield setup using herbs, salad leaves, tomatoes, and microgreens.',
    gardenType: 'Balcony',
    sunlight: 'Medium',
    monthlyValueGbp: 58,
    recommendedCrops: ['Basil', 'Lettuce', 'Tomatoes', 'Microgreens'],
    nextActions: [
      'Fill two containers with peat-free compost',
      'Start lettuce and basil from seed',
      'Place tomatoes in the brightest spot',
    ],
  },
];
