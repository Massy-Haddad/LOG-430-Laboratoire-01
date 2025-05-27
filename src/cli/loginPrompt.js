import inquirer from 'inquirer';
import ora from 'ora';
import bcrypt from 'bcrypt';

import { sequelize } from '../infrastructure/database.js';
import { defineUserModel } from '../infrastructure/models/user.model.js';

const User = defineUserModel(sequelize);

export default async function loginPrompt() {
  const { username, password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Nom d’utilisateur :'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Mot de passe :'
    }
  ]);

  const spinner = ora('🔐 Vérification des identifiants...').start();

  const user = await User.findOne({ where: { username } });

  if (!user) {
    spinner.fail('Utilisateur introuvable.');
    throw new Error('Identifiants invalides.');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    spinner.fail('Mot de passe incorrect.');
    throw new Error('Identifiants invalides.');
  }

  spinner.succeed('Connexion réussie !');
  return user;
}
