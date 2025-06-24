import jwt from 'jsonwebtoken'

export function makeLoginController({ authenticateUserUseCase }) {
	return async function loginController(req, res) {
		const { username, password } = req.body || {}

		if (!username || !password) {
			return res.status(400).json({ error: 'Missing username or password' })
		}

		try {
			const user = await authenticateUserUseCase.login(username, password)

			const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					role: user.role, // si tu as un champ `role` dans ton modèle
				},
				process.env.JWT_SECRET || 'dev-secret',
				{ expiresIn: '1h' }
			)

			return res.status(200).json({ token })
		} catch (err) {
			return res.status(401).json({ error: err.message })
		}
	}
}
