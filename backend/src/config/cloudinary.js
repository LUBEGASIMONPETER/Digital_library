const cloudinary = require('cloudinary').v2

// Configure Cloudinary safely. The cloudinary SDK expects CLOUDINARY_URL to begin with
// 'cloudinary://'. If users accidentally paste an HTTPS URL (common when copying from
// the dashboard), we'll ignore it and fall back to individual env vars. We also attach
// a `_configured` flag to the exported object so callers can detect whether Cloudinary
// is actually usable.
let configured = false
let configError = null
const rawUrl = process.env.CLOUDINARY_URL && String(process.env.CLOUDINARY_URL).trim()
const hasKeys = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME

if (rawUrl) {
  if (rawUrl.startsWith('cloudinary://') && !rawUrl.includes('<your_')) {
    try {
      cloudinary.config({ url: rawUrl })
      configured = true
      console.log('Cloudinary configured via CLOUDINARY_URL')
    } catch (err) {
      configError = err && err.message
      console.warn('Cloudinary config failed for CLOUDINARY_URL:', configError)
    }
  } else {
    configError = rawUrl.includes('<your_') ? 'CLOUDINARY_URL contains placeholder values' : 'CLOUDINARY_URL does not start with cloudinary://'
    console.warn(configError + '; ignoring and falling back to individual keys')
  }
}

if (!configured && hasKeys) {
  const isPlaceholder = String(process.env.CLOUDINARY_API_KEY).includes('<your_') || String(process.env.CLOUDINARY_CLOUD_NAME).includes('<your_')
  
  if (isPlaceholder) {
    configError = 'Cloudinary keys contain placeholder values (<your_...>); skipping configuration'
    console.warn(configError)
  } else {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      })
      configured = true
      console.log('Cloudinary configured via individual keys (cloud_name:', process.env.CLOUDINARY_CLOUD_NAME, ')')
    } catch (err) {
      configError = err && err.message
      console.warn('Cloudinary config failed for individual keys:', configError)
    }
  }
}

if (!configured) {
  console.warn('Cloudinary not configured. Uploads will fall back to local storage (/uploads).')
  if (!rawUrl && !hasKeys) {
    console.warn('Missing env vars: CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET)')
  }
}

// Attach flags so other modules can detect Cloudinary status
cloudinary._configured = configured
cloudinary._configError = configError

module.exports = cloudinary
