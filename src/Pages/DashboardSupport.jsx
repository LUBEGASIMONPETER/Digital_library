import React, { useState, useEffect } from 'react'
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  User,
  FileText,
  ExternalLink,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'

const SAMPLE_FAQ = [
  {
    id: 1,
    q: 'How do I download a resource?',
    a: 'Visit the Library page, find the resource you want and click the download button. The file will be saved to your device.',
    category: 'Downloads'
  },
  {
    id: 2,
    q: 'How do I read resources online?',
    a: 'Click the "Read Now" button on any resource card to open it in your browser. No download required.',
    category: 'Reading'
  },
  {
    id: 3,
    q: 'What file formats are supported?',
    a: 'We support PDF format for all textbooks and past papers. Some resources may also be available in DOC/DOCX format.',
    category: 'Technical'
  },
  {
    id: 4,
    q: 'Can I access resources offline?',
    a: 'Yes! Download any resource to access it offline. Downloaded resources remain available in your Downloads section.',
    category: 'Access'
  }
]

const DashboardSupport = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])

  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    subject: '', 
    message: '',
    priority: 'Medium'
  })
  const [sending, setSending] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }))
      if (user.id) fetchTickets()
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      const res = await apiFetch(`/api/support/tickets?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      return alert('Please complete all fields before sending your message.')
    }
    setSending(true)
    
    try {
      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId: user?.id
        })
      })

      if (res.ok) {
        setForm({ ...form, subject: '', message: '' })
        fetchTickets()
        alert('Support request submitted successfully!')
      } else {
        const error = await res.json()
        alert(error.message || 'Failed to submit support request.')
      }
    } catch (err) {
      console.error('Submit ticket error:', err)
      alert('An error occurred. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  const categories = ['all', ...new Set(SAMPLE_FAQ.map(faq => faq.category))]
  const filteredFaqs = activeCategory === 'all' 
    ? SAMPLE_FAQ 
    : SAMPLE_FAQ.filter(faq => faq.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-1">Find answers, contact support, or view your recent tickets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Support response time: 24-48 hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Contact Support</h2>
              <p className="text-sm text-gray-500">Send us a message and our support team will get back to you</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <label>Your name</label>
                </div>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="Enter your name" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <label>Your email</label>
                </div>
                <input 
                  value={form.email} 
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <label>Subject</label>
              </div>
              <input 
                value={form.subject} 
                onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} 
                placeholder="Brief description of your issue" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <label>Priority</label>
              </div>
              <select 
                value={form.priority} 
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))} 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <label>Message</label>
              </div>
              <textarea 
                value={form.message} 
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} 
                placeholder="Describe your issue in detail" 
                rows={5} 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none" 
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                type="submit" 
                disabled={sending} 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: FAQ + Resources */}
        <div className="space-y-6">
          {/* FAQ Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-500">Common questions and answers</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {filteredFaqs.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setFaqOpen(faqOpen === item.id ? null : item.id)} 
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-50 rounded">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{item.q}</div>
                    </div>
                    <div className="text-gray-400">
                      {faqOpen === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {faqOpen === item.id && (
                    <div className="px-4 pb-4 pt-2">
                      <div className="pl-8">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Resources */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Resources</h3>
                <p className="text-xs text-gray-600">Helpful links and contacts</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group">
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">User Guide</div>
                  <div className="text-xs text-gray-500">Complete guide to using the platform</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-600" />
              </a>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Support Hotline</div>
                  <div className="text-xs text-gray-500">+256 700 000000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Recent Tickets</h3>
              <p className="text-sm text-gray-500">Track the status of your support requests</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{tickets.length} total</div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ticket ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{ticket._id?.slice(-6) || ticket.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ticket.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'Open' 
                        ? 'bg-blue-100 text-blue-700' 
                        : ticket.status === 'Answered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status === 'Open' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No support tickets yet</p>
            <p className="text-sm text-gray-400 mt-1">Your support requests will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardSupport