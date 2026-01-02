/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import ticketsRoutes from './routes/tickets.js'
import adminRoutes from './routes/admin.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/admin', adminRoutes)

/**
 * Serve Static Files (Production)
 */
// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')))

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * API 404 handler
 * Only handle 404 for /api routes, otherwise let SPA handle it
 */
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

/**
 * SPA Catch-all
 * Send index.html for any other requests (React Router)
 */
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

export default app
