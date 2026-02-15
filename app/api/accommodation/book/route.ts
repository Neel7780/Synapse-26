import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * POST /api/accommodation/book
 * Creates an accommodation booking with payment screenshot
 */
export async function POST(request: NextRequest) {
    try {
        const {
            user_id,
            check_in,
            check_out,
            nights,
            amount,
            payment_screenshot_url,
            transaction_reference
        } = await request.json();

        // Validate required fields
        if (!user_id) {
            return NextResponse.json(
                { error: "user_id is required" },
                { status: 400 }
            );
        }

        if (!nights || !amount) {
            return NextResponse.json(
                { error: "nights and amount are required" },
                { status: 400 }
            );
        }

        if (!payment_screenshot_url || !payment_screenshot_url.trim()) {
            return NextResponse.json(
                { error: "Payment screenshot URL is required" },
                { status: 400 }
            );
        }

        if (!transaction_reference || !transaction_reference.trim()) {
            return NextResponse.json(
                { error: "Transaction ID is required" },
                { status: 400 }
            );
        }

        if (!check_in || !check_out) {
            return NextResponse.json(
                { error: "check_in and check_out dates are required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Validate dates against accommodation_type for this night count
        const { data: accomType, error: accomTypeError } = await supabase
            .from("accommodation_type")
            .select("start_date, end_date, price")
            .eq("is_available", true)
            .ilike("package_name", `%${nights} Night%`)
            .maybeSingle();

        if (accomTypeError) {
            console.error("Error fetching accommodation type:", accomTypeError);
        }

        if (accomType && accomType.start_date && accomType.end_date) {
            const checkInDate = new Date(check_in + "T00:00:00");
            const checkOutDate = new Date(check_out + "T00:00:00");
            const pkgStartDate = new Date(accomType.start_date + "T00:00:00");
            // Package end_date is the last night; valid checkout is end_date + 1 day
            const pkgCheckoutLimit = new Date(new Date(accomType.end_date + "T00:00:00").getTime() + 86400000);

            if (checkInDate < pkgStartDate || checkOutDate > pkgCheckoutLimit) {
                return NextResponse.json(
                    { error: `Invalid dates. Check-in must be on or after ${accomType.start_date} and check-out must be on or before ${accomType.end_date} (next morning).` },
                    { status: 400 }
                );
            }
        }

        // Create the booking
        const { data: booking, error: bookingError } = await supabase
            .from("accommodation_bookings")
            .insert({
                user_id,
                check_in,
                check_out,
                nights,
                amount,
                payment_screenshot_url: payment_screenshot_url || null,
                transaction_reference: transaction_reference.trim(),
                payment_status: "pending",
                created_at: new Date().toISOString(),
            })
            .select("booking_id")
            .single();

        if (bookingError) {
            console.error("Error creating booking:", bookingError);
            return NextResponse.json(
                { error: "Failed to create booking: " + bookingError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            booking_id: booking.booking_id,
            message: "Accommodation booking submitted successfully! Your payment is pending verification."
        });
    } catch (error: unknown) {
        console.error("Error in accommodation book:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
