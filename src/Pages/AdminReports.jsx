import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Lock,
  ArrowUpRight
} from 'lucide-react'

const AdminReports = () => {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [exporting, setExporting] = useState(null) // 'csv' | 'pdf' | 'txt'
  const [searchQuery, setSearchQuery] = useState('')

  const fetchReportsData = async (mounted = { current: true }) => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/analytics')
      if (res.ok) {
        const data = await res.json()
        if (mounted.current) {
          setAnalyticsData(data)
          setActivities(data.recentActivity || [])
        }
      }
    } catch (err) {
      if (mounted.current) console.error('Failed to fetch report data', err)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  useEffect(() => {
    const status = { current: true }
    fetchReportsData(status)
    return () => { status.current = false }
  }, [])

  const handleExport = (type) => {
    if (!analyticsData) {
       alert('Data not loaded yet')
       return
    }

    setExporting(type)
    
    try {
      if (type === 'pdf') {
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.text('SYSTEM AUDIT & INVENTORY REPORT', 105, 20, { align: 'center' })
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' })

        // Audit Log Table
        doc.setFontSize(14)
        doc.text('1. Recent Audit Logs', 15, 45)
        const auditData = activities.map(a => [
          new Date(a.time).toLocaleString(),
          a.resource,
          a.action,
          'SUCCESS'
        ])
        autoTable(doc, {
          startY: 50,
          head: [['Timestamp', 'Resource', 'Action', 'Status']],
          body: auditData,
          theme: 'striped'
        })

        // Inventory Summary
        doc.addPage()
        doc.text('2. Inventory Summary', 15, 20)
        const summaryData = [
          ['Total Books', analyticsData.metrics.totalBooks.toString()],
          ['Available', analyticsData.metrics.availableBooks.toString()],
          ['Maintenance', analyticsData.metrics.maintenanceBooks.toString()],
          ['Total Borrows', analyticsData.metrics.borrowCount.toString()]
        ]
        autoTable(doc, {
          startY: 25,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid'
        })

        doc.save(`System_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      } else if (type === 'csv') {
        const headers = ['Timestamp', 'Resource', 'Action', 'Status']
        const rows = activities.map(a => [
          new Date(a.time).toISOString(),
          `"${a.resource.replace(/"/g, '""')}"`,
          a.action,
          'SUCCESS'
        ])
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `System_Audit_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(`${type.toUpperCase()} Export not implemented yet`)
      }
    } catch (err) {
      console.error(`${type.toUpperCase()} export failed`, err)
      alert(`Failed to generate ${type.toUpperCase()} report`)
    } finally {
      setExporting(null)
    }
  }

  const generateSpecificReport = (title) => {
    if (!analyticsData) return
    
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text(title.toUpperCase(), 105, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 28, { align: 'center' })

    if (title === 'Inventory Summary') {
      const data = [
        ['Total Books', analyticsData.metrics.totalBooks],
        ['Available', analyticsData.metrics.availableBooks],
        ['Maintenance', analyticsData.metrics.maintenanceBooks],
        ['Unavailable', analyticsData.metrics.unavailableBooks],
        ['Total Borrows', analyticsData.metrics.borrowCount]
      ]
      autoTable(doc, { startY: 40, head: [['Metric', 'Quantity']], body: data })
    } 
    else if (title === 'User Activity') {
      const data = [
        ['Total Users', analyticsData.metrics.totalUsers],
        ['Active Now', analyticsData.metrics.activeUsers],
        ['Banned', analyticsData.metrics.bannedUsers],
        ['Instructors', analyticsData.metrics.instructors],
        ['Students/Members', analyticsData.metrics.students]
      ]
      autoTable(doc, { startY: 40, head: [['User Segment', 'Count']], body: data })
    }
    else if (title === 'Audit Trail') {
      const data = activities.map(a => [new Date(a.time).toLocaleString(), a.action, a.resource])
      autoTable(doc, { startY: 40, head: [['Time', 'Action', 'Target']], body: data })
    }
    else if (title === 'Monthly Growth') {
      const data = analyticsData.growth.map(g => [`Month ${g.month}`, g.count])
      autoTable(doc, { startY: 40, head: [['Period', 'Books Added']], body: data })
    }

    doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`)
  }

  const filteredActivities = activities.filter(a => 
    a.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const reportTypes = [
    { title: 'Inventory Summary', desc: 'Current catalog status, categories and resource types.', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'User Activity', desc: 'New registrations, login frequency and active users.', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Audit Trail', desc: 'System changes, deleted resources and permission shifts.', icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Monthly Growth', desc: 'Resource addition trends and category preferences.', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Reports</h1>
            <p className="text-sm text-gray-500 mt-1">Export data and review system audit trails</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchReportsData}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => handleExport('csv')}
              disabled={!!exporting}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV Export
            </button>
            <button 
               onClick={() => handleExport('pdf')}
               disabled={!!exporting}
               className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black flex items-center gap-2 shadow-sm transition-all"
            >
              {exporting === 'pdf' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Full PDF Report
            </button>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {reportTypes.map((rpt, i) => (
            <div 
              key={i} 
              onClick={() => generateSpecificReport(rpt.title)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 ${rpt.bg} ${rpt.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <rpt.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{rpt.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{rpt.desc}</p>
              <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                Generate <ArrowUpRight className="ml-1 w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Recent Audit Log
            </h2>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Filter logs..." 
                   className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-gray-800 outline-none w-48"
                 />
               </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActivities.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <RefreshCw className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.resource}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        SUCCESS
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && !loading && (
                   <tr>
                     <td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">
                       No system activity matched your search.
                     </td>
                   </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-center">
            <button className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 mx-auto">
              View Full History <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
