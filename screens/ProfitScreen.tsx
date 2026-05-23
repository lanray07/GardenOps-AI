import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PremiumPaywall } from '../components/PremiumPaywall';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { cropProfitData } from '../data/crops';
import { colors } from '../theme/colors';

export function ProfitScreen() {
  const { isPremium } = useGarden();

  return (
    <Screen>
      <SectionTitle
        title="Profit Mode"
        subtitle="Estimate what each crop could cost, yield, resell for, and return."
      />

      {!isPremium ? (
        <>
          <PremiumPaywall
            title="Unlock Profit Mode"
            text="Compare crop costs, estimated yield, resale value, and profit for beginner-friendly garden crops."
          />
          <Card style={styles.unlockCard}>
            <Text style={styles.unlockText}>
              Preview crops: Basil, Mint, Lettuce, Tomatoes, and Microgreens.
              Subscribe to view the full profit table.
            </Text>
          </Card>
        </>
      ) : null}

      {isPremium ? cropProfitData.map((crop) => (
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
      )) : null}
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
