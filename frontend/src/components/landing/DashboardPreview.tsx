import { motion } from 'framer-motion'
import ReactECharts from 'echarts-for-react'

const fakeItems = [
  { rank: 1, title: 'AI-Powered Fraud Detection', score: 9.2, color: 'var(--score-high)' },
  { rank: 2, title: 'Customer Churn Prediction', score: 8.7, color: 'var(--score-high)' },
  { rank: 3, title: 'Document Processing Automation', score: 8.4, color: 'var(--score-high)' },
  { rank: 4, title: 'Predictive Maintenance Engine', score: 7.9, color: 'var(--score-mid)' },
  { rank: 5, title: 'AI Chatbot for Support', score: 7.5, color: 'var(--score-mid)' },
]

const radarOption = {
  radar: {
    indicator: [
      { name: 'ROI', max: 10 },
      { name: 'Tech', max: 10 },
      { name: 'Market', max: 10 },
      { name: 'Risk', max: 10 },
      { name: 'Quick Win', max: 10 },
    ],
    shape: 'circle',
    splitNumber: 4,
    axisName: { color: '#6b7280', fontSize: 11, fontWeight: 600 },
    splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed', width: 0.8 } },
    splitArea: { areaStyle: { color: ['rgba(90,141,232,0.02)', 'transparent'] } },
    axisLine: { lineStyle: { color: '#e5e7eb' } },
  },
  series: [{
    type: 'radar',
    symbol: 'circle',
    symbolSize: 8,
    data: [{
      value: [8.5, 6.0, 7.2, 4.5, 7.8],
      lineStyle: { color: '#5a8de8', width: 2.5 },
      areaStyle: {
        color: {
          type: 'radial', x: 0.5, y: 0.5, r: 0.5,
          colorStops: [
            { offset: 0, color: 'rgba(90,141,232,0.25)' },
            { offset: 1, color: 'rgba(90,141,232,0.05)' },
          ],
        },
      },
      itemStyle: { color: '#fff', borderColor: '#5a8de8', borderWidth: 2.5 },
    }],
    animationDuration: 1500,
  }],
}

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        borderRadius: 16,
        border: '1px solid var(--border-light)',
        background: 'var(--bg-white)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        transform: 'perspective(1200px) rotateX(3deg)',
      }}
    >
      {/* Fake browser bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        background: 'var(--bg-soft)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{
          flex: 1, marginLeft: 12, padding: '4px 16px',
          borderRadius: 6, background: 'var(--bg-white)',
          fontSize: 12, color: 'var(--text-dim)',
          border: '1px solid var(--border-light)',
        }}>
          ai-radar.dxc.com/radar
        </div>
      </div>

      {/* Dashboard content */}
      <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', minHeight: 340 }}>
        {/* Left — Mini ECharts radar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <ReactECharts
            option={radarOption}
            style={{ width: 300, height: 300 }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Right — Fake top 5 list */}
        <div style={{
          padding: '28px 28px 28px 0',
          display: 'flex', flexDirection: 'column', gap: 10,
          borderLeft: '1px solid var(--border-light)',
          paddingLeft: 28,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            Top 5 AI Opportunities
          </div>
          {fakeItems.map(item => (
            <div key={item.rank} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: item.rank === 1 ? 'var(--dxc-blue-light)' : 'var(--bg-soft)',
              border: item.rank === 1 ? '1px solid var(--dxc-blue-medium)' : '1px solid transparent',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
                color: item.rank === 1 ? '#b8860b' : item.rank <= 3 ? 'var(--text-secondary)' : 'var(--text-dim)',
                minWidth: 28,
              }}>
                #{String(item.rank).padStart(2, '0')}
              </span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500,
                color: 'var(--text-body)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.title}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                color: item.score >= 8 ? 'var(--score-high)' : 'var(--score-mid)',
                background: item.score >= 8 ? 'var(--score-high-light)' : 'var(--score-mid-light)',
                padding: '2px 8px', borderRadius: 6,
              }}>
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
