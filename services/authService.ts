import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';

import { AuthUserSummary } from '../types';
import { firebaseAuth, hasFirebaseConfig } from './firebase';

export function canUseFirebaseAuth() {
  return Boolean(hasFirebaseConfig && firebaseAuth);
}

export function listenToAuthState(
  onChange: (user: AuthUserSummary | null) => void,
  onError: () => void,
) {
  if (!firebaseAuth) {
    onChange(null);
    return () => undefined;
  }

  return onAuthStateChanged(
    firebaseAuth,
    (user) => {
      onChange(
        user
          ? {
              uid: user.uid,
              email: user.email,
              isAnonymous: user.isAnonymous,
            }
          : null,
      );
    },
    onError,
  );
}

export async function signInWithFirebaseDemoAccount() {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured.');
  }

  const credential = await signInAnonymously(firebaseAuth);

  return {
    uid: credential.user.uid,
    email: credential.user.email,
    isAnonymous: credential.user.isAnonymous,
  } satisfies AuthUserSummary;
}

export async function signOutFirebaseAccount() {
  if (!firebaseAuth) {
    return;
  }

  await signOut(firebaseAuth);
}
