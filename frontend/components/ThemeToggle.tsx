'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'system' | 'dark';

const OPTIONS: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'dark', label: 'Dark', icon: Moon },
];

const STORAGE_KEY = 'anviksa-theme';

function applyTheme(mode: ThemeMode) {
  const dark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system';
    setMode(stored);
    setMounted(true);

    // Follow OS changes while in system mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) === 'system') {
        applyTheme('system');
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = (next: ThemeMode) => {
    document.documentElement.classList.add('theme-anim');
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.setTimeout(() => document.documentElement.classList.remove('theme-anim'), 350);
  };

  if (!mounted) return <div className="h-7 w-[92px]" aria-hidden="true" />;

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center gap-0.5 p-0.5 rounded-full border border-soc-border bg-soc-overlay"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${opt.label} theme`}
            title={`${opt.label} theme`}
            onClick={() => setTheme(opt.id)}
            className={`p-1 rounded-full transition-colors ${
              active
                ? 'bg-soc-panel text-soc-accent shadow-sm'
                : 'text-soc-textMuted hover:text-soc-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
