import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import { mockGardenPlans } from '../data/gardenPlans';
import { colors } from '../theme/colors';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { latestPlan, profile, tasks } = useGarden();
  const starterPlan = mockGardenPlans[0];
  const nextTasks = tasks.filter((task) => !task.completed).slice(0, 3);
  const estimatedValue = latestPlan?.estimatedValueGbp ?? starterPlan.monthlyValueGbp;

  return (
    <Screen>
      <SectionTitle
        title="Dashboard"
        subtitle={`Your ${profile?.gardenType.toLowerCase()} garden in ${profile?.location}.`}
      />

      <Card>
        <View style={styles.planHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" color={colors.primary} size={22} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              {latestPlan ? 'Latest AI Garden Plan' : starterPlan.title}
            </Text>
            <Text style={styles.muted}>
              {latestPlan
                ? latestPlan.recommendedCrops.join(', ')
                : starterPlan.summary}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.sizeSquareMetres}m2</Text>
            <Text style={styles.statLabel}>Space</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.sunlight}</Text>
            <Text style={styles.statLabel}>Sunlight</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{`\u00A3${estimatedValue}`}</Text>
            <Text style={styles.statLabel}>Monthly value</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Next 3 tasks</Text>
          <Text style={styles.previewLabel}>Free MVP preview</Text>
        </View>
        <View style={styles.taskList}>
          {nextTasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <Ionicons
                name="ellipse"
                color={task.priority === 'High' ? colors.amber : colors.primary}
                size={10}
              />
              <View style={styles.flex}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.muted}>
                  {task.dueDate} - {task.priority} priority
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <PrimaryButton
        icon="sparkles-outline"
        onPress={() => navigation.navigate('Planner')}
        title="Generate AI Garden Plan"
      />
      <View style={styles.buttonWithBadge}>
        <PrimaryButton
          icon="stats-chart-outline"
          onPress={() => navigation.navigate('Profit')}
          title="Open Profit Mode"
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  stat: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flex: 1,
    padding: 10,
  },
  statValue: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  sectionHeader: {
    gap: 10,
  },
  previewLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  taskList: {
    gap: 12,
    marginTop: 14,
  },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonWithBadge: {
    gap: 10,
  },
});
