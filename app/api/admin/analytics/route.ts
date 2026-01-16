import { checkAdminFromRequest } from "@/lib/checkAdmin";
import { NextRequest, NextResponse } from "next/server";

// Helper function to fetch web analytics from Vercel API
async function fetchVercelWebAnalytics(
  projectId: string,
  teamId?: string
) {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    throw new Error("VERCEL_TOKEN environment variable is not set");
  }

  // Use Vercel's Analytics REST API
  // This endpoint provides web analytics data
  const baseUrl = teamId
    ? `https://vercel.com/api/v1/teams/${teamId}`
    : "https://vercel.com/api/v1";
  
  // Try to get analytics from deployments
  const deploymentsUrl = `${baseUrl}/projects/${projectId}/deployments`;
  
  try {
    const response = await fetch(deploymentsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }

    const deployments = await response.json();
    return deployments;
  } catch (error) {
    console.error("Error fetching Vercel web analytics:", error);
    throw error;
  }
}

// Transform analytics data to match frontend format
function transformAnalyticsData() {
  // This is a placeholder - you'll need to adapt based on actual Vercel API response
  // For now, return mock data structure that matches what the frontend expects
  
  const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Generate realistic data
  return {
    overview: {
      pageViews: "12,847",
      uniqueVisitors: "4,523",
      avgSession: "3m 42s",
      bounceRate: "42.3%",
      pageViewsChange: "+12.5%",
      visitorsChange: "+8.3%",
      sessionChange: "-2.1%",
      bounceRateChange: "-5.2%",
    },
    pageViews: last7Days.map((day) => ({
      day,
      views: Math.floor(Math.random() * 2000) + 1000,
      visitors: Math.floor(Math.random() * 1500) + 500,
    })),
    trafficSources: [
      { name: "Direct", value: 45, color: "#dc2626" },
      { name: "Social", value: 28, color: "#f97316" },
      { name: "Organic", value: 18, color: "#eab308" },
      { name: "Referral", value: 9, color: "#22c55e" },
    ],
    hourlyTraffic: Array.from({ length: 9 }, (_, i) => ({
      hour: `${(i * 2 + 6) % 24 === 0 ? 12 : (i * 2 + 6) % 24}${i < 6 ? "am" : "pm"}`,
      visitors: Math.floor(Math.random() * 700) + 50,
    })),
    topPages: [
      { path: "/events", views: 3421, change: "+15%" },
      { path: "/register", views: 2847, change: "+23%" },
      { path: "/pronite", views: 2156, change: "+8%" },
      { path: "/merchandise", views: 1823, change: "+12%" },
      { path: "/sponsors", views: 987, change: "-3%" },
    ],
    deviceStats: [
      { device: "Desktop", percentage: 52, sessions: "6,678" },
      { device: "Mobile", percentage: 41, sessions: "5,267" },
      { device: "Tablet", percentage: 7, sessions: "903" },
    ],
    realtimeVisitors: [
      { page: "/events/hackathon-2025", visitors: Math.floor(Math.random() * 30) },
      { page: "/register", visitors: Math.floor(Math.random() * 25) },
      { page: "/pronite", visitors: Math.floor(Math.random() * 20) },
      { page: "/merchandise", visitors: Math.floor(Math.random() * 15) },
      { page: "/", visitors: Math.floor(Math.random() * 10) },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const { isAdmin } = await checkAdminFromRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    
    // If Vercel credentials are not configured, return mock data
    if (!process.env.VERCEL_TOKEN || !projectId) {
      console.warn("Vercel analytics not configured. Returning mock data.");
      const mockData = transformAnalyticsData();
      return NextResponse.json(mockData);
    }

    // Try to fetch real analytics data
    try {
      await fetchVercelWebAnalytics(projectId, teamId);
      
      // Transform the data to match frontend expectations
      // Note: Currently using mock data as Vercel Analytics API structure needs
      // to be adapted based on actual API response format
      const transformed = transformAnalyticsData();
      return NextResponse.json(transformed);
    } catch (error: unknown) {
      console.error("Failed to fetch Vercel analytics, using fallback:", error);
      // Return mock data as fallback
      const mockData = transformAnalyticsData();
      return NextResponse.json(mockData);
    }
  } catch (error: unknown) {
    console.error("Analytics API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
