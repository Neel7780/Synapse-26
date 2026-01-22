import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/checkAdmin";

// GET - Fetch a single accommodation booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert id to number for proper comparison with booking_id
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { data: booking, error } = await supabase
      .from("accommodation_bookings")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch booking" },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Get user details separately
    let user: any = {};
    if (booking.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("user_id, user_name, email, phone")
        .eq("user_id", booking.user_id)
        .single();

      if (userData) {
        user = userData;
      }
    }

    // Transform to match expected format
    const order = {
      order_id: booking.booking_id,
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      user_name: user.user_name || null,
      user_email: user.email || null,
      user_phone: user.phone || null,
      order_date: booking.created_at,
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights: booking.nights,
      amount: booking.amount,
      verification_status: booking.verification_status || "pending",
      payment_screenshot_url: booking.payment_screenshot_url,
      transaction_reference: booking.transaction_reference,
      admin_notes: booking.admin_notes,
      rejection_reason: booking.rejection_reason,
      verified_at: booking.verified_at,
      created_at: booking.created_at,
    };

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching accommodation booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update verification status of an accommodation booking (Admin verifies payment screenshot)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { data: user } = await supabase.auth.getUser();

    // Build update data
    const updateData: any = {};

    // Handle verification status changes
    if (body.verification_status) {
      updateData.verification_status = body.verification_status;

      if (body.verification_status === "verified") {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.user?.id;
        updateData.payment_status = "done"; // Mark payment as confirmed
      } else if (body.verification_status === "rejected") {
        updateData.rejection_reason = body.rejection_reason || null;
        updateData.payment_status = "failed"; // Mark payment as failed
      }
    }

    // Allow admin to add notes
    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes;
    }

    // Convert id to number for proper comparison with booking_id
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    // First check if the booking exists
    const { data: existingBooking, error: fetchError } = await supabase
      .from("accommodation_bookings")
      .select("booking_id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Perform the update
    const { data: updatedBookings, error } = await supabase
      .from("accommodation_bookings")
      .update(updateData)
      .eq("booking_id", bookingId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedBookings || updatedBookings.length === 0) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    const updatedBooking = updatedBookings[0];

    const message = body.verification_status === "verified"
      ? "Payment verified successfully. User's accommodation slot is now confirmed."
      : body.verification_status === "rejected"
        ? "Payment rejected. User will need to submit a new payment screenshot."
        : "Booking updated successfully.";

    // Transform to match expected format
    const order = {
      order_id: updatedBooking.booking_id,
      booking_id: updatedBooking.booking_id,
      ...updatedBooking,
    };

    return NextResponse.json(
      { order, message },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating accommodation booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an accommodation booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Convert id to number for proper comparison with booking_id
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("accommodation_bookings")
      .delete()
      .eq("booking_id", bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Accommodation booking deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting accommodation booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
