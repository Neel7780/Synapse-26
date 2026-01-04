import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: product, error } = await supabase
      .from('merchandise_management')
      .select('*')
      .eq('product_id', Number(id))
      .single();

    if (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;
    const body = await request.json();

    // Check existence
    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_management')
      .select('product_id')
      .eq('product_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.product_name !== undefined) updateData.product_name = body.product_name;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.available_sizes !== undefined) updateData.available_sizes = Array.isArray(body.available_sizes) ? body.available_sizes : null;
    if (body.product_image !== undefined) updateData.product_image = body.product_image;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_available !== undefined) updateData.is_available = !!body.is_available;

    const { data: product, error } = await supabase
      .from('merchandise_management')
      .update(updateData)
      .eq('product_id', Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product, message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_management')
      .select('product_id')
      .eq('product_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('merchandise_management')
      .delete()
      .eq('product_id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
