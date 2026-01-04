import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single accommodation package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;

    const { data: package_data, error } = await supabase
      .from('accommodation_type')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Accommodation package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ package: package_data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an accommodation package 
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;
    const body = await request.json();

    // First, check if package exists
    const { data: existingPackage, error: fetchError } = await supabase
      .from('accommodation_type')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: 'Accommodation package not found' },
        { status: 404 }
      );
    }

    // Validate package_name if provided
    if (body.package_name !== undefined) {
      if (!body.package_name || body.package_name.trim() === '') {
        return NextResponse.json(
          { error: 'Package name cannot be empty' },
          { status: 400 }
        );
      }
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

    // Validate dates if both are provided
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

    // Build update object - only include fields that are provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (body.package_name !== undefined) updateData.package_name = body.package_name;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_available !== undefined) updateData.is_available = body.is_available;

    const { data: package_data, error } = await supabase
      .from('accommodation_type')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { package: package_data, message: 'Accommodation package updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an accommodation package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { id } = await params;

    // First check if package exists
    const { data: existingPackage, error: fetchError } = await supabase
      .from('accommodation_type')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: 'Accommodation package not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('accommodation_type')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Accommodation package deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}