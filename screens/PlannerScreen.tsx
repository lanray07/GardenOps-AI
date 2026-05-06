import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { PremiumBadge } from '../components/PremiumBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SegmentedControl } from '../components/SegmentedControl';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { FREE_PLAN_LIMIT } from '../monetisation';
import { generateGardenPlan, getPlannerModeLabel } from '../services/aiPlanner';
import { colors } from '../theme/colors';
import { AIPlannerResult, SunlightLevel } from '../types';

const sunlightLevels: SunlightLevel[] = ['Low', 'Medium', 'Full Sun'];

export function PlannerScreen() {
  const {
    aiPlansGenerated,
    canGenerateAIPlan,
    isPremium,
    latestPlan,
    profile,
    remainingFreePlans,
    saveGeneratedPlan,
  } = useGarden();
  const [gardenSize, setGardenSize] = useState(
    String(profile?.sizeSquareMetres ?? 4),
  );
  const [sunlight, setSunlight] = useState<SunlightLevel>(
    profile?.sunlight ?? 'Medium',
  );
  const [location, setLocation] = useState(profile?.location ?? '');
  const [preferredCrops, setPreferredCrops] = useState(
    'Basil, Lettuce, Tomatoes',
  );
  const [budget, setBudget] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<AIPlannerResult | null>(latestPlan);

  const canGenerate =
    canGenerateAIPlan &&
    Number(gardenSize) > 0 &&
    Number(budget) >= 0 &&
    location.trim().length > 1;

  async function handleGeneratePlan() {
    if (!canGenerateAIPlan) {
      return;
    }

    setIsLoading(true);
    const generatedPlan = await generateGardenPlan({
      budgetGbp: Number(budget),
      gardenSize: Number(gardenSize),
      location: location.trim(),
      preferredCrops: preferredCrops
        .split(',')
        .map((crop) => crop.trim())
        .filter(Boolean),
      sunlight,
    });
    saveGeneratedPlan(generatedPlan);
    setPlan(generatedPlan);
    setIsLoading(false);
  }

  return (
    <Screen>
      <SectionTitle
        title="AI Garden Planner"
        subtitle="Generate a quick planting plan from your space, budget, crops, and sunlight."
      />

      <Card style={styles.formCard}>
        <View style={styles.premiumRow}>
          <PremiumBadge label="Unlimited AI plans" />
          <Text style={styles.limit}>
            {isPremium
              ? 'Premium demo: unlimited plans'
              : `Free plan: ${remainingFreePlans}/${FREE_PLAN_LIMIT} remaining`}
          </Text>
        </View>

        <View style={styles.modeBox}>
          <Text style={styles.modeLabel}>Planner mode</Text>
          <Text style={styles.modeValue}>{getPlannerModeLabel()}</Text>
        </View>

        {!canGenerateAIPlan ? (
          <View style={styles.limitBox}>
            <Text style={styles.limitTitle}>Free plan used</Text>
            <Text style={styles.limitCopy}>
              You have generated {aiPlansGenerated} mock AI plan. Enable Premium
              in Settings to keep generating plans during demos.
            </Text>
          </View>
        ) : null}

        <FormField
          keyboardType="numeric"
          label="Garden size"
          onChangeText={setGardenSize}
          placeholder="4"
          value={gardenSize}
        />

        <View style={styles.group}>
          <Text style={styles.label}>Sunlight</Text>
          <SegmentedControl
            onSelect={setSunlight}
            options={sunlightLevels}
            selected={sunlight}
          />
        </View>

        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="e.g. Bristol, UK"
          value={location}
        />

        <FormField
          label="Preferred crops"
          multiline
          onChangeText={setPreferredCrops}
          placeholder="Basil, tomatoes, lettuce"
          value={preferredCrops}
        />

        <FormField
          keyboardType="numeric"
          label="Budget"
          onChangeText={setBudget}
          placeholder="30"
          value={budget}
        />

        <PrimaryButton
          disabled={!canGenerate}
          icon="sparkles-outline"
          loading={isLoading}
          onPress={handleGeneratePlan}
          title={canGenerateAIPlan ? 'Generate Plan' : 'Premium required'}
        />
      </Card>

      {plan ? (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Mock AI plan</Text>
          <PlanBlock title="Recommended crops" items={plan.recommendedCrops} />
          <PlanBlock title="Planting schedule" items={plan.plantingSchedule} />
          <PlanBlock title="Watering schedule" items={plan.wateringSchedule} />

          <View style={styles.metrics}>
            <Metric label="Harvest time" value={plan.estimatedHarvestTime} />
            <Metric label="Estimated yield" value={plan.estimatedYield} />
            <Metric
              label="Estimated value"
              value={`\u00A3${plan.estimatedValueGbp}`}
            />
          </View>

          <Text style={styles.note}>{plan.notes}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function PlanBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bullet}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 16,
  },
  premiumRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  limit: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  limitBox: {
    backgroundColor: '#FFF6DE',
    borderColor: '#F4D89A',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 12,
  },
  limitTitle: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  limitCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  modeBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    gap: 4,
    padding: 12,
  },
  modeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  modeValue: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },
  group: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    gap: 18,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  block: {
    gap: 7,
  },
  blockTitle: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  bullet: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  metrics: {
    gap: 10,
  },
  metric: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    padding: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  note: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
