import { checkAdmin } from '@/lib/checkAdmin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('concert')
    .select('*')
    .order('concert_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { concert_name, concert_date, venue, timing } = body

    // Validation
    if (!concert_name || !concert_date) {
      return NextResponse.json({ error: 'Name and Date are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('concert')
      .insert({
        concert_name,
        concert_date, 
        venue,
        timing       
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, concert_name, concert_date, venue, timing } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('concert')
      .update({
        concert_name,
        concert_date,
        venue,
        timing
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const { error } = await supabase
      .from('concert')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}