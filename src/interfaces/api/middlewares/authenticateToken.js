// src/interfaces/api/middlewares/authenticateToken.js
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token || token !== 'secret-token-123') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
