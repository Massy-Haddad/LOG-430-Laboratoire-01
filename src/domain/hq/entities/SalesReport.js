export default class SalesReport {
  constructor({ startDate, endDate, summaryByStore }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.summaryByStore = summaryByStore; // [{ storeName, totalSales, topProducts, remainingStock }]
  }
}
