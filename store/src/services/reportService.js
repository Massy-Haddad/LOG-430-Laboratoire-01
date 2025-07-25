import { salesAnalysisRepository } from '../infrastructure/postgres/repositories/salesAnalysisRepository.js'

export async function generateSalesReport(startDate, endDate) {
  return await salesAnalysisRepository.generateSalesReport(startDate, endDate)
}
