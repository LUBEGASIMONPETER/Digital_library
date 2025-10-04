import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const initialState = {
  fullName: '',
  schoolName: '',
  location: '',
  gender: '',
  email: '',
  password: '',
  contact: '',
  acceptAgreement: false,
}

const Signup_page = () => {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.schoolName.trim()) errs.schoolName = 'School name is required'
    if (!form.location.trim()) errs.location = 'Location is required'
    if (!form.gender) errs.gender = 'Please select a gender'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Email is invalid'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.contact.trim()) errs.contact = 'Contact is required'
    if (!form.acceptAgreement) errs.acceptAgreement = 'You must accept the user agreement'
    return errs
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    setSubmitting(true)

    try {
      // Placeholder: submit to API here. For now we just log and redirect.
      console.log('Submitting', form)
      // simulate network delay
      await new Promise((r) => setTimeout(r, 600))
      // on success navigate to home
      navigate('/')
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
        <p className="text-gray-600">Join our platform to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Jane Doe"
              disabled={submitting}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* School Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              School Name *
            </label>
            <input
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.schoolName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="school of Example"
              disabled={submitting}
            />
            {errors.schoolName && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.schoolName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="City, Country"
              disabled={submitting}
            />
            {errors.location && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.location}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact *
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.contact ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Phone number or alternative contact"
              disabled={submitting}
            />
            {errors.contact && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.contact}
              </p>
            )}
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender *
          </label>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="gender" 
                value="male" 
                checked={form.gender === 'male'} 
                onChange={handleChange} 
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={submitting}
              />
              <span className="ml-2 text-gray-700">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="gender" 
                value="female" 
                checked={form.gender === 'female'} 
                onChange={handleChange} 
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled={submitting}
              />
              <span className="ml-2 text-gray-700">Female</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-red-600 text-sm flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.gender}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1  gap-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password *
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Create a password"
              disabled={submitting}
            />
            {errors.password && (
              <p className="text-red-600 text-sm flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input 
              type="checkbox" 
              name="acceptAgreement" 
              checked={form.acceptAgreement} 
              onChange={handleChange} 
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={submitting}
            />
            <label className="text-sm text-gray-700">
              I accept the{' '}
              <a 
                href="/auth/agreement" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
              >
                User Agreement
              </a>
              {' '}and acknowledge the terms and conditions
            </label>
          </div>
          {errors.acceptAgreement && (
            <p className="text-red-600 text-sm flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.acceptAgreement}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.submit}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/auth/login" 
            className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup_page