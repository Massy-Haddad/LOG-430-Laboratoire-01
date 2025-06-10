// test/usecases/authenticateUser.test.js
import { describe, it, expect, jest } from '@jest/globals';

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: jest.fn()
  }
}));

const bcrypt = (await import('bcrypt')).default;
const { makeAuthenticateUserUseCase } = await import('../../src/usecases/shared/authenticateUser.js');
const { default: User } = await import('../../src/domain/shared/entities/User.js');

describe('AuthenticateUser Use Case', () => {
  const mockRepo = { findByUsername: jest.fn() };
  const usecase = makeAuthenticateUserUseCase({ userRepository: mockRepo });

  it('devrait authentifier un utilisateur valide', async () => {
    const userRecord = {
      id: 'U1',
      username: 'admin',
      role: 'manager',
      storeId: 'S1',
      password: 'hash'
    };

    mockRepo.findByUsername.mockResolvedValueOnce(userRecord);

    bcrypt.compare.mockResolvedValueOnce(true);

    const user = await usecase.login('admin', 'motdepasse');

    expect(user).toBeInstanceOf(User);
    expect(user.username).toBe('admin');
    expect(user.role).toBe('manager');
  });

  it('devrait échouer si l’utilisateur n’existe pas', async () => {
    mockRepo.findByUsername.mockResolvedValueOnce(null);

    await expect(usecase.login('ghost', 'secret')).rejects.toThrow('Utilisateur introuvable.');
  });

  it('devrait échouer si le mot de passe est invalide', async () => {
    const userRecord = {
      id: 'U1',
      username: 'admin',
      role: 'manager',
      storeId: 'S1',
      password: 'hash'
    };

    mockRepo.findByUsername.mockResolvedValueOnce(userRecord);
    bcrypt.compare.mockResolvedValueOnce(false);

    await expect(usecase.login('admin', 'wrong')).rejects.toThrow('Mot de passe incorrect.');
  });
});
