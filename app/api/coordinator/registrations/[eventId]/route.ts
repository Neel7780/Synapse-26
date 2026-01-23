import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coordinator email
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (!userData?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const params = await context.params;
    const { eventId: eventIdParam } = params;

    const eventId = parseInt(eventIdParam, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    // Verify that the coordinator owns this event and fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from("event")
      .select("event_id, event_name, event_date, description, coordinator_email")
      .eq("event_id", eventId)
      .single();

    if (!eventData || eventError) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventData.coordinator_email !== userData.email) {
      return NextResponse.json({ error: "Access denied to this event" }, { status: 403 });
    }

    // Fetch registrations for this event with user details and fee info
    const { data: registrations, error: regError } = await supabase
      .from("event_registrations")
      .select(`
        registration_id,
        event_id,
        fee_id,
        registered_by_user_id,
        registration_date,
        payment_status,
        coordinator_status,
        gross_amount,
        transaction_id,
        payment_screenshot_url,
        created_at
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (regError) {
      console.error("Error fetching registrations:", regError);
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    // Debug: Log all registrations with fee_id
    console.log("Registrations fetched:", registrations?.map(r => ({ id: r.registration_id, fee_id: r.fee_id })));

    // Fetch user details, fee info, and team members for each registration
    const enrichedRegistrations = await Promise.all(
      (registrations || []).map(async (reg: any) => {
        let userData: any = { user_id: "", user_name: null, email: "", phone: null, college: null };
        let feeData = { participation_type: "General", min_members: 0, max_members: 0, price: 0 };
        let teamMembers: Array<{ user_id: string; user_name: string | null; email: string; phone: string | null; college: string | null }> = [];

        // Fetch user details
        if (reg.registered_by_user_id) {
          const { data: user } = await supabase
            .from("users")
            .select("user_id, user_name, email, phone, college")
            .eq("user_id", reg.registered_by_user_id)
            .single();

          if (user) {
            userData = user;
          }
        }

        // Fetch fee details from the fee table (not event_fee)
        if (reg.fee_id) {
          console.log(`Attempting to fetch fee_id ${reg.fee_id} for registration ${reg.registration_id}`);
          
          // Fetch from the fee table which has participation_type
          const { data: feeRaw, error: feeError } = await supabase
            .from("fee")
            .select("*")
            .eq("fee_id", reg.fee_id)
            .single();

          if (feeError) {
            console.error(`Error fetching fee for registration ${reg.registration_id}:`, feeError);
          } else if (feeRaw) {
            console.log(`Raw fee data for fee_id ${reg.fee_id}:`, JSON.stringify(feeRaw));
            
            // Extract participation_type from fee table
            feeData = {
              participation_type: (feeRaw as any).participation_type || "General",
              min_members: (feeRaw as any).min_members || 0,
              max_members: (feeRaw as any).max_members || 0,
              price: (feeRaw as any).price || 0,
            };
            console.log(`Processed fee data:`, feeData);
          }
        } else {
          console.warn(`Registration ${reg.registration_id} has no fee_id`);
        }

        // If there could be multiple members (duet/group), fetch team and members
        try {
          const { data: teamRow, error: teamError } = await supabase
            .from("team")
            .select("team_id, registration_id")
            .eq("registration_id", reg.registration_id)
            .single();

          if (teamError && teamError.code !== "PGRST116") { // ignore 'No rows' error
            console.error(`Error fetching team for registration ${reg.registration_id}:`, teamError);
          }

          if (teamRow?.team_id) {
            const { data: memberRows, error: membersError } = await supabase
              .from("team_members")
              .select("user_id")
              .eq("team_id", teamRow.team_id);

            if (membersError) {
              console.error(`Error fetching team members for team ${teamRow.team_id}:`, membersError);
            } else if (memberRows && memberRows.length > 0) {
              // Fetch user details for each member
              const membersDetailed = await Promise.all(
                memberRows.map(async (m) => {
                  const { data: memberUser } = await supabase
                    .from("users")
                    .select("user_id, user_name, email, phone, college")
                    .eq("user_id", m.user_id)
                    .single();
                  return (
                    memberUser || { user_id: m.user_id, user_name: null, email: "", phone: null, college: null }
                  );
                })
              );
              teamMembers = membersDetailed;
            }
          }
        } catch (e) {
          console.error(`Error while assembling team info for registration ${reg.registration_id}:`, e);
        }

        return {
          ...reg,
          users: userData,
          fee: feeData,
          team_members: teamMembers,
        };
      })
    );

    return NextResponse.json({
      event: {
        event_id: eventData.event_id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        description: eventData.description,
      },
      registrations: enrichedRegistrations || [],
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
