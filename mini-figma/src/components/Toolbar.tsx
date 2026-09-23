import type { ReactElement } from 'react';
import { TOOLS } from '../constants/tools';
import type { Tool } from '../types/shape';

const TOOL_ICONS: Record<Tool, ReactElement> = {
  select: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5l11 6.5-6.1 1.5-1.8 5.5L5 3.5z" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="5.5" width="13" height="9" rx="1.5" />
    </svg>
  ),
  ellipse: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <ellipse cx="10" cy="10" rx="6.5" ry="4.5" />
    </svg>
  ),
};

interface ToolbarProps {
  tool: Tool;
  onChange: (tool: Tool) => void;
}

export function Toolbar({ tool, onChange }: ToolbarProps) {
  return (
    <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
      {TOOLS.map((item) => (
        <button
          key={item.id}
          type="button"
          title={`${item.label} (${item.shortcut.toUpperCase()})`}
          onClick={() => onChange(item.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            tool === item.id
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          {TOOL_ICONS[item.id]}
        </button>
      ))}
    </div>
  );
}