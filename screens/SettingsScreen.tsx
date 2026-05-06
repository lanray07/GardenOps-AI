import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PremiumBadge } from '../components/PremiumBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { cropProfitData } from '../data/crops';
import { MONTHLY_PRICE, PREMIUM_FEATURES, YEARLY_PRICE } from '../monetisation';
import { getEmailAuthPlaceholderMessage } from '../services/authService';
import { exportGardenData } from '../services/exportGardenData';
import { hasFirebaseConfig } from '../services/firebase';
import { colors } from '../theme/colors';
import { AuthStatus, SyncStatus } from '../types';

export function SettingsScreen() {
  const {
    aiPlansGenerated,
    authStatus,
    authUser,
    isPremium,
    latestPlan,
    profile,
    remainingFreePlans,
    resetGarden,
    setSubscriptionStatus,
    signInDemoAccount,
    signOutAccount,
    subscriptionStatus,
    syncStatus,
    tasks,
  } = useGarden();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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

  async function handleDemoSignIn() {
    setIsAuthLoading(true);
    setAuthMessage(null);

    try {
      await signInDemoAccount();
      setAuthMessage('Signed in with Firebase demo sync.');
    } catch {
      setAuthMessage('Firebase sign-in failed. Check Auth setup and env values.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSignOut() {
    setIsAuthLoading(true);
    setAuthMessage(null);

    try {
      await signOutAccount();
      setAuthMessage('Signed out. GardenOps AI is back in local demo mode.');
    } catch {
      setAuthMessage('Sign out failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  return (
    <Screen>
      <SectionTitle
        title="Settings"
        subtitle="Account, subscription, data export, and launch integrations."
      />

      <Card style={styles.accountCard}>
        <View style={styles.subscriptionTop}>
          <View>
            <Text style={styles.label}>Account mode</Text>
            <Text style={styles.status}>{authStatusLabel[authStatus]}</Text>
          </View>
          <Ionicons
            name={authUser ? 'person-circle-outline' : 'person-outline'}
            color={authUser ? colors.primary : colors.muted}
            size={28}
          />
        </View>
        <Text style={styles.muted}>
          {authUser
            ? `Firebase user: ${authUser.isAnonymous ? 'anonymous demo account' : authUser.email ?? authUser.uid}`
            : hasFirebaseConfig
              ? 'Use Firebase demo sync to test Auth and Firestore without building full sign-in yet.'
              : 'Add Firebase environment values to enable Auth and Firestore sync.'}
        </Text>
        <View style={styles.authActions}>
          {authUser ? (
            <PrimaryButton
              icon="log-out-outline"
              loading={isAuthLoading}
              onPress={handleSignOut}
              title="Sign out"
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              disabled={!hasFirebaseConfig}
              icon="person-add-outline"
              loading={isAuthLoading}
              onPress={handleDemoSignIn}
              title="Continue with Firebase demo sync"
              variant="secondary"
            />
          )}
        </View>
        <View style={styles.emailPlaceholder}>
          <Text style={styles.actionTitle}>Email sign-in</Text>
          <Text style={styles.actionText}>{getEmailAuthPlaceholderMessage()}</Text>
        </View>
        {authMessage ? (
          <Text
            style={[
              styles.authMessage,
              authMessage.includes('failed') && styles.authError,
            ]}
          >
            {authMessage}
          </Text>
        ) : null}
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
            <Text style={styles.status}>{subscriptionStatus} plan</Text>
          </View>
          <Ionicons name="sparkles-outline" color={colors.amber} size={28} />
        </View>
        <Text style={styles.muted}>
          Premium placeholder: {MONTHLY_PRICE}/month or {YEARLY_PRICE}/year.
        </Text>
        <View style={styles.planUsage}>
          <Text style={styles.usageLabel}>AI plans generated</Text>
          <Text style={styles.usageValue}>
            {aiPlansGenerated} used -{' '}
            {isPremium ? 'unlimited remaining' : `${remainingFreePlans} free remaining`}
          </Text>
        </View>
        <View style={styles.toggleRow}>
          <View style={styles.flex}>
            <Text style={styles.actionTitle}>Premium demo access</Text>
            <Text style={styles.actionText}>
              Toggle this locally until Apple In-App Purchases are connected.
            </Text>
          </View>
          <Switch
            onValueChange={(enabled) =>
              setSubscriptionStatus(enabled ? 'Premium' : 'Free')
            }
            thumbColor={colors.surface}
            trackColor={{ false: colors.border, true: colors.primary }}
            value={isPremium}
          />
        </View>
        <View style={styles.featureList}>
          {PREMIUM_FEATURES.map((feature) => (
            <PremiumBadge key={feature} label={feature} />
          ))}
        </View>
      </Card>

      <Card style={styles.actions}>
        <SettingsAction
          icon="refresh-outline"
          title="Restore purchases"
          text="Apple purchase restore placeholder."
        />
        <SettingsAction
          icon="download-outline"
          title="Export data"
          text="Create a JSON snapshot of garden plans, tasks, and profit rows."
        />
        <SettingsAction
          icon="trash-outline"
          title="Delete account"
          text="Connect Firebase Auth account deletion before launch."
          danger
        />
      </Card>

      <PrimaryButton
        icon="refresh-outline"
        onPress={() => undefined}
        title="Restore purchases"
        variant="secondary"
      />

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
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  planUsage: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: 4,
    padding: 12,
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
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
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
  authActions: {
    gap: 8,
  },
  emailPlaceholder: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: 4,
    padding: 12,
  },
  authMessage: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  authError: {
    color: colors.danger,
  },
});
