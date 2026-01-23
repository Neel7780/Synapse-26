import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getEmailTransporter, senderEmail } from "@/lib/email-config";
import { acceptanceEmailTemplate, rejectionEmailTemplate } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { registration_id, event_id, status } = body;

    if (!registration_id || !event_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate status value
    if (status !== "accepted" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Verify that the coordinator owns this event
    const { data: eventData } = await supabase
      .from("event")
      .select("coordinator_email")
      .eq("event_id", event_id)
      .single();

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Case-insensitive email comparison
    const coordinatorEmail = userData.email.toLowerCase();
    const eventCoordinatorEmail = eventData.coordinator_email?.toLowerCase();

    if (eventCoordinatorEmail !== coordinatorEmail) {
      return NextResponse.json({ error: "Access denied to this event" }, { status: 403 });
    }

    // Update the coordinator_status
    const { data, error } = await supabase
      .from("event_registrations")
      .update({ coordinator_status: status })
      .eq("registration_id", registration_id)
      .eq("event_id", event_id)
      .select();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    // Fetch full registration details for email
    const { data: registrationData } = await supabase
      .from("event_registrations")
      .select("registration_id, gross_amount, registered_by_user_id")
      .eq("registration_id", registration_id)
      .single();

    // Fetch user details
    let participantEmail = "";
    let participantName = "";
    if (registrationData?.registered_by_user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, user_name")
        .eq("user_id", registrationData.registered_by_user_id)
        .single();

      if (userData) {
        participantEmail = userData.email;
        participantName = userData.user_name || "Participant";
      }
    }

    // Fetch event details
    let eventName = "Event";
    const { data: eventDetailData } = await supabase
      .from("event")
      .select("event_name")
      .eq("event_id", event_id)
      .single();

    if (eventDetailData) {
      eventName = eventDetailData.event_name;
    }

    // Fetch fee details
    let participationType = "General";
    if (registrationData?.registration_id) {
      const { data: regData } = await supabase
        .from("event_registrations")
        .select("fee:event_fee_id(participation_type)")
        .eq("registration_id", registration_id)
        .single();

      if (regData?.fee) {
        const feeData = Array.isArray(regData.fee) ? regData.fee[0] : regData.fee;
        participationType = feeData?.participation_type || "General";
      }
    }

    // Send email only if status is accepted or rejected (not pending)
    if ((status === "accepted" || status === "rejected") && participantEmail && senderEmail) {
      try {
        const transporter = getEmailTransporter();
        const amount = registrationData?.gross_amount || 0;

        let emailTemplate;

        if (status === "accepted") {
          emailTemplate = acceptanceEmailTemplate({
            participantName,
            email: participantEmail,
            eventName,
            participationType,
            registrationId: registration_id,
            amount,
          });
        } else {
          emailTemplate = rejectionEmailTemplate({
            participantName,
            email: participantEmail,
            eventName,
            participationType,
            registrationId: registration_id,
            amount,
          });
        }

        await transporter.sendMail({
          from: senderEmail,
          to: participantEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        console.log(`Email sent to ${participantEmail} for registration ${registration_id}`);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire request if email fails, just log it
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error verifying registration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
