import { getAnnouncements } from '@/lib/redis';
import { AnnouncementList } from './AnnouncementList';

export const revalidate = 60; // 每60秒重新验证

export default async function NewsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-2 font-tech tracking-wider">SYSTEM NEWS</h2>
      <AnnouncementList announcements={announcements} />
    </div>
  );
}
