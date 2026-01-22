import { NextResponse } from "next/server";

/**
 * Health check endpoint for Docker, Kubernetes, and load balancers
 * GET /api/health
 * 
 * Returns:
 * - 200: Service is healthy
 * - 503: Service is unhealthy
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      checks: {
        memory: getMemoryStatus(),
        responseTime: 0, // Will be calculated
      },
    };

    // Calculate response time
    healthData.checks.responseTime = Date.now() - startTime;

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

/**
 * Get memory usage status
 */
function getMemoryStatus() {
  const used = process.memoryUsage();
  return {
    heapUsed: formatBytes(used.heapUsed),
    heapTotal: formatBytes(used.heapTotal),
    rss: formatBytes(used.rss),
    external: formatBytes(used.external),
  };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}
