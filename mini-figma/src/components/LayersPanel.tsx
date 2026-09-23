import type { Shape as ShapeData } from '../types/shape';

interface LayersPanelProps {
  shapes: ShapeData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function LayersPanel({ shapes, selectedId, onSelect }: LayersPanelProps) {
  const ordered = [...shapes].reverse();

  return (
    <aside className="flex h-full min-h-0 flex-col bg-white">
      <header className="border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Слои
      </header>

      {ordered.length === 0 ? (
        <p className="p-4 text-sm text-zinc-400">Слоёв пока нет</p>
      ) : (
        <ul className="overflow-y-auto p-2 text-sm">
          {ordered.map((shape) => (
            <li key={shape.id}>
              <button
                type="button"
                onClick={() => onSelect(shape.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left transition-colors ${
                  shape.id === selectedId
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {shape.kind === 'rectangle' ? 'Прямоугольник' : 'Эллипс'} · {shape.id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}