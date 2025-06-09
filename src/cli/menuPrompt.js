import inquirer from 'inquirer';

import searchProductCommand from './commands/searchProduct.js';
import sellProductCommand from './commands/sellProduct.js';
import returnSaleCommand from './commands/returnSale.js';
import checkStockCommand from './commands/checkStock.js';
import generateReportCommand from './commands/generateReport.js'


export default async function menuPrompt(user) {
	console.log(
		`\n👋 Bienvenue ${user.username} (${user.role}) du magasin #${user.storeId} !\n`
	)
	while (true) {
		const choices = []

		if (user.role === 'admin') {
			choices.push({ name: '📊 Générer un rapport consolidé', value: 'report' })
		}

		if (user.role === 'employee') {
			choices.push(
				{ name: '🔍 Rechercher un produit', value: 'search' },
				{ name: '🛒 Enregistrer une vente', value: 'sell' },
				{ name: '🔁 Gérer un retour', value: 'return' },
				{ name: '📦 Consulter le stock', value: 'stock' }
			)
		}

		choices.push({ name: '❌ Quitter', value: 'exit' })

		const { action } = await inquirer.prompt({
			type: 'list',
			name: 'action',
			message: '🧭 Que souhaitez-vous faire ?',
			choices,
		})

		if (action === 'exit') break

		switch (action) {
			case 'search':
				await searchProductCommand(user)
				break
			case 'sell':
				await sellProductCommand(user)
				break
			case 'return':
				await returnSaleCommand(user)
				break
			case 'stock':
				await checkStockCommand(user)
				break
			case 'report':
				await generateReportCommand()
				break
		}
	}
}
