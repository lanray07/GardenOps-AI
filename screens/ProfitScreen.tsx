import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PremiumBadge } from '../components/PremiumBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { cropProfitData } from '../data/crops';
import { MONTHLY_PRICE, YEARLY_PRICE } from '../monetisation';
import { colors } from '../theme/colors';

export function ProfitScreen() {
  const { isPremium, setSubscriptionStatus } = useGarden();

  if (!isPremium) {
    return (
      <Screen>
        <SectionTitle
          title="Profit Mode"
          subtitle="Estimate what each crop could cost, yield, resell for, and return."
        />

        <Card style={styles.lockedCard}>
          <PremiumBadge label="Profit Mode" />
          <Text style={styles.lockedTitle}>Premium feature locked</Text>
          <Text style={styles.unlockText}>
            Unlock crop cost, yield, resale value, and estimated profit tools.
            Placeholder pricing is {MONTHLY_PRICE}/month or {YEARLY_PRICE}/year.
          </Text>
          <PrimaryButton
            icon="sparkles-outline"
            onPress={() => setSubscriptionStatus('Premium')}
            title="Enable Premium Demo"
          />
        </Card>

        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>Sample crops included</Text>
          <Text style={styles.unlockText}>
            Basil, Mint, Lettuce, Tomatoes, and Microgreens are ready in the demo
            data once Premium is enabled.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle
        title="Profit Mode"
        subtitle="Estimate what each crop could cost, yield, resell for, and return."
      />

      <Card style={styles.unlockCard}>
        <PremiumBadge label="Profit Mode" />
        <Text style={styles.unlockText}>
          Premium demo enabled. Placeholder pricing: {MONTHLY_PRICE}/month or{' '}
          {YEARLY_PRICE}/year.
        </Text>
      </Card>

      {cropProfitData.map((crop) => (
        <Card key={crop.id} style={styles.cropCard}>
          <View style={styles.cropHeader}>
            <Text style={styles.cropName}>{crop.crop}</Text>
            <Text style={styles.profit}>
              {`\u00A3${crop.estimatedProfitGbp} profit`}
            </Text>
          </View>
          <View style={styles.grid}>
            <ProfitMetric
              label="Estimated cost"
              value={`\u00A3${crop.estimatedCostGbp}`}
            />
            <ProfitMetric label="Estimated yield" value={crop.estimatedYield} />
            <ProfitMetric
              label="Resale value"
              value={`\u00A3${crop.estimatedResaleValueGbp}`}
            />
          </View>
          <Text style={styles.tip}>{crop.careTip}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function ProfitMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockedCard: {
    gap: 14,
  },
  lockedTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  previewCard: {
    gap: 10,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  unlockCard: {
    gap: 10,
  },
  unlockText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cropCard: {
    gap: 14,
  },
  cropHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cropName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  profit: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  grid: {
    gap: 8,
  },
  metric: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    padding: 11,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  tip: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
