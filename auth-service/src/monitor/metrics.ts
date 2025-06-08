import { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

const register = new client.Registry();
register.setDefaultLabels({
  app: 'auth-service',
});
client.collectDefaultMetrics({ register }); // Collect default Node.js metrics


// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 500, 1000], // ms
  });

register.registerMetric(httpRequestDurationMicroseconds);


export const matricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const observeDuration = () => {
        const diff = process.hrtime(start);
        const durationInMilliseconds = diff[0] * 1e3 + diff[1] * 1e-6;
        
        // Extract route and method for lebels 
        const route = req.route ? req.route.path : 'unknown';
        const method = req.method;
        const statusCode = res.statusCode;
        
        httpRequestDurationMicroseconds.labels(method, route, statusCode.toString()).observe(durationInMilliseconds);
    };
    res.on('finish', observeDuration);
    next();
};

export const matricsEndpoint = async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    let metrics = await register.metrics();
    res.send(metrics);
};

export const testCounter = new client.Counter({
    name: 'test_counter',
    help: 'Test counter',
    });

