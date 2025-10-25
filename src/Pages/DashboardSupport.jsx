import React, { useState } from 'react'

const SAMPLE_FAQ = [
  {
    id: 1,
    q: 'How do I borrow a book?',
    a: 'Visit the Library page, find the book you want and click the "Borrow Now" button. Follow on-screen instructions.'
  },
  {
    id: 2,
    q: 'Can I renew a borrowed book?',
    a: 'Yes — if the book is not overdue and the renewal limit has not been reached. Use the Renew button on My Borrowed Books.'
  },
  {
    id: 3,
    q: 'How do I request an extension?',
    a: 'Open the Borrowed Books page and click "Request Extension" under Quick Actions or on the specific loan.'
  }
]

const DashboardSupport = () => {
  const [tickets, setTickets] = useState([
    { id: 101, subject: 'Unable to download book', status: 'Open', created: '2 days ago' },
    { id: 102, subject: 'Account settings not saving', status: 'Answered', created: '5 days ago' }
  ])

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      return alert('Please complete all fields before sending your message.')
    }
    setSending(true)
    setTimeout(() => {
      const newTicket = {
        id: Math.floor(Math.random() * 10000) + 200,
        subject: form.subject,
        status: 'Open',
        created: 'Just now'
      }
      setTickets(prev => [newTicket, ...prev])
      setForm({ name: '', email: '', subject: '', message: '' })
      setSending(false)
      alert('Support request submitted (mock). A real implementation would POST this to your API.')
    }, 900)
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-sm text-gray-600 mt-1">Find answers, contact support, or view your recent tickets.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Support</h2>
            <p className="text-sm text-gray-500 mb-4">Send us a message and our support team will get back to you.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="px-4 py-2.5 border border-gray-300 rounded-xl" />
                <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Your email" className="px-4 py-2.5 border border-gray-300 rounded-xl" />
              </div>

              <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" />

              <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help?" rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none" />

              <div className="flex items-center justify-end gap-3">
                <button type="submit" disabled={sending} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: FAQ + Resources */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently asked questions</h3>
            <div className="space-y-2">
              {SAMPLE_FAQ.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-lg">
                  <button onClick={() => setFaqOpen(faqOpen === item.id ? null : item.id)} className="w-full text-left px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{item.q}</div>
                    </div>
                    <div className="text-gray-500">{faqOpen === item.id ? '−' : '+'}</div>
                  </button>
                  {faqOpen === item.id && (
                    <div className="px-4 pb-4 text-sm text-gray-600">{item.a}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Resources</h4>
              <ul className="text-sm text-blue-600 space-y-2">
                <li><a href="#">User Guide</a></li>
                <li><a href="#">Borrowing Policy</a></li>
                <li><a href="#">Contact Phone: +256 700 000000</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your recent tickets</h3>
            <div className="text-sm text-gray-500">{tickets.length} total</div>
          </div>
          <div className="divide-y divide-gray-100">
            {tickets.map(t => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">#{t.id} — {t.subject}</div>
                  <div className="text-xs text-gray-500">{t.status} • {t.created}</div>
                </div>
                <div className="text-sm text-blue-600">View</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSupport
