import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setMessage('Please enter your email')
    // simulate sending reset link
    await new Promise((r) => setTimeout(r, 600))
    setMessage('If that email exists in our system, a reset link has been sent.')
    // optionally navigate back to login after a short delay
    setTimeout(() => navigate('/auth/login'), 2000)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Forgot password</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your email and we'll send a password reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <div>
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded">Send reset link</button>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword
