import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

let idCounter = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback(({ message, type = 'info', timeout = 4000 }) => {
    const id = idCounter++
    setToasts(t => [...t, { id, message, type }])
    if (timeout > 0) {
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id))
      }, timeout)
    }
    return id
  }, [])

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-xl shadow-md text-white flex items-start gap-3 ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
            <div className="flex-1 text-sm">
              {t.message}
            </div>
            <button onClick={() => remove(t.id)} className="text-white/80 hover:text-white">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export default ToastProvider
