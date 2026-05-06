import { AIPlannerInput, AIPlannerResult } from '../types';
import {
  isAiPlannerEndpointConfigured,
  requestOpenAiGardenPlan,
} from './openAiGardenApi';

const fallbackCrops = ['Basil', 'Lettuce', 'Tomatoes', 'Microgreens'];

export async function generateGardenPlan(
  input: AIPlannerInput,
): Promise<AIPlannerResult> {
  if (isAiPlannerEndpointConfigured()) {
    try {
      return await requestOpenAiGardenPlan(input);
    } catch {
      const mockPlan = await generateMockGardenPlan(input);

      return {
        ...mockPlan,
        notes:
          'AI endpoint request failed, so GardenOps AI returned the local mock plan. Check backend logs and endpoint configuration.',
      };
    }
  }

  return generateMockGardenPlan(input);
}

async function generateMockGardenPlan(
  input: AIPlannerInput,
): Promise<AIPlannerResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const preferredCrops =
    input.preferredCrops.length > 0 ? input.preferredCrops : fallbackCrops;
  const cropList = preferredCrops.slice(0, 5);
  const compactSpace = input.gardenSize <= 5;
  const estimatedValue = Math.max(
    25,
    Math.round(input.gardenSize * (compactSpace ? 9 : 6) + input.budgetGbp * 0.35),
  );

  return {
    recommendedCrops: cropList,
    plantingSchedule: [
      `Week 1: Prepare ${input.gardenSize} square metres of growing space in ${input.location}.`,
      `Week 2: Sow ${cropList.slice(0, 2).join(' and ')} in trays or containers.`,
      `Week 3: Transplant stronger seedlings and label each crop clearly.`,
      'Week 4: Start a second small sowing for repeat harvests.',
    ],
    wateringSchedule: [
      input.sunlight === 'Full Sun'
        ? 'Check soil moisture every morning and water deeply when the top layer is dry.'
        : 'Check soil moisture every 2 days and avoid overwatering shaded containers.',
      'Feed leafy crops lightly every 2 weeks.',
      'Mulch larger pots to keep moisture stable.',
    ],
    estimatedHarvestTime: compactSpace
      ? '2 to 6 weeks for herbs and salad crops'
      : '4 to 10 weeks depending on crop mix',
    estimatedYield: compactSpace
      ? '4 to 8 fresh portions per week'
      : '8 to 18 fresh portions per week',
    estimatedValueGbp: estimatedValue,
    notes:
      'This is mock guidance for the MVP. Set EXPO_PUBLIC_AI_PLANNER_ENDPOINT to call a secure OpenAI-backed planner service.',
  };
}

export function getPlannerModeLabel() {
  return isAiPlannerEndpointConfigured()
    ? 'AI endpoint configured'
    : 'Local mock planner';
}
