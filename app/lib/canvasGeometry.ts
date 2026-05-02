export type CanvasRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasResizeHandle = "tl" | "tr" | "bl" | "br";

export const MIN_CANVAS_ITEM_WIDTH = 12;
export const MIN_CANVAS_ITEM_HEIGHT = 12;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

export function moveCanvasRect(rect: CanvasRect, xDelta: number, yDelta: number): CanvasRect {
  return {
    ...rect,
    x: roundPercent(clamp(rect.x + xDelta, 0, 100 - rect.width)),
    y: roundPercent(clamp(rect.y + yDelta, 0, 100 - rect.height)),
  };
}

export function resizeCanvasRect(
  rect: CanvasRect,
  handle: CanvasResizeHandle,
  xDelta: number,
  yDelta: number
): CanvasRect {
  const originRight = rect.x + rect.width;
  const originBottom = rect.y + rect.height;

  let nextX = rect.x;
  let nextY = rect.y;
  let nextWidth = rect.width;
  let nextHeight = rect.height;

  if (handle.includes("l")) {
    nextX = clamp(rect.x + xDelta, 0, originRight - MIN_CANVAS_ITEM_WIDTH);
    nextWidth = originRight - nextX;
  }

  if (handle.includes("r")) {
    nextWidth = clamp(rect.width + xDelta, MIN_CANVAS_ITEM_WIDTH, 100 - rect.x);
  }

  if (handle.includes("t")) {
    nextY = clamp(rect.y + yDelta, 0, originBottom - MIN_CANVAS_ITEM_HEIGHT);
    nextHeight = originBottom - nextY;
  }

  if (handle.includes("b")) {
    nextHeight = clamp(rect.height + yDelta, MIN_CANVAS_ITEM_HEIGHT, 100 - rect.y);
  }

  return {
    x: roundPercent(nextX),
    y: roundPercent(nextY),
    width: roundPercent(nextWidth),
    height: roundPercent(nextHeight),
  };
}
