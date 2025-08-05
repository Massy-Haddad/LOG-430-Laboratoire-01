import promClient from 'prom-client';

// Create a registry for metrics
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections'
});

// Business metrics
const cartOperations = new promClient.Counter({
  name: 'cart_operations_total',
  help: 'Total number of cart operations',
  labelNames: ['operation', 'status']
});

const orderOperations = new promClient.Counter({
  name: 'order_operations_total',
  help: 'Total number of order operations',
  labelNames: ['operation', 'status']
});

const checkoutDuration = new promClient.Histogram({
  name: 'checkout_duration_seconds',
  help: 'Duration of checkout process in seconds',
  labelNames: ['status'],
  buckets: [1, 2, 5, 10, 30, 60]
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(cartOperations);
register.registerMetric(orderOperations);
register.registerMetric(checkoutDuration);

/**
 * Metrics middleware
 */
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Clean up route for metrics (remove IDs and query params)
  const route = req.route ? req.route.path : req.path;
  const cleanRoute = route.replace(/:[^/]+/g, ':id').split('?')[0];
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    httpRequestDuration
      .labels(req.method, cleanRoute, statusCode)
      .observe(duration);
      
    httpRequestTotal
      .labels(req.method, cleanRoute, statusCode)
      .inc();
    
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

/**
 * Cart operation metrics
 */
export const recordCartOperation = (operation, status = 'success') => {
  cartOperations.labels(operation, status).inc();
};

/**
 * Order operation metrics
 */
export const recordOrderOperation = (operation, status = 'success') => {
  orderOperations.labels(operation, status).inc();
};

/**
 * Checkout duration metrics
 */
export const recordCheckoutDuration = (duration, status = 'success') => {
  checkoutDuration.labels(status).observe(duration);
};

/**
 * Metrics endpoint handler
 */
export const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_ERROR',
        message: 'Unable to generate metrics'
      }
    });
  }
};

/**
 * Health check handler
 */
export const healthCheckHandler = (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
    },
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(health);
};

export { register };
