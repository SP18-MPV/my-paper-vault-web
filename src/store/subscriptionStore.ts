import { create } from "zustand";
import type {
  MySubscription,
  MyStorage,
  SubscriptionData,
} from "@/api/endpoints/subscriptions";

// Pure helper — used inside selectors to avoid calling get() recursively
const statusIsActive = (sub: MySubscription | null): sub is MySubscription =>
  sub?.status === "ACTIVE";

interface SubscriptionState {
  subscription: MySubscription | null;
  storage: MyStorage | null;
  // The free plan is one-time: once used, it can't be chosen again.
  freePlanUsed: boolean;
  isLoaded: boolean;

  // Actions
  setData: (data: SubscriptionData) => void;
  markLoaded: () => void;
  clear: () => void;

  // Derived selectors — call these anywhere, even outside React
  isActive: () => boolean;
  isWriteBlocked: () => boolean;
  canUpload: () => boolean;
  isUploadRestricted: () => boolean;
  canManageFamily: () => boolean;
  canAddFamilyMember: (currentCount: number) => boolean;
  canAddDirectoryMember: (currentCount: number) => boolean;
  canGrantUploadAccess: (currentCount: number) => boolean;
  canGrantDownloadAccess: (currentCount: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  storage: null,
  freePlanUsed: false,
  isLoaded: false,

  setData: ({ subscription, storage, free_plan_used }) =>
    set({ subscription, storage, freePlanUsed: free_plan_used, isLoaded: true }),

  markLoaded: () => set({ isLoaded: true }),

  clear: () => set({ subscription: null, storage: null, freePlanUsed: false, isLoaded: false }),

  isActive: () => statusIsActive(get().subscription),

  isWriteBlocked: () => {
    const { subscription } = get();
    if (!subscription) return true;
    return (
      subscription.status === "ARCHIVED" || subscription.status === "CANCELLED"
    );
  },

  canUpload: () => {
    const { subscription, storage } = get();
    return statusIsActive(subscription) && storage?.threshold !== "BLOCKED";
  },

  isUploadRestricted: () => {
    const status = get().subscription?.status;
    return status === "GRACE" || status === "RESTRICTED";
  },

  canManageFamily: () => {
    const { subscription } = get();
    return (
      statusIsActive(subscription) &&
      subscription.subscriptionPlan.allow_family_connections
    );
  },

  canAddFamilyMember: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    if (!subscription.subscriptionPlan.allow_family_connections) return false;
    const max = subscription.subscriptionPlan.max_family_connections;
    if (max === null) return false;
    return currentCount < max;
  },

  canAddDirectoryMember: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_directory_members;
    if (max === null) return false;
    return currentCount < max;
  },

  canGrantUploadAccess: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_upload_members;
    if (max === null) return false;
    return currentCount < max;
  },

  canGrantDownloadAccess: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_download_members;
    if (max === null) return false;
    return currentCount < max;
  },
}));
