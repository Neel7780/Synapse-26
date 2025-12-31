import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single sponsor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('sponsor_id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sponsor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a sponsor 
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;
    const body = await request.json();

    // First, check if sponsor exists
    const { data: existingSponsor, error: fetchError } = await supabase
      .from('sponsors')
      .select('*')
      .eq('sponsor_id', id)
      .single();

    if (fetchError || !existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    // Validate tier is not empty if provided
    if (body.tier !== undefined && body.tier.trim() === '') {
      return NextResponse.json(
        { error: 'Tier cannot be empty' },
        { status: 400 }
      );
    }

    // Build update object - only include fields that are provided
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tier !== undefined) updateData.tier = body.tier;
    if (body.website_url !== undefined) updateData.website_url = body.website_url;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.description !== undefined) updateData.description = body.description;

    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .update(updateData)
      .eq('sponsor_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { sponsor, message: 'Sponsor updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;

    // First check if sponsor exists
    const { data: existingSponsor, error: fetchError } = await supabase
      .from('sponsors')
      .select('sponsor_id')
      .eq('sponsor_id', id)
      .single();

    if (fetchError || !existingSponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('sponsor_id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Sponsor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}