const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Engine service URL (separate Railway service)
const ENGINE_URL = process.env.ENGINE_URL || 'https://your-engine-service.up.railway.app'

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      
      // Proxy API routes to Python engine service
      if (parsedUrl.pathname.startsWith('/api/engine/')) {
        const enginePath = parsedUrl.pathname.replace('/api/engine', '')
        const engineUrl = `${ENGINE_URL}${enginePath}${parsedUrl.search || ''}`
        
        try {
          const fetch = (await import('node-fetch')).default
          const response = await fetch(engineUrl, {
            method: req.method,
            headers: req.headers,
            body: req.method !== 'GET' ? req : undefined
          })
          
          res.writeHead(response.status, response.headers.raw())
          response.body.pipe(res)
        } catch (error) {
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
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
