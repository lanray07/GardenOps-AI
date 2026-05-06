import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandMark } from './components/BrandMark';
import { GardenProvider, useGarden } from './context/GardenContext';
import { AppTabs } from './navigation/AppTabs';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { colors } from './theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <GardenProvider>
        <NavigationContainer>
          <AppRoot />
        </NavigationContainer>
        <StatusBar style="dark" />
      </GardenProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { isHydrated, profile } = useGarden();

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <BrandMark size="large" showTagline />
        <Text style={styles.loadingText}>Loading your garden...</Text>
      </View>
    );
  }

  if (!profile) {
    return <OnboardingScreen />;
  }

  return <AppTabs />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 8,
  },
});
