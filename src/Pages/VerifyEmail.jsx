import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const initialEmail = searchParams.get('email') || ''
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown === 0) return
    
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (!token) return setMessage('No verification token provided.')

    const verify = async () => {
      setStatus('loading')
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET'
        })
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
          setMessage(data.message || 'Your email has been successfully verified.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. Please try again.')
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setMessage('Network error while verifying. Please check your connection and try again.')
      }
    }

    verify()
  }, [token])

  // Redirect to dashboard after successful verification
  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => {
      navigate('/dashboard')
    }, 3000) // Increased delay to allow reading success message
    return () => clearTimeout(t)
  }, [status, navigate])

  const handleCodeVerification = async () => {
    if (!email || !code) {
      setMessage('Please enter both email and verification code.')
      return
    }
    
    if (code.length !== 6) {
      setMessage('Please enter a valid 6-digit code.')
      return
    }

    setStatus('loading')
      try {
        const res = await apiFetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Email successfully verified!')
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed. Please check your code and try again.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage('Please enter your email address to resend verification.')
      return
    }

    setStatus('loading')
      try {
        const res = await apiFetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('idle')
        setMessage(data.message || 'Verification code has been resent to your email.')
        setCountdown(60) // 60 second cooldown
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to resend verification. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setMessage('Network error. Please try again later.')
    }
  }

  const renderBody = () => {
    // Manual code verification form
    if (!token) return (
      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Verify Your Email</h2>
          <p className="verify-subtitle">Enter the 6-digit verification code sent to your email address</p>
        </div>

        <div className="verify-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              disabled={status === 'loading'}
            />
          </div>

          <div className="input-group">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-field code-input"
              maxLength={6}
              disabled={status === 'loading'}
            />
            <div className="code-hint">Enter the 6-digit code from your email</div>
          </div>

          {message && (
            <div className={`message ${status === 'error' ? 'error' : status === 'success' ? 'success' : 'info'}`}>
              {message}
            </div>
          )}

          <div className="button-group">
            <button
              onClick={handleCodeVerification}
              disabled={status === 'loading' || !email || !code}
              className="btn btn-primary"
            >
              {status === 'loading' ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              onClick={handleResendCode}
              disabled={status === 'loading' || countdown > 0 || !email}
              className="btn btn-secondary"
            >
              {countdown > 0 ? `Resend available in ${countdown}s` : 'Resend Verification Code'}
            </button>
          </div>
        </div>

        <div className="verify-footer">
          <p>Didn't receive the code? Check your spam folder or <button 
            onClick={handleResendCode}
            disabled={countdown > 0}
            className="link-button"
          >
            resend
          </button></p>
        </div>
      </div>
    )

    // Automatic token verification states
    if (status === 'loading' || status === 'idle') return (
      <div className="verify-card">
        <div className="verify-header">
          <div className="loading-spinner large"></div>
          <h2>Verifying Your Email</h2>
          <p className="verify-subtitle">Please wait while we confirm your email address</p>
        </div>
      </div>
    )

    if (status === 'success') return (
      <div className="verify-card success">
        <div className="verify-header">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Email Verified Successfully!</h2>
          <p className="verify-subtitle">{message}</p>
        </div>
        <div className="redirect-notice">
          <div className="loading-spinner small"></div>
          <span>Redirecting to your dashboard...</span>
        </div>
      </div>
    )

    // Error state
    return (
      <div className="verify-card error">
        <div className="verify-header">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Verification Failed</h2>
          <p className="verify-subtitle">{message}</p>
        </div>
        <div className="action-links">
          <Link to="/auth/signup" className="btn btn-outline">Create New Account</Link>
          <Link to="/auth/forgot" className="btn btn-secondary">Resend Verification</Link>
          <Link to="/auth/login" className="link-button">Back to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="verify-container">
      {renderBody()}
    </div>
  )
}