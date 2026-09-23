import type { Point, Rect } from '../types/shape';

export interface Viewport {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function screenToCanvas(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.offsetX) / viewport.zoom,
    y: (screen.y - viewport.offsetY) / viewport.zoom,
  };
}

export function canvasToScreen(canvas: Point, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.offsetX,
    y: canvas.y * viewport.zoom + viewport.offsetY,
  };
}

export function pointDelta(from: Point, to: Point): Point {
  return { x: to.x - from.x, y: to.y - from.y };
}

export function translateRect(rect: Rect, delta: Point): Rect {
  return {
    x: rect.x + delta.x,
    y: rect.y + delta.y,
    width: rect.width,
    height: rect.height,
  };
}

export function normalizeRect(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}