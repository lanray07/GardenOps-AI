import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PremiumPaywall } from '../components/PremiumPaywall';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { useGarden } from '../context/GardenContext';
import {
  getWeatherBasedTasks,
  getWeatherTaskModeLabel,
} from '../services/weather';
import { colors } from '../theme/colors';
import { Priority } from '../types';

const priorityColor: Record<Priority, string> = {
  High: colors.amber,
  Medium: colors.blue,
  Low: colors.primary,
};

export function TasksScreen() {
  const { addTasks, completeTask, isPremium, profile, tasks } = useGarden();
  const [isGeneratingWeatherTasks, setIsGeneratingWeatherTasks] = useState(false);
  const [weatherTaskMessage, setWeatherTaskMessage] = useState<string | null>(
    null,
  );

  async function handleGenerateWeatherTasks() {
    if (!profile) {
      return;
    }

    setIsGeneratingWeatherTasks(true);
    setWeatherTaskMessage(null);

    try {
      const generatedTasks = await getWeatherBasedTasks({
        existingTasks: tasks,
        profile,
      });

      addTasks(generatedTasks);
      setWeatherTaskMessage(`Added ${generatedTasks.length} smart tasks.`);
    } catch {
      setWeatherTaskMessage('Could not generate smart tasks. Please try again.');
    } finally {
      setIsGeneratingWeatherTasks(false);
    }
  }

  return (
    <Screen>
      <SectionTitle
        title="Garden Tasks"
        subtitle="A starter task list for keeping your garden moving each week."
      />

      {isPremium ? (
        <Card style={styles.weatherCard}>
          <View style={styles.modeBox}>
            <Text style={styles.modeLabel}>Task mode</Text>
            <Text style={styles.modeValue}>{getWeatherTaskModeLabel()}</Text>
          </View>
          <Text style={styles.weatherText}>
            Generate watering, wind, and plant protection tasks from your garden
            profile. A real weather endpoint can replace the mock task engine.
          </Text>
          <PrimaryButton
            disabled={!profile}
            icon="partly-sunny-outline"
            loading={isGeneratingWeatherTasks}
            onPress={handleGenerateWeatherTasks}
            title={profile ? 'Generate Smart Tasks' : 'Complete onboarding first'}
            variant="secondary"
          />
          {weatherTaskMessage ? (
            <Text
              style={[
                styles.weatherMessage,
                weatherTaskMessage.includes('Could not') && styles.weatherError,
              ]}
            >
              {weatherTaskMessage}
            </Text>
          ) : null}
        </Card>
      ) : (
        <PremiumPaywall
          compact
          title="Unlock smart weather tasks"
          text="Premium adds mock weather-aware garden jobs now, with a real Weather API integration ready for the next backend pass."
        />
      )}

      {tasks.map((task) => (
        <Card key={task.id} style={styles.taskCard}>
          <View style={styles.taskTop}>
            <View style={styles.checkCircle}>
              <Ionicons
                name={task.completed ? 'checkmark' : 'leaf-outline'}
                color={task.completed ? colors.surface : colors.primary}
                size={18}
              />
            </View>
            <View style={styles.flex}>
              <Text
                style={[styles.taskTitle, task.completed && styles.completedText]}
              >
                {task.title}
              </Text>
              <Text style={styles.meta}>{task.dueDate}</Text>
            </View>
            <View
              style={[
                styles.priorityPill,
                { borderColor: priorityColor[task.priority] },
              ]}
            >
              <Text style={[styles.priority, { color: priorityColor[task.priority] }]}>
                {task.priority}
              </Text>
            </View>
          </View>

          <PrimaryButton
            disabled={task.completed}
            icon={task.completed ? 'checkmark-outline' : 'checkmark-circle-outline'}
            onPress={() => completeTask(task.id)}
            title={task.completed ? 'Complete' : 'Complete task'}
            variant="secondary"
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  weatherCard: {
    gap: 10,
  },
  weatherText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
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
  weatherMessage: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  weatherError: {
    color: colors.danger,
  },
  taskCard: {
    gap: 14,
  },
  taskTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  flex: {
    flex: 1,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  completedText: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  priorityPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priority: {
    fontSize: 12,
    fontWeight: '800',
  },
});
