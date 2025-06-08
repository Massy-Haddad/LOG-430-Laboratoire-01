import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { makeReturnSaleUseCase } from '../../usecases/retail/returnSale.js'
import { saleRepository } from '../../infrastructure/postgres/repositories/saleRepository.js'
import { productRepository } from '../../infrastructure/postgres/repositories/productRepository.js'

const returnSaleUseCase = makeReturnSaleUseCase({
	saleRepository,
	productRepository,
})

export default async function returnSaleCommand(currentUser) {
	try {
		const spinner = ora('Chargement des ventes...').start()
		const sales = await returnSaleUseCase.getSalesByUser(currentUser.id)
		spinner.stop()

		if (sales.length === 0) {
			console.log(chalk.red('❌ Aucune vente trouvée.'))
			return
		}

		const { saleId } = await inquirer.prompt([
			{
				type: 'list',
				name: 'saleId',
				message: '🧾 Quelle vente souhaitez-vous annuler ?',
				choices: sales.map((s) => ({
					name: `#${s.id} - ${s.product.name} x ${
						s.quantity
					} = ${s.total.toFixed(2)} $`,
					value: s.id,
				})),
			},
		])

		const { confirm } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'confirm',
				message: "Confirmer l'annulation ?",
				default: true,
			},
		])

		if (!confirm) {
			console.log(chalk.red('❌ Annulation interrompue.'))
			return
		}

		const spinnerCancel = ora('📦 Annulation en cours...').start()
		await returnSaleUseCase.cancelSale(saleId)
		spinnerCancel.stop()

		console.log(chalk.green('\n✅ Vente annulée avec succès.'))
	} catch (error) {
		console.error(chalk.red(`❌ Erreur : ${error.message}`))
	}
}
