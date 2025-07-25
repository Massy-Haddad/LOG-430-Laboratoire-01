import { generateSalesReport } from '../../services/reportService.js'

export const generateSalesReportController = async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: 'startDate and endDate query parameters are required',
    })
  }

  try {
    const report = await generateSalesReport(startDate, endDate)

    return res.status(200).json({
      startDate,
      endDate,
      report,
    })
  } catch (error) {
    console.error('Error generating sales report:', error)
    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}
