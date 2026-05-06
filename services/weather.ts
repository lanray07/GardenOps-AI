import { GardenTask, WeatherTaskInput } from '../types';
import {
  isWeatherTasksEndpointConfigured,
  requestWeatherTasks,
} from './weatherTasksApi';

export async function getWeatherBasedTasks(
  input: WeatherTaskInput,
): Promise<GardenTask[]> {
  if (isWeatherTasksEndpointConfigured()) {
    try {
      return await requestWeatherTasks(input);
    } catch {
      return generateMockWeatherTasks(input, true);
    }
  }

  return generateMockWeatherTasks(input);
}

function generateMockWeatherTasks(
  input: WeatherTaskInput,
  endpointFailed = false,
): GardenTask[] {
  const compactGarden = input.profile.sizeSquareMetres <= 5;
  const fullSun = input.profile.sunlight === 'Full Sun';
  const prefix = endpointFailed ? 'Mock fallback: ' : '';

  return [
    {
      id: 'weather-check-soil-moisture',
      title: `${prefix}Check soil moisture in ${input.profile.location}`,
      dueDate: 'Today',
      priority: fullSun ? 'High' : 'Medium',
      completed: false,
    },
    {
      id: 'weather-adjust-watering',
      title: fullSun
        ? `${prefix}Water containers before the warmest part of the day`
        : `${prefix}Skip watering if soil still feels damp`,
      dueDate: 'Tomorrow',
      priority: fullSun ? 'High' : 'Low',
      completed: false,
    },
    {
      id: 'weather-protect-young-plants',
      title: compactGarden
        ? `${prefix}Move small pots out of harsh wind`
        : `${prefix}Check exposed beds after weather changes`,
      dueDate: 'Next 2 days',
      priority: 'Medium',
      completed: false,
    },
  ];
}

export function getWeatherTaskModeLabel() {
  return isWeatherTasksEndpointConfigured()
    ? 'Weather endpoint configured'
    : 'Local mock weather tasks';
}
