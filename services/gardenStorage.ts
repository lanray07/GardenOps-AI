import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { mockTasks } from '../data/tasks';
import { PersistedGardenState } from '../types';
import { firebaseAuth, firestore } from './firebase';

const LOCAL_STATE_KEY = '@gardenops-ai/garden-state/v1';
const REMOTE_COLLECTION = 'gardenStates';

export const defaultGardenState: PersistedGardenState = {
  profile: null,
  tasks: mockTasks,
  latestPlan: null,
  subscriptionStatus: 'Free',
  aiPlansGenerated: 0,
};

export function canUseFirebaseSync() {
  return Boolean(firebaseAuth?.currentUser && firestore);
}

export async function loadGardenStateFromDevice() {
  const rawState = await AsyncStorage.getItem(LOCAL_STATE_KEY);

  if (!rawState) {
    return null;
  }

  return {
    ...defaultGardenState,
    ...JSON.parse(rawState),
  } as PersistedGardenState;
}

export async function saveGardenStateToDevice(state: PersistedGardenState) {
  await AsyncStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}

export async function clearGardenStateFromDevice() {
  await AsyncStorage.removeItem(LOCAL_STATE_KEY);
}

async function getGardenUserId() {
  if (!firebaseAuth) {
    return null;
  }

  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser.uid;
  }

  return null;
}

export async function loadGardenStateFromCloud() {
  if (!firestore) {
    return null;
  }

  const userId = await getGardenUserId();

  if (!userId) {
    return null;
  }

  // TODO: Model user-owned Firestore rules before shipping real customer data.
  const snapshot = await getDoc(doc(firestore, REMOTE_COLLECTION, userId));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    profile: data.profile ?? null,
    tasks: data.tasks?.length ? data.tasks : mockTasks,
    latestPlan: data.latestPlan ?? null,
    subscriptionStatus: data.subscriptionStatus ?? 'Free',
    aiPlansGenerated: data.aiPlansGenerated ?? 0,
  } as PersistedGardenState;
}

export async function saveGardenStateToCloud(state: PersistedGardenState) {
  if (!firestore) {
    return false;
  }

  const userId = await getGardenUserId();

  if (!userId) {
    return false;
  }

  // TODO: Move richer sync conflict handling into a backend once accounts exist.
  await setDoc(
    doc(firestore, REMOTE_COLLECTION, userId),
    {
      ...state,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return true;
}
