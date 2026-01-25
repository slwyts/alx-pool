'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Announcement } from '@/lib/redis';

export default function NewsPage() {
  const { lang } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-2 font-tech tracking-wider">SYSTEM NEWS</h2>

      {announcements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {lang === 'zh' ? '暂无公告' : 'No announcements'}
        </div>
      ) : (
        announcements.map((item) => {
          const isExpanded = expandedId === item.id;
          const title = lang === 'zh' ? item.title : item.title_en;
          const content = lang === 'zh' ? item.content : item.content_en;

          return (
            <div
              key={item.id}
              className="glass-card rounded-xl border-l-4 border-l-white hover:bg-white/5 transition overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg flex-1">{title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 font-tech border border-white/10 px-2 py-1 rounded">
                      {item.date}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {!isExpanded && (
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                    {content.replace(/[#*`]/g, '').slice(0, 100)}...
                  </p>
                )}
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-white mb-3">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-white mb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold text-white mb-2">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="text-white font-bold">{children}</strong>
                        ),
                        em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-black/50 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 text-gray-400 italic mb-3">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="border-white/10 my-4" />,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
