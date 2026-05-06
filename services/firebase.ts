import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuthReactNative from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// TODO: Add real Firebase project keys in .env and enable Auth + Firestore.
export const firebaseApp = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

function createFirebaseAuth(): Auth | null {
  if (!firebaseApp) {
    return null;
  }

  try {
    const getReactNativePersistence = (
      FirebaseAuthReactNative as unknown as {
        getReactNativePersistence?: (
          storage: typeof AsyncStorage,
        ) => NonNullable<Parameters<typeof initializeAuth>[1]>['persistence'];
      }
    ).getReactNativePersistence;

    if (!getReactNativePersistence) {
      return getAuth(firebaseApp);
    }

    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = createFirebaseAuth();
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
