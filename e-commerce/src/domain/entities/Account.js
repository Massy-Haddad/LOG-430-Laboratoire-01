/**
 * Account Entity
 * Represents a user account in the e-commerce system
 */
export class Account {
  constructor({
    id,
    email,
    firstName,
    lastName,
    hashedPassword,
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.hashedPassword = hashedPassword;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Get full name of the account holder
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Get account display information (without sensitive data)
   * @returns {object} Public account data
   */
  toPublicObject() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Validate account data
   * @returns {boolean} True if valid
   */
  isValid() {
    return !!(
      this.email &&
      this.firstName &&
      this.lastName &&
      this.hashedPassword
    );
  }
}
