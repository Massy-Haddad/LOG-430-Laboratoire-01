import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

import { makeSellProductUseCase } from '../../usecases/retail/sellProduct.js'
import { productRepository } from '../../infrastructure/postgres/repositories/productRepository.js'
import { saleRepository } from '../../infrastructure/postgres/repositories/saleRepository.js'

// Injection des dépendances
const sellProductUseCase = makeSellProductUseCase({
	productRepository,
	saleRepository,
})

export default async function sellProductCommand(currentUser) {
	try {
		const spinner = ora('Chargement des produits...').start()
		const products = await sellProductUseCase.getAllProducts()
		spinner.stop()

		if (products.length === 0) {
			console.log(chalk.red('❌ Aucun produit disponible.'))
			return
		}

		const { selectedIds } = await inquirer.prompt([
			{
				type: 'checkbox',
				name: 'selectedIds',
				message: '🛒 Sélectionnez les produits à vendre :',
				choices: products.map((p) => ({
					name: `${p.name} (${p.category}) - ${p.price.toFixed(2)} $ [Stock: ${
						p.stock
					}]`,
					value: p.id,
				})),
				validate: (input) =>
					input.length > 0
						? true
						: 'Veuillez sélectionner au moins un produit.',
			},
		])

		const selectedProducts = []

		for (const id of selectedIds) {
			const product = products.find((p) => p.id === id)
			const { quantity } = await inquirer.prompt([
				{
					type: 'number',
					name: 'quantity',
					message: `Quantité pour ${product.name} (stock: ${product.stock}) :`,
					validate: (val) =>
						val > 0 && val <= product.stock
							? true
							: `Quantité invalide. (1 - ${product.stock})`,
				},
			])

			selectedProducts.push({ product, quantity })
		}

		const total = selectedProducts.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0
		)

		console.log(chalk.cyan('\n🧾 Récapitulatif de la vente :'))
		selectedProducts.forEach((item) => {
			console.log(
				`- ${item.product.name} x ${item.quantity} = ${(
					item.product.price * item.quantity
				).toFixed(2)} $`
			)
		})
		console.log(chalk.yellow(`\n💰 Total : ${total.toFixed(2)} $`))

		const { confirm } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirm',
				message: 'Confirmer la vente ?',
				default: true,
			},
		])

		if (!confirm) {
			console.log(chalk.red('❌ Vente annulée.'))
			return
		}

		const spinnerSave = ora('💾 Enregistrement...').start()
		await sellProductUseCase.sellProduct(currentUser.id, selectedProducts)
		spinnerSave.stop()

		console.log(chalk.green('\n✅ Vente enregistrée avec succès.'))
	} catch (error) {
		console.error(chalk.red(`❌ Erreur : ${error.message}`))
	}
}
