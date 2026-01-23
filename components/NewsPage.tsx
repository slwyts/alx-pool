'use client';

import { NewsItem } from '@/lib/types';
import { Lang } from '@/lib/i18n';

interface NewsPageProps {
  newsList: NewsItem[];
  lang: Lang;
}

export default function NewsPage({ newsList, lang }: NewsPageProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-2 font-tech tracking-wider">SYSTEM NEWS</h2>
      {newsList.map((item) => (
        <div
          key={item.id}
          className="glass-card p-5 rounded-xl border-l-4 border-l-white hover:bg-white/5 transition"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg">
              {lang === 'zh' ? item.title : item.title_en}
            </h3>
            <span className="text-xs text-gray-500 font-tech border border-white/10 px-2 py-1 rounded">
              {item.date}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
