import { describe, it, expect, jest } from '@jest/globals';
import { makeCheckStockUseCase } from '../../src/usecases/retail/checkStock.js';

describe('CheckStock Use Case', () => {
  const mockRepo = {
    getAllInventoryForStore: jest.fn()
  };

  const usecase = makeCheckStockUseCase({ inventoryRepository: mockRepo });

  it('devrait obtenir l’inventaire d’un magasin donné', async () => {
    mockRepo.getAllInventoryForStore.mockResolvedValueOnce([{ id: 'P1', stock: 10 }]);

    const result = await usecase.getInventoryByStore('store-123');
    expect(mockRepo.getAllInventoryForStore).toHaveBeenCalledWith('store-123');
    expect(result).toEqual([{ id: 'P1', stock: 10 }]);
  });

  it('devrait obtenir l’inventaire du centre logistique (storeId = 0)', async () => {
    mockRepo.getAllInventoryForStore.mockResolvedValueOnce([{ id: 'P99', stock: 999 }]);

    const result = await usecase.getInventoryFromLogisticCenter();
    expect(mockRepo.getAllInventoryForStore).toHaveBeenCalledWith(0);
    expect(result).toEqual([{ id: 'P99', stock: 999 }]);
  });
});
