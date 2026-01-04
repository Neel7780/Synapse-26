import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const allowedAdmins = ['synapse@gmail.com'];
  return !!(user.email && allowedAdmins.includes(user.email));
}

// GET - Fetch all merchandise products
export async function GET() {
  try {
    const supabase = await createClient() as any;

    const { data: products, error } = await supabase
      .from('merchandise_management')
      .select('*')
      .order('product_id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products, count: products?.length || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient() as any;

    if (!await checkAdmin(supabase)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.product_name || body.price === undefined) {
      return NextResponse.json(
        { error: 'product_name and price are required' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('merchandise_management')
      .insert({
        product_name: body.product_name,
        price: body.price,
        available_sizes: Array.isArray(body.available_sizes) ? body.available_sizes : null,
        product_image: body.product_image || null,
        description: body.description || null,
        is_available: body.is_available !== undefined ? !!body.is_available : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product, message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
