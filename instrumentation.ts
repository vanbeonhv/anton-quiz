import type { Counter, Gauge, Histogram, Registry } from "prom-client";

declare global {
    var metrics: {
        registry: Registry;
        httpRequestDuration: Histogram<string>;
        httpRequestTotal: Counter<string>;
        httpRequestErrors: Counter<string>;
        systemInfo: Gauge<string>;
    };
}

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log("instrumentation initializing...")

        // Auto-run database migrations in production
        if (process.env.NODE_ENV === 'production' && process.env.AUTO_MIGRATE !== 'false') {
            console.log('🔄 Running database migrations...')
            try {
                const { execSync } = await import('child_process')
                execSync('npx prisma migrate deploy', { 
                    stdio: 'inherit',
                    env: process.env 
                })
                console.log('✅ Database migrations completed successfully')
            } catch (error) {
                console.error('❌ Migration failed:', error)
                // Don't exit - let app start anyway for debugging
                console.warn('⚠️  Application starting despite migration failure')
            }
        }

        const { collectDefaultMetrics, Registry, Counter, Histogram, Gauge } = await import('prom-client');
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

        const systemInfo = new Gauge({
            name: 'system_info',
            help: 'System information (CPU cores, total memory)',
            labelNames: ['type'],
            registers: [prometheusRegistry],
        });

         // Set system metrics
        const os = await import('os');
        const cpuCores = os.cpus().length;
        const totalMemory = os.totalmem();
        systemInfo.labels('cpu_cores').set(cpuCores);
        systemInfo.labels('total_memory_bytes').set(totalMemory);
        

        // Store everything globally
        globalThis.metrics = {
            registry: prometheusRegistry,
            httpRequestDuration,
            httpRequestTotal,
            httpRequestErrors,
            systemInfo
        }

        console.log("Instrumentation completed");
    }
}