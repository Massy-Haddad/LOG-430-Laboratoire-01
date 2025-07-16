import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import dotenv from 'dotenv'
dotenv.config()

import { loggerMiddleware } from './middlewares/loggerMiddleware.js'
import { metricsMiddleware } from './middlewares/metricsMiddleware.js'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectRedis } from '../../infrastructure/redis/redisClient.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(
	cors({
		origin: ['http://localhost:3000'], // à ajuster selon ton front
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)

app.use(express.json())

app.use(metricsMiddleware)
app.use(loggerMiddleware)

app.use('/api/v1', router)

const swaggerDocument = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'docs', 'swagger.json'), 'utf8')
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Connexion Redis avant de lancer le serveur
await connectRedis()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`API server running on http://localhost:${PORT}`)
})
