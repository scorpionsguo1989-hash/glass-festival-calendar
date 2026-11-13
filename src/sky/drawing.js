export const W = 196;
export const H = 217;
export const TAU = Math.PI * 2;
export const COLD = [183, 215, 255];
export const WARM = [255, 188, 103];
export const RED = [255, 91, 48];
export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const mod = (a, b) => ((a % b) + b) % b;
export const rgba = (rgb, a) => "rgba(" + rgb.join(",") + "," + clamp(a) + ")";

export function samples(seed, count, map) {
  let state = seed;
  const next = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => map(next, i));
}

export function glow(ctx, x, y, radius, color, alpha) {
  const paint = ctx.createRadialGradient(x, y, 0, x, y, radius);
  paint.addColorStop(0, rgba(color, alpha));
  paint.addColorStop(0.27, rgba(color, alpha * 0.66));
  paint.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = paint;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export function dot(ctx, x, y, size, color, alpha) {
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TAU);
  ctx.fill();
}

export function easeOut(progress) {
  return 1 - (1 - clamp(progress)) ** 3;
}

export function line(ctx, x1, y1, x2, y2, paint, width = 0.55) {
  ctx.strokeStyle = paint;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function fadePastTitle(y) {
  return 1 - 0.79 * clamp((y - 47) / 67);
}
