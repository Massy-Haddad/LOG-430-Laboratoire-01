import ora from 'ora'
import chalk from 'chalk'
import Table from 'cli-table3'

import { saleRepository } from '../../infrastructure/postgres/repositories/saleRepository.js';
import { inventoryRepository } from '../../infrastructure/postgres/repositories/inventoryRepository.js'

import { makeDashboardUseCase } from '../../usecases/hq/dashboard.js'

const dashboardUseCase = makeDashboardUseCase({
	saleRepository,
	inventoryRepository,
})

export default async function dashboardCommand() {
	const spinner = ora('📊 Chargement du tableau de bord...').start()

	try {
		const revenue = await dashboardUseCase.getRevenueByStore()
		const { lowStock, overStock } = await dashboardUseCase.getStockAlerts({})
		const trends = await dashboardUseCase.getWeeklyTrends()

		spinner.stop()

		const revTable = new Table({
			head: ['🏬 Magasin', '💰 Chiffre d’affaires'],
			style: { head: [], border: [] },
		})
		for (const entry of revenue) {
			revTable.push([entry.storeName, `${entry.total.toFixed(2)} $`])
		}

		const lowStockTable = new Table({
			head: ['🔻 Produit', 'Magasin', 'Stock'],
			style: { head: [], border: [] },
		})
		for (const item of lowStock) {
			lowStockTable.push([item.Product.name, item.Store.name, item.stock])
		}

		const overStockTable = new Table({
			head: ['🔺 Produit', 'Magasin', 'Stock'],
			style: { head: [], border: [] },
		})
		for (const item of overStock) {
			overStockTable.push([item.Product.name, item.Store.name, item.stock])
		}

		const trendTable = new Table({
			head: ['📅 Date', '🛒 Ventes totales'],
			style: { head: [], border: [] },
		})
		for (const day of trends) {
			trendTable.push([day.date, `${day.total.toFixed(2)} $`])
		}

		console.log(chalk.bold('\n📊 Chiffre d’affaires par magasin :'))
		console.log(revTable.toString())

		console.log(chalk.bold('\n⚠️ Produits en rupture de stock :'))
		console.log(lowStockTable.toString())

		console.log(chalk.bold('\n📦 Produits en surstock :'))
		console.log(overStockTable.toString())

		console.log(chalk.bold('\n📈 Tendances de ventes cette semaine :'))
		console.log(trendTable.toString())
	} catch (error) {
		spinner.fail('❌ Échec du chargement du tableau de bord.')
		console.error(error.message)
	}
}
