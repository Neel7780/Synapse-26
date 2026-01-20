import { checkAdmin } from "@/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    
    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    // Get page views (registrations) for the specified period
    const { count: pageViews, error: viewsError } = await supabase
      .from("event_registrations")
      .select("registration_id", { count: "exact", head: true })
      .not("created_at", "is", null)
      .gte("created_at", startDate.toISOString());

    if (viewsError) {
      console.error("Error fetching page views:", viewsError);
      return NextResponse.json(
        { error: "Failed to fetch page views" },
        { status: 500 }
      );
    }

    // Calculate previous period for comparison
    const previousStartDate = new Date(today);
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    
    const { count: previousPageViews, error: prevViewsError } = await supabase
      .from("event_registrations")
      .select("registration_id", { count: "exact", head: true })
      .not("created_at", "is", null)
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString());

    if (prevViewsError) {
      console.error("Error fetching previous page views:", prevViewsError);
    }

    const currentViews = pageViews || 0;
    const previousViews = previousPageViews || 0;
    const change = previousViews > 0
      ? ((currentViews - previousViews) / previousViews * 100).toFixed(1)
      : currentViews > 0 ? "100.0" : "0.0";

    // Get daily breakdown
    const { data: dailyRegistrations } = await supabase
      .from("event_registrations")
      .select("created_at")
      .not("created_at", "is", null)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    const dailyMap: { [key: string]: number } = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyRegistrations?.forEach((reg: any) => {
      if (reg.created_at) {
        const date = new Date(reg.created_at).toLocaleDateString("en-US", { weekday: "short" });
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      }
    });

    const lastNDays = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString("en-US", { weekday: "short" });
    });

    const dailyBreakdown = lastNDays.map((day) => ({
      day,
      views: dailyMap[day] || 0,
    }));

    return NextResponse.json({
      total: currentViews,
      change: `${parseFloat(change) >= 0 ? "+" : ""}${change}%`,
      previous: previousViews,
      dailyBreakdown,
    });
  } catch (error: unknown) {
    console.error("Page views API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
