import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

export interface Announcement {
  id: string;
  title: string;
  title_en: string;
  content: string;
  content_en: string;
  date: string;
  createdAt: number;
}

const ANNOUNCEMENTS_KEY = 'announcements';

export async function getAnnouncements(): Promise<Announcement[]> {
  const data = await redis.get<Announcement[]>(ANNOUNCEMENTS_KEY);
  return data || [];
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const list = await getAnnouncements();
  return list.find((a) => a.id === id) || null;
}

export async function createAnnouncement(
  announcement: Omit<Announcement, 'id' | 'createdAt'>
): Promise<Announcement> {
  const list = await getAnnouncements();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  list.unshift(newAnnouncement);
  await redis.set(ANNOUNCEMENTS_KEY, list);
  return newAnnouncement;
}

export async function updateAnnouncement(
  id: string,
  data: Partial<Omit<Announcement, 'id' | 'createdAt'>>
): Promise<Announcement | null> {
  const list = await getAnnouncements();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...data };
  await redis.set(ANNOUNCEMENTS_KEY, list);
  return list[index];
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const list = await getAnnouncements();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;
  await redis.set(ANNOUNCEMENTS_KEY, filtered);
  return true;
}
