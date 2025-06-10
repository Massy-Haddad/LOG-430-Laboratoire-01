import { describe, it, expect } from '@jest/globals';
import Sale from '../../src/domain/retail/entities/Sale.js';

describe('Sale Entity', () => {
  it('devrait construire une vente valide', () => {
    const now = new Date();
    const sale = new Sale({
      id: 'S001',
      userId: 'U123',
      productId: 'P456',
      quantity: 3,
      total: 30.00,
      date: now
    });

    expect(sale.id).toBe('S001');
    expect(sale.quantity).toBe(3);
    expect(sale.total).toBeCloseTo(30.00);
    expect(sale.date).toBe(now);
  });

  it('devrait accepter un total égal à zéro (ex: retour ou promo totale)', () => {
    const sale = new Sale({
      id: 'S002',
      userId: 'U123',
      productId: 'P789',
      quantity: 1,
      total: 0.00,
      date: new Date()
    });

    expect(sale.total).toBe(0);
  });
});
