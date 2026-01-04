import { checkAdmin } from '@/lib/checkAdmin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // We select all category data (*)
  // AND we count the related events using 'event(count)'
  const { data, error } = await supabase
    .from('event_category')
    .select('*, event(count)')
    .order('category_id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transformation: Supabase returns count as [{ count: 5 }]. 
  // We clean it up for the frontend to be a simple number.
  const formattedData = data.map((cat: any) => ({
    ...cat,
    event_count: cat.event?.[0]?.count || 0
  }))

  return NextResponse.json({ categories: formattedData })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.category_name) {
      return NextResponse.json({ error: 'Category Name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('event_category')
      .insert({
        category_name: body.category_name,
        description: body.description || null,
        category_image: body.category_image || null 
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, category: data }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

//remove category
export async function DELETE(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('event_category')
      .delete()
      .eq('category_id', Number(id))

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// update category details
export async function PUT(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.category_id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const updates: any = {}
    
    if (body.category_name) updates.category_name = body.category_name
    if (body.description) updates.description = body.description
    if (body.category_image) updates.category_image = body.category_image

    const { data, error } = await supabase
      .from('event_category')
      .update(updates)
      .eq('category_id', Number(body.category_id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, category: data })

  } catch (error: any) {
    console.error('Update Category Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}