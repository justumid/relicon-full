const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

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
      
      // Proxy API routes to Python engine service (except chat)
      if (parsedUrl.pathname.startsWith('/api/engine/')) {
        let enginePath = parsedUrl.pathname.replace('/api/engine', '')
        const engineUrl = `${ENGINE_URL}${enginePath}${parsedUrl.search || ''}`
        
        console.log(`Proxying to engine: ${engineUrl}`)
        console.log(`Engine URL configured: ${ENGINE_URL}`)
        console.log(`Request method: ${req.method}`)
        console.log(`Request path: ${parsedUrl.pathname}`)
        
        try {
          // Disable TLS verification for Railway internal calls
          if (engineUrl.includes('railway.app')) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
          }
          
          const fetch = (await import('node-fetch')).default
          
          // Collect request body for POST requests
          let body = undefined
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            body = await new Promise((resolve) => {
              let data = ''
              req.on('data', chunk => data += chunk)
              req.on('end', () => resolve(data))
            })
          }
          
          const response = await fetch(engineUrl, {
            method: req.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...req.headers,
              'host': undefined // Remove host header
            },
            body: body
          })
          
          // Copy response headers
          for (const [key, value] of response.headers.entries()) {
            res.setHeader(key, value)
          }
          
          res.writeHead(response.status)
          response.body.pipe(res)
          
          // Re-enable TLS verification
          if (engineUrl.includes('railway.app')) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          }
        } catch (error) {
          // Re-enable TLS verification on error too
          if (engineUrl.includes('railway.app')) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
          }
          console.error('Engine proxy error:', error)
          res.writeHead(503, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            error: 'Engine service unavailable',
            message: 'Please try again later'
          }))
        }
        return
      }
      
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
