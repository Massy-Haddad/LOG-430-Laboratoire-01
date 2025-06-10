import { describe, it, expect, jest } from '@jest/globals';
import { makeReturnSaleUseCase } from '../../src/usecases/retail/returnSale.js';

describe('ReturnSale Use Case', () => {
  const mockSaleRepo = {
    findByUser: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn()
  };

  const mockInventoryRepo = {
    incrementStock: jest.fn()
  };

  const usecase = makeReturnSaleUseCase({
    saleRepository: mockSaleRepo,
    inventoryRepository: mockInventoryRepo
  });

  it('devrait retourner les ventes d’un utilisateur', async () => {
    const mockSales = [{ id: 'S1' }, { id: 'S2' }];
    mockSaleRepo.findByUser.mockResolvedValueOnce(mockSales);

    const result = await usecase.getSalesByUser('U123');
    expect(mockSaleRepo.findByUser).toHaveBeenCalledWith('U123');
    expect(result).toEqual(mockSales);
  });

  it('devrait annuler une vente existante', async () => {
    const sale = { id: 'S1', productId: 'P1', quantity: 3 };
    mockSaleRepo.findById.mockResolvedValueOnce(sale);

    await usecase.cancelSale('S1', 'StoreA');

    expect(mockSaleRepo.findById).toHaveBeenCalledWith('S1');
    expect(mockInventoryRepo.incrementStock).toHaveBeenCalledWith('StoreA', 'P1', 3);
    expect(mockSaleRepo.deleteById).toHaveBeenCalledWith('S1');
  });

  it('devrait lancer une erreur si la vente est introuvable', async () => {
    mockSaleRepo.findById.mockResolvedValueOnce(null);

    await expect(usecase.cancelSale('InvalidID', 'StoreA')).rejects.toThrow('Vente introuvable.');
  });
});
