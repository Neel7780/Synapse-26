import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all accommodation packages
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;

    const { data: packages, error } = await supabase
      .from('accommodation_type')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { packages, count: packages?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new accommodation package
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const body = await request.json();

    // Validate required fields - only package_name is required (id is auto-generated)
    if (!body.package_name) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      );
    }

    // Validate package_name is not empty
    if (body.package_name.trim() === '') {
      return NextResponse.json(
        { error: 'Package name cannot be empty' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (body.price !== undefined && body.price !== null) {
      const price = Number(body.price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);

      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }

      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }

      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const { data: package_data, error } = await supabase
      .from('accommodation_type')
      .insert({
        package_name: body.package_name,
        price: body.price !== undefined ? body.price : null,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        description: body.description || null,
        is_available: body.is_available !== undefined ? body.is_available : null,
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
      { package: package_data, message: 'Accommodation package created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}