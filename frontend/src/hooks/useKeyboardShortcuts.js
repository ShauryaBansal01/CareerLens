import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      for (const s of shortcuts) {
        const mod = s.mod !== false;
        const ctrlOrMeta = e.ctrlKey || e.metaKey;
        if (mod && ctrlOrMeta && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault();
          s.action(e);
          return;
        }
        if (!mod && e.key === s.key) {
          e.preventDefault();
          s.action(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
