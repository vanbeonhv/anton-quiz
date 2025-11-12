import { NextRequest, NextResponse } from 'next/server';

type Handler = (request: NextRequest, context: any) => Promise<NextResponse>;

export function withMetrics(handler: Handler, routePattern?: string) {
	return async (request: NextRequest, context: any) => {
		const start = Date.now();
		const method = request.method;
		const route = routePattern || request.nextUrl.pathname;

		try {
			const response = await handler(request, context);
			const duration = (Date.now() - start) / 1000; // Convert to seconds
			const statusCode = response.status.toString();

			// Record metrics
			globalThis.metrics?.httpRequestDuration.labels(method, route, statusCode).observe(duration);
			globalThis.metrics?.httpRequestTotal.labels(method, route, statusCode).inc();

			if (response.status >= 400) {
				globalThis.metrics?.httpRequestErrors.labels(method, route, statusCode).inc();
			}

			return response;
		} catch (error) {
			const duration = (Date.now() - start) / 1000;
			const statusCode = '500';

			globalThis.metrics?.httpRequestDuration.labels(method, route, statusCode).observe(duration);
			globalThis.metrics?.httpRequestTotal.labels(method, route, statusCode).inc();
			globalThis.metrics?.httpRequestErrors.labels(method, route, statusCode).inc();

			throw error;
		}
	};
}