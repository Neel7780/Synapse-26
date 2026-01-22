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
            payment_screenshot_url
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

        if (!check_in || !check_out) {
            return NextResponse.json(
                { error: "check_in and check_out dates are required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Create the booking
        const { data: booking, error: bookingError } = await supabase
            .from("accommodation_bookings")
            .insert({
                user_id,
                check_in,
                check_out,
                nights,
                amount,
                payment_screenshot_url: payment_screenshot_url.trim(),
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
