import { Registry } from "prom-client";

declare global {
    var metrics: {
        registry: Registry
    }
}

export async function register() {
    console.log(process.env.NEXT_RUNTIME)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log("instrumentation...")

        const { collectDefaultMetrics, Registry } = await import('prom-client');
        const prometheusRegistry = new Registry();

        collectDefaultMetrics({
            register: prometheusRegistry
        });

        globalThis.metrics = {
            registry: prometheusRegistry
        }
    }
}