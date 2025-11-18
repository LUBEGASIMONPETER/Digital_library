const cloudinary = require('cloudinary').v2

// Configure Cloudinary safely. The cloudinary SDK expects CLOUDINARY_URL to begin with
// 'cloudinary://'. If users accidentally paste an HTTPS URL (common when copying from
// the dashboard), we'll ignore it and fall back to individual env vars. We also attach
// a `_configured` flag to the exported object so callers can detect whether Cloudinary
// is actually usable.
let configured = false
const rawUrl = process.env.CLOUDINARY_URL && String(process.env.CLOUDINARY_URL).trim()
const hasKeys = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME

if (rawUrl) {
  if (rawUrl.startsWith('cloudinary://')) {
    try {
      cloudinary.config({ url: rawUrl })
      configured = true
    } catch (err) {
      console.warn('Cloudinary config failed for CLOUDINARY_URL:', err && err.message)
    }
  } else {
    console.warn('CLOUDINARY_URL provided but does not start with "cloudinary://"; ignoring and falling back to individual keys')
  }
}

if (!configured && hasKeys) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })
    configured = true
  } catch (err) {
    console.warn('Cloudinary config failed for individual keys:', err && err.message)
  }
}

if (!configured) {
  console.warn('Cloudinary not configured. Uploads will fall back to local storage (/uploads).')
}

// Attach a small flag so other modules can decide whether to call cloudinary uploader
cloudinary._configured = configured

module.exports = cloudinary
