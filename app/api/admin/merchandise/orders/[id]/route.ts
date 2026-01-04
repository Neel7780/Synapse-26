import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: order, error } = await supabase
      .from('merchandise_orders')
      .select('*')
      .eq('order_id', Number(id))
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update order by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;
    const body = await request.json();

    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_orders')
      .select('order_id')
      .eq('order_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.items !== undefined) updateData.items = body.items;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.order_date !== undefined) updateData.order_date = body.order_date;
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method;

    const { data: order, error } = await supabase
      .from('merchandise_orders')
      .update(updateData)
      .eq('order_id', Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order, message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove an order by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_orders')
      .select('order_id')
      .eq('order_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('merchandise_orders')
      .delete()
      .eq('order_id', Number(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
