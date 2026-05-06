import { PlantScanResult } from '../types';
import {
  isPlantIdEndpointConfigured,
  requestPlantIdentification,
} from './plantIdApi';

export async function scanPlantImage(
  imageUri: string | null,
): Promise<PlantScanResult> {
  if (imageUri && isPlantIdEndpointConfigured()) {
    try {
      return await requestPlantIdentification(imageUri);
    } catch {
      return getMockPlantScanResult(true);
    }
  }

  return getMockPlantScanResult();
}

export function getPlantScannerModeLabel() {
  return isPlantIdEndpointConfigured()
    ? 'Plant ID endpoint configured'
    : 'Local mock scanner';
}

function getMockPlantScanResult(endpointFailed = false): PlantScanResult {
  return {
    plantName: endpointFailed ? 'Basil (mock fallback)' : 'Basil',
    confidenceScore: endpointFailed ? 0.88 : 0.92,
    careInstructions: [
      'Keep in bright indirect light or gentle morning sun.',
      'Water when the top 2 cm of soil feels dry.',
      'Pinch off flowers to keep leaves productive.',
    ],
  };
}
