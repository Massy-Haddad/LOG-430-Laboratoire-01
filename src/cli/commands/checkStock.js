import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';

import { makeCheckStockUseCase } from '../../usecases/retail/checkStock.js'
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js'

const checkStockUseCase = makeCheckStockUseCase({ inventoryRepository })

export default async function checkStockCommand(user) {
	const spinner = ora('📦 Vérification du stock...').start()

	try {
		const inventory = await checkStockUseCase.getInventoryByStore(user.storeId)
		spinner.stop()

		if (!inventory.length) {
			console.log(chalk.yellow('❗ Aucun produit en stock pour ce magasin.'))
			return
		}

		const table = new Table({
			head: [
				chalk.cyan('Produit'),
				chalk.cyan('Catégorie'),
				chalk.cyan('Prix'),
				chalk.cyan('Stock'),
			],
			style: { head: [], border: [] },
		})

		for (const item of inventory) {
			const product = item.Product
			table.push([
				product.name,
				product.category,
				product.price.toFixed(2) + ' $',
				item.stock,
			])
		}

		console.log(
			chalk.green.bold(
				`\n🛒 Stock – Magasin ${user.storeId} – ${inventory.length} produits\n`
			)
		)
		console.log(table.toString())
	} catch (err) {
		spinner.fail('❌ Échec de la consultation du stock.')
		console.error(chalk.red(err.message))
	}
}
