import bcrypt from 'bcrypt'
import User from '../../domain/shared/entities/User.js'

export function makeAuthenticateUserUseCase({ userRepository }) {
	return {
		async login(username, password) {
			// Obtenir un enregistrement brut depuis la couche infrastructure
			const userRecord = await userRepository.findByUsername(username)
			if (!userRecord) throw new Error('Utilisateur introuvable.')

			// Comparaison du mot de passe (bcrypt)
			const match = await bcrypt.compare(password, userRecord.password)
			if (!match) throw new Error('Mot de passe incorrect.')

			// Création de l'entité User (propre, sans mot de passe)
			return new User({
				id: userRecord.id,
				username: userRecord.username,
				role: userRecord.role,
				storeId: userRecord.storeId,
			})
		},
	}
}
