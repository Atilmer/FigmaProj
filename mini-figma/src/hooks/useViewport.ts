import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Point } from '../types/shape';
import { clampZoom, screenToCanvas, type Viewport } from '../utils/geometry';

const ZOOM_SENSITIVITY = 0.002;

export function useViewport(containerRef: RefObject<HTMLElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const spaceRef = useRef(false);
  const panRef = useRef(false);
  const lastClientRef = useRef<Point | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setViewport((v) => ({
      ...v,
      offsetX: rect.width / 2,
      offsetY: rect.height / 2,
    }));
  }, [containerRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || spaceRef.current) return;
      spaceRef.current = true;
      setIsSpaceDown(true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      spaceRef.current = false;
      setIsSpaceDown(false);
      if (panRef.current) {
        panRef.current = false;
        lastClientRef.current = null;
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouse: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      setViewport((v) => {
        const zoom = clampZoom(v.zoom * Math.exp(-e.deltaY * ZOOM_SENSITIVITY));
        const world = screenToCanvas(mouse, v);
        return {
          zoom,
          offsetX: mouse.x - world.x * zoom,
          offsetY: mouse.y - world.y * zoom,
        };
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !spaceRef.current) return;
      panRef.current = true;
      lastClientRef.current = { x: e.clientX, y: e.clientY };
      setIsPanning(true);
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!panRef.current || !lastClientRef.current) return;
      const dx = e.clientX - lastClientRef.current.x;
      const dy = e.clientY - lastClientRef.current.y;
      lastClientRef.current = { x: e.clientX, y: e.clientY };
      setViewport((v) => ({
        ...v,
        offsetX: v.offsetX + dx,
        offsetY: v.offsetY + dy,
      }));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!panRef.current) return;
      panRef.current = false;
      lastClientRef.current = null;
      setIsPanning(false);
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [containerRef]);

  return { viewport, isSpaceDown, isPanning };
}