import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

let globalReadIds: Set<number> = new Set();
let globalFavoriteIds: Set<number> = new Set();
let listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useUserInteractions(isLoggedIn?: boolean) {
  const [, setTick] = useState(0);

  useEffect(() => {
    // 1. Initialize from localStorage cache
    try {
      const cached = localStorage.getItem('rafvex_read_ids');
      if (cached) {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr)) {
          arr.forEach((id) => globalReadIds.add(Number(id)));
        }
      }
    } catch (e) {}

    // 2. Fetch server interactions
    axios
      .get('/api/user/interactions')
      .then((res) => {
        if (res.data.read_ids) {
          res.data.read_ids.forEach((id: number) => globalReadIds.add(id));
          try {
            localStorage.setItem('rafvex_read_ids', JSON.stringify(Array.from(globalReadIds)));
          } catch (e) {}
        }
        if (res.data.favorite_ids) {
          globalFavoriteIds = new Set(res.data.favorite_ids);
        }
        notifyListeners();
      })
      .catch(() => {});

    const update = () => setTick((t) => t + 1);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, [isLoggedIn]);

  const isRead = useCallback((articleId: number) => {
    return globalReadIds.has(Number(articleId));
  }, []);

  const isFavorited = useCallback((articleId: number) => {
    return globalFavoriteIds.has(Number(articleId));
  }, []);

  const toggleFavorite = useCallback(
    async (articleId: number) => {
      const id = Number(articleId);
      const wasFav = globalFavoriteIds.has(id);

      // Optimistic update
      if (wasFav) {
        globalFavoriteIds.delete(id);
      } else {
        globalFavoriteIds.add(id);
      }
      notifyListeners();

      try {
        const res = await axios.post(`/api/articles/${id}/favorite`);
        if (res.data.favorited) {
          globalFavoriteIds.add(id);
        } else {
          globalFavoriteIds.delete(id);
        }
        notifyListeners();
      } catch (err: any) {
        // Revert optimistic update on error
        if (wasFav) {
          globalFavoriteIds.add(id);
        } else {
          globalFavoriteIds.delete(id);
        }
        notifyListeners();

        // If unauthenticated, trigger auth modal
        if (err.response?.status === 401) {
          window.dispatchEvent(
            new CustomEvent('rafvex:open-auth', {
              detail: { mode: 'login' },
            })
          );
        }
      }
    },
    []
  );

  const markAsRead = useCallback((articleId: number) => {
    const id = Number(articleId);
    if (!globalReadIds.has(id)) {
      globalReadIds.add(id);
      try {
        localStorage.setItem('rafvex_read_ids', JSON.stringify(Array.from(globalReadIds)));
      } catch (e) {}
      notifyListeners();

      axios.post(`/api/articles/${id}/read`).catch(() => {});
    }
  }, []);

  return {
    isRead,
    isFavorited,
    toggleFavorite,
    markAsRead,
  };
}
