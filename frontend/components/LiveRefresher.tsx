'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function LiveRefresher() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Connect to the SOC backend SSE stream
    const eventSource = new EventSource('http://localhost:8000/api/stream/events');

    eventSource.onmessage = (event) => {
      if (event.data === 'new_events') {
        setIsRefreshing(true);
        // Soft refresh the Next.js Server Component to fetch the latest data
        router.refresh();

        // Remove the spinner after 1 second to show completion
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Browser EventSource automatically reconnects
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  if (!isRefreshing) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-soc-panel text-soc-text px-3 py-1.5 rounded-sm flex items-center gap-2 text-2xs font-mono border border-soc-border shadow-dropdown z-50 tracking-wider">
      <RefreshCw className="w-3 h-3 animate-spin text-soc-accent" />
      <span className="text-soc-textSecondary">STREAM: NEW DATA INGESTED</span>
    </div>
  );
}
