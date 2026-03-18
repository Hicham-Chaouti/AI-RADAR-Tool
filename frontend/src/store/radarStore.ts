import { create } from 'zustand'

interface RadarState {
    selectedNodeId: string | null
    hoveredNodeId: string | null
    cameraMode: 'control' | 'top' | 'orbit'
    filterSector: string | null
    detailPanelOpen: boolean
    setSelectedNode: (id: string | null) => void
    setHoveredNode: (id: string | null) => void
    setCameraMode: (mode: 'control' | 'top' | 'orbit') => void
    setFilterSector: (sector: string | null) => void
    setDetailPanelOpen: (open: boolean) => void
}

export const useRadarStore = create<RadarState>((set) => ({
    selectedNodeId: null,
    hoveredNodeId: null,
    cameraMode: 'control',
    filterSector: null,
    detailPanelOpen: false,
    setSelectedNode: (id) => set({ selectedNodeId: id, detailPanelOpen: id !== null }),
    setHoveredNode: (id) => set({ hoveredNodeId: id }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
    setFilterSector: (sector) => set({ filterSector: sector }),
    setDetailPanelOpen: (open) => set({ detailPanelOpen: open, selectedNodeId: open ? undefined : null }),
}))
