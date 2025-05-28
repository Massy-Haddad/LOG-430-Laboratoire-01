import figlet from 'figlet';
import chalk from 'chalk';

import { makeAuthenticateUserUseCase } from '../usecases/authenticateUser.js'
import { userRepository } from '../infrastructure/repositories/userRepository.js'
import loginPrompt from './loginPrompt.js'
import menuPrompt from './menuPrompt.js'

const authenticateUserUseCase = makeAuthenticateUserUseCase({ userRepository })

console.clear();
console.log(chalk.cyan(figlet.textSync('POS App', { horizontalLayout: 'full' })));

try {
  const user = await loginPrompt(authenticateUserUseCase)
  console.log(chalk.green(`\n✅ Bienvenue, ${user.username} !\n`));
  await menuPrompt(user);
} catch (err) {
  console.error(chalk.red(`❌ ${err.message}`));
  process.exit(1);
}
