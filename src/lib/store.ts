import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

interface ErrorState {
    error: string | null;
    setError: (error: string | null) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
}));

export const useErrorStore = create<ErrorState>((set) => ({
    error: null,
    setError: (error) => set({ error }),
}));