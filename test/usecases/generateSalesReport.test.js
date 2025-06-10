import { describe, it, expect, jest } from '@jest/globals';
import { makeGenerateSalesReportUseCase } from '../../src/usecases/hq/generateSalesReport.js';

describe('GenerateSalesReport Use Case', () => {
  const mockRepo = {
    generateSalesReport: jest.fn()
  };

  const usecase = makeGenerateSalesReportUseCase({ salesAnalysisRepository: mockRepo });

  it('devrait appeler le repository avec les bonnes dates', async () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const mockReport = { summaryByStore: [], startDate: start, endDate: end };

    mockRepo.generateSalesReport.mockResolvedValueOnce(mockReport);

    const result = await usecase.generateReport(start, end);

    expect(mockRepo.generateSalesReport).toHaveBeenCalledWith(start, end);
    expect(result).toEqual(mockReport);
  });
});
