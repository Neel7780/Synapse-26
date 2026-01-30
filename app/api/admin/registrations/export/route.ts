import { createClient } from "@/utils/supabase/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
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
    const supabaseAuth = (await createClient()) as any;
    const supabaseAdmin = getSupabaseServer();

    if (!(await checkAdmin(supabaseAuth))) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return addCorsHeaders(response, origin);
    }
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("searchParams") ?? "";
    const eventFilter = searchParams.get("filter");
    const paymentStatus = searchParams.get("paymentStatus") as "pending" | "done" | "failed" | null;

    let query = supabaseAdmin.from("event_registrations").select(
      `
      registration_id,
      transaction_id,
      payment_status,
      coordinator_status,
      registered_by_user_id,
      fee_id,
      event_id,
      gross_amount
      `
    );

    if (eventFilter) {
      // We'll filter by event name after fetching event data
    }

    if (paymentStatus && (paymentStatus === "pending" || paymentStatus === "done" || paymentStatus === "failed")) {
      query = query.eq("payment_status", paymentStatus);
    }

    const { data: registrations, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message || "Database query failed" }, { status: 500 });
    }

    // Enrich registrations with user, fee, event, and team data
    const enrichedData = await Promise.all(
      (registrations || []).map(async (reg: any) => {
        let userData: any = null;
        let feeData: any = null;
        let eventData: any = null;
        let teamMembers: any[] = [];

        // Fetch user details
        if (reg.registered_by_user_id) {
          const { data: user } = await supabaseAdmin
            .from("users")
            .select("user_id, user_name, email, phone, college")
            .eq("user_id", reg.registered_by_user_id)
            .single();
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
        if (reg.event_id) {
          const { data: event } = await supabaseAdmin
            .from("event")
            .select("event_name, event_category(category_name)")
            .eq("event_id", reg.event_id)
            .single();
          eventData = event;
        }

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
        // Deduplicate by user_id to avoid including leader twice
        const memberIds = new Set<string>();
        const allTeamMembers: any[] = [];
        
        // Add team leader first
        if (userData && userData.user_id) {
          memberIds.add(userData.user_id);
          allTeamMembers.push(userData);
        }
        
        // Add other team members, skipping duplicates
        teamMembers.forEach((member: any) => {
          if (member && member.user_id && !memberIds.has(member.user_id)) {
            memberIds.add(member.user_id);
            allTeamMembers.push(member);
          }
        });

        return {
          ...reg,
          users: userData,
          fee: feeData,
          event: eventData,
          team_members: allTeamMembers,
        };
      })
    );

    // Apply filters after enrichment
    let filteredData = enrichedData;
    
    if (search.trim()) {
      filteredData = filteredData.filter((reg: any) => {
        const searchLower = search.toLowerCase();
        return (
          reg.transaction_id?.toLowerCase().includes(searchLower) ||
          reg.users?.user_name?.toLowerCase().includes(searchLower) ||
          reg.users?.email?.toLowerCase().includes(searchLower) ||
          reg.users?.college?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (eventFilter) {
      filteredData = filteredData.filter((reg: any) => 
        reg.event?.event_name === eventFilter
      );
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
