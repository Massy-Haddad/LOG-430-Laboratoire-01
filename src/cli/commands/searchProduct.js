import inquirer from 'inquirer'
import chalk from 'chalk'
import Table from 'cli-table3'

import { makeSearchProductUseCase } from '../../usecases/retail/searchProduct.js'
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js'

const searchProductUseCase = makeSearchProductUseCase({ inventoryRepository })

export default async function searchProductCommand(user) {
	const { searchType } = await inquirer.prompt([
		{
			type: 'list',
			name: 'searchType',
			message: '🔍 Rechercher un produit par :',
			choices: [
				{ name: 'ID', value: 'id' },
				{ name: 'Nom', value: 'name' },
				{ name: 'Catégorie', value: 'category' },
			],
		},
	])

	const { keyword } = await inquirer.prompt([
		{
			type: 'input',
			name: 'keyword',
			message: `🔎 Entrez le ${searchType} à rechercher :`,
		},
	])

	const results = await searchProductUseCase.searchInStore(
		user.storeId,
		keyword,
		searchType
	)

	if (results.length === 0) {
		console.log(chalk.red('❌ Aucun produit trouvé.'))
		return
	}

	const table = new Table({
		head: [
			chalk.cyan('ID'),
			chalk.cyan('Nom'),
			chalk.cyan('Catégorie'),
			chalk.cyan('Prix'),
			chalk.cyan('Stock'),
		],
		style: { head: [], border: [] },
	})

	results.forEach((item) => {
		const product = item.Product
		table.push([
			product.id,
			product.name,
			product.category,
			product.price.toFixed(2) + ' $',
			item.stock,
		])
	})

	console.log(chalk.green.bold(`\n📋 Résultats dans Magasin #${user.storeId}`))
	console.log(table.toString())
}
