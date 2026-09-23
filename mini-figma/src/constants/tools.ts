import type { Tool } from '../types/shape';

export interface ToolDefinition {
  id: Tool;
  label: string;
  shortcut: string;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Выбор', shortcut: 'v' },
  { id: 'rectangle', label: 'Прямоугольник', shortcut: 'r' },
  { id: 'ellipse', label: 'Эллипс', shortcut: 'o' },
];

export const TOOL_BY_SHORTCUT: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((tool) => [tool.shortcut, tool.id]),
);