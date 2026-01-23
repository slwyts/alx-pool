'use client';

import { CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Toast() {
  const { toast } = useAppStore();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg z-[60] flex items-center gap-2 whitespace-nowrap">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <span>{toast.message}</span>
    </div>
  );
}
