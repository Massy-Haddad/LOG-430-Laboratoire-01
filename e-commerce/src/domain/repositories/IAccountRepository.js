/**
 * Account Repository Interface
 * Defines the contract for account data operations
 */
export class IAccountRepository {
  /**
   * Create a new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Account>} Created account
   */
  async create(accountData) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find account by ID
   * @param {string} id - Account ID
   * @returns {Promise<Account|null>} Account or null
   */
  async findById(id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find account by email
   * @param {string} email - Account email
   * @returns {Promise<Account|null>} Account or null
   */
  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Account>} Updated account
   */
  async update(id, updateData) {
    throw new Error('Method must be implemented');
  }

  /**
   * Delete account (soft delete)
   * @param {string} id - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find all accounts with pagination
   * @param {Object} options - Query options
   * @returns {Promise<{accounts: Account[], total: number}>} Paginated results
   */
  async findAll(options = {}) {
    throw new Error('Method must be implemented');
  }
}
