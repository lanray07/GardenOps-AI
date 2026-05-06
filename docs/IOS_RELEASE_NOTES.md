# iOS Release Notes

GardenOps AI is configured as an Expo-managed React Native app with an iOS bundle identifier of `com.gardenopsai.app`.

## Local Checks

```bash
npm.cmd run typecheck
npx.cmd expo export --platform ios --output-dir dist-check
```

## EAS Build

Install and log in to EAS before building:

```bash
npm.cmd install --global eas-cli
eas login
eas build:configure
```

Simulator preview build:

```bash
eas build --platform ios --profile preview
```

Production build:

```bash
eas build --platform ios --profile production
```

## Before App Store Submission

- Replace demo app icons and splash assets.
- Connect real Firebase Auth sign-in and production Firestore rules.
- Replace local Premium Demo toggle with Apple In-App Purchases.
- Verify all `EXPO_PUBLIC_*_ENDPOINT` values point to production backends.
- Add privacy policy copy for photo scanning, garden profile storage, and analytics if introduced.
- Confirm Plant Scanner image handling complies with the selected Plant ID provider terms.
