import { useCallback, useRef, useState } from 'react';
import type { Point, Rect, Shape, ShapeKind } from '../types/shape';
import {
  normalizeRect,
  pointDelta,
  screenToCanvas,
  translateRect,
  type Viewport,
} from '../utils/geometry';

export const DEFAULT_FILL = '#3b82f6';

const HISTORY_LIMIT = 100;
const UPDATE_COALESCE_MS = 800;

export interface ShapeDraft {
  kind: ShapeKind;
  rect: Rect;
}

let shapeCounter = 0;

interface DraftState {
  kind: ShapeKind;
  from: Point;
  to: Point;
}

interface DragState {
  id: string;
  origin: Point;
  start: Rect;
  before: Shape[];
}

interface UpdateStamp {
  id: string;
  at: number;
}

export function useShapes() {
  const [shapes, setShapesState] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ShapeDraft | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const shapesRef = useRef<Shape[]>([]);
  const pastRef = useRef<Shape[][]>([]);
  const futureRef = useRef<Shape[][]>([]);
  const draftRef = useRef<DraftState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const updateStampRef = useRef<UpdateStamp | null>(null);

  const applyShapes = useCallback((next: Shape[]) => {
    shapesRef.current = next;
    setShapesState(next);
  }, []);

  const mutateShapes = useCallback(
    (updater: (prev: Shape[]) => Shape[]) => {
      applyShapes(updater(shapesRef.current));
    },
    [applyShapes],
  );

  const refreshHistoryFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const pushPast = useCallback(
    (snapshot: Shape[]) => {
      const past = [...pastRef.current, snapshot];
      pastRef.current =
        past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past;
      futureRef.current = [];
      refreshHistoryFlags();
    },
    [refreshHistoryFlags],
  );

  const addShape = useCallback(
    (shape: Omit<Shape, 'id'>) => {
      const id = `shape-${++shapeCounter}`;
      pushPast(shapesRef.current);
      mutateShapes((prev) => [...prev, { ...shape, id }]);
      setSelectedId(id);
      return id;
    },
    [mutateShapes, pushPast],
  );

  const updateShape = useCallback(
    (id: string, patch: Partial<Omit<Shape, 'id'>>) => {
      const exists = shapesRef.current.some((shape) => shape.id === id);
      if (!exists) return;

      const now = Date.now();
      const stamp = updateStampRef.current;
      const coalesce = stamp !== null && stamp.id === id && now - stamp.at < UPDATE_COALESCE_MS;
      updateStampRef.current = { id, at: now };

      if (coalesce) {
        futureRef.current = [];
        setCanRedo(false);
      } else {
        pushPast(shapesRef.current);
      }

      mutateShapes((prev) =>
        prev.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)),
      );
    },
    [mutateShapes, pushPast],
  );

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const startCreate = useCallback(
    (kind: ShapeKind, screen: Point, viewport: Viewport) => {
      const from = screenToCanvas(screen, viewport);
      draftRef.current = { kind, from, to: from };
      setDraft({ kind, rect: normalizeRect(from, from) });
    },
    [],
  );

  const moveCreate = useCallback(
    (screen: Point, viewport: Viewport) => {
      if (!draftRef.current) return;
      const to = screenToCanvas(screen, viewport);
      draftRef.current = { ...draftRef.current, to };
      setDraft({
        kind: draftRef.current.kind,
        rect: normalizeRect(draftRef.current.from, to),
      });
    },
    [],
  );

  const finishCreate = useCallback(() => {
    const state = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!state) return;
    const rect = normalizeRect(state.from, state.to);
    if (rect.width < 1 || rect.height < 1) return;
    addShape({ kind: state.kind, ...rect, fill: DEFAULT_FILL });
  }, [addShape]);

  const startDrag = useCallback(
    (id: string, screen: Point, viewport: Viewport) => {
      const shape = shapesRef.current.find((s) => s.id === id);
      if (!shape) return;
      dragRef.current = {
        id,
        origin: screenToCanvas(screen, viewport),
        start: { x: shape.x, y: shape.y, width: shape.width, height: shape.height },
        before: shapesRef.current,
      };
      setSelectedId(id);
    },
    [],
  );

  const moveDrag = useCallback(
    (screen: Point, viewport: Viewport) => {
      const drag = dragRef.current;
      if (!drag) return;
      const rect = translateRect(
        drag.start,
        pointDelta(drag.origin, screenToCanvas(screen, viewport)),
      );
      mutateShapes((prev) =>
        prev.map((shape) => {
          if (shape.id !== drag.id) return shape;
          if (shape.x === rect.x && shape.y === rect.y) return shape;
          return { ...shape, x: rect.x, y: rect.y };
        }),
      );
    },
    [mutateShapes],
  );

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const current = shapesRef.current;
    const changed =
      current.length !== drag.before.length ||
      current.some((shape, index) => shape !== drag.before[index]);
    if (changed) pushPast(drag.before);
  }, [pushPast]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, shapesRef.current];
    updateStampRef.current = null;
    refreshHistoryFlags();
    applyShapes(previous);
    setSelectedId((current) =>
      current && previous.some((shape) => shape.id === current) ? current : null,
    );
  }, [applyShapes, refreshHistoryFlags]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, shapesRef.current];
    updateStampRef.current = null;
    refreshHistoryFlags();
    applyShapes(next);
    setSelectedId((current) =>
      current && next.some((shape) => shape.id === current) ? current : null,
    );
  }, [applyShapes, refreshHistoryFlags]);

  return {
    shapes,
    selectedId,
    draft,
    canUndo,
    canRedo,
    addShape,
    updateShape,
    selectShape,
    startCreate,
    moveCreate,
    finishCreate,
    startDrag,
    moveDrag,
    finishDrag,
    undo,
    redo,
  };
}