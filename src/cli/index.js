import figlet from 'figlet';
import chalk from 'chalk';

import { makeAuthenticateUserUseCase } from '../usecases/shared/authenticateUser.js'
import { userRepository } from '../infrastructure/postgres/repositories/userRepository.js'
import loginPrompt from './loginPrompt.js'
import menuPrompt from './menuPrompt.js'

const authenticateUserUseCase = makeAuthenticateUserUseCase({ userRepository })

console.clear();
console.log(
	chalk.cyan(figlet.textSync('POS', { horizontalLayout: 'full', width: 80 }))
)
console.log(
	chalk.cyan('Système de Point de Vente - Gestion des Ventes et du Stock\n')
)
console.log(chalk.yellow('Veuillez vous connecter pour continuer.'))

try {
	const user = await loginPrompt(authenticateUserUseCase)
	console.log(chalk.green(`\n Bienvenue, ${user.username} !\n`))
	await menuPrompt(user)
} catch (err) {
	console.error(chalk.red(`❌ ${err.message}`))
	process.exit(1)
}
