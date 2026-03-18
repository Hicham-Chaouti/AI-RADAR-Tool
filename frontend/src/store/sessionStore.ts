import { create } from 'zustand'
import type { SessionRead } from '../types/session'
import type { UseCaseScored } from '../types/useCase'

interface SessionState {
    session: SessionRead | null
    topTen: UseCaseScored[]
    isLoading: boolean
    loadingMessage: string
    error: string | null
    selectedSector: string | null
    setSession: (session: SessionRead) => void
    setTopTen: (results: UseCaseScored[]) => void
    setLoading: (loading: boolean, message?: string) => void
    setError: (error: string | null) => void
    setSelectedSector: (sector: string | null) => void
    reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
    session: null,
    topTen: [],
    isLoading: false,
    loadingMessage: '',
    error: null,
    selectedSector: null,
    setSession: (session) => set({ session, error: null }),
    setTopTen: (results) => set({ topTen: results }),
    setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
    setError: (error) => set({ error, isLoading: false }),
    setSelectedSector: (sector) => set({ selectedSector: sector }),
    reset: () => set({ session: null, topTen: [], isLoading: false, loadingMessage: '', error: null, selectedSector: null }),
}))
