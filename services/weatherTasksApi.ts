import { GardenTask, WeatherTaskInput } from '../types';

const weatherTasksEndpoint =
  process.env.EXPO_PUBLIC_WEATHER_TASKS_ENDPOINT?.trim();

export function isWeatherTasksEndpointConfigured() {
  return Boolean(weatherTasksEndpoint);
}

export async function requestWeatherTasks(
  input: WeatherTaskInput,
): Promise<GardenTask[]> {
  if (!weatherTasksEndpoint) {
    throw new Error('Weather tasks endpoint is not configured.');
  }

  // TODO: This endpoint should combine weather forecasts with garden profile
  // data on a trusted backend. Keep third-party weather API keys off-device.
  const response = await fetch(weatherTasksEndpoint, {
    body: JSON.stringify(input),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Weather tasks request failed with ${response.status}.`);
  }

  return validateWeatherTasks(await response.json());
}

function validateWeatherTasks(payload: unknown): GardenTask[] {
  if (!Array.isArray(payload)) {
    throw new Error('Weather tasks response must be an array.');
  }

  return payload.map((task) => {
    if (!task || typeof task !== 'object') {
      throw new Error('Weather task response contained an invalid item.');
    }

    const candidate = task as Partial<GardenTask>;
    const priority = candidate.priority;

    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.title !== 'string' ||
      typeof candidate.dueDate !== 'string' ||
      !priority ||
      !['Low', 'Medium', 'High'].includes(priority) ||
      typeof candidate.completed !== 'boolean'
    ) {
      throw new Error('Weather task response did not match the expected shape.');
    }

    return {
      id: candidate.id,
      title: candidate.title,
      dueDate: candidate.dueDate,
      priority,
      completed: candidate.completed,
    };
  });
}
