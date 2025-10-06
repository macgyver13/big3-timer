const fastify = require('fastify')({ logger: true })
const path = require('path')
const fs = require('fs')

// Register CORS
const isDev = process.env.NODE_ENV !== 'production'
fastify.register(require('@fastify/cors'), {
  origin: isDev ? true : false, // Allow all origins in dev, same-origin only in production
  credentials: true
})

// Serve static files from frontend/dist in production
const distPath = path.join(__dirname, '../frontend/dist')
if (fs.existsSync(distPath)) {
  fastify.register(require('@fastify/static'), {
    root: distPath,
    prefix: '/'
  })

  // Serve index.html for all routes (SPA support)
  fastify.setNotFoundHandler((request, reply) => {
    reply.sendFile('index.html')
  })
} else {
  fastify.log.info('No frontend dist found, running in dev mode')
}

// Health check endpoint
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Exercise configuration endpoint
fastify.get('/api/exercises', async (request, reply) => {
  const configPath = path.join(__dirname, 'config', 'exercises.json')
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    return config
  } catch (error) {
    fastify.log.error('Failed to load exercise config:', error)
    reply.code(500).send({ error: 'Failed to load exercise configuration' })
  }
})

// Start server
const start = async () => {
  try {
    const host = '0.0.0.0'
    const port = process.env.PORT || 3000
    await fastify.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
