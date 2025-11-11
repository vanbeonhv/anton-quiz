import { NextRequest, NextResponse } from 'next/server';
import { withMetrics } from '@/lib/withMetrics';

export const GET = withMetrics(async (request: NextRequest) => {
    return NextResponse.json({
        hasGlobalMetrics: !!globalThis?.metrics,
        hasRegistry: !!globalThis?.metrics?.registry,
        runtime: process.env.NEXT_RUNTIME,
        nodeEnv: process.env.NODE_ENV,
    });
})