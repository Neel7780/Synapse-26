import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, userAgent } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Get visitor identifier from headers (anonymized)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
    
    // Create anonymous visitor hash (don't store actual IP)
    const today = new Date().toISOString().split("T")[0];
    const visitorHash = Buffer.from(`${ip}-${today}-${userAgent || ""}`).toString("base64").substring(0, 32);

    // Detect device type from user agent
    const ua = userAgent?.toLowerCase() || "";
    let deviceType = "desktop";
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      deviceType = "mobile";
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      deviceType = "tablet";
    }

    // Insert page view
    const { error } = await supabase.from("page_views").insert({
      path,
      referrer: referrer || null,
      visitor_hash: visitorHash,
      device_type: deviceType,
      user_agent: userAgent?.substring(0, 500) || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // If table doesn't exist, return success anyway (graceful degradation)
      if (error.code === "42P01") {
        console.warn("page_views table does not exist. Run the migration to create it.");
        return NextResponse.json({ success: true, warning: "Table not configured" });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking page view:", error);
    // Don't fail the request - tracking should be non-blocking
    return NextResponse.json({ success: true });
  }
}

// Also support GET for simple tracking via image/beacon
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";
  
  // Create a mock request body
  const mockRequest = {
    json: async () => ({
      path,
      referrer: searchParams.get("ref"),
      userAgent: request.headers.get("user-agent"),
    }),
    headers: request.headers,
  } as NextRequest;

  return POST(mockRequest);
}
