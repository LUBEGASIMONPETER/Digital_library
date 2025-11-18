let lastError = null;

function setLastError(err) {
  try {
    if (!err) return
    // store a short, non-sensitive string (message + first stack line)
    const msg = typeof err === 'string' ? err : (err && err.message ? err.message : String(err))
    const stackLine = err && err.stack ? (err.stack.split('\n')[1] || '').trim() : ''
    lastError = (msg + (stackLine ? ' | ' + stackLine : '')).slice(0, 1000)
  } catch (e) {
    // ignore
  }
}

function getLastError() {
  return lastError
}

module.exports = { setLastError, getLastError }
