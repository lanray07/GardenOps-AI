import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PREMIUM_FEATURES } from '../monetisation';
import { colors } from '../theme/colors';
import { useGarden } from '../context/GardenContext';
import { Card } from './Card';
import { PremiumBadge } from './PremiumBadge';
import { PrimaryButton } from './PrimaryButton';

interface PremiumPaywallProps {
  title: string;
  text: string;
  compact?: boolean;
}

export function PremiumPaywall({
  compact = false,
  text,
  title,
}: PremiumPaywallProps) {
  const {
    isPremium,
    premiumPlans,
    purchaseMessage,
    purchasePremiumPlan,
    purchaseStatus,
    restorePremiumPurchases,
  } = useGarden();
  const isBusy = purchaseStatus === 'purchasing' || purchaseStatus === 'restoring';

  if (isPremium) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" color={colors.surface} size={18} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>Premium active</Text>
            <Text style={styles.text}>
              Unlimited AI plans, Profit Mode, and smart weather tasks are
              unlocked on this device.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PremiumBadge label="Premium" />
        <Ionicons name="sparkles-outline" color={colors.primary} size={22} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>

      {!compact ? (
        <View style={styles.features}>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle-outline"
                color={colors.primary}
                size={17}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.planList}>
        {premiumPlans.map((plan) => (
          <View key={plan.productId} style={styles.planRow}>
            <View style={styles.flex}>
              <Text style={styles.planTitle}>{plan.periodLabel}</Text>
              <Text style={styles.planMeta}>{plan.valueLabel}</Text>
            </View>
            <View style={styles.planAction}>
              <Text style={styles.price}>{plan.storePrice}</Text>
              <PrimaryButton
                disabled={isBusy}
                loading={purchaseStatus === 'purchasing'}
                onPress={() => purchasePremiumPlan(plan.key)}
                title="Buy"
                variant="secondary"
              />
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton
        disabled={isBusy}
        icon="refresh-outline"
        loading={purchaseStatus === 'restoring'}
        onPress={restorePremiumPurchases}
        title="Restore Purchases"
        variant="secondary"
      />

      {purchaseMessage ? (
        <Text
          style={[
            styles.message,
            purchaseStatus === 'error' && styles.errorMessage,
          ]}
        >
          {purchaseMessage}
        </Text>
      ) : null}

      <Text style={styles.terms}>
        Subscriptions renew automatically through your Apple ID unless cancelled
        at least 24 hours before renewal. You can manage or cancel in Apple
        Account settings.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  flex: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  features: {
    gap: 8,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  featureText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  planList: {
    gap: 10,
  },
  planRow: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  planTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  planMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  planAction: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 86,
  },
  price: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  message: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  errorMessage: {
    color: colors.danger,
  },
  terms: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
