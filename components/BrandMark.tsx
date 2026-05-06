import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

const iconSource = require('../assets/icon.png');

interface BrandMarkProps {
  size?: 'small' | 'large';
  showTagline?: boolean;
}

export function BrandMark({ size = 'small', showTagline = false }: BrandMarkProps) {
  const large = size === 'large';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Image
          accessibilityIgnoresInvertColors
          source={iconSource}
          style={[styles.icon, large && styles.largeIcon]}
        />
        <View style={styles.copy}>
          <Text style={[styles.name, large && styles.largeName]}>
            GardenOps AI
          </Text>
          {showTagline ? (
            <Text style={[styles.tagline, large && styles.largeTagline]}>
              Plan. Grow. Profit.
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    borderRadius: 8,
    height: 42,
    width: 42,
  },
  largeIcon: {
    borderRadius: 12,
    height: 62,
    width: 62,
  },
  copy: {
    gap: 2,
  },
  name: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  largeName: {
    fontSize: 24,
  },
  tagline: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  largeTagline: {
    fontSize: 14,
  },
});
