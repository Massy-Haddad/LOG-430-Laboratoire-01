import { describe, it, expect } from '@jest/globals';
import Store from '../../src/domain/shared/entities/Store.js';

describe('Store Entity', () => {
  it('devrait construire un magasin avec id, nom et adresse', () => {
    const store = new Store('S001', 'Magasin Central', '123 rue Principale');

    expect(store.id).toBe('S001');
    expect(store.name).toBe('Magasin Central');
    expect(store.address).toBe('123 rue Principale');
  });

  it('devrait permettre des champs vides si non validés en logique', () => {
    const store = new Store('', '', '');

    expect(store.id).toBe('');
    expect(store.name).toBe('');
    expect(store.address).toBe('');
  });
});
