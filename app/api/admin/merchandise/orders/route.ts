import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const allowedAdmins = ['synapse@gmail.com'];
  return !!(user.email && allowedAdmins.includes(user.email));
}

// GET - Fetch all orders (admin only)
export async function GET() {
  try {
    const supabase = await createClient() as any;

    if (!await checkAdmin(supabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from('merchandise_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders, count: orders?.length || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new order (admin or public depending on flow)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as any;

    // If orders are admin-created only, uncomment:
    // if (!await checkAdmin(supabase)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await request.json();

    if (!body.customer_id || body.items === undefined || body.amount === undefined || !body.payment_status || !body.payment_method) {
      return NextResponse.json(
        { error: 'customer_id, items, amount, payment_status, payment_method are required' },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from('merchandise_orders')
      .insert({
        customer_id: body.customer_id,
        items: body.items,
        amount: body.amount,
        order_date: body.order_date || new Date().toISOString(),
        payment_status: body.payment_status,
        payment_method: body.payment_method,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order, message: 'Order created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
