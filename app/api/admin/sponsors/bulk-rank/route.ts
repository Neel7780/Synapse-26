import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/checkAdmin';

// PATCH - Bulk update sponsor ranks
export async function PATCH(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = await createClient() as any;

        // Check admin authentication
        const isAdmin = await checkAdmin(supabase);
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { ranks } = body;

        // Validate input
        if (!Array.isArray(ranks)) {
            return NextResponse.json(
                { error: "Invalid input: ranks must be an array" },
                { status: 400 }
            );
        }

        // Update each sponsor's rank
        const updates = ranks.map(async (item: { sponsor_id: number; rank: number | null }) => {
            const { sponsor_id, rank } = item;

            // Validate rank value
            if (rank !== null && (typeof rank !== 'number' || rank <= 0)) {
                throw new Error(`Invalid rank value for sponsor ${sponsor_id}`);
            }

            const { error } = await supabase
                .from('sponsors')
                .update({ rank })
                .eq('sponsor_id', sponsor_id);

            if (error) {
                throw new Error(`Failed to update sponsor ${sponsor_id}: ${error.message}`);
            }
        });

        await Promise.all(updates);

        return NextResponse.json(
            { message: "Ranks updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
