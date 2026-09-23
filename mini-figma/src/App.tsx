import { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Toolbar } from './components/Toolbar';
import { TOOL_BY_SHORTCUT } from './constants/tools';
import { useHotkeys, type HotkeyMap } from './hooks/useHotkeys';
import { useShapes } from './hooks/useShapes';
import type { Tool } from './types/shape';

export default function App() {
  const [tool, setTool] = useState<Tool>('select');
  const {
    shapes,
    selectedId,
    draft,
    selectShape,
    updateShape,
    startCreate,
    moveCreate,
    finishCreate,
    startDrag,
    moveDrag,
    finishDrag,
    undo,
    redo,
  } = useShapes();
  const selected = shapes.find((shape) => shape.id === selectedId) ?? null;

  const hotkeys = useMemo<HotkeyMap>(() => {
    const map: HotkeyMap = {};
    for (const [shortcut, id] of Object.entries(TOOL_BY_SHORTCUT)) {
      map[shortcut] = () => setTool(id);
    }
    map['ctrl+z'] = undo;
    map['ctrl+shift+z'] = redo;
    return map;
  }, [undo, redo]);

  useHotkeys(hotkeys);

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-100 font-sans text-zinc-900">
      <Canvas
        shapes={shapes}
        selectedId={selectedId}
        draft={draft}
        tool={tool}
        onSelectShape={selectShape}
        onCreateStart={startCreate}
        onCreateMove={moveCreate}
        onCreateEnd={finishCreate}
        onDragStart={startDrag}
        onDragMove={moveDrag}
        onDragEnd={finishDrag}
      />

      <Toolbar tool={tool} onChange={setTool} />

      <div className="absolute right-0 top-0 z-10 grid h-full w-80 grid-rows-2 border-l border-zinc-200 bg-white shadow-lg">
        <PropertiesPanel
          shape={selected}
          onUpdate={(patch) => selectedId && updateShape(selectedId, patch)}
        />
        <LayersPanel shapes={shapes} selectedId={selectedId} onSelect={selectShape} />
      </div>
    </div>
  );
}