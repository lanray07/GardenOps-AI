import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface PremiumBadgeProps {
  label: string;
}

export function PremiumBadge({ label }: PremiumBadgeProps) {
  return (
    <View style={styles.badge}>
      <Ionicons name="lock-closed-outline" color={colors.primaryDark} size={14} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF6DE',
    borderColor: '#F4D89A',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
