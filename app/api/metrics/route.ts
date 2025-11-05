import { NextResponse } from 'next/server';
import { registry } from '@/lib/prometheus';

export async function GET() {
    try {
        const metrics = await globalThis?.metrics?.registry?.metrics();
        console.log(globalThis.metrics)
        
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': registry.contentType,
            },
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}