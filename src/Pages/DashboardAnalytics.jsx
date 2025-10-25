import React, { useMemo, useState } from 'react'

// Lightweight analytics page with mock data and simple SVG charts
const SAMPLE_METRICS = {
  totalBooks: 1240,
  activeLoans: 42,
  avgReadingDays: 12,
  downloadsLast30: 842,
  categories: [
    { name: 'Science', count: 420 },
    { name: 'Mathematics', count: 210 },
    { name: 'Arts', count: 180 },
    { name: 'Technology', count: 150 },
    { name: 'Languages', count: 120 }
  ]
}

const RECENT_ACTIVITY = [
  { id: 1, user: 'Alice M.', action: 'Borrowed', book: 'Advanced Physics', time: '2 hours ago' },
  { id: 2, user: 'Ben K.', action: 'Returned', book: 'Calculus I', time: '1 day ago' },
  { id: 3, user: 'Clara N.', action: 'Added to reading list', book: 'World History', time: '2 days ago' },
  { id: 4, user: 'David S.', action: 'Requested extension', book: 'Modern Chemistry', time: '3 days ago' }
]

const Donut = ({ value, max = 100, size = 80, stroke = 10, color = '#4F46E5' }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.round((value / max) * 100))
  const dash = `${(circumference * pct) / 100} ${circumference}`

  return (
    <svg width={size} height={size} className="block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} stroke="#eef2ff" strokeWidth={stroke} fill="none" />
        <circle r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={dash} strokeLinecap="round" transform={`rotate(-90)`} />
        <text x="0" y="4" textAnchor="middle" fontSize="12" className="fill-current text-gray-700">{pct}%</text>
      </g>
    </svg>
  )
}

const BarChart = ({ items = [], width = 300, height = 120, color = '#06B6D4' }) => {
  const max = Math.max(...items.map(i => i.count), 1)
  const barWidth = Math.max(8, Math.floor(width / items.length) - 8)

  return (
    <svg width={width} height={height} className="block">
      {items.map((it, idx) => {
        const barHeight = Math.round((it.count / max) * (height - 20))
        const x = idx * (barWidth + 8) + 10
        const y = height - barHeight - 10
        return (
          <g key={it.name}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={color} />
            <text x={x + barWidth / 2} y={height - 2} fontSize="10" textAnchor="middle" className="fill-current text-gray-600">{it.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

const DashboardAnalytics = () => {
  const [range, setRange] = useState('30')

  const categoryShare = useMemo(() => {
    const total = SAMPLE_METRICS.categories.reduce((s, c) => s + c.count, 0)
    return SAMPLE_METRICS.categories.map(c => ({ ...c, pct: Math.round((c.count / total) * 100) }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of library activity and usage</p>
          </div>

          <div className="flex items-center gap-3">
            <select value={range} onChange={(e) => setRange(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-300 bg-white">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">Export</button>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Books</p>
            <div className="text-2xl font-bold text-gray-900">{SAMPLE_METRICS.totalBooks.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">Catalog size</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Active Loans</p>
            <div className="text-2xl font-bold text-gray-900">{SAMPLE_METRICS.activeLoans}</div>
            <p className="text-xs text-gray-400 mt-1">Currently borrowed</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Read Time</p>
              <div className="text-2xl font-bold text-gray-900">{SAMPLE_METRICS.avgReadingDays} days</div>
              <p className="text-xs text-gray-400 mt-1">Average per book</p>
            </div>
            <div>
              <Donut value={Math.min(100, Math.round((SAMPLE_METRICS.avgReadingDays / 30) * 100))} size={64} stroke={8} color="#10B981" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Downloads (30d)</p>
            <div className="text-2xl font-bold text-gray-900">{SAMPLE_METRICS.downloadsLast30.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">E-book downloads</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Category distribution</h3>
            <div className="flex items-center gap-6">
              <div>
                <BarChart items={SAMPLE_METRICS.categories} width={420} height={160} color="#60A5FA" />
              </div>
              <div className="flex-1">
                <ul className="space-y-2">
                  {categoryShare.map(c => (
                    <li key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: '#60A5FA' }} />
                        <div className="text-sm text-gray-700">{c.name}</div>
                      </div>
                      <div className="text-sm text-gray-500">{c.pct}%</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Snapshot</h3>
            <div className="flex flex-col items-center gap-4">
              <Donut value={Math.round((SAMPLE_METRICS.activeLoans / SAMPLE_METRICS.totalBooks) * 100)} size={120} stroke={12} color="#4F46E5" />
              <div className="text-sm text-gray-500">Active loans vs catalog</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent activity</h3>
          <div className="divide-y divide-gray-100">
            {RECENT_ACTIVITY.map(a => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">{a.user.split(' ')[0].charAt(0)}</div>
                  <div>
                    <div className="text-sm text-gray-800"><span className="font-medium">{a.user}</span> {a.action} <span className="font-semibold">{a.book}</span></div>
                    <div className="text-xs text-gray-400">{a.time}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">View</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAnalytics
