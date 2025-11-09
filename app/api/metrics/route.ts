import { NextResponse } from 'next/server';
import { registry } from '@/lib/prometheus';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fallback nếu globalThis.metrics chưa được init
        const metricsRegistry = globalThis?.metrics?.registry || registry;
        
        if (!metricsRegistry) {
            console.error('Metrics registry not initialized');
            return NextResponse.json(
                { error: 'Metrics not available' }, 
                { status: 503 }
            );
        }

        const metrics = await metricsRegistry.metrics();
        
        console.log('Metrics length:', metrics?.length || 0);
        
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': metricsRegistry.contentType,
            },
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}