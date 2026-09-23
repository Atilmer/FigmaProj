import type { Shape as ShapeData } from '../types/shape';

interface PropertiesPanelProps {
  shape: ShapeData | null;
  onUpdate: (patch: Partial<Omit<ShapeData, 'id'>>) => void;
}

export function PropertiesPanel({ shape, onUpdate }: PropertiesPanelProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-b border-zinc-200 bg-white">
      <header className="border-b border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Свойства
      </header>

      {!shape ? (
        <p className="p-4 text-sm text-zinc-400">Ничего не выбрано</p>
      ) : (
        <dl className="space-y-2 p-4 text-sm">
          {(
            [
              ['Тип', shape.kind === 'rectangle' ? 'Прямоугольник' : 'Эллипс'],
              ['X', String(Math.round(shape.x))],
              ['Y', String(Math.round(shape.y))],
              ['Ширина', String(Math.round(shape.width))],
              ['Высота', String(Math.round(shape.height))],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="truncate font-medium text-zinc-900">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <dt className="text-zinc-500">Цвет</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-600">{shape.fill}</span>
              <input
                type="color"
                value={shape.fill}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-zinc-200 bg-transparent p-0.5"
                aria-label="Цвет заливки"
              />
            </dd>
          </div>
        </dl>
      )}
    </aside>
  );
}