import { UserModel } from '../models/index.js';

export const userRepository = {
  async findByUsername(username) {
    const dbUser = await UserModel.findOne({ where: { username } });
    if (!dbUser) return null;

    // Objet brut contenant password hashé (hors domaine)
    return {
      id: dbUser.id,
      username: dbUser.username,
      password: dbUser.password,
      role: dbUser.role,
      storeId: dbUser.storeId
    };
  }
};

