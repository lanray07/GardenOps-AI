import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PremiumPaywall } from '../components/PremiumPaywall';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { cropProfitData } from '../data/crops';
import { exportGardenData } from '../services/exportGardenData';
import { colors } from '../theme/colors';
import { AuthStatus, SyncStatus } from '../types';

export function SettingsScreen() {
  const {
    aiPlansGenerated,
    authStatus,
    isPremium,
    latestPlan,
    openSubscriptionManagement,
    profile,
    purchaseStatus,
    refreshPurchaseEntitlements,
    resetGarden,
    subscriptionStatus,
    syncStatus,
    tasks,
  } = useGarden();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleExportData() {
    setIsExporting(true);
    setExportMessage(null);

    try {
      const result = await exportGardenData({
        aiPlansGenerated,
        cropProfitRows: cropProfitData,
        latestPlan,
        profile,
        subscriptionStatus,
        syncStatus,
        tasks,
      });

      setExportMessage(
        result.shared
          ? `Export created: ${result.fileName}`
          : `Export saved locally: ${result.fileName}`,
      );
    } catch {
      setExportMessage('Export failed. Please try again from Settings.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleResetGarden() {
    setResetMessage(null);
    await resetGarden();
    setResetMessage('Demo data cleared. The app will return to onboarding.');
  }

  return (
    <Screen>
      <SectionTitle
        title="Settings"
        subtitle="Account mode, data export, and launch integrations."
      />

      <Card style={styles.accountCard}>
        <View style={styles.subscriptionTop}>
          <View>
            <Text style={styles.label}>Account mode</Text>
            <Text style={styles.status}>{authStatusLabel[authStatus]}</Text>
          </View>
          <Ionicons
            name="person-outline"
            color={colors.primary}
            size={28}
          />
        </View>
        <Text style={styles.muted}>
          No sign-in is required in this App Store review build. Garden data is
          saved locally on the device, and Firebase remains a future integration.
        </Text>
      </Card>

      <Card style={styles.syncCard}>
        <View style={styles.subscriptionTop}>
          <View>
            <Text style={styles.label}>Data sync</Text>
            <Text style={styles.status}>{syncStatusLabel[syncStatus]}</Text>
          </View>
          <Ionicons
            name={syncStatus === 'synced' ? 'cloud-done-outline' : 'phone-portrait-outline'}
            color={syncStatus === 'error' ? colors.danger : colors.primary}
            size={28}
          />
        </View>
        <Text style={styles.muted}>{syncStatusText[syncStatus]}</Text>
      </Card>

      <Card style={styles.subscriptionCard}>
        <View style={styles.subscriptionTop}>
          <View>
            <Text style={styles.label}>Subscription status</Text>
            <Text style={styles.status}>{subscriptionStatus}</Text>
          </View>
          <Ionicons
            name={isPremium ? 'checkmark-circle-outline' : 'lock-closed-outline'}
            color={colors.primary}
            size={28}
          />
        </View>
        <Text style={styles.muted}>
          Premium unlocks unlimited AI garden plans, Profit Mode, and smart
          weather-based tasks through Apple In-App Purchases.
        </Text>
        <View style={styles.planUsage}>
          <Text style={styles.usageLabel}>AI plans generated</Text>
          <Text style={styles.usageValue}>
            {aiPlansGenerated} generated in this install
          </Text>
        </View>
        {isPremium ? (
          <View style={styles.subscriptionActions}>
            <PrimaryButton
              icon="open-outline"
              onPress={openSubscriptionManagement}
              title="Manage subscription"
              variant="secondary"
            />
            <PrimaryButton
              icon="refresh-outline"
              loading={purchaseStatus === 'loading'}
              onPress={refreshPurchaseEntitlements}
              title="Refresh access"
              variant="secondary"
            />
          </View>
        ) : null}
      </Card>

      {!isPremium ? (
        <PremiumPaywall
          title="Upgrade to Premium"
          text="Buy or restore GardenOps AI Premium to unlock the paid garden planning tools."
        />
      ) : null}

      <Card style={styles.actions}>
        <SettingsAction
          icon="download-outline"
          title="Export data"
          text="Create a JSON snapshot of garden plans, tasks, and profit rows."
        />
        <SettingsAction
          icon="trash-outline"
          title="Delete local demo data"
          text="Use Start fresh demo below to clear local garden data from this device."
          danger
        />
      </Card>

      <View style={styles.exportBlock}>
        <PrimaryButton
          icon="download-outline"
          loading={isExporting}
          onPress={handleExportData}
          title="Export data"
          variant="secondary"
        />
        {exportMessage ? (
          <Text
            style={[
              styles.exportMessage,
              exportMessage.includes('failed') && styles.exportError,
            ]}
          >
            {exportMessage}
          </Text>
        ) : null}
      </View>

      <PrimaryButton
        icon="trash-outline"
        onPress={handleResetGarden}
        title="Start fresh demo"
        variant="danger"
      />
      {resetMessage ? (
        <Text style={styles.resetMessage}>{resetMessage}</Text>
      ) : null}
    </Screen>
  );
}

const syncStatusLabel: Record<SyncStatus, string> = {
  'local-only': 'Saved on this device',
  syncing: 'Syncing',
  synced: 'Synced to Firebase',
  error: 'Sync needs attention',
};

const authStatusLabel: Record<AuthStatus, string> = {
  'local-demo': 'Local demo',
  'signed-out': 'Firebase ready',
  'signed-in': 'Signed in',
  'auth-error': 'Auth needs attention',
};

const syncStatusText: Record<SyncStatus, string> = {
  'local-only':
    'Onboarding, task completion, and AI plans persist locally. Add Firebase keys to enable cloud sync.',
  syncing: 'Saving the latest garden state.',
  synced: 'This demo is using anonymous Firebase Auth and Firestore sync.',
  error:
    'Local persistence still works. Check Firebase keys, Auth, Firestore rules, or network access.',
};

function SettingsAction({
  danger = false,
  icon,
  text,
  title,
}: {
  danger?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  title: string;
}) {
  return (
    <View style={styles.actionRow}>
      <View style={[styles.actionIcon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          color={danger ? colors.danger : colors.primary}
          size={20}
        />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.actionTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.actionText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    gap: 10,
  },
  syncCard: {
    gap: 10,
  },
  subscriptionCard: {
    gap: 14,
  },
  subscriptionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  status: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  planUsage: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: 4,
    padding: 12,
  },
  subscriptionActions: {
    gap: 10,
  },
  usageLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  usageValue: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },
  actions: {
    gap: 18,
  },
  exportBlock: {
    gap: 8,
  },
  exportMessage: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  exportError: {
    color: colors.danger,
  },
  resetMessage: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dangerIcon: {
    backgroundColor: '#FDECEC',
  },
  flex: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  dangerText: {
    color: colors.danger,
  },
  actionText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
});
