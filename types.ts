export type GardenType = 'Balcony' | 'Backyard' | 'Allotment';

export type SunlightLevel = 'Low' | 'Medium' | 'Full Sun';

export type GardenGoal =
  | 'Save Money'
  | 'Grow Food'
  | 'Make Extra Income'
  | 'Learn Gardening';

export type Priority = 'Low' | 'Medium' | 'High';

export type SubscriptionStatus = 'Free' | 'Premium';

export type SyncStatus = 'local-only' | 'syncing' | 'synced' | 'error';

export type AuthStatus =
  | 'local-demo'
  | 'signed-out'
  | 'signed-in'
  | 'auth-error';

export interface AuthUserSummary {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}

export interface GardenProfile {
  location: string;
  gardenType: GardenType;
  sizeSquareMetres: number;
  sunlight: SunlightLevel;
  goal: GardenGoal;
}

export interface GardenTask {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
}

export interface CropProfit {
  id: string;
  crop: string;
  estimatedCostGbp: number;
  estimatedYield: string;
  estimatedResaleValueGbp: number;
  estimatedProfitGbp: number;
  careTip: string;
}

export interface GardenPlan {
  id: string;
  title: string;
  summary: string;
  gardenType: GardenType;
  sunlight: SunlightLevel;
  monthlyValueGbp: number;
  recommendedCrops: string[];
  nextActions: string[];
}

export interface AIPlannerInput {
  gardenSize: number;
  sunlight: SunlightLevel;
  location: string;
  preferredCrops: string[];
  budgetGbp: number;
}

export interface AIPlannerResult {
  recommendedCrops: string[];
  plantingSchedule: string[];
  wateringSchedule: string[];
  estimatedHarvestTime: string;
  estimatedYield: string;
  estimatedValueGbp: number;
  notes: string;
}

export interface PlantScanResult {
  plantName: string;
  confidenceScore: number;
  careInstructions: string[];
}

export interface WeatherTaskInput {
  profile: GardenProfile;
  existingTasks: GardenTask[];
}

export interface PersistedGardenState {
  profile: GardenProfile | null;
  tasks: GardenTask[];
  latestPlan: AIPlannerResult | null;
  subscriptionStatus: SubscriptionStatus;
  aiPlansGenerated: number;
}
