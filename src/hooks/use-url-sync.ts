import { useEffect } from 'react';
import { useHolocronStore } from '@/store/holocron-store';

/**
 * Синхронизирует стор с изменениями URL (back/forward, ручное редактирование).
 */
export function useUrlSync(): void {
  const hydrate = useHolocronStore((s) => s.hydrateFromUrl);

  useEffect(() => {
    const onPop = () => hydrate();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [hydrate]);
}
