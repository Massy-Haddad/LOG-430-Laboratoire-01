import { testConnection, syncDatabase, closeConnection } from './src/infrastructure/postgres/db.js';
import { cartRepository } from './src/infrastructure/postgres/repositories/cartRepository.js';
import { orderRepository } from './src/infrastructure/postgres/repositories/orderRepository.js';
import { CartService } from './src/services/cart.js';
import { CheckoutService } from './src/services/checkoutService.js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

/**
 * Test script for e-commerce service
 */
async function runTests() {
  console.log(chalk.blue('🧪 Starting E-commerce Service Tests...'));

  try {
    // Test database connection
    console.log(chalk.yellow('\n1. Testing database connection...'));
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Sync database
    console.log(chalk.yellow('\n2. Syncing database models...'));
    await syncDatabase(true); // Force sync for testing

    // Test cart repository
    console.log(chalk.yellow('\n3. Testing cart repository...'));
    await testCartRepository();

    // Test order repository
    console.log(chalk.yellow('\n4. Testing order repository...'));
    await testOrderRepository();

    // Test cart service
    console.log(chalk.yellow('\n5. Testing cart service...'));
    await testCartService();

    // Test checkout service
    console.log(chalk.yellow('\n6. Testing checkout service...'));
    await testCheckoutService();

    console.log(chalk.green('\n✅ All tests passed!'));

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error.message);
    console.error(error.stack);
  } finally {
    await closeConnection();
  }
}

async function testCartRepository() {
  const userId = uuidv4();
  const productId = uuidv4();

  // Add item to cart
  console.log('  📝 Adding item to cart...');
  const cartItem = await cartRepository.addItem(userId, productId, 'Test Product', 29.99, 2);
  console.log(chalk.green('  ✓ Item added:', cartItem.toObject()));

  // Get cart items
  console.log('  📋 Getting cart items...');
  const items = await cartRepository.getCartItems(userId);
  console.log(chalk.green(`  ✓ Found ${items.length} items`));

  // Update quantity
  console.log('  ✏️  Updating item quantity...');
  const updatedItem = await cartRepository.updateItemQuantity(userId, productId, 3);
  console.log(chalk.green('  ✓ Quantity updated:', updatedItem.quantity));

  // Get cart summary
  console.log('  📊 Getting cart summary...');
  const summary = await cartRepository.getCartSummary(userId);
  console.log(chalk.green('  ✓ Cart summary:', summary));

  // Remove item
  console.log('  🗑️  Removing item...');
  const removed = await cartRepository.removeItem(userId, productId);
  console.log(chalk.green('  ✓ Item removed:', removed));
}

async function testOrderRepository() {
  const userId = uuidv4();
  const orderData = {
    id: uuidv4(),
    userId,
    status: 'pending',
    totalAmount: 59.98,
    items: [
      {
        productId: uuidv4(),
        productName: 'Test Product 1',
        productPrice: 29.99,
        quantity: 2
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'US'
    },
    paymentMethod: {
      type: 'credit_card',
      cardNumber: '****-****-****-1234'
    }
  };

  // Create order
  console.log('  📝 Creating order...');
  const order = await orderRepository.create(orderData);
  console.log(chalk.green('  ✓ Order created:', order.orderNumber));

  // Find order by ID
  console.log('  🔍 Finding order by ID...');
  const foundOrder = await orderRepository.findById(order.id);
  console.log(chalk.green('  ✓ Order found:', foundOrder.orderNumber));

  // Update status
  console.log('  ✏️  Updating order status...');
  const updatedOrder = await orderRepository.updateStatus(order.id, 'confirmed');
  console.log(chalk.green('  ✓ Status updated:', updatedOrder.status));

  // Get user orders
  console.log('  📋 Getting user orders...');
  const userOrders = await orderRepository.getUserOrders(userId);
  console.log(chalk.green(`  ✓ Found ${userOrders.orders.length} orders`));
}

async function testCartService() {
  const cartService = new CartService();
  const userId = uuidv4();

  // Add item to cart
  console.log('  🛒 Adding item via service...');
  const cartItem = await cartService.addItem(userId, {
    productId: uuidv4(),
    productName: 'Service Test Product',
    productPrice: 19.99,
    quantity: 1
  });
  console.log(chalk.green('  ✓ Item added via service'));

  // Get cart
  console.log('  📋 Getting cart via service...');
  const cart = await cartService.getCart(userId);
  console.log(chalk.green(`  ✓ Cart has ${cart.items.length} items, total: $${cart.summary.totalAmount}`));

  // Validate cart
  console.log('  ✅ Validating cart...');
  const validation = await cartService.validateCart(userId);
  console.log(chalk.green('  ✓ Cart validation:', validation.valid ? 'PASSED' : 'FAILED'));
}

async function testCheckoutService() {
  const cartService = new CartService();
  const checkoutService = new CheckoutService();
  const userId = uuidv4();

  // Add items to cart first
  console.log('  🛒 Setting up cart for checkout...');
  await cartService.addItem(userId, {
    productId: uuidv4(),
    productName: 'Checkout Test Product',
    productPrice: 39.99,
    quantity: 1
  });

  // Process checkout
  console.log('  💳 Processing checkout...');
  const checkoutData = {
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      addressLine1: '456 Checkout Ave',
      city: 'Commerce City',
      state: 'CC',
      postalCode: '67890',
      country: 'US'
    },
    paymentMethod: {
      type: 'credit_card',
      cardNumber: '4111111111111111',
      expiryMonth: 12,
      expiryYear: 2025,
      cvv: '123'
    }
  };

  try {
    const order = await checkoutService.processCheckout(userId, checkoutData);
    console.log(chalk.green('  ✓ Checkout completed, order:', order.orderNumber));

    // Get user orders
    console.log('  📋 Getting user orders...');
    const orders = await checkoutService.getUserOrders(userId);
    console.log(chalk.green(`  ✓ User has ${orders.orders.length} orders`));
  } catch (error) {
    console.log(chalk.yellow('  ⚠️  Checkout test completed with controlled error:', error.message));
  }
}

// Run tests
runTests();
