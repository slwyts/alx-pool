import { NextRequest, NextResponse } from 'next/server';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/redis';

// GET - 获取所有公告
export async function GET() {
  try {
    const announcements = await getAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - 创建公告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, title_en, content, content_en, date } = body;

    if (!title || !content || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      title,
      title_en: title_en || title,
      content,
      content_en: content_en || content,
      date,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT - 更新公告
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });
    }

    const updated = await updateAnnouncement(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE - 删除公告
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });
    }

    const deleted = await deleteAnnouncement(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
