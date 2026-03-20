export function mapMouseToComposition(event, canvas, preview) {
  if (!(canvas instanceof HTMLCanvasElement) || !preview) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height || !preview.scale) return null;

  // Scale from CSS pixels to canvas buffer pixels.
  // After the view syncs canvas.width = clientWidth this ratio is 1,
  // but we keep it here as a safeguard against any resize race.
  const ratioX = canvas.width / rect.width;
  const ratioY = canvas.height / rect.height;

  const localX = (event.clientX - rect.left) * ratioX;
  const localY = (event.clientY - rect.top) * ratioY;
  const compX = (localX - preview.offsetX) / preview.scale;
  const compY = (localY - preview.offsetY) / preview.scale;

  return { x: compX, y: compY };
}

export function findPlacementAtPoint(placements, x, y) {
  for (let i = placements.length - 1; i >= 0; i--) {
    const item = placements[i];
    if (
      x >= item.x &&
      x <= item.x + item.width &&
      y >= item.y &&
      y <= item.y + item.height
    ) {
      return item;
    }
  }
  return null;
}

/**
 * Snaps candidate position to nearby edges of other placements.
 *
 * Threshold is in composition pixels and should already be scaled from
 * screen pixels by the caller (e.g. 24 / canvasScale).
 *
 * Checks 8 snap targets per neighbour (X: adjacency×2 + alignment×2,
 * Y: adjacency×2 + alignment×2). No direction or overlap preconditions —
 * just picks the nearest snap within threshold on each axis independently.
 */
export function snapPlacement(candidate, placements, movingScreenId, options = {}) {
  const snapThreshold = Math.max(0, Number(options.snapThreshold) || 0);
  const gap = Math.max(0, Number(options.gap) || 0);

  if (snapThreshold <= 0) return candidate;

  const others = placements.filter(
    (item) => String(item.screen.id) !== String(movingScreenId),
  );
  if (others.length === 0) return candidate;

  const cL = candidate.x;
  const cR = candidate.x + candidate.width;
  const cT = candidate.y;
  const cB = candidate.y + candidate.height;

  let bestX = candidate.x;
  let bestY = candidate.y;
  let bestDistX = Infinity;
  let bestDistY = Infinity;

  others.forEach((item) => {
    const oL = item.x;
    const oR = item.x + item.width;
    const oT = item.y;
    const oB = item.y + item.height;

    // X-axis: adjacency (with gap) + edge alignment
    const xSnaps = [
      { dist: Math.abs(cL - (oR + gap)), snapX: oR + gap },               // left → right-of-neighbour + gap
      { dist: Math.abs(cR - (oL - gap)), snapX: oL - gap - candidate.width }, // right → left-of-neighbour - gap
      { dist: Math.abs(cL - oL),          snapX: oL },                    // align left edges
      { dist: Math.abs(cR - oR),          snapX: oR - candidate.width },  // align right edges
    ];

    // Y-axis: adjacency (with gap) + edge alignment
    const ySnaps = [
      { dist: Math.abs(cT - (oB + gap)), snapY: oB + gap },               // top → below-neighbour + gap
      { dist: Math.abs(cB - (oT - gap)), snapY: oT - gap - candidate.height }, // bottom → above-neighbour - gap
      { dist: Math.abs(cT - oT),          snapY: oT },                    // align tops
      { dist: Math.abs(cB - oB),          snapY: oB - candidate.height }, // align bottoms
    ];

    xSnaps.forEach((snap) => {
      if (snap.dist <= snapThreshold && snap.dist < bestDistX) {
        bestDistX = snap.dist;
        bestX = snap.snapX;
      }
    });

    ySnaps.forEach((snap) => {
      if (snap.dist <= snapThreshold && snap.dist < bestDistY) {
        bestDistY = snap.dist;
        bestY = snap.snapY;
      }
    });
  });

  return {
    ...candidate,
    x: Math.max(0, Math.round(bestX)),
    y: Math.max(0, Math.round(bestY)),
  };
}
