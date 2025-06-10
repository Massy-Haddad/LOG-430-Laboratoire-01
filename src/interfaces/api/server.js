import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Routes à venir ici
app.get('/api/v1/ping', (req, res) => res.send('pong'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
