import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all sponsors
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;

    const { data: sponsors, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('sponsor_id', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { sponsors, count: sponsors?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.tier) {
      return NextResponse.json(
        { error: 'Name and tier are required fields' },
        { status: 400 }
      );
    }

    // Validate tier is not empty string
    if (body.tier.trim() === '') {
      return NextResponse.json(
        { error: 'Tier cannot be empty' },
        { status: 400 }
      );
    }

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .insert({
        name: body.name,
        tier: body.tier,
        website_url: body.website_url || null,
        logo_url: body.logo_url || null,
        description: body.description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { sponsor, message: 'Sponsor created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}