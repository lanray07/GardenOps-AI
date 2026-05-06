import { PlantScanResult } from '../types';

const plantIdEndpoint = process.env.EXPO_PUBLIC_PLANT_ID_ENDPOINT?.trim();

export function isPlantIdEndpointConfigured() {
  return Boolean(plantIdEndpoint);
}

export async function requestPlantIdentification(
  imageUri: string,
): Promise<PlantScanResult> {
  if (!plantIdEndpoint) {
    throw new Error('Plant ID endpoint is not configured.');
  }

  const formData = new FormData();
  formData.append('image', {
    name: 'plant-photo.jpg',
    type: 'image/jpeg',
    uri: imageUri,
  } as unknown as Blob);

  // TODO: This endpoint should upload the image to a trusted backend that calls
  // Plant.id, PlantNet, or another plant recognition API. Keep API keys off-device.
  const response = await fetch(plantIdEndpoint, {
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Plant ID request failed with ${response.status}.`);
  }

  return validatePlantScanResult(await response.json());
}

function validatePlantScanResult(payload: unknown): PlantScanResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Plant ID response was empty.');
  }

  const candidate = payload as Partial<PlantScanResult>;

  if (
    typeof candidate.plantName !== 'string' ||
    typeof candidate.confidenceScore !== 'number' ||
    !Array.isArray(candidate.careInstructions)
  ) {
    throw new Error('Plant ID response did not match the expected shape.');
  }

  return {
    plantName: candidate.plantName,
    confidenceScore: candidate.confidenceScore,
    careInstructions: candidate.careInstructions,
  };
}
