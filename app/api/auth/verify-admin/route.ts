import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
            isAdmin: true,
            email: "dev@localhost",
        });
    }

    const supabase = await createClient();

    try {
        // Use getUser() instead of deprecated getSession() for better security
        // getUser() validates the JWT on the server side
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { isAdmin: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const userEmail = user.email;
        const adminEmail = process.env.ADMIN_EMAIL;

        const isAdmin = userEmail === adminEmail;

        return NextResponse.json({
            isAdmin,
            email: userEmail,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { isAdmin: false, error: errorMessage },
            { status: 500 }
        );
    }
}
