import { describe, it, expect } from '@jest/globals';
import Product from '../../src/domain/retail/entities/Product.js';

describe('Product Entity', () => {
  it('devrait construire un produit valide', () => {
    const product = new Product({
      id: 'P001',
      name: 'Bouteille d\'eau',
      category: 'Boissons',
      price: 1.5,
      stock: 100,
    });
    expect(product.name).toBe('Bouteille d\'eau');
    expect(product.stock).toBe(100);
  });

  it('devrait vérifier si le stock est suffisant', () => {
    const product = new Product({ id: 'P002', name: 'Soda', category: 'Boissons', price: 2.0, stock: 10 });
    expect(product.isInStock(5)).toBe(true);
    expect(product.isInStock(15)).toBe(false);
  });

  it('devrait réduire le stock si quantité suffisante', () => {
    const product = new Product({ id: 'P003', name: 'Jus', category: 'Boissons', price: 2.5, stock: 20 });
    product.reduceStock(5);
    expect(product.stock).toBe(15);
  });

  it('devrait lancer une erreur si le stock est insuffisant', () => {
    const product = new Product({ id: 'P004', name: 'Eau gazeuse', category: 'Boissons', price: 1.0, stock: 5 });
    expect(() => product.reduceStock(10)).toThrow('Stock insuffisant');
  });
});
