import { createClient } from "@/utils/supabase/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabaseAuth = (await createClient()) as any;
    const supabaseAdmin = getSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coordinatorEmail = user.email ?? null;

    if (!coordinatorEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const eventIdParam = searchParams.get("eventId");

    if (!eventIdParam) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const eventId = parseInt(eventIdParam, 10);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Verify that the coordinator owns this event
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from("event")
      .select("event_id, event_name, coordinator_email")
      .eq("event_id", eventId)
      .single();

    if (!eventData || eventError) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventData.coordinator_email !== coordinatorEmail) {
      return NextResponse.json({ error: "Access denied to this event" }, { status: 403 });
    }

    const search = searchParams.get("searchParams") ?? "";
    const statusFilter = searchParams.get("status") as "pending" | "accepted" | "rejected" | "all" | null;

    let query = supabaseAdmin.from("event_registrations").select(
      `
      registration_id,
      transaction_id,
      payment_status,
      coordinator_status,
      registered_by_user_id,
      fee_id,
      gross_amount
      `
    ).eq("event_id", eventId);

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "pending") {
        query = query.or("coordinator_status.is.null,coordinator_status.eq.pending");
      } else if (statusFilter === "accepted" || statusFilter === "rejected") {
        query = query.eq("coordinator_status", statusFilter);
      }
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message || "Database query failed" }, { status: 500 });
    }

    // Enrich registrations with user, fee, event, and team data
    const enrichedData = await Promise.all(
      (registrations || []).map(async (reg: any) => {
        console.log(`Processing registration ${reg.registration_id}, registered_by_user_id:`, reg.registered_by_user_id);
        
        let userData: any = null;
        let feeData: any = null;
        let eventData: any = null;
        let teamMembers: any[] = [];

        // Fetch user details
        if (reg.registered_by_user_id) {
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("user_id, user_name, email, phone, college")
            .eq("user_id", reg.registered_by_user_id)
            .single();
          
          if (userError) {
            console.error(`Error fetching user for registration ${reg.registration_id}:`, userError);
            console.log(`Attempted to find user with user_id: "${reg.registered_by_user_id}"`);
          } else {
            console.log(`User data for registration ${reg.registration_id}:`, user);
          }
          userData = user;
        }

        // Fetch fee details
        if (reg.fee_id) {
          const { data: fee } = await supabaseAdmin
            .from("fee")
            .select("participation_type, price, qr_code")
            .eq("fee_id", reg.fee_id)
            .single();
          feeData = fee;
        }

        // Fetch event details
        const { data: event } = await supabaseAdmin
          .from("event")
          .select("event_name, event_category(category_name)")
          .eq("event_id", eventId)
          .single();
        eventData = event;

        // Fetch team members
        const { data: teamRow } = await supabaseAdmin
          .from("team")
          .select("team_id")
          .eq("registration_id", reg.registration_id)
          .single();

        if (teamRow?.team_id) {
          const { data: memberRows } = await supabaseAdmin
            .from("team_members")
            .select("user_id")
            .eq("team_id", teamRow.team_id);

          if (memberRows && memberRows.length > 0) {
            const membersDetailed = await Promise.all(
              memberRows.map(async (member: any) => {
                const { data: memberUser } = await supabaseAdmin
                  .from("users")
                  .select("user_id, user_name, email, phone, college")
                  .eq("user_id", member.user_id)
                  .single();
                return memberUser;
              })
            );
            teamMembers = membersDetailed.filter(Boolean);
          }
        }

        // Include the team leader (registered_by user) in team_members
        const allTeamMembers = [userData, ...teamMembers].filter(member => member && member.user_id);

        return {
          ...reg,
          users: userData,
          fee: feeData,
          event: eventData,
          team_members: allTeamMembers,
        };
      })
    );

    // Apply search filter after enrichment
    let filteredData = enrichedData;
    if (search.trim()) {
      filteredData = enrichedData.filter((reg: any) => {
        const searchLower = search.toLowerCase();
        return (
          reg.transaction_id?.toLowerCase().includes(searchLower) ||
          reg.users?.user_name?.toLowerCase().includes(searchLower) ||
          reg.users?.email?.toLowerCase().includes(searchLower) ||
          reg.users?.college?.toLowerCase().includes(searchLower)
        );
      });
    }

    const headers = [
      "Registration ID",
      "Transaction ID",
      "User Name",
      "Email",
      "Phone",
      "College",
      "Event Name",
      "Category",
      "Participation Type",
      "Group Size",
      "Team Members",
      "Team Member Emails",
      "Team Member Phones",
      "Payment Status",
      "Coordinator Status",
      "Gross Amount",
      "QR Code",
    ];

    const csvRows = [
      headers.join(","),
      ...(filteredData ?? []).map((row: any) => {
        const price = row.fee?.price ?? 0;
        const teamMembers = row.team_members ?? [];
        const groupSize = teamMembers.length;

        // Log the row data to debug
        console.log(`CSV Row for registration ${row.registration_id}:`, {
          users: row.users,
          fee: row.fee,
          event: row.event
        });

        // Get all team member details
        const teamMemberNames: string[] = [];
        const teamMemberEmails: string[] = [];
        const teamMemberPhones: string[] = [];

        teamMembers.forEach((member: any) => {
          if (member) {
            teamMemberNames.push(member.user_name || "");
            teamMemberEmails.push(member.email || "");
            teamMemberPhones.push(member.phone || "");
          }
        });

        return [
          row.registration_id || "",
          `"${row.transaction_id || ""}"`,
          `"${row.users?.user_name || ""}"`,
          row.users?.email || "",
          row.users?.phone || "",
          `"${row.users?.college || ""}"`,
          `"${row.event?.event_name || ""}"`,
          `"${row.event?.event_category?.category_name || ""}"`,
          `"${row.fee?.participation_type || ""}"`,
          groupSize,
          `"${teamMemberNames.join("; ")}"`,
          `"${teamMemberEmails.join("; ")}"`,
          `"${teamMemberPhones.join("; ")}"`,
          row.payment_status || "",
          row.coordinator_status || "",
          price,
          `"${row.fee?.qr_code || ""}"`,
        ].join(",");
      }),
    ];

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
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
