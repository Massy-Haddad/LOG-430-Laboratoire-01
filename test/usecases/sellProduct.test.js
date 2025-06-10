import { describe, it, expect, jest } from '@jest/globals';
import { makeSellProductUseCase } from '../../src/usecases/retail/sellProduct.js';

describe('SellProduct Use Case', () => {
  const productRepository = { update: jest.fn() };
  const saleRepository = { createSale: jest.fn() };
  const inventoryRepository = { decrementStock: jest.fn() };

  const usecase = makeSellProductUseCase({
    productRepository,
    saleRepository,
    inventoryRepository,
  });

  it('devrait enregistrer une vente pour chaque produit sélectionné', async () => {
    const user = { id: 'U1', storeId: 'S1' };
    const selectedProducts = [
      { id: 'P1', quantity: 2, price: 5.0 },
      { id: 'P2', quantity: 1, price: 10.0 }
    ];

    await usecase.sellProduct(user, selectedProducts);

    expect(inventoryRepository.decrementStock).toHaveBeenCalledTimes(2);
    expect(saleRepository.createSale).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'U1',
      productId: 'P1',
      quantity: 2,
      total: 10
    }));
    expect(productRepository.update).toHaveBeenCalledWith(selectedProducts[0]);
  });
});
