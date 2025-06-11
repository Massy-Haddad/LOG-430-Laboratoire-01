
import { makeDashboardUseCase } from '../../../usecases/hq/dashboard.js'
import { saleRepository } from '../../../infrastructure/postgres/repositories/saleRepository.js'
import { inventoryRepository } from '../../../infrastructure/postgres/repositories/inventoryRepository.js'

const dashboardUseCase = makeDashboardUseCase({
  saleRepository,
  inventoryRepository
})

export const dashboardController = async (req, res) => {
  try {
    const revenueByStore = await dashboardUseCase.getRevenueByStore()
    const stockAlerts = await dashboardUseCase.getStockAlerts({})
    const weeklyTrends = await dashboardUseCase.getWeeklyTrends()

    return res.status(200).json({
      revenueByStore,
      stockAlerts,
      weeklyTrends
    })
  } catch (error) {
    console.error('Error generating dashboard:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
