import { create } from "zustand";

type NavState = {
    isFirstLoad: boolean;
    isTransitioning: boolean;
    loadingCount: number;
    startTransition: () => void;
    endTransition: () => void;
    registerLoading: () => void;
    unregisterLoading: () => void;
};

export const useNavigationState = create<NavState>((set) => ({
    isFirstLoad: true,
    isTransitioning: false,
    loadingCount: 0,
    registerLoading: () => set((state) => ({ loadingCount: state.loadingCount + 1 })),
    unregisterLoading: () => set((state) => ({ loadingCount: Math.max(0, state.loadingCount - 1) })),
    startTransition: () =>
        set({ isTransitioning: true, loadingCount: 0 }),
    endTransition: () =>
        set({ isTransitioning: false, isFirstLoad: false }),
}));