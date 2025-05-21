// Utilidades para picking de entidades en DXF
export function pickEntityAt(cpuEntities, x, y, tolerancia = 3) {
  let seleccionada = null;
  let minDist = Infinity;
  for (const ent of cpuEntities) {
    switch (ent.type) {
      case "LINE":
        const d1 = distToSegment({ x, y }, ent.vertices[0], ent.vertices[1]);
        if (d1 < tolerancia && d1 < minDist) {
          seleccionada = ent;
          minDist = d1;
        }
        break;
      case "POLYLINE":
        for (let i = 0; i < ent.vertices.length - 1; i++) {
          const d2 = distToSegment(
            { x, y },
            ent.vertices[i],
            ent.vertices[i + 1]
          );
          if (d2 < tolerancia && d2 < minDist) {
            seleccionada = ent;
            minDist = d2;
          }
        }
        break;
      case "CIRCLE":
        const distCentro = Math.hypot(x - ent.center.x, y - ent.center.y);
        const d3 = Math.abs(distCentro - ent.radius);
        if (d3 < tolerancia && d3 < minDist) {
          seleccionada = ent;
          minDist = d3;
        }
        break;
      case "ARC":
        const dx = x - ent.center.x,
          dy = y - ent.center.y;
        const distArc = Math.hypot(dx, dy);
        let ang = Math.atan2(dy, dx);
        let start = ent.startAngle,
          end = ent.endAngle;
        if (end < start) end += 2 * Math.PI;
        if (ang < start) ang += 2 * Math.PI;
        const onArc = ang >= start && ang <= end;
        const d4 = Math.abs(distArc - ent.radius);
        if (onArc && d4 < tolerancia && d4 < minDist) {
          seleccionada = ent;
          minDist = d4;
        }
        break;
    }
  }
  return seleccionada;
}

function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(
    p.x - (v.x + t * (w.x - v.x)),
    p.y - (v.y + t * (w.y - v.y))
  );
}
