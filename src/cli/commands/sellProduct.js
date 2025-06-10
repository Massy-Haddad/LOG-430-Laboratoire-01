import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

import { makeSellProductUseCase } from '../../usecases/retail/sellProduct.js'
import { productRepository } from '../../infrastructure/postgres/repositories/productRepository.js'
import { saleRepository } from '../../infrastructure/postgres/repositories/saleRepository.js'
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js'

// Injection des dépendances
const sellProductUseCase = makeSellProductUseCase({
	productRepository,
	saleRepository,
	inventoryRepository,
})

export default async function sellProductCommand(user) {
	const products = await productRepository.getAll()

	const inventory = await Promise.all(
		products.map(async (product) => {
			const stock = await inventoryRepository.getStock(user.storeId, product.id)
			return { ...product, stock }
		})
	)

	const productChoices = inventory
		.filter((p) => p.stock !== null)
		.map((product) => ({
			name: `${product.name} (${product.category}) - ${product.price.toFixed(
				2
			)} $ [Stock: ${product.stock}]`,
			value: product,
		}))

	const { selectedProducts } = await inquirer.prompt([
		{
			type: 'checkbox',
			name: 'selectedProducts',
			message: '🛒 Sélectionnez les produits à vendre :',
			choices: productChoices,
			validate: (input) =>
				input.length > 0 || 'Veuillez sélectionner au moins un produit.',
		},
	])

	for (const product of selectedProducts) {
		const { quantity } = await inquirer.prompt([
			{
				type: 'number',
				name: 'quantity',
				message: `Quantité pour ${product.name} (stock: ${product.stock}) :`,
				validate: (input) =>
					(input > 0 && input <= product.stock) ||
					`Veuillez entrer une quantité entre 1 et ${product.stock}`,
			},
		])
		product.quantity = quantity
	}

	const total = selectedProducts.reduce(
		(sum, p) => sum + p.price * p.quantity,
		0
	)

	console.log('🧾 Récapitulatif de la vente :')
	selectedProducts.forEach((p) => {
		console.log(
			`- ${p.name} x ${p.quantity} = ${(p.price * p.quantity).toFixed(2)} $`
		)
	})
	console.log(`
💰 Total : ${total.toFixed(2)} $`)

	const { confirm } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirm',
			message: '✔ Confirmer la vente ?',
		},
	])

	if (!confirm) return

	const spinner = ora('💾 Enregistrement...').start()

	try {
		await sellProductUseCase.sellProduct(user, selectedProducts)
		spinner.succeed('✅ Vente enregistrée avec succès !')
	} catch (error) {
		spinner.fail(`❌ Erreur : ${error.message}`)
	}
}
