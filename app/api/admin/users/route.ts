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

    const getUserIdsForEventIds = async (eventIds: number[]) => {
      const { data: registrations, error: regError } = await adminSupabase
        .from("event_registrations")
        .select("registration_id, registered_by_user_id")
        .in("event_id", eventIds);

      if (regError) {
        console.error("Registration lookup error:", regError);
        return { error: "Failed to resolve registrations", ids: [] as string[] };
      }

      const registrationIds = (registrations ?? []).map((row: any) => row.registration_id).filter(Boolean);
      const leaderIds = (registrations ?? []).map((row: any) => row.registered_by_user_id).filter(Boolean);

      let memberIds: string[] = [];
      if (registrationIds.length > 0) {
        const { data: teams, error: teamError } = await adminSupabase
          .from("team")
          .select("team_id")
          .in("registration_id", registrationIds);

        if (teamError) {
          console.error("Team lookup error:", teamError);
          return { error: "Failed to resolve teams", ids: [] as string[] };
        }

        const teamIds = (teams ?? []).map((row: any) => row.team_id).filter(Boolean);
        if (teamIds.length > 0) {
          const { data: members, error: memberError } = await adminSupabase
            .from("team_members")
            .select("user_id")
            .in("team_id", teamIds);

          if (memberError) {
            console.error("Team members lookup error:", memberError);
            return { error: "Failed to resolve team members", ids: [] as string[] };
          }

          memberIds = (members ?? []).map((row: any) => row.user_id).filter(Boolean);
        }
      }

      return { error: null, ids: Array.from(new Set([...(leaderIds ?? []), ...memberIds])) };
    };

    let filteredUserIds: string[] | null = null;
    if (eventName) {
      const { data: eventRows, error: eventError } = await adminSupabase
        .from("event")
        .select("event_id")
        .eq("event_name", eventName);

      if (eventError) {
        console.error("Event lookup error:", eventError);
        return NextResponse.json({ error: "Failed to resolve event filter" }, { status: 500 });
      }

      const eventIds = (eventRows ?? []).map((row: any) => row.event_id).filter(Boolean);
      if (eventIds.length === 0) {
        return NextResponse.json({ total: 0, page, limit, users: [] });
      }

      const { error: idsError, ids } = await getUserIdsForEventIds(eventIds);
      if (idsError) {
        return NextResponse.json({ error: idsError }, { status: 500 });
      }

      filteredUserIds = ids;
      if (filteredUserIds.length === 0) {
        return NextResponse.json({ total: 0, page, limit, users: [] });
      }
    }

    let searchEventUserIds: string[] = [];
    if (search.trim() !== "") {
      const { data: searchEventRows, error: searchEventError } = await adminSupabase
        .from("event")
        .select("event_id")
        .ilike("event_name", `%${search}%`);

      if (searchEventError) {
        console.error("Event search error:", searchEventError);
        return NextResponse.json({ error: "Failed to resolve search events" }, { status: 500 });
      }

      const searchEventIds = (searchEventRows ?? []).map((row: any) => row.event_id).filter(Boolean);
      if (searchEventIds.length > 0) {
        const { error: idsError, ids } = await getUserIdsForEventIds(searchEventIds);
        if (idsError) {
          return NextResponse.json({ error: idsError }, { status: 500 });
        }
        searchEventUserIds = ids;
      }
    }

    let countQuery = adminSupabase
      .from("users")
      .select("user_id", { count: "exact", head: true });

    if (filteredUserIds) {
      countQuery = countQuery.in("user_id", filteredUserIds);
    }

    if (search.trim() !== "") {
      const searchIds = searchEventUserIds
        .map((id) => `"${id}"`)
        .join(",");
      const searchOr = searchIds.length > 0
        ? `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%,user_id.in.(${searchIds})`
        : `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`;
      countQuery = countQuery.or(searchOr);
    }

    const { count: totalCount } = await countQuery;

    let query = adminSupabase.from("users").select(
      `
        user_id,
        user_name,
        email,
        phone,
        college,
        registration_date,
        team_members (
        team (
        event_registrations (
        registration_id,
        event (
        event_name
        ))))
        `
    );

    if (filteredUserIds) {
      query = query.in("user_id", filteredUserIds);
    }

    if (search.trim() !== "") {
      const searchIds = searchEventUserIds
        .map((id) => `"${id}"`)
        .join(",");
      const searchOr = searchIds.length > 0
        ? `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%,user_id.in.(${searchIds})`
        : `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`;
      query = query.or(searchOr);
    }

    const { data, error } = await query.range(from, to);

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
      total: totalCount ?? 0,
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
