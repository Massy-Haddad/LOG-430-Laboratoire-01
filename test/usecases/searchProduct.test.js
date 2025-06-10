import { describe, it, expect, jest } from '@jest/globals';
import { makeSearchProductUseCase } from '../../src/usecases/retail/searchProduct.js';

describe('SearchProduct Use Case', () => {
  const mockRepo = {
    getAllInventoryForStore: jest.fn()
  };

  const usecase = makeSearchProductUseCase({ inventoryRepository: mockRepo });

  it('devrait chercher un produit par nom', async () => {
    const inventory = [
      { Product: { id: 1, name: 'Café', category: 'Boisson' } },
      { Product: { id: 2, name: 'Thé', category: 'Boisson' } }
    ];

    mockRepo.getAllInventoryForStore.mockResolvedValueOnce(inventory);

    const result = await usecase.searchInStore('StoreX', 'café', 'name');

    expect(mockRepo.getAllInventoryForStore).toHaveBeenCalledWith('StoreX');
    expect(result).toEqual([{ Product: { id: 1, name: 'Café', category: 'Boisson' } }]);
  });

  it('devrait chercher un produit par id exact', async () => {
    const inventory = [
      { Product: { id: 100, name: 'Lait', category: 'Frais' } },
      { Product: { id: 101, name: 'Fromage', category: 'Frais' } }
    ];

    mockRepo.getAllInventoryForStore.mockResolvedValueOnce(inventory);

    const result = await usecase.searchInStore('StoreY', '100', 'id');

    expect(result).toEqual([{ Product: { id: 100, name: 'Lait', category: 'Frais' } }]);
  });

  it('devrait chercher un produit par catégorie', async () => {
    const inventory = [
      { Product: { id: 1, name: 'Jus', category: 'Boisson' } },
      { Product: { id: 2, name: 'Chips', category: 'Snack' } }
    ];

    mockRepo.getAllInventoryForStore.mockResolvedValueOnce(inventory);

    const result = await usecase.searchInStore('StoreZ', 'boi', 'category');

    expect(result).toEqual([{ Product: { id: 1, name: 'Jus', category: 'Boisson' } }]);
  });
});
