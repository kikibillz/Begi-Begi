import { useCallback } from 'react';

export function useShare() {
  const share = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = data.url || window.location.href;
      await navigator.clipboard.writeText(`${data.title}: ${url}`);
      alert('Link copied to clipboard!');
    }
  }, []);

  return { share, isSupported: typeof navigator !== 'undefined' && !!navigator.share };
}
