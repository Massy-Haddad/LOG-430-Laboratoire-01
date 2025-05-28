import { UserModel } from '../models/index.js';

export const userRepository = {
  async findByUsername(username) {
    return await UserModel.findOne({ where: { username } });
  }
};
