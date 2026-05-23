import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  deepLinkToSubscriptions,
  finishTransaction as finishIapTransaction,
  useIAP,
  type Purchase,
} from 'expo-iap';

import { FREE_PLAN_LIMIT, PREMIUM_MONTHLY_PRODUCT_ID } from '../monetisation';
import { mockTasks } from '../data/tasks';
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
  buildPremiumPlanOptions,
  getProductIdForPlan,
  getPurchaseErrorMessage,
  isPremiumProductId,
  PREMIUM_PLAN_PRODUCT_IDS,
  PremiumPlanKey,
  PremiumPlanOption,
  PurchaseStatus,
} from '../services/iap';
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
  premiumPlans: PremiumPlanOption[];
  purchaseStatus: PurchaseStatus;
  purchaseMessage: string | null;
  isHydrated: boolean;
  syncStatus: SyncStatus;
  authStatus: AuthStatus;
  authUser: AuthUserSummary | null;
  setProfile: (profile: GardenProfile) => void;
  saveGeneratedPlan: (plan: AIPlannerResult) => void;
  completeTask: (taskId: string) => void;
  addTasks: (newTasks: GardenTask[]) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  purchasePremiumPlan: (plan: PremiumPlanKey) => Promise<void>;
  restorePremiumPurchases: () => Promise<void>;
  refreshPurchaseEntitlements: () => Promise<void>;
  openSubscriptionManagement: () => Promise<void>;
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
  const [purchaseStatus, setPurchaseStatus] =
    useState<PurchaseStatus>('loading');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUserSummary | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    canUseFirebaseAuth() ? 'signed-out' : 'local-demo',
  );

  const handlePurchaseSuccess = useCallback(async (purchase: Purchase) => {
    if (!isPremiumProductId(purchase.productId)) {
      return;
    }

    setSubscriptionStatus('Premium');
    setPurchaseStatus('idle');
    setPurchaseMessage('Premium is active. Thanks for supporting GardenOps AI.');

    try {
      // TODO: Verify the App Store transaction on a trusted backend before
      // finishing it in a production subscription release.
      await finishIapTransaction({ purchase, isConsumable: false });
    } catch {
      setPurchaseMessage(
        'Premium is active, but the App Store transaction still needs to finish.',
      );
    }
  }, []);

  const handlePurchaseError = useCallback((error: unknown) => {
    const message = getPurchaseErrorMessage(error);
    const loweredMessage = message.toLowerCase();

    setPurchaseStatus(loweredMessage.includes('cancel') ? 'idle' : 'error');
    setPurchaseMessage(
      loweredMessage.includes('cancel')
        ? 'Purchase cancelled.'
        : message,
    );
  }, []);

  const handleStoreError = useCallback((error: Error) => {
    setPurchaseStatus('error');
    setPurchaseMessage(getPurchaseErrorMessage(error));
  }, []);

  const {
    activeSubscriptions,
    availablePurchases,
    connected,
    fetchProducts,
    getActiveSubscriptions,
    getAvailablePurchases,
    hasActiveSubscriptions,
    reconnect,
    requestPurchase,
    restorePurchases,
    subscriptions,
  } = useIAP({
    onError: handleStoreError,
    onPurchaseError: handlePurchaseError,
    onPurchaseSuccess: handlePurchaseSuccess,
  });

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

  const premiumPlans = useMemo(
    () => buildPremiumPlanOptions(subscriptions),
    [subscriptions],
  );

  const refreshPurchaseEntitlements = useCallback(async () => {
    if (!connected) {
      setPurchaseStatus('unavailable');
      return;
    }

    setPurchaseStatus('loading');
    setPurchaseMessage(null);

    try {
      await fetchProducts({
        skus: PREMIUM_PLAN_PRODUCT_IDS,
        type: 'subs',
      });
      const hasPremium = await hasActiveSubscriptions(PREMIUM_PLAN_PRODUCT_IDS);
      await getActiveSubscriptions(PREMIUM_PLAN_PRODUCT_IDS);
      await getAvailablePurchases({
        onlyIncludeActiveItemsIOS: true,
      });

      setSubscriptionStatus(hasPremium ? 'Premium' : 'Free');
      setPurchaseStatus('idle');
    } catch {
      setPurchaseStatus('error');
      setPurchaseMessage(
        'App Store purchases are temporarily unavailable. Please try again shortly.',
      );
    }
  }, [
    connected,
    fetchProducts,
    getActiveSubscriptions,
    getAvailablePurchases,
    hasActiveSubscriptions,
  ]);

  useEffect(() => {
    refreshPurchaseEntitlements();
  }, [refreshPurchaseEntitlements]);

  useEffect(() => {
    const hasActiveSubscription = activeSubscriptions.some(
      (subscription) =>
        subscription.isActive && isPremiumProductId(subscription.productId),
    );
    const hasAvailablePurchase = availablePurchases.some(
      (purchase) =>
        purchase.purchaseState === 'purchased' &&
        isPremiumProductId(purchase.productId),
    );

    if (hasActiveSubscription || hasAvailablePurchase) {
      setSubscriptionStatus('Premium');
      setPurchaseStatus('idle');
    }
  }, [activeSubscriptions, availablePurchases]);

  const purchasePremiumPlan = useCallback(
    async (plan: PremiumPlanKey) => {
      const productId = getProductIdForPlan(plan);

      setPurchaseStatus('purchasing');
      setPurchaseMessage(null);

      try {
        const isReady = connected || (await reconnect());

        if (!isReady) {
          setPurchaseStatus('unavailable');
          setPurchaseMessage(
            'The App Store purchase sheet is not available yet. Please try again.',
          );
          return;
        }

        await requestPurchase({
          request: {
            apple: {
              sku: productId,
            },
            google: {
              skus: [productId],
            },
          },
          type: 'subs',
        });
        setPurchaseMessage('Confirm the subscription in the App Store sheet.');
      } catch (error) {
        setPurchaseStatus('error');
        setPurchaseMessage(getPurchaseErrorMessage(error));
      }
    },
    [connected, reconnect, requestPurchase],
  );

  const restorePremiumPurchases = useCallback(async () => {
    setPurchaseStatus('restoring');
    setPurchaseMessage(null);

    try {
      const isReady = connected || (await reconnect());

      if (!isReady) {
        setPurchaseStatus('unavailable');
        setPurchaseMessage(
          'The App Store is not available yet. Please try restoring again.',
        );
        return;
      }

      await restorePurchases({
        onlyIncludeActiveItemsIOS: true,
      });
      const hasPremium = await hasActiveSubscriptions(PREMIUM_PLAN_PRODUCT_IDS);
      await getActiveSubscriptions(PREMIUM_PLAN_PRODUCT_IDS);

      setSubscriptionStatus(hasPremium ? 'Premium' : 'Free');
      setPurchaseStatus('idle');
      setPurchaseMessage(
        hasPremium
          ? 'Premium purchase restored.'
          : 'No active GardenOps AI subscription was found for this Apple ID.',
      );
    } catch (error) {
      setPurchaseStatus('error');
      setPurchaseMessage(getPurchaseErrorMessage(error));
    }
  }, [
    connected,
    getActiveSubscriptions,
    hasActiveSubscriptions,
    reconnect,
    restorePurchases,
  ]);

  const openSubscriptionManagement = useCallback(async () => {
    try {
      await deepLinkToSubscriptions({
        packageNameAndroid: 'com.gardenopsai.app',
        skuAndroid: PREMIUM_MONTHLY_PRODUCT_ID,
      });
    } catch (error) {
      setPurchaseStatus('error');
      setPurchaseMessage(getPurchaseErrorMessage(error));
    }
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
      premiumPlans,
      purchaseStatus,
      purchaseMessage,
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
      purchasePremiumPlan,
      restorePremiumPurchases,
      refreshPurchaseEntitlements,
      openSubscriptionManagement,
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
      openSubscriptionManagement,
      profile,
      premiumPlans,
      purchaseMessage,
      purchasePremiumPlan,
      purchaseStatus,
      refreshPurchaseEntitlements,
      remainingFreePlans,
      resetGarden,
      restorePremiumPurchases,
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
