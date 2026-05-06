import { StyleSheet, Text, Pressable, View } from 'react-native';

import { colors } from '../theme/colors';

interface SegmentedControlProps<T extends string> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.option, active && styles.active]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.surface,
  },
});
