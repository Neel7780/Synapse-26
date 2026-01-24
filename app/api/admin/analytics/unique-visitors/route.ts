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
    
    // Get unique visitors (unique users who registered) for the specified period
    const { count: uniqueVisitors, error: visitorsError } = await supabase
      .from("users")
      .select("user_id", { count: "exact", head: true })
      .not("registration_date", "is", null)
      .gte("registration_date", startDate.toISOString());

    if (visitorsError) {
      console.error("Error fetching unique visitors:", visitorsError);
      return NextResponse.json(
        { error: "Failed to fetch unique visitors" },
        { status: 500 }
      );
    }

    // Calculate previous period for comparison
    const previousStartDate = new Date(today);
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    
    const { count: previousVisitors, error: prevVisitorsError } = await supabase
      .from("users")
      .select("user_id", { count: "exact", head: true })
      .not("registration_date", "is", null)
      .gte("registration_date", previousStartDate.toISOString())
      .lt("registration_date", startDate.toISOString());

    if (prevVisitorsError) {
      console.error("Error fetching previous unique visitors:", prevVisitorsError);
    }

    const currentVisitors = uniqueVisitors || 0;
    const previousVisitorsCount = previousVisitors || 0;
    const change = previousVisitorsCount > 0
      ? ((currentVisitors - previousVisitorsCount) / previousVisitorsCount * 100).toFixed(1)
      : currentVisitors > 0 ? "100.0" : "0.0";

    // Get daily breakdown of unique visitors
    const { data: dailyUsers } = await supabase
      .from("users")
      .select("registration_date")
      .not("registration_date", "is", null)
      .gte("registration_date", startDate.toISOString())
      .order("registration_date", { ascending: true });

    const dailyMap: { [key: string]: number } = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyUsers?.forEach((user: any) => {
      if (user.registration_date) {
        const date = new Date(user.registration_date).toLocaleDateString("en-US", { weekday: "short" });
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
      visitors: dailyMap[day] || 0,
    }));

    return NextResponse.json({
      total: currentVisitors,
      change: `${parseFloat(change) >= 0 ? "+" : ""}${change}%`,
      previous: previousVisitorsCount,
      dailyBreakdown,
    });
  } catch (error: unknown) {
    console.error("Unique visitors API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
