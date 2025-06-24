export function makeLoginController({ authenticateUserUseCase }) {
  return async function loginController(req, res) {
    const { username, password } = req.body || {}

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' })
    }

    try {
      const user = await authenticateUserUseCase.login(username, password)
      const token = 'secret-token-123'
      return res.status(200).json({ token })
    } catch (err) {
      return res.status(401).json({ error: err.message })
    }
  }
}
