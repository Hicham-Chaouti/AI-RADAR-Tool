import { useMemo, useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import type { UseCaseScored } from '../../types/useCase'

interface Props {
  data: UseCaseScored | null
  isLoading: boolean
}

export default function RadarChart({ data, isLoading }: Props) {
  const [showScan, setShowScan] = useState(true)
  const [showRadar, setShowRadar] = useState(false)

  useEffect(() => {
    if (!isLoading && data) {
      const scanTimer = setTimeout(() => setShowScan(false), 2500)
      const radarTimer = setTimeout(() => setShowRadar(true), 2000)
      return () => { clearTimeout(scanTimer); clearTimeout(radarTimer) }
    }
  }, [isLoading, data])

  const option = useMemo(() => {
    const axes = data?.radar_axes
    const values = axes ? [
      axes.roi_potential,
      axes.technical_complexity,
      axes.market_maturity,
      axes.regulatory_risk,
      axes.quick_win_potential,
    ] : [0, 0, 0, 0, 0]

    return {
      radar: {
        indicator: [
          { name: 'ROI Potential', max: 10 },
          { name: 'Tech Complexity', max: 10 },
          { name: 'Market Maturity', max: 10 },
          { name: 'Regulatory Risk', max: 10 },
          { name: 'Quick Win', max: 10 },
        ],
        shape: 'circle',
        splitNumber: 5,
        axisName: {
          color: '#6b7280',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb', type: 'dashed', width: 0.8 },
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(90,141,232,0.02)', 'transparent', 'rgba(90,141,232,0.02)', 'transparent', 'rgba(90,141,232,0.01)'],
          },
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' },
        },
      },
      series: [{
        type: 'radar',
        symbol: 'circle',
        symbolSize: 10,
        data: [{
          value: values,
          name: data?.title || 'Score',
        }],
        lineStyle: { width: 2.5, color: '#5a8de8' },
        areaStyle: {
          color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(90,141,232,0.25)' },
              { offset: 1, color: 'rgba(90,141,232,0.05)' },
            ],
          },
        },
        itemStyle: {
          color: '#ffffff',
          borderColor: '#5a8de8',
          borderWidth: 2.5,
          shadowColor: 'rgba(90,141,232,0.3)',
          shadowBlur: 8,
        },
        animationDuration: 1500,
        animationEasing: 'elasticOut',
      }],
    }
  }, [data])

  if (isLoading) {
    return (
      <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: 200, height: 200, borderRadius: '50%',
          border: '2px dashed var(--border-light)', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(90,141,232,0.15) 350deg, rgba(90,141,232,0.25) 358deg, transparent 360deg)',
            animation: 'radarScan 2s linear infinite',
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scan overlay */}
      {showScan && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2, transition: 'opacity 0.5s', opacity: showRadar ? 0 : 1, pointerEvents: 'none',
        }}>
          <div style={{
            width: 300, height: 300, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(90,141,232,0.15) 350deg, rgba(90,141,232,0.25) 358deg, transparent 360deg)',
            animation: 'radarScan 2s linear 2',
          }} />
        </div>
      )}
      <div style={{ opacity: showRadar ? 1 : 0, transition: 'opacity 0.5s' }}>
        <ReactECharts
          option={option}
          style={{ width: '100%', height: 420 }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  )
}
