import promClient from 'prom-client';

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new promClient.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Durée des requêtes HTTP en secondes',
	labelNames: ['method', 'route', 'code'],
	buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
})

export const metricsMiddleware = (req, res, next) => {
	const end = httpRequestDurationMicroseconds.startTimer()
	res.on('finish', () => {
		console.log('Recording metric:', {
			method: req.method,
			route: req.route?.path,
			originalUrl: req.originalUrl,
			url: req.url,
			code: res.statusCode,
		})
		end({
			method: req.method,
			route: req.route?.path ?? req.originalUrl ?? req.url ?? 'unknown',
			code: res.statusCode,
		})
	})
	next()
}

export const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
};
