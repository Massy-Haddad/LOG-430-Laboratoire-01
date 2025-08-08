module.exports = {
  beforeRequest: function (req, context, ee, next) {
    if (context.vars.token) {
      req.headers['Authorization'] = `Bearer ${context.vars.token}`;
    }
    return next();
  },
  
  afterResponse: function (req, res, context, ee, next) {
    // Log successful operations
    if (res.statusCode < 400) {
      if (req.url.includes('/cart') && req.method === 'POST') {
        console.log(`🛒 Added item to cart - User: ${context.vars.username || 'anonymous'}`);
        ee.emit('customStat', 'cart_additions', 1);
      } else if (req.url.includes('/checkout')) {
        console.log(`💳 Checkout attempt - Status: ${res.statusCode}`);
        ee.emit('customStat', res.statusCode === 200 ? 'successful_checkouts' : 'failed_checkouts', 1);
      } else if (req.url.includes('/products')) {
        ee.emit('customStat', 'product_views', 1);
      }
    } else {
      console.log(`❌ ${req.method} ${req.url} - ${res.statusCode}`);
      ee.emit('customStat', 'errors_4xx_5xx', 1);
    }
    return next();
  },
  
  // Black Friday specific behavior
  setUserBehavior: function (context, ee, next) {
    const behaviors = ['casual_shopper', 'bargain_hunter', 'bulk_buyer', 'window_shopper'];
    context.vars.userType = behaviors[Math.floor(Math.random() * behaviors.length)];
    
    // Generate realistic user ID
    const userPrefixes = ['bf', 'shopper', 'deal', 'buy'];
    const prefix = userPrefixes[Math.floor(Math.random() * userPrefixes.length)];
    context.vars.username = `${prefix}${Math.floor(Math.random() * 10000)}`;
    
    console.log(`🛍️  New ${context.vars.userType}: ${context.vars.username}`);
    return next();
  }
};
