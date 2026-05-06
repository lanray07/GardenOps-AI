import { AIPlannerInput, AIPlannerResult } from '../types';

const plannerEndpoint = process.env.EXPO_PUBLIC_AI_PLANNER_ENDPOINT?.trim();

export function isAiPlannerEndpointConfigured() {
  return Boolean(plannerEndpoint);
}

export async function requestOpenAiGardenPlan(
  input: AIPlannerInput,
): Promise<AIPlannerResult> {
  if (!plannerEndpoint) {
    throw new Error('AI planner endpoint is not configured.');
  }

  // TODO: This endpoint should be a trusted backend, such as a Firebase Cloud
  // Function, Vercel API route, or server. Keep OpenAI API keys off the device.
  const response = await fetch(plannerEndpoint, {
    body: JSON.stringify(input),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`AI planner request failed with ${response.status}.`);
  }

  return validatePlannerResult(await response.json());
}

function validatePlannerResult(payload: unknown): AIPlannerResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('AI planner response was empty.');
  }

  const candidate = payload as Partial<AIPlannerResult>;

  if (
    !Array.isArray(candidate.recommendedCrops) ||
    !Array.isArray(candidate.plantingSchedule) ||
    !Array.isArray(candidate.wateringSchedule) ||
    typeof candidate.estimatedHarvestTime !== 'string' ||
    typeof candidate.estimatedYield !== 'string' ||
    typeof candidate.estimatedValueGbp !== 'number' ||
    typeof candidate.notes !== 'string'
  ) {
    throw new Error('AI planner response did not match the expected shape.');
  }

  return {
    recommendedCrops: candidate.recommendedCrops,
    plantingSchedule: candidate.plantingSchedule,
    wateringSchedule: candidate.wateringSchedule,
    estimatedHarvestTime: candidate.estimatedHarvestTime,
    estimatedYield: candidate.estimatedYield,
    estimatedValueGbp: candidate.estimatedValueGbp,
    notes: candidate.notes,
  };
}
