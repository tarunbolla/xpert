import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Get group members
    const { data: members, error } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Error fetching group members:', error)
      return NextResponse.json({ error: 'Failed to fetch group members' }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error in GET /api/group-members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { groupId, userEmail, userName, role, addedByEmail, addedByName } = await request.json()

    if (!groupId || !userEmail || !userName || !addedByEmail || !addedByName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_email', userEmail)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'Member already exists in this group' }, { status: 400 })
    }

    // Add member
    const { data: member, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_email: userEmail,
        user_name: userName,
        role: role || 'member',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding group member:', error)
      return NextResponse.json({ error: 'Failed to add group member' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'group',
        entity_id: groupId,
        action: 'UPDATE',
        changes: {
          added_member: {
            email: userEmail,
            name: userName,
            role: role || 'member',
          },
        },
        user_email: addedByEmail,
        user_name: addedByName,
      })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error in POST /api/group-members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { memberId, role, updatedByEmail, updatedByName } = await request.json()

    if (!memberId || !role || !updatedByEmail || !updatedByName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update member role
    const { data: member, error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single()

    if (error) {
      console.error('Error updating group member:', error)
      return NextResponse.json({ error: 'Failed to update group member' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'group',
        entity_id: member.group_id,
        action: 'UPDATE',
        changes: {
          updated_member_role: {
            email: member.user_email,
            name: member.user_name,
            new_role: role,
          },
        },
        user_email: updatedByEmail,
        user_name: updatedByName,
      })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error in PUT /api/group-members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const removedByEmail = searchParams.get('removedByEmail')
    const removedByName = searchParams.get('removedByName')

    if (!memberId || !removedByEmail || !removedByName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get member info before deletion for audit log
    const { data: memberToDelete } = await supabase
      .from('group_members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (!memberToDelete) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Delete member
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Error removing group member:', error)
      return NextResponse.json({ error: 'Failed to remove group member' }, { status: 500 })
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        entity_type: 'group',
        entity_id: memberToDelete.group_id,
        action: 'UPDATE',
        changes: {
          removed_member: {
            email: memberToDelete.user_email,
            name: memberToDelete.user_name,
            role: memberToDelete.role,
          },
        },
        user_email: removedByEmail,
        user_name: removedByName,
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/group-members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
