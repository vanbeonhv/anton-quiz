import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasGlobalMetrics: !!globalThis?.metrics,
        hasRegistry: !!globalThis?.metrics?.registry,
        runtime: process.env.NEXT_RUNTIME,
        nodeEnv: process.env.NODE_ENV,
    });
}