import inquirer from 'inquirer'
import ora from 'ora'

export default async function loginPrompt(authenticateUserUseCase) {
	const { username, password } = await inquirer.prompt([
		{
			type: 'input',
			name: 'username',
			message: 'Nom d’utilisateur :',
		},
		{
			type: 'password',
			name: 'password',
			message: 'Mot de passe :',
		},
	])

	const spinner = ora('🔐 Vérification des identifiants...').start()

	try {
		const user = await authenticateUserUseCase.login(username, password)
		spinner.succeed('Connexion réussie')
		return user
	} catch (error) {
		spinner.fail('Échec de la connexion')
		console.error('Erreur de connexion:', error)
		throw new Error(
			`Échec de la connexion : ${error.message || 'Identifiants invalides'}`
		)
	}
}
