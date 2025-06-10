import { describe, it, expect } from '@jest/globals';
import SalesReport from '../../src/domain/hq/entities/SalesReport.js';

describe('SalesReport Entity', () => {
  it('devrait construire un rapport de ventes avec les données valides', () => {
    const report = new SalesReport({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      summaryByStore: [
        {
          storeName: 'Magasin A',
          totalSales: 10000,
          topProducts: ['P1', 'P2'],
          remainingStock: { P1: 50, P2: 30 }
        }
      ]
    });

    expect(report.startDate).toEqual(new Date('2024-01-01'));
    expect(report.summaryByStore).toHaveLength(1);
    expect(report.summaryByStore[0].storeName).toBe('Magasin A');
    expect(report.summaryByStore[0].totalSales).toBe(10000);
    expect(report.summaryByStore[0].topProducts).toContain('P1');
  });

  it('devrait permettre un rapport vide sans erreur', () => {
    const report = new SalesReport({
      startDate: new Date(),
      endDate: new Date(),
      summaryByStore: []
    });

    expect(report.summaryByStore).toEqual([]);
  });
});
