import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleCorsResponse, addCorsHeaders } from '@/lib/cors'

async function checkAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return handleCorsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const supabase = (await createClient()) as any;

    if (!(await checkAdmin(supabase))) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return addCorsHeaders(response, origin);
    }
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("searchParams") ?? "";
    const eventName = searchParams.get("filter") ?? "";
    const hasEventFilter = Boolean(eventName);

    let query = supabase.from("users").select(
      `
        user_id,
        user_name,
        email,
        phone,
        college,
        registration_date,
        team_members${hasEventFilter ? "!inner" : ""} (
        team${hasEventFilter ? "!inner" : ""} (
        event_registrations${hasEventFilter ? "!inner" : ""} (
        event${hasEventFilter ? "!inner" : ""} (
        event_name
        ))))
        `
    );

    if (search.trim() !== "") {
      query = query.or(
        `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`
      );
    }

    if (eventName) {
      query = query.eq(
        "team_members.team.event_registrations.event.event_name",
        eventName
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message || "Database query failed" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No users found matching the criteria" }, { status: 404 });
    }

    const headers = [
      "User ID",
      "User Name",
      "Email",
      "Phone",
      "College",
      "Registration Date",
      "Event Count",
      "Events",
    ];

    const csvRows = [
      headers.join(","),
      ...(data ?? []).map((user: any) => {
        const eventNames = new Set<string>();

        user.team_members?.forEach((tm: any) => {
          const registrations = tm.team?.event_registrations;

          if (Array.isArray(registrations)) {
            registrations.forEach((er: any) => {
              const eventName = er?.event?.event_name;
              if (eventName) eventNames.add(eventName);
            });
          } else {
            const eventName = registrations?.event?.event_name;
            if (eventName) eventNames.add(eventName);
          }
        });

        const eventsList = Array.from(eventNames);
        const eventCount = eventsList.length;

        return [
          user.user_id,
          `"${user.user_name || ""}"`,
          user.email || "",
          user.phone || "",
          `"${user.college || ""}"`,
          user.registration_date || "",
          eventCount,
          `"${eventsList.join("; ")}"`,
        ].join(",");
      }),
    ];

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
