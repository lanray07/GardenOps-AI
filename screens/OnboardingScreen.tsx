import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '../components/BrandMark';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SegmentedControl } from '../components/SegmentedControl';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { sampleGardenProfile } from '../data/sampleGarden';
import { colors } from '../theme/colors';
import { GardenGoal, GardenType, SunlightLevel } from '../types';

const gardenTypes: GardenType[] = ['Balcony', 'Backyard', 'Allotment'];
const sunlightLevels: SunlightLevel[] = ['Low', 'Medium', 'Full Sun'];
const goals: GardenGoal[] = [
  'Save Money',
  'Grow Food',
  'Make Extra Income',
  'Learn Gardening',
];

export function OnboardingScreen() {
  const { setProfile } = useGarden();
  const [location, setLocation] = useState('');
  const [gardenType, setGardenType] = useState<GardenType>('Balcony');
  const [gardenSize, setGardenSize] = useState('4');
  const [sunlight, setSunlight] = useState<SunlightLevel>('Medium');
  const [goal, setGoal] = useState<GardenGoal>('Grow Food');

  const sizeNumber = Number(gardenSize);
  const hasLocation = location.trim().length > 1;
  const hasValidSize = Number.isFinite(sizeNumber) && sizeNumber > 0;
  const canContinue = hasLocation && hasValidSize;

  function fillDemoGarden() {
    setLocation(sampleGardenProfile.location);
    setGardenType(sampleGardenProfile.gardenType);
    setGardenSize(String(sampleGardenProfile.sizeSquareMetres));
    setSunlight(sampleGardenProfile.sunlight);
    setGoal(sampleGardenProfile.goal);
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <BrandMark size="large" showTagline />
        <SectionTitle
          title="Plan a garden that pays you back."
          subtitle="Tell us the basics and we will set up a starter plan, tasks, and profit estimates."
        />
      </View>

      <Card style={styles.formCard}>
        <PrimaryButton
          icon="flash-outline"
          onPress={fillDemoGarden}
          title="Use demo garden"
          variant="secondary"
        />

        <FormField
          label="Location"
          onChangeText={setLocation}
          placeholder="e.g. Bristol, UK"
          value={location}
        />

        <View style={styles.group}>
          <Text style={styles.label}>Garden type</Text>
          <SegmentedControl
            onSelect={setGardenType}
            options={gardenTypes}
            selected={gardenType}
          />
        </View>

        <FormField
          keyboardType="numeric"
          label="Garden size in square metres"
          onChangeText={setGardenSize}
          placeholder="4"
          value={gardenSize}
        />
        {!hasValidSize ? (
          <Text style={styles.validationText}>
            Enter a garden size greater than 0.
          </Text>
        ) : null}

        <View style={styles.group}>
          <Text style={styles.label}>Sunlight level</Text>
          <SegmentedControl
            onSelect={setSunlight}
            options={sunlightLevels}
            selected={sunlight}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Goal</Text>
          <SegmentedControl onSelect={setGoal} options={goals} selected={goal} />
        </View>

        <PrimaryButton
          disabled={!canContinue}
          icon="arrow-forward-outline"
          onPress={() =>
            setProfile({
              location: location.trim(),
              gardenType,
              sizeSquareMetres: sizeNumber,
              sunlight,
              goal,
            })
          }
          title="Create my garden"
        />
        {!hasLocation ? (
          <Text style={styles.validationText}>
            Add a location or use the demo garden to continue.
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 12,
    paddingTop: 12,
  },
  formCard: {
    gap: 18,
  },
  group: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  validationText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
