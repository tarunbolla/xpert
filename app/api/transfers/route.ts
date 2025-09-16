import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      groupId, 
      fromUserEmail, 
      fromUserName, 
      toUserEmail, 
      toUserName, 
      amount, 
      description 
    } = body

    if (!groupId || !fromUserEmail || !fromUserName || !toUserEmail || !toUserName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (fromUserEmail === toUserEmail) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Verify both users are members of the group
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_email')
      .eq('group_id', groupId)
      .in('user_email', [fromUserEmail, toUserEmail])

    if (membersError) {
      console.error('Error checking group members:', membersError)
      return NextResponse.json({ error: 'Failed to verify group membership' }, { status: 500 })
    }

    if (!members || members.length !== 2) {
      return NextResponse.json({ error: 'Both users must be members of the group' }, { status: 400 })
    }

    // Create transfer
    const { data: transfer, error: transferError } = await supabase
      .from('transfers')
      .insert({
        group_id: groupId,
        from_user_email: fromUserEmail,
        from_user_name: fromUserName,
        to_user_email: toUserEmail,
        to_user_name: toUserName,
        amount: amount,
        description: description || null,
      })
      .select()
      .single()

    if (transferError) {
      console.error('Error creating transfer:', transferError)
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'transfer',
        entity_id: transfer.id,
        action: 'CREATE',
        changes: {
          created_transfer: {
            from_user: fromUserEmail,
            to_user: toUserEmail,
            amount: amount,
            description: description,
          },
        },
        user_email: fromUserEmail,
        user_name: fromUserName,
      })

    return NextResponse.json({ transfer })
  } catch (error) {
    console.error('Error in POST /api/transfers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      transferId,
      fromUserEmail, 
      fromUserName, 
      toUserEmail, 
      toUserName, 
      amount, 
      description 
    } = body

    if (!transferId || !fromUserEmail || !fromUserName || !toUserEmail || !toUserName || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (fromUserEmail === toUserEmail) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    // Get current transfer for audit log
    const { data: currentTransfer } = await supabase
      .from('transfers')
      .select('*')
      .eq('id', transferId)
      .single()

    if (!currentTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }

    // Verify both users are members of the group
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_email')
      .eq('group_id', currentTransfer.group_id)
      .in('user_email', [fromUserEmail, toUserEmail])

    if (membersError) {
      console.error('Error checking group members:', membersError)
      return NextResponse.json({ error: 'Failed to verify group membership' }, { status: 500 })
    }

    if (!members || members.length !== 2) {
      return NextResponse.json({ error: 'Both users must be members of the group' }, { status: 400 })
    }

    // Update transfer
    const { data: transfer, error: transferError } = await supabase
      .from('transfers')
      .update({
        from_user_email: fromUserEmail,
        from_user_name: fromUserName,
        to_user_email: toUserEmail,
        to_user_name: toUserName,
        amount: amount,
        description: description || null,
      })
      .eq('id', transferId)
      .select()
      .single()

    if (transferError) {
      console.error('Error updating transfer:', transferError)
      return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'transfer',
        entity_id: transferId,
        action: 'UPDATE',
        changes: {
          old_transfer: {
            from_user: currentTransfer.from_user_email,
            to_user: currentTransfer.to_user_email,
            amount: currentTransfer.amount,
            description: currentTransfer.description,
          },
          new_transfer: {
            from_user: fromUserEmail,
            to_user: toUserEmail,
            amount: amount,
            description: description,
          },
        },
        user_email: fromUserEmail,
        user_name: fromUserName,
      })

    return NextResponse.json({ transfer })
  } catch (error) {
    console.error('Error in PUT /api/transfers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const { data: transfers, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('group_id', groupId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transfers:', error)
      return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
    }

    return NextResponse.json({ transfers })
  } catch (error) {
    console.error('Error in GET /api/transfers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transferId = searchParams.get('transferId')
    const userEmail = searchParams.get('userEmail')
    const userName = searchParams.get('userName')

    if (!transferId || !userEmail || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current transfer for audit log
    const { data: currentTransfer } = await supabase
      .from('transfers')
      .select('*')
      .eq('id', transferId)
      .single()

    if (!currentTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }

    // Delete transfer (any group member can delete, consistent with expenses)
    const { error: deleteError } = await supabase
      .from('transfers')
      .delete()
      .eq('id', transferId)

    if (deleteError) {
      console.error('Error deleting transfer:', deleteError)
      return NextResponse.json({ error: 'Failed to delete transfer' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'transfer',
        entity_id: transferId,
        action: 'DELETE',
        changes: {
          deleted_transfer: {
            from_user: currentTransfer.from_user_email,
            to_user: currentTransfer.to_user_email,
            amount: currentTransfer.amount,
            description: currentTransfer.description,
          },
        },
        user_email: userEmail,
        user_name: userName,
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/transfers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
