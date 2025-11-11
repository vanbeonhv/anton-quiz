import { Counter, Histogram, Registry } from "prom-client";

declare global {
    var metrics: {
        registry: Registry,
        httpRequestDuration: Histogram<string>;
        httpRequestTotal: Counter<string>;
        httpRequestErrors: Counter<string>;
    }
}

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log("instrumentation initializing...")

        const { collectDefaultMetrics, Registry, Counter, Histogram } = await import('prom-client');
        const prometheusRegistry = new Registry();

        collectDefaultMetrics({
            register: prometheusRegistry
        });

        // Create custom metrics
        const httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10],
            registers: [prometheusRegistry],
        });

        const httpRequestTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [prometheusRegistry],
        });

        const httpRequestErrors = new Counter({
            name: 'http_request_errors_total',
            help: 'Total number of HTTP request errors',
            labelNames: ['method', 'route', 'status_code'],
            registers: [prometheusRegistry],
        });

        // Store everything globally
        globalThis.metrics = {
            registry: prometheusRegistry,
            httpRequestDuration,
            httpRequestTotal,
            httpRequestErrors,
        }

        console.log("Instrumentation completed");
    }
}