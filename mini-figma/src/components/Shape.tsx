import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { Shape as ShapeData } from '../types/shape';

const MARKER_SIZE = 8;

const MARKERS: Array<{ left: number | string; top: number | string }> = [
  { left: 0, top: 0 },
  { left: '50%', top: 0 },
  { left: '100%', top: 0 },
  { left: 0, top: '50%' },
  { left: '100%', top: '50%' },
  { left: 0, top: '100%' },
  { left: '50%', top: '100%' },
  { left: '100%', top: '100%' },
];

interface ShapeProps {
  shape: ShapeData;
  selected?: boolean;
  draggable?: boolean;
  onSelect?: (id: string) => void;
  onDragStart?: (id: string, e: ReactPointerEvent<HTMLDivElement>) => void;
}

export function Shape({
  shape,
  selected = false,
  draggable = false,
  onSelect,
  onDragStart,
}: ShapeProps) {
  const { kind, x, y, width, height, fill } = shape;

  const style: CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    height,
    backgroundColor: fill,
    cursor: draggable ? 'move' : 'default',
  };

  const markerStyle: CSSProperties = {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffffff',
    border: '1.5px solid #2563eb',
    borderRadius: 2,
  };

  return (
    <div
      className={kind === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'}
      style={style}
      onPointerDown={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        onSelect?.(shape.id);
        onDragStart?.(shape.id, e);
      }}
    >
      {selected && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            outline: '1.5px solid #2563eb',
            outlineOffset: -1,
            borderRadius: kind === 'ellipse' ? '50%' : 2,
          }}
        >
          {MARKERS.map((marker, index) => (
            <span
              key={index}
              className="absolute"
              style={{ ...markerStyle, left: marker.left, top: marker.top }}
            />
          ))}
        </div>
      )}
    </div>
  );
}