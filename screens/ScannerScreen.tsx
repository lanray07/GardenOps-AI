import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import {
  getPlantScannerModeLabel,
  scanPlantImage,
} from '../services/plantScanner';
import { colors } from '../theme/colors';
import { PlantScanResult } from '../types';

export function ScannerScreen() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantScanResult | null>(null);

  async function handleChooseImage() {
    setPermissionMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPermissionMessage(
        'Photo access is needed to choose a plant image for scanning.',
      );
      return;
    }

    // TODO: Upload this image URI to a Plant ID API once scanner integration is live.
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!pickerResult.canceled) {
      setSelectedImageUri(pickerResult.assets[0]?.uri ?? null);
      setResult(null);
      setScanMessage(null);
    }
  }

  async function handleAnalyzeImage() {
    if (!selectedImageUri) {
      setScanMessage('Choose a plant image before scanning.');
      return;
    }

    setIsScanning(true);
    setScanMessage(null);

    try {
      const scanResult = await scanPlantImage(selectedImageUri);
      setResult(scanResult);
      setScanMessage('Scan complete.');
    } catch {
      setScanMessage('Plant scan failed. Please try another image.');
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <Screen>
      <SectionTitle
        title="Plant Scanner"
        subtitle="Choose a plant photo and preview the care result format."
      />

      <Card style={styles.uploadCard}>
        <View style={styles.modeBox}>
          <Text style={styles.modeLabel}>Scanner mode</Text>
          <Text style={styles.modeValue}>{getPlantScannerModeLabel()}</Text>
        </View>
        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadBox}>
            <Ionicons name="image-outline" color={colors.primary} size={34} />
            <Text style={styles.uploadTitle}>Choose a plant image</Text>
            <Text style={styles.uploadText}>
              The MVP previews your selected image and returns a mock scan result.
            </Text>
          </View>
        )}
        {permissionMessage ? (
          <Text style={styles.permissionText}>{permissionMessage}</Text>
        ) : null}
        <PrimaryButton
          icon="cloud-upload-outline"
          onPress={handleChooseImage}
          title={selectedImageUri ? 'Choose Another Image' : 'Choose Image'}
          variant="secondary"
        />
        <PrimaryButton
          disabled={!selectedImageUri}
          icon="scan-outline"
          loading={isScanning}
          onPress={handleAnalyzeImage}
          title="Analyze Plant"
        />
        {scanMessage ? (
          <Text
            style={[
              styles.scanMessage,
              scanMessage.includes('failed') && styles.scanError,
            ]}
          >
            {scanMessage}
          </Text>
        ) : null}
      </Card>

      {result ? (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>Plant scan result</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.plantName}>{result.plantName}</Text>
            <Text style={styles.score}>
              {Math.round(result.confidenceScore * 100)}% confidence
            </Text>
          </View>
          <View style={styles.instructions}>
            {result.careInstructions.map((instruction) => (
              <Text key={instruction} style={styles.instruction}>
                - {instruction}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadCard: {
    gap: 14,
  },
  uploadBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 24,
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
  previewImage: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    width: '100%',
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  uploadText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  permissionText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  scanMessage: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  scanError: {
    color: colors.danger,
  },
  resultCard: {
    gap: 14,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  plantName: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  score: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '800',
  },
  instructions: {
    gap: 8,
  },
  instruction: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
