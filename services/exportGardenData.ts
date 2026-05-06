import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  AIPlannerResult,
  CropProfit,
  GardenProfile,
  GardenTask,
  SubscriptionStatus,
  SyncStatus,
} from '../types';

interface ExportGardenDataInput {
  profile: GardenProfile | null;
  tasks: GardenTask[];
  latestPlan: AIPlannerResult | null;
  cropProfitRows: CropProfit[];
  subscriptionStatus: SubscriptionStatus;
  aiPlansGenerated: number;
  syncStatus: SyncStatus;
}

export interface ExportGardenDataResult {
  fileName: string;
  fileUri: string;
  shared: boolean;
}

export async function exportGardenData({
  aiPlansGenerated,
  cropProfitRows,
  latestPlan,
  profile,
  subscriptionStatus,
  syncStatus,
  tasks,
}: ExportGardenDataInput): Promise<ExportGardenDataResult> {
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.replace(/[:.]/g, '-');
  const fileName = `gardenops-ai-export-${stamp}.json`;
  const file = new File(Paths.document, fileName);

  const exportPayload = {
    app: 'GardenOps AI',
    generatedAt,
    profile,
    tasks,
    latestPlan,
    profitMode: {
      cropProfitRows,
    },
    subscription: {
      status: subscriptionStatus,
      aiPlansGenerated,
    },
    sync: {
      status: syncStatus,
    },
  };

  // TODO: Add encrypted cloud backup/export once real accounts are connected.
  file.create({ overwrite: true });
  file.write(JSON.stringify(exportPayload, null, 2));

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Export GardenOps AI data',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
  }

  return {
    fileName,
    fileUri: file.uri,
    shared: canShare,
  };
}
