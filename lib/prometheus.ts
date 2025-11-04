import * as client from 'prom-client';

const registry = new client.Registry();

// 1. Thu thập các metrics mặc định của Node.js (CPU, Memory, GC, v.v.)
// Giúp bạn theo dõi sức khỏe của môi trường Node.js mà Next.js đang chạy
client.collectDefaultMetrics({ 
    prefix: 'nextjs_app_', // Thêm prefix để dễ phân biệt
    register: registry,
});

// 2. Định nghĩa các metrics tùy chỉnh của bạn (ví dụ: Counter, Histogram, Gauge)
// Ví dụ: Counter để đếm tổng số lần gọi API
export const apiRequestCounter = new client.Counter({
    name: 'nextjs_api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
});

// Xuất registry để sử dụng trong endpoint /api/metrics
export { registry, client };