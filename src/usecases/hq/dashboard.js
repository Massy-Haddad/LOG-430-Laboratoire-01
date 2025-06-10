export function makeDashboardUseCase({ saleRepository, inventoryRepository }) {
  return {
    async getRevenueByStore() {
      return await saleRepository.getRevenueGroupedByStore();
    },

    async getStockAlerts({ thresholdLow = 5, thresholdHigh = 100 }) {
      const allStocks = await inventoryRepository.getAll();
      const lowStock = allStocks.filter(item => item.stock <= thresholdLow);
      const overStock = allStocks.filter(item => item.stock >= thresholdHigh);
      return { lowStock, overStock };
    },

    async getWeeklyTrends() {
      return await saleRepository.getDailySalesForWeek();
    }
  };
}
