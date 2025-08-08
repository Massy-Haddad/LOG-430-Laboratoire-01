import promClient from 'prom-client';

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// HTTP request counter
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// HTTP request duration histogram
const httpRequestDurationMicroseconds = new promClient.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Durée des requêtes HTTP en secondes',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
})

// HTTP active connections gauge
const httpActiveConnections = new promClient.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

export const metricsMiddleware = (req, res, next) => {
	// Increment active connections
	httpActiveConnections.inc();
	
	const end = httpRequestDurationMicroseconds.startTimer()
	res.on('finish', () => {
		const route = req.route?.path ?? req.originalUrl ?? req.url ?? 'unknown';
		
		// Record metrics
		httpRequestsTotal.inc({
			method: req.method,
			route: route,
			status_code: res.statusCode
		});
		
		end({
			method: req.method,
			route: route,
			status_code: res.statusCode,
		});
		
		// Decrement active connections
		httpActiveConnections.dec();
		
		console.log('Recording metric:', {
			method: req.method,
			route: route,
			originalUrl: req.originalUrl,
			url: req.url,
			status_code: res.statusCode,
		})
	})
	next()
}

export const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};
