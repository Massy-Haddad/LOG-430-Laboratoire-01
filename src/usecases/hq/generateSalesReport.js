export function makeGenerateSalesReportUseCase({ salesAnalysisRepository }) {
  return {
    async generateReport(startDate, endDate) {
      return await salesAnalysisRepository.generateSalesReport(startDate, endDate);
    }
  };
}
