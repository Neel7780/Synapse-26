import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin(supabase: any) {

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Replace with your actual admin emails
  const allowedAdmins = ['admin@yourcollege.edu', 'organizer@gmail.com']
  
  if (user.email && allowedAdmins.includes(user.email)) {
    return true
  }
  return false
}

// not gated as it's for public event listing
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .select(`
      *,
      event_category ( category_id, category_name ),
      event_fee (
        fee ( fee_id, participation_type, price, min_members, max_members )
      )
    `)
    .order('event_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // gated endpoint 
  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.event_name || !body.event_date || !body.category_id) {
      return NextResponse.json({ error: 'Missing Name, Date, or Category' }, { status: 400 })
    }

    // Image Handling Note:
    // this API expects a 'string' URL.
    // If using Cloudinary: Frontend sends "https://res.cloudinary.com/..."
    // If using Public Folder: Frontend sends "/assets/events/my-image.jpg"
    // We just save whatever string is passed.
    
    const { data, error } = await supabase
      .from('event')
      .insert({
        event_name: body.event_name,
        category_id: Number(body.category_id), // Ensure it's a number
        event_date: body.event_date,           // ISO Date String
        event_picture: body.event_picture || null, 
        rulebook: body.rulebook || null,
        description: body.description || null,
        is_registration_open: true             // Default to Open
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, event: data }, { status: 201 })

  } catch (error: any) {
    console.error('Create Event Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// update event details or toggle registration
export async function PUT(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { event_id, ...updates } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // This handles the toggle switch (is_registration_open)
    // AND full edits (name, date, etc.) depending on what you send.
    const { data, error } = await supabase
      .from('event')
      .update(updates)
      .eq('event_id', Number(event_id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, event: data })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// remove event
export async function DELETE(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    // Get ID from URL query params (e.g. ?id=123)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('event')
      .delete()
      .eq('event_id', Number(id))

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}