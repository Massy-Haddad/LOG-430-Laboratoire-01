export function makeDashboardController({ dashboardUseCase }) {
	return async function dashboardController(req, res) {
		try {
			const revenueByStore = await dashboardUseCase.getRevenueByStore()
			const stockAlerts = await dashboardUseCase.getStockAlerts({})
			const weeklyTrends = await dashboardUseCase.getWeeklyTrends()

			return res.status(200).json({
				revenueByStore,
				stockAlerts,
				weeklyTrends,
			})
		} catch (error) {
			console.error('Error generating dashboard:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}
}

export function makeGenerateSalesReportController({
	generateSalesReportUseCase,
}) {
	return async function generateSalesReportController(req, res) {
		try {
			const { from, to } = req.query
			if (!from || !to) {
				return res.status(400).json({
					error: "Missing required query parameters: 'from' and 'to'",
				})
			}

			const report = await generateSalesReportUseCase.generateReport(from, to)

			return res.status(200).json({
				startDate: from,
				endDate: to,
				summaryByStore: report.summaryByStore,
			})
		} catch (error) {
			console.error('Error generating sales report:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}
}
