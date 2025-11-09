const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Disable TLS verification for Railway internal calls globally
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

// Engine service URL (separate Railway service)
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:8000'

console.log('Environment check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('ENGINE_URL:', ENGINE_URL)
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('Starting Next.js app...')

app.prepare().then(() => {
  console.log('Next.js app prepared successfully')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Port:', port)
  console.log('Hostname:', hostname)
  
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      console.log(`Request: ${req.method} ${parsedUrl.pathname}`)
      
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }
      
      // Debug endpoint to check environment
      if (parsedUrl.pathname === '/debug/env') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          ENGINE_URL: process.env.ENGINE_URL,
          OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
          NODE_ENV: process.env.NODE_ENV,
          ALL_ENV_KEYS: Object.keys(process.env).filter(key => 
            key.includes('ENGINE') || key.includes('OPENAI') || key.includes('NEXT')
          )
        }, null, 2))
        return
      }
      
      // Remove engine proxy - let Next.js API routes handle it
      // This forces all /api/engine/* requests to go through the API route handlers
      
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err)
    process.exit(1)
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Engine URL: ${ENGINE_URL}`)
  })
}).catch((err) => {
  console.error('Failed to start Next.js app:', err)
  process.exit(1)
})
