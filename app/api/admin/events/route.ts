

// eg api call
// {
//   "event_name": "Hackathon 2025",
//   "category_id": 1,
//   "event_date": "2025-12-20T09:00:00.000Z",
//   "is_registration_open": true,
//   "is_dau_free": true,  
//   "fees": [
//     { 
//       "type": "solo", 
//       "price": 100, 
//       "min": 1, 
//       "max": 1 
//     },
//     { 
//       "type": "duet", 
//       "price": 200, 
//       "min": 2, 
//       "max": 2 
//     }
//   ]
// }


import { checkAdmin } from '@/lib/checkAdmin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .select(`
      *,
      event_category ( category_name ),
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

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // A. Create the Event
    const { data: eventData, error: eventError } = await supabase
      .from('event')
      .insert({
        event_name: body.event_name,
        category_id: body.category_id,
        event_date: body.event_date,
        event_picture: body.event_picture || null,
        rulebook: body.rulebook || null,
        description: body.description || null,
        is_registration_open: body.is_registration_open ?? true,
        is_dau_free: body.is_dau_free ?? false // <--- NEW FIELD
      })
      .select()
      .single()

    if (eventError) throw eventError

    if (body.fees && Array.isArray(body.fees) && body.fees.length > 0) {
      
      const feeInserts = body.fees.map((f: any) => ({
        participation_type: f.type, 
        price: Number(f.price),
        min_members: Number(f.min || 1),
        max_members: Number(f.max || 1)
      }))

      const { data: feeData, error: feeError } = await supabase
        .from('fee')
        .insert(feeInserts)
        .select()

      if (feeError) throw feeError

      const eventFeeLinks = feeData.map((f: any) => ({
        event_id: eventData.event_id,
        fee_id: f.fee_id
      }))

      const { error: linkError } = await supabase
        .from('event_fee')
        .insert(eventFeeLinks)

      if (linkError) throw linkError
    }

    return NextResponse.json({ success: true, event: eventData }, { status: 201 })

  } catch (error: any) {
    console.error('Create Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  if (!await checkAdmin(supabase)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { event_id, fees, ...updates } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const { data: eventData, error: eventError } = await supabase
      .from('event')
      .update(updates)
      .eq('event_id', Number(event_id))
      .select()
      .single()

    if (eventError) throw eventError

    if (fees && Array.isArray(fees)) {
      
      // 1. Find old fees linked to this event
      const { data: oldLinks } = await supabase
        .from('event_fee')
        .select('fee_id')
        .eq('event_id', Number(event_id))

      const oldFeeIds = oldLinks?.map((link: any) => link.fee_id) || []

      if (oldFeeIds.length > 0) {
        await supabase.from('fee').delete().in('fee_id', oldFeeIds)
      }

      // 3. Create NEW fees from the form data
      if (fees.length > 0) {
        const feeInserts = fees.map((f: any) => ({
          participation_type: f.type,
          price: Number(f.price),
          min_members: Number(f.min || 1),
          max_members: Number(f.max || 1)
        }))

        const { data: newFees, error: newFeeError } = await supabase
          .from('fee')
          .insert(feeInserts)
          .select()

        if (newFeeError) throw newFeeError

        const newLinks = newFees.map((f: any) => ({
          event_id: event_id,
          fee_id: f.fee_id
        }))

        await supabase.from('event_fee').insert(newLinks)
      }
    }

    return NextResponse.json({ success: true, event: eventData })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
      .from('event')
      .delete()
      .eq('event_id', Number(id))

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}