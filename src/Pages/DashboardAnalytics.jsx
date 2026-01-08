import React, { useMemo, useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Download, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react'

// SVG Donut Chart Component
const Donut = ({ value, max = 100, size = 100, stroke = 12, color = '#4F46E5', label = '' }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const dash = `${(circumference * pct) / 100} ${circumference}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block overflow-visible">
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <circle r={radius} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
            <circle 
              r={radius} 
              stroke={color} 
              strokeWidth={stroke} 
              fill="none" 
              strokeDasharray={dash} 
              strokeLinecap="round" 
              transform={`rotate(-90)`}
              className="transition-all duration-1000 ease-out"
            />
            <text x="0" y="5" textAnchor="middle" fontSize="14" className="font-bold fill-gray-900">{pct}%</text>
          </g>
        </svg>
      </div>
      {label && <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">{label}</p>}
    </div>
  )
}

// SVG Bar Chart Component
const BarChart = ({ items = [], width = 400, height = 200, color = '#6366f1' }) => {
  const max = Math.max(...items.map(i => i.count), 1)
  const chartHeight = height - 40
  const barGap = 12
  const totalGaps = (items.length - 1) * barGap
  const barWidth = items.length > 0 ? (width - 40 - totalGaps) / items.length : 0

  return (
    <div className="w-full h-full flex flex-col items-center">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
        {items.map((it, idx) => {
          const barH = Math.max(4, (it.count / max) * chartHeight)
          const x = 20 + idx * (barWidth + barGap)
          const y = height - barH - 25
          return (
            <g key={it.name} className="group cursor-help">
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barH} 
                rx="4" 
                fill={color} 
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <title>{`${it.name}: ${it.count}`}</title>
              </rect>
              <text 
                x={x + barWidth / 2} 
                y={height - 5} 
                fontSize="10" 
                textAnchor="middle" 
                className="fill-gray-400 group-hover:fill-gray-900 font-medium transition-colors"
                transform={`rotate(0, ${x + barWidth / 2}, ${height - 5})`}
              >
                {it.name.length > 8 ? it.name.substring(0, 7) + '..' : it.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const DashboardAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerateReport = () => {
    if (!data) return
    setGenerating(true)
    
    try {
      const doc = new jsPDF()
      const primaryColor = [79, 70, 229] // Indigo-600

      // Header
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('DIGITAL LIBRARY ANALYTICS', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' })

      // Summary Section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('1. Executive Summary', 15, 55)
      
      const summaryData = [
        ['Total Resources', data.metrics.totalBooks.toString()],
        ['Available Now', data.metrics.availableBooks.toString()],
        ['Total Borrow Count', data.metrics.borrowCount.toString()],
        ['Maintenance Items', data.metrics.maintenanceBooks.toString()],
        ['Unavailable Items', (data.metrics.unavailableBooks || 0).toString()],
      ]

      autoTable(doc, {
        startY: 62,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      })

      // Categories Section
      doc.setFontSize(16)
      doc.text('2. Category Distribution', 15, doc.lastAutoTable.finalY + 15)
      
      const categoryData = data.categories.map(c => [c.name, c.count.toString()])
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Category (Subject)', 'Count']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [45, 55, 72] }
      })

      // Resource Types Section
      if (doc.lastAutoTable.finalY + 60 > 280) doc.addPage()
      
      doc.setFontSize(16)
      doc.text('3. Resource Type Breakdown', 15, doc.lastAutoTable.finalY + 15)
      
      const typeData = data.types.map(t => [t.name.toUpperCase().replace('_', ' '), t.count.toString()])
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Resource Type', 'Count']],
        body: typeData,
        theme: 'plain',
        headStyles: { fillColor: [100, 100, 100] }
      })

      // Recent Activity
      if (doc.lastAutoTable.finalY + 60 > 280) doc.addPage()
      doc.setFontSize(16)
      doc.text('4. Recent Additions', 15, doc.lastAutoTable.finalY + 15)
      
      const activityData = data.recentActivity.map(a => [
        new Date(a.time).toLocaleDateString(),
        a.resource,
        a.action
      ])

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Resource Name', 'Action Type']],
        body: activityData,
        theme: 'striped'
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount} - Digital Library System`, 105, 290, { align: 'center' })
      }

      doc.save(`Library_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('Failed to generate PDF report')
    } finally {
      setTimeout(() => setGenerating(false), 1000)
    }
  }

  useEffect(() => {
    let mounted = true
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await apiFetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const body = await res.json()
        if (mounted) setData(body)
      } catch (err) {
        if (mounted) console.error(err)
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchAnalytics()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-gray-300 animate-spin mb-4" />
        <p className="text-gray-500 font-medium italic">Processing library data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Analytics Unavailable</h3>
        <p className="text-gray-500 max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
        >
          Retry Loading
        </button>
      </div>
    )
  }

  const { metrics, categories, types, recentActivity, growth } = data

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const growthData = growth.map(g => ({
    name: monthNames[g.month - 1] || `M${g.month}`,
    count: g.count
  }))

  return (
    <div className="min-h-screen bg-gray-50/30 py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Library Analytics</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Live activity insights from your collection
            </p>
          </div>
          <button 
            onClick={handleGenerateReport}
            disabled={generating || !data}
            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-sm font-medium ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generating ? 'Finalizing...' : 'Generate Report'}
          </button>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard 
            label="Total Resources" 
            value={metrics.totalBooks} 
            icon={<BookOpen className="w-5 h-5" />} 
            color="text-blue-600" 
            bg="bg-blue-50"
            sub="Items in catalog"
          />
          <MetricCard 
            label="Available Now" 
            value={metrics.availableBooks} 
            icon={<CheckCircle className="w-5 h-5" />} 
            color="text-green-600" 
            bg="bg-green-50"
            sub="Ready for borrowing"
          />
          <MetricCard 
            label="Total Borrows" 
            value={metrics.borrowCount} 
            icon={<RefreshCw className="w-5 h-5" />} 
            color="text-purple-600" 
            bg="bg-purple-50"
            sub="Lifetime circulation"
          />
          <MetricCard 
            label="Under Care" 
            value={metrics.maintenanceBooks} 
            icon={<AlertCircle className="w-5 h-5" />} 
            color="text-amber-600" 
            bg="bg-amber-50"
            sub="In maintenance"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Popular Categories</h3>
                <p className="text-xs text-gray-400">Distribution of resources by subject</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="h-64 flex items-center justify-center">
              <BarChart items={categories} color="#4F46E5" />
            </div>
          </div>

          {/* Availability Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Availability</h3>
            <p className="text-xs text-gray-400 mb-8">Collection status breakdown</p>
            
            <div className="flex flex-col items-center gap-8">
              <Donut 
                value={metrics.availableBooks} 
                max={metrics.totalBooks} 
                color="#10B981" 
                size={140} 
                label="Available Items"
              />
              
              <div className="w-full space-y-3">
                <StatusItem label="Available" count={metrics.availableBooks} color="bg-green-500" total={metrics.totalBooks} />
                <StatusItem label="Maintenance" count={metrics.maintenanceBooks} color="bg-amber-500" total={metrics.totalBooks} />
                <StatusItem label="Unavailable" count={metrics.unavailableBooks || 0} color="bg-red-500" total={metrics.totalBooks} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Collection Growth</h3>
                <p className="text-xs text-gray-400">New resources added per month</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="h-64 flex items-center justify-center">
              <BarChart items={growthData} color="#10B981" />
            </div>
          </div>

          {/* Resource Types */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resource Types</h3>
            <div className="space-y-4">
              {types.map((type, i) => (
                <div key={type.name} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${i % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{type.name.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-gray-900">{type.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-pink-500'} rounded-full transition-all duration-1000`} 
                        style={{ width: `${(type.count / metrics.totalBooks) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Additions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Latest Additions</h3>
            <div className="space-y-6">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{item.resource}</h4>
                    <p className="text-xs text-gray-500 mb-1">{item.type.replace('_', ' ').toUpperCase()} • Added {new Date(item.time).toLocaleDateString()}</p>
                    <div className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
                      <TrendingUp className="w-2.5 h-2.5" />
                      New Entry
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic">No recent activity found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ label, value, icon, color, bg, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 ${bg} ${color} rounded-xl`}>
        {icon}
      </div>
      <div className="h-6 w-12 bg-gray-50 rounded animate-pulse opacity-20"></div>
    </div>
    <div className="text-2xl font-black text-gray-900 tracking-tight">{value.toLocaleString()}</div>
    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{label}</p>
    <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{sub}</p>
  </div>
)

const StatusItem = ({ label, count, color, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 ${color} rounded-full`}></div>
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm font-bold text-gray-900">{count}</span>
      <span className="text-xs text-gray-400 font-medium ml-2">{Math.round(pct)}%</span>
    </div>
  )
}

export default DashboardAnalytics
