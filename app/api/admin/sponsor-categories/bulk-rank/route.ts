import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/checkAdmin';

// PATCH - Bulk update category ranks
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

        // Update each category's rank
        const updates = ranks.map(async (item: { category_id: number; rank: number | null }) => {
            const { category_id, rank } = item;

            // Validate rank value
            if (rank !== null && (typeof rank !== 'number' || rank <= 0)) {
                throw new Error(`Invalid rank value for category ${category_id}`);
            }

            const { error } = await supabase
                .from('sponsor_category')
                .update({ rank })
                .eq('sponsor_category_id', category_id);

            if (error) {
                throw new Error(`Failed to update category ${category_id}: ${error.message}`);
            }
        });

        await Promise.all(updates);

        return NextResponse.json(
            { message: "Category ranks updated successfully" },
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
