import inquirer from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'
import Table from 'cli-table3'
import {
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	format,
} from 'date-fns'

import { salesAnalysisRepository } from '../../infrastructure/postgres/repositories/salesAnalysisRepository.js'
import { makeGenerateSalesReportUseCase } from '../../usecases/hq/generateSalesReport.js'

const generateSalesReportUseCase = makeGenerateSalesReportUseCase({
	salesAnalysisRepository,
})

function getPeriodRange(choice) {
	const today = new Date()

	switch (choice) {
		case 'week':
			return {
				startDate: format(
					startOfWeek(today, { weekStartsOn: 1 }),
					'yyyy-MM-dd'
				),
				endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
			}
		case 'month':
			return {
				startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
				endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
			}
		case 'year':
			return {
				startDate: format(startOfYear(today), 'yyyy-MM-dd'),
				endDate: format(endOfYear(today), 'yyyy-MM-dd'),
			}
		default:
			return null
	}
}

export default async function generateReportCommand() {
	const { period } = await inquirer.prompt([
		{
			type: 'list',
			name: 'period',
			message: '📅 Pour quelle période générer le rapport ?',
			choices: [
				{ name: '📆 Cette semaine', value: 'week' },
				{ name: '📅 Ce mois', value: 'month' },
				{ name: '📈 Cette année', value: 'year' },
				{ name: '🔎 Choisir une plage personnalisée', value: 'custom' },
			],
		},
	])

	let startDate, endDate

	if (period === 'custom') {
		const input = await inquirer.prompt([
			{
				type: 'input',
				name: 'startDate',
				message: '📅 Date de début (YYYY-MM-DD) :',
				validate: (input) =>
					/^\d{4}-\d{2}-\d{2}$/.test(input) || 'Format invalide.',
			},
			{
				type: 'input',
				name: 'endDate',
				message: '📅 Date de fin (YYYY-MM-DD) :',
				validate: (input) =>
					/^\d{4}-\d{2}-\d{2}$/.test(input) || 'Format invalide.',
			},
		])
		startDate = input.startDate
		endDate = input.endDate
	} else {
		const range = getPeriodRange(period)
		startDate = range.startDate
		endDate = range.endDate
	}

	const spinner = ora('📊 Génération du rapport...').start()

	try {
		const report = await generateSalesReportUseCase.generateReport(
			startDate,
			endDate
		)
		spinner.succeed(`✅ Rapport du ${startDate} au ${endDate} :
`)

		for (const store of report.summaryByStore) {
			const table = new Table({
				colWidths: [20, 20, 20, 20],
				style: { head: [], border: [] },
				wordWrap: true,
			})

			table.push([
				{
					colSpan: 4,
					content: chalk.blue.bold(`🏪 ${store.storeName}`),
					hAlign: 'center',
				},
			])

			if (store.totalSales === 0) {
				table.push([
					{
						colSpan: 4,
						content: chalk.yellow(
							'Aucune vente enregistrée pour cette période.'
						),
						hAlign: 'center',
					},
				])
			} else {
				table.push([
					chalk.cyan('Produit'),
					chalk.cyan('Quantité vendue'),
					chalk.cyan('Prix unitaire'),
					chalk.cyan('Total produit'),
				])

				for (const product of store.topProducts) {
					table.push([
						product.name,
						product.quantity,
						product.price.toFixed(2) + ' $',
						(product.price * product.quantity).toFixed(2) + ' $',
					])
				}

				table.push([
					{
						colSpan: 4,
						content: chalk.green.bold(
							`Total des ventes : ${store.totalSales.toFixed(2)} $`
						),
						hAlign: 'center',
					},
				])
			}

			console.log(table.toString())
			console.log()
		}
	} catch (error) {
		spinner.fail('❌ Échec de la génération du rapport.')
		console.error(chalk.red(error.message))
	}
}
