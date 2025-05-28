import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';

import { makeCheckStockUseCase } from '../../usecases/checkStock.js'
import { productRepository } from '../../infrastructure/repositories/productRepository.js'

const checkStockUseCase = makeCheckStockUseCase({ productRepository })

export default async function checkStockCommand() {
	const spinner = ora('📦 Chargement du stock...').start()

	try {
		const products = await checkStockUseCase.getAllProducts()
		spinner.stop()

		if (products.length === 0) {
			console.log(chalk.yellow('⚠️ Aucun produit en stock.'))
		} else {
			console.log(
				chalk.green(`📦 ${products.length} produit(s) trouvé(s) en stock :\n`)
			)
			displayProductsTable(products)
		}
	} catch (error) {
		spinner.stop()
		console.error(
			chalk.red(`❌ Erreur lors de la consultation du stock : ${error.message}`)
		)
	}
}

function displayProductsTable(products) {
  const table = new Table({
    head: [
      chalk.blue('ID'),
      chalk.blue('Nom'),
      chalk.blue('Catégorie'),
      chalk.blue('Prix'),
      chalk.blue('Stock')
    ],
    colWidths: [5, 20, 20, 10, 10]
  });

  products.forEach(product => {
    table.push([
      product.id,
      product.name,
      product.category,
      `${product.price.toFixed(2)} $`,
      product.stock
    ]);
  });

  console.log(table.toString());
}
