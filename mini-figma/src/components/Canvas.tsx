import { useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { DEFAULT_FILL, type ShapeDraft } from '../hooks/useShapes';
import { useViewport } from '../hooks/useViewport';
import type { Point, Shape as ShapeData, ShapeKind } from '../types/shape';
import type { Viewport } from '../utils/geometry';
import { Shape } from './Shape';

const GRID_MINOR = 20;
const GRID_MAJOR = 100;
const GRID_MIN_VISIBLE = 6;

interface CanvasProps {
  shapes: ShapeData[];
  selectedId: string | null;
  draft: ShapeDraft | null;
  tool: ShapeKind | 'select';
  onSelectShape: (id: string | null) => void;
  onCreateStart: (kind: ShapeKind, screen: Point, viewport: Viewport) => void;
  onCreateMove: (screen: Point, viewport: Viewport) => void;
  onCreateEnd: () => void;
  onDragStart: (id: string, screen: Point, viewport: Viewport) => void;
  onDragMove: (screen: Point, viewport: Viewport) => void;
  onDragEnd: () => void;
}

export function Canvas({
  shapes,
  selectedId,
  draft,
  tool,
  onSelectShape,
  onCreateStart,
  onCreateMove,
  onCreateEnd,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, isSpaceDown, isPanning } = useViewport(containerRef);
  const { offsetX, offsetY, zoom } = viewport;

  const isShapeTool = tool === 'rectangle' || tool === 'ellipse';

  const screenPoint = (e: ReactPointerEvent<HTMLDivElement>): Point | null => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isSpaceDown) return;
    const point = screenPoint(e);
    if (!point) return;

    if (isShapeTool) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onCreateStart(tool, point, viewport);
    } else {
      onSelectShape(null);
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const point = screenPoint(e);
    if (!point) return;
    if (draft) {
      onCreateMove(point, viewport);
    } else {
      onDragMove(point, viewport);
    }
  };

  const handlePointerUp = () => {
    if (draft) onCreateEnd();
    onDragEnd();
  };

  const handleShapeDragStart = (id: string, e: ReactPointerEvent<HTMLDivElement>) => {
    if (isSpaceDown || draft || e.button !== 0) return;
    const point = screenPoint(e);
    if (!point) return;
    containerRef.current?.setPointerCapture(e.pointerId);
    onDragStart(id, point, viewport);
  };

  const minor = GRID_MINOR * zoom;
  const major = GRID_MAJOR * zoom;
  const showMinor = minor >= GRID_MIN_VISIBLE;

  const gridImage = showMinor
    ? [
        'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)',
        'linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
        'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)',
        'linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
      ].join(', ')
    : [
        'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)',
        'linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
      ].join(', ');

  const gridSize = showMinor
    ? `${minor}px ${minor}px, ${minor}px ${minor}px, ${major}px ${major}px, ${major}px ${major}px`
    : `${major}px ${major}px, ${major}px ${major}px`;

  const background: CSSProperties = {
    backgroundColor: '#f4f4f5',
    backgroundImage: gridImage,
    backgroundSize: gridSize,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
  };

  const cursor = isPanning ? 'grabbing' : isSpaceDown ? 'grab' : isShapeTool ? 'crosshair' : 'default';

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none select-none overflow-hidden"
      style={{ ...background, cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            selected={shape.id === selectedId}
            draggable={tool === 'select' && !isSpaceDown}
            onSelect={onSelectShape}
            onDragStart={handleShapeDragStart}
          />
        ))}
        {draft && (
          <div
            className={draft.kind === 'ellipse' ? 'rounded-full' : 'rounded-[2px]'}
            style={{
              position: 'absolute',
              left: draft.rect.x,
              top: draft.rect.y,
              width: draft.rect.width,
              height: draft.rect.height,
              backgroundColor: DEFAULT_FILL,
              opacity: 0.6,
              outline: '1px solid #2563eb',
              outlineOffset: 1,
            }}
          />
        )}
      </div>
    </div>
  );
}