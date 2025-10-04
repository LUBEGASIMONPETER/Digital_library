import React, { useEffect, useRef, useState } from 'react'

// Simple counter that animates from 0 to target when it enters the viewport
function Counter({ target = 0, duration = 1000, suffix = '', formatComma = false, appendPlus = false }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const from = 0
          const to = target
          const dur = duration

          function tick(now) {
            const progress = Math.min((now - start) / dur, 1)
            const current = Math.floor(from + (to - from) * progress)
            setValue(current)
            if (progress < 1) requestAnimationFrame(tick)
            else {
              // ensure final value
              setValue(to)
            }
          }

          requestAnimationFrame(tick)
          io.disconnect()
        }
      })
    }, { threshold: 0.3 })

    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  const display = formatComma ? value.toLocaleString() : value
  const text = `${display}${suffix}${appendPlus ? '+' : ''}`

  return <div ref={ref}>{text}</div>
}

function CounterCard({ children, label, colorClass = 'text-blue-600' }) {
  return (
    <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
      <div className={`text-3xl font-bold mb-2 ${colorClass}`}>{children}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  )
}

const Contact = () => {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section with Animation */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to support your educational journey. Reach out to the Kawempe Digital Library team 
            for assistance with resources, technical support, or general inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Contact Cards - 3 columns */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Card */}
              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-blue-100 hover:border-blue-200">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 w-[60px]">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Support</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Perfect for detailed questions, resource requests, and general inquiries about the library.
                    </p>
                    <div className="space-y-2">
                      <a href="mailto:support@kawempelibrary.ac.ug" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors duration-200 group-hover:translate-x-1 transform transition-transform">
                        support@kawempelibrary.ac.ug
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p className="text-sm text-gray-500">Typically respond within 2-4 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-green-100 hover:border-green-200">
                  <div className="w-[60px] bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Phone Support</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Speak directly with our support team for immediate assistance and quick questions.
                    </p>
                    <div className="space-y-2">
                      <a href="tel:+256700123456" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-lg transition-colors duration-200 group-hover:translate-x-1 transform transition-transform">
                        +256 700 123 456
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p className="text-sm text-gray-500">Mon-Fri: 8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Card */}
              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-orange-100 hover:border-orange-200">
                  <div className="w-[60px] bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Technical Help</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Experiencing issues with the platform? Our tech team is here to help you.
                    </p>
                    <div className="space-y-2">
                      <a href="mailto:tech@kawempelibrary.ac.ug" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-lg transition-colors duration-200 group-hover:translate-x-1 transform transition-transform">
                        tech@kawempelibrary.ac.ug
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p className="text-sm text-gray-500">24/7 for critical platform issues</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit Card */}
              <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-purple-100 hover:border-purple-200">
                  <div className="w-[60px] bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Visit Our Office</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Prefer face-to-face assistance? Visit our main office in Kawempe.
                    </p>
                    <div className="space-y-2">
                      <p className="text-purple-600 font-semibold text-lg">
                        Kawempe Education District
                      </p>
                      <p className="text-gray-600 text-sm">
                        Kampala Road, Kawempe Division<br />
                        Kampala, Uganda
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            {/* Animated Stats Section */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Counter component will animate numbers when visible */}
              {/* Define Counter inline so file remains self-contained */}
              {/**/}
              
              {/* Counter JSX helper */}
              
              
              <CounterCard label="Avg. Response Time" colorClass="text-blue-600">
                <Counter target={24} suffix="h" duration={1200} />
              </CounterCard>

              <CounterCard label="Satisfaction Rate" colorClass="text-green-600">
                <Counter target={98} suffix="%" duration={1200} />
              </CounterCard>

              <CounterCard label="Students Helped" colorClass="text-purple-600">
                <Counter target={2500} formatComma appendPlus duration={1400} />
              </CounterCard>

              <CounterCard label="Quick Issue Resolution" colorClass="text-orange-600">
                <Counter target={15} suffix="min" duration={1200} />
              </CounterCard>
            </div>
          </div>

          {/* Sidebar - Enhanced */}
          <div className="space-y-6">
            {/* Emergency Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-xl font-bold">Urgent Support</h3>
              </div>
              <p className="text-red-100 mb-4 text-sm leading-relaxed">
                Critical platform issues requiring immediate attention
              </p>
              <a href="tel:+256700654321" className="inline-flex items-center justify-center w-full bg-white text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-50 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +256 700 654 321
              </a>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quick Resources
              </h3>
              <div className="space-y-3">
                {[
                  { name: "FAQ & Help Center", href: "/faq", emoji: "❓" },
                  { name: "Platform Tutorials", href: "/tutorials", emoji: "🎥" },
                  { name: "Study Materials Guide", href: "/resources", emoji: "📚" },
                  { name: "User Agreement", href: "/user-agreement", emoji: "📄" },
                  { name: "Borrowing Policy", href: "/borrowing-policy", emoji: "⏰" },
                  { name: "Mobile App Guide", href: "/mobile-guide", emoji: "📱" }
                ].map((item, index) => (
                  <a key={index} href={item.href} className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group">
                    <span className="text-lg mr-3">{item.emoji}</span>
                    <span className="text-gray-700 group-hover:text-blue-600 font-medium flex-1">{item.name}</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Operating Hours
              </h3>
              <div className="space-y-3">
                {[
                  { day: "Monday - Friday", time: "8:00 AM - 6:00 PM", status: "open" },
                  { day: "Saturday", time: "9:00 AM - 2:00 PM", status: "limited" },
                  { day: "Sunday", time: "Closed", status: "closed" }
                ].map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <span className="text-gray-300">{schedule.day}</span>
                    <span className={`font-semibold ${
                      schedule.status === 'open' ? 'text-green-400' : 
                      schedule.status === 'limited' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Our Commitment to Your Success</h3>
            <p className="text-blue-100 text-lg leading-relaxed max-w-3xl mx-auto">
              We're dedicated to ensuring every A-Level student in Kawempe has access to quality educational resources. 
              Your academic journey is our priority, and we're here to support you every step of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact