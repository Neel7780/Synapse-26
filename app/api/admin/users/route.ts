import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { checkAdmin } from "@/lib/checkAdmin";
import { NextRequest, NextResponse } from "next/server";
import { handleCorsResponse, addCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return handleCorsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const supabase = (await createClient()) as any;

    if (!(await checkAdmin(supabase as Parameters<typeof checkAdmin>[0]))) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return addCorsHeaders(response, origin);
    }
    
    // Use admin client for data fetching to bypass RLS
    const adminSupabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const search = searchParams.get("searchParams") ?? "";
    const eventName = searchParams.get("filter") ?? "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const hasEventFilter = Boolean(eventName);

    // When no event filter, use a simple count for accurate total (complex join can cause edge cases)
    let totalCount: number | null = null;
    if (!hasEventFilter) {
      const { count: simpleCount } = await adminSupabase
        .from("users")
        .select("user_id", { count: "exact", head: true });
      totalCount = simpleCount;
    }

    let query = adminSupabase.from("users").select(
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
        registration_id,
        event${hasEventFilter ? "!inner" : ""} (
        event_name
        ))))
        `,
      { count: "exact" }
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

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    const users =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.map((user: any) => {
        const eventNames = new Set<string>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const eventCount = eventNames.size;

        return {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.email,
          phone: user.phone,
          college: user.college,
          registration_date: user.registration_date,
          event_count: eventCount,
          events: Array.from(eventNames),
        };
      }) ?? [];

    return NextResponse.json({
      total: totalCount ?? count ?? 0,
      page,
      limit,
      users,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
