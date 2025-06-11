import express from 'express'
import cors from 'cors'
import router from './routes/index.js'

import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/v1', router)

const swaggerDocument = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'docs', 'swagger.json'), 'utf8')
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`API server running on http://localhost:${PORT}`)
})
