import { describe, it, expect, jest } from '@jest/globals';
import { makeReplenishStockUseCase } from '../../src/usecases/retail/replenishStock.js';

describe('ReplenishStock Use Case', () => {
  const mockRepo = {
    getAllInventoryForStore: jest.fn(),
    getInventoryByStoreAndProduct: jest.fn(),
    transferStock: jest.fn()
  };

  const usecase = makeReplenishStockUseCase({ inventoryRepository: mockRepo });

  it('devrait retourner les produits en-dessous du seuil', async () => {
    mockRepo.getAllInventoryForStore.mockResolvedValueOnce([
      { id: 'P1', stock: 2 },
      { id: 'P2', stock: 10 },
      { id: 'P3', stock: 0 }
    ]);

    const result = await usecase.getLocalStockBelowThreshold('store-1', 5);
    expect(mockRepo.getAllInventoryForStore).toHaveBeenCalledWith('store-1');
    expect(result).toEqual([
      { id: 'P1', stock: 2 },
      { id: 'P3', stock: 0 }
    ]);
  });

  it('devrait récupérer le stock logistique pour un produit', async () => {
    const mockStock = { id: 'P99', stock: 50 };
    mockRepo.getInventoryByStoreAndProduct.mockResolvedValueOnce(mockStock);

    const result = await usecase.getLogisticStockForProduct('P99');
    expect(mockRepo.getInventoryByStoreAndProduct).toHaveBeenCalledWith(0, 'P99');
    expect(result).toBe(mockStock);
  });

  it('devrait appeler le transfert de stock du centre logistique', async () => {
    await usecase.transferFromLogisticCenter('store-5', 'P3', 20);
    expect(mockRepo.transferStock).toHaveBeenCalledWith(0, 'store-5', 'P3', 20);
  });
});
