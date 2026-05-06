import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockTasks } from '../data/tasks';
import { FREE_PLAN_LIMIT } from '../monetisation';
import {
  canUseFirebaseAuth,
  listenToAuthState,
  signInWithFirebaseDemoAccount,
  signOutFirebaseAccount,
} from '../services/authService';
import {
  canUseFirebaseSync,
  clearGardenStateFromDevice,
  defaultGardenState,
  loadGardenStateFromCloud,
  loadGardenStateFromDevice,
  saveGardenStateToCloud,
  saveGardenStateToDevice,
} from '../services/gardenStorage';
import {
  AIPlannerResult,
  AuthStatus,
  AuthUserSummary,
  GardenProfile,
  GardenTask,
  PersistedGardenState,
  SubscriptionStatus,
  SyncStatus,
} from '../types';

interface GardenContextValue {
  profile: GardenProfile | null;
  tasks: GardenTask[];
  latestPlan: AIPlannerResult | null;
  subscriptionStatus: SubscriptionStatus;
  aiPlansGenerated: number;
  remainingFreePlans: number;
  isPremium: boolean;
  canGenerateAIPlan: boolean;
  isHydrated: boolean;
  syncStatus: SyncStatus;
  authStatus: AuthStatus;
  authUser: AuthUserSummary | null;
  setProfile: (profile: GardenProfile) => void;
  saveGeneratedPlan: (plan: AIPlannerResult) => void;
  completeTask: (taskId: string) => void;
  addTasks: (newTasks: GardenTask[]) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  signInDemoAccount: () => Promise<void>;
  signOutAccount: () => Promise<void>;
  resetGarden: () => Promise<void>;
}

const GardenContext = createContext<GardenContextValue | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GardenProfile | null>(null);
  const [tasks, setTasks] = useState<GardenTask[]>(mockTasks);
  const [latestPlan, setLatestPlan] = useState<AIPlannerResult | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>('Free');
  const [aiPlansGenerated, setAiPlansGenerated] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local-only');
  const [authUser, setAuthUser] = useState<AuthUserSummary | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    canUseFirebaseAuth() ? 'signed-out' : 'local-demo',
  );

  const applyState = useCallback((state: PersistedGardenState) => {
    setProfile(state.profile);
    setTasks(state.tasks.length ? state.tasks : mockTasks);
    setLatestPlan(state.latestPlan);
    setSubscriptionStatus(state.subscriptionStatus ?? 'Free');
    setAiPlansGenerated(state.aiPlansGenerated ?? 0);
  }, []);

  useEffect(() => {
    if (!canUseFirebaseAuth()) {
      setAuthStatus('local-demo');
      setAuthUser(null);
      return undefined;
    }

    return listenToAuthState(
      (user) => {
        setAuthUser(user);
        setAuthStatus(user ? 'signed-in' : 'signed-out');
      },
      () => {
        setAuthUser(null);
        setAuthStatus('auth-error');
      },
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function hydrateGardenState() {
      const localState = await loadGardenStateFromDevice();
      const initialState = localState ?? defaultGardenState;

      if (!isMounted) {
        return;
      }

      applyState(initialState);
      setIsHydrated(true);

      if (!canUseFirebaseSync()) {
        setSyncStatus('local-only');
        return;
      }

      setSyncStatus('syncing');
      const cloudState = await loadGardenStateFromCloud();

      if (!isMounted) {
        return;
      }

      if (cloudState) {
        applyState(cloudState);
        await saveGardenStateToDevice(cloudState);
      } else {
        await saveGardenStateToCloud(initialState);
      }

      if (isMounted) {
        setSyncStatus('synced');
      }
    }

    hydrateGardenState().catch(() => {
      if (isMounted) {
        setIsHydrated(true);
        setSyncStatus('error');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [applyState, authUser]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    async function persistGardenState() {
      const state = {
        profile,
        tasks,
        latestPlan,
        subscriptionStatus,
        aiPlansGenerated,
      };

      await saveGardenStateToDevice(state);

      if (!canUseFirebaseSync()) {
        if (isMounted) {
          setSyncStatus('local-only');
        }
        return;
      }

      if (isMounted) {
        setSyncStatus('syncing');
      }

      const synced = await saveGardenStateToCloud(state);

      if (isMounted) {
        setSyncStatus(synced ? 'synced' : 'error');
      }
    }

    persistGardenState().catch(() => {
      if (isMounted) {
        setSyncStatus('error');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    aiPlansGenerated,
    isHydrated,
    latestPlan,
    profile,
    subscriptionStatus,
    tasks,
  ]);

  const resetGarden = useCallback(async () => {
    await clearGardenStateFromDevice();
    applyState(defaultGardenState);
  }, [applyState]);

  const signInDemoAccount = useCallback(async () => {
    setAuthStatus('signed-out');
    const user = await signInWithFirebaseDemoAccount();
    setAuthUser(user);
    setAuthStatus('signed-in');
  }, []);

  const signOutAccount = useCallback(async () => {
    await signOutFirebaseAccount();
    setAuthUser(null);
    setAuthStatus(canUseFirebaseAuth() ? 'signed-out' : 'local-demo');
    setSyncStatus('local-only');
  }, []);

  const isPremium = subscriptionStatus === 'Premium';
  const remainingFreePlans = Math.max(FREE_PLAN_LIMIT - aiPlansGenerated, 0);
  const canGenerateAIPlan = isPremium || remainingFreePlans > 0;

  const value = useMemo(
    () => ({
      profile,
      tasks,
      latestPlan,
      subscriptionStatus,
      aiPlansGenerated,
      remainingFreePlans,
      isPremium,
      canGenerateAIPlan,
      isHydrated,
      syncStatus,
      authStatus,
      authUser,
      setProfile,
      saveGeneratedPlan: (plan: AIPlannerResult) => {
        setLatestPlan(plan);
        setAiPlansGenerated((currentCount) => currentCount + 1);
      },
      completeTask: (taskId: string) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task,
          ),
        );
      },
      addTasks: (newTasks: GardenTask[]) => {
        setTasks((currentTasks) => {
          const taskMap = new Map(
            currentTasks.map((task) => [task.id, task] as const),
          );

          newTasks.forEach((task) => {
            taskMap.set(task.id, task);
          });

          return Array.from(taskMap.values());
        });
      },
      setSubscriptionStatus,
      signInDemoAccount,
      signOutAccount,
      resetGarden,
    }),
    [
      aiPlansGenerated,
      authStatus,
      authUser,
      canGenerateAIPlan,
      isHydrated,
      isPremium,
      latestPlan,
      profile,
      remainingFreePlans,
      resetGarden,
      signInDemoAccount,
      signOutAccount,
      subscriptionStatus,
      syncStatus,
      tasks,
    ],
  );

  return (
    <GardenContext.Provider value={value}>{children}</GardenContext.Provider>
  );
}

export function useGarden() {
  const context = useContext(GardenContext);

  if (!context) {
    throw new Error('useGarden must be used inside GardenProvider');
  }

  return context;
}
