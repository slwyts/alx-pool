'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import { usePoolConfig } from '@/lib/contracts/hooks';
import type { Announcement } from '@/lib/redis';

export default function AnnouncementAdminPage() {
  const { showToast } = useAppStore();
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const poolConfig = usePoolConfig();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 编辑状态
  const [editMode, setEditMode] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    title_en: '',
    content: '',
    content_en: '',
    date: new Date().toISOString().split('T')[0],
  });

  const isOwner =
    poolConfig.owner && address && poolConfig.owner.toLowerCase() === address.toLowerCase();

  // 加载公告列表
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
      showToast('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // 创建/更新公告
  const handleSave = async () => {
    if (!form.title || !form.content) {
      showToast(t('toast_fill_required') || 'Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      const method = editMode === 'create' ? 'POST' : 'PUT';
      const body =
        editMode === 'create' ? form : { id: editId, ...form };

      const res = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editMode === 'create' ? 'Created successfully' : 'Updated successfully');
        setEditMode(null);
        setEditId(null);
        resetForm();
        fetchAnnouncements();
      } else {
        showToast('Operation failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Operation failed');
    } finally {
      setSaving(false);
    }
  };

  // 删除公告
  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete') || 'Are you sure to delete?')) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Deleted successfully');
        fetchAnnouncements();
      } else {
        showToast('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Delete failed');
    }
  };

  // 进入编辑模式
  const startEdit = (announcement: Announcement) => {
    setEditMode('edit');
    setEditId(announcement.id);
    setForm({
      title: announcement.title,
      title_en: announcement.title_en,
      content: announcement.content,
      content_en: announcement.content_en,
      date: announcement.date,
    });
  };

  // 重置表单
  const resetForm = () => {
    setForm({
      title: '',
      title_en: '',
      content: '',
      content_en: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditMode(null);
    setEditId(null);
    resetForm();
  };

  // 权限检查
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p>{t('connect_wallet_first') || 'Please connect wallet'}</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 mb-4 text-orange-500" />
        <p className="text-orange-400">{t('admin_only') || 'Admin access only'}</p>
        <Link href="/news" className="mt-4 text-sm text-blue-400 hover:underline">
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500">
          <ShieldCheck className="w-6 h-6" />
          <span>{t('announcement_manage') || 'Announcement Management'}</span>
        </h2>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white hover:bg-white/20 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_admin') || 'Admin'}
          </Link>
          {!editMode && (
            <button
              onClick={() => {
                setEditMode('create');
                resetForm();
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-bold text-white transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t('new_announcement') || 'New'}
            </button>
          )}
        </div>
      </div>

      {/* 编辑表单 */}
      {editMode && (
        <div className="glass-card rounded-2xl p-6 border border-orange-500/30">
          <h3 className="text-lg font-bold text-white mb-4">
            {editMode === 'create' ? 'Create Announcement' : 'Edit Announcement'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (Chinese) *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500/50"
                  placeholder="公告标题"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title (English)</label>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500/50"
                  placeholder="Announcement Title"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Content (Chinese, Markdown) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500/50 font-mono"
                placeholder="支持 Markdown 格式..."
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Content (English, Markdown)</label>
              <textarea
                value={form.content_en}
                onChange={(e) => setForm({ ...form, content_en: e.target.value })}
                rows={6}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500/50 font-mono"
                placeholder="Supports Markdown..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editMode === 'create' ? 'Create' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 公告列表 */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-4">
          {t('announcement_list') || 'Announcement List'} ({announcements.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {t('no_announcements') || 'No announcements yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-black/30 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">{item.date}</span>
                  </div>
                  <h4 className="font-bold text-white truncate">{item.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{item.title_en}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-2 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-white/10 rounded text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
