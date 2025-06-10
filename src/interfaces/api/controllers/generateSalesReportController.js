
import { makeGenerateSalesReportUseCase } from '../../../usecases/hq/generateSalesReport.js'
import { salesAnalysisRepository } from '../../../infrastructure/postgres/repositories/salesAnalysisRepository.js'

const generateSalesReportUseCase = makeGenerateSalesReportUseCase({
  salesAnalysisRepository
})

export const generateSalesReportController = async (req, res) => {
  try {
    const { from, to } = req.query
    if (!from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters: 'from' and 'to'"
      })
    }

    const report = await generateSalesReportUseCase.generateReport(from, to)
    return res.status(200).json(report)
  } catch (error) {
    console.error('Error generating sales report:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
