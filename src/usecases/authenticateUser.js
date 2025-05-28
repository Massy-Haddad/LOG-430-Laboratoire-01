import bcrypt from 'bcrypt';
import User from '../domain/entities/User.js';

export function makeAuthenticateUserUseCase({ userRepository }) {
  return {
    async login(username, password) {
      const userRecord = await userRepository.findByUsername(username);
      if (!userRecord) throw new Error('Utilisateur introuvable.');

      const match = await bcrypt.compare(password, userRecord.password);
      if (!match) throw new Error('Mot de passe incorrect.');

      return new User({
        id: userRecord.id,
        username: userRecord.username,
        role: userRecord.role
      });
    }
  };
}
