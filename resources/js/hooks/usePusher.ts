import { useEffect, useState } from 'react';
import { playNotificationChime } from '@/lib/sound';

export interface RealtimeToast {
  id: string;
  title: string;
  message: string;
  link?: string;
  type?: 'comment' | 'article' | 'system';
}

export function usePusher(userId?: number | null) {
  const [activeToast, setActiveToast] = useState<RealtimeToast | null>(null);
  const [unreadCountIncrement, setUnreadCountIncrement] = useState(0);

  useEffect(() => {
    // 1. Listen for new published articles on custom event from app.blade.php
    const handleArticlePublished = (e: any) => {
      const article = e.detail;
      playNotificationChime();
      setActiveToast({
        id: 'art-' + Date.now(),
        title: '🔥 New Article Published',
        message: article.title || 'Check out our latest publication!',
        link: `/article/${article.slug}`,
        type: 'article',
      });
      setUnreadCountIncrement(prev => prev + 1);
    };

    window.addEventListener('rafvex:article-published', handleArticlePublished);

    // 2. If user is authenticated, subscribe to user's personal channel
    let userChannel: any = null;
    const pusher = (window as any).pusherInstance;

    if (pusher && userId) {
      const channelName = `user-notif-${userId}`;
      userChannel = pusher.subscribe(channelName);

      userChannel.bind('comment.notification', (data: any) => {
        playNotificationChime();
        setActiveToast({
          id: 'cmt-' + Date.now(),
          title: data.notification?.title || '💬 New Comment Activity',
          message: data.notification?.message || 'Someone replied to your comment!',
          link: data.notification?.link || '/',
          type: 'comment',
        });
        setUnreadCountIncrement(prev => prev + 1);
      });
    }

    return () => {
      window.removeEventListener('rafvex:article-published', handleArticlePublished);
      if (pusher && userChannel && userId) {
        pusher.unsubscribe(`user-notif-${userId}`);
      }
    };
  }, [userId]);

  const dismissToast = () => setActiveToast(null);

  return {
    activeToast,
    dismissToast,
    unreadCountIncrement,
    resetUnreadIncrement: () => setUnreadCountIncrement(0),
  };
}
