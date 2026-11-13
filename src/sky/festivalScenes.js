import { W, H, TAU, COLD, WARM, RED, clamp, mod, rgba, samples, glow, dot, line, easeOut, fadePastTitle } from "./drawing.js";

const flakes = samples(520, 118, (r, i) => ({
  x: r() * (W + 24) - 12, y: r() * (H + 40), speed: 8 + r() * 20,
  phase: r() * TAU, size: 0.31 + r() ** 1.9 * (i < 12 ? 1.8 : 0.87), alpha: 0.19 + r() * 0.75,
  blurred: i < 10,
}));
const fineFlakes = samples(960, 52, (r) => ({
  x: r() * (W + 14) - 7, y: r() * 110, speed: 7 + r() * 12,
  phase: r() * TAU, size: 0.39 + r() ** 1.36 * 0.69, alpha: 0.31 + r() * 0.66,
}));
const rockets = [
  [61, 30, 0.02, "peony"], [129, 32, 0.42, "ring"], [157, 48, 1.12, "willow"],
  [43, 57, 1.84, "ring"], [106, 29, 2.31, "peony"], [64, 32, 3.06, "willow"],
  [118, 39, 3.47, "ring"], [157, 27, 3.68, "peony"],
].map(([x, y, start, shape], index) => ({
  x, y, start, shape,
  sparks: samples(79 + index * 15, 43, (r, i) => ({
    angle: i * TAU / 43 + r() * 0.12, speed: r(), life: r(), size: r(), phase: r() * TAU,
  })),
}));
const lanterns = samples(852, 10, (r, i) => ({
  x: 12 + r() * (W - 24), y: (i + 0.32) * 26, speed: 9 + r() * 9,
  phase: r() * TAU, size: 2.1 + r() * 3.5, alpha: 0.29 + r() * 0.67,
}));
const embers = samples(171, 65, (r) => ({
  x: r() * W, y: r() * (H + 28), speed: 7 + r() * 25, phase: r() * TAU, size: 0.3 + r() * 0.55,
}));
const snowCrystals = samples(147, 8, (r, i) => ({
  x: r() * W, y: r() * 120, speed: 13 + r() * 8, size: 1.7 + r() * 2.1, phase: r() * TAU, turn: i % 2 ? 0.7 : -0.7,
}));

export function ribbons(ctx, t, gain, icy = false) {
  const color = icy ? [115, 167, 238] : [66, 194, 203];
  for (let i = 0; i < (icy ? 2 : 4); i++) {
    const phase = t * (0.68 + i * 0.09) + i * 0.93;
    const spine = (x) => 24 + 5 * i + 10 * Math.sin(x * 0.022 + phase) + 3 * Math.sin(x * 0.039 - phase * 0.8);
    const thickness = (x) => 0.9 + ((icy ? 3.7 : 7) + i * 0.9) * Math.sin(Math.PI * clamp((x + 16) / (W + 32))) ** 1.4;
    const shade = ctx.createLinearGradient(0, 0, W, 0);
    shade.addColorStop(0, rgba(color, gain * 0.008));
    shade.addColorStop(0.33, rgba(color, gain * (icy ? 0.061 : 0.15)));
    shade.addColorStop(0.64, rgba(color, gain * (icy ? 0.071 : 0.108)));
    shade.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(-16, spine(-16));
    for (let x = -12; x <= W + 16; x += 4) ctx.lineTo(x, spine(x));
    for (let x = W + 16; x >= -16; x -= 4) ctx.lineTo(x, spine(x) + thickness(x));
    ctx.closePath();
    ctx.fill();
    const edge = ctx.createLinearGradient(0, 0, W, 0);
    edge.addColorStop(0, rgba(color, 0));
    edge.addColorStop(0.44, rgba([155, 229, 255], gain * (icy ? 0.1 : 0.26)));
    edge.addColorStop(1, rgba(color, 0));
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(-16, spine(-16));
    for (let x = -12; x <= W + 16; x += 4) ctx.lineTo(x, spine(x));
    ctx.stroke();
  }
}

export function snow(ctx, t, gain) {
  ribbons(ctx, t * 0.36, gain, true);
  for (const f of flakes) {
    const y = mod(f.y + t * f.speed, H + 40) - 20;
    const x = f.x + 9 * Math.sin(t * 0.63 + f.phase) + t % 11;
    const depth = Math.max(0.1, 1 - Math.max(0, y - 23) / 142);
    const alpha = gain * f.alpha * depth * (0.83 + 0.17 * Math.sin(t * 2.1 + f.phase));
    if (f.blurred) {
      glow(ctx, x, y, f.size * 4.9 + 1.4, COLD, alpha * 0.27);
    } else {
      if (f.size > 0.92) glow(ctx, x, y, f.size * 3.5, COLD, alpha * 0.34);
      dot(ctx, x, y, f.size, [227, 240, 255], alpha);
    }
  }
  for (const f of fineFlakes) {
    const y = mod(f.y + t * f.speed, 110) - 16;
    const x = f.x + 5.8 * Math.sin(t * 0.52 + f.phase);
    const fade = 1 - clamp((y - 40) / 52);
    const a = gain * f.alpha * fade * (0.84 + 0.16 * Math.cos(t * 1.6 + f.phase));
    if (f.size > 0.91) glow(ctx, x, y, 2.6, COLD, a * 0.31);
    dot(ctx, x, y, f.size, [232, 244, 255], a);
  }
  for (const f of snowCrystals) {
    const y = mod(f.y + t * f.speed, 120) - 9;
    const x = f.x + 12 * Math.sin(t * 0.64 + f.phase);
    const alpha = gain * fadePastTitle(y) * (0.45 + 0.32 * Math.sin(t + f.phase) ** 2);
    ctx.strokeStyle = rgba([230, 245, 255], alpha);
    ctx.lineWidth = 0.43;
    ctx.beginPath();
    for (let arm = 0; arm < 6; arm++) {
      const angle = f.phase + t * f.turn + arm * TAU / 6;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      ctx.moveTo(x, y);
      ctx.lineTo(x + f.size * dx, y + f.size * dy);
      ctx.lineTo(x + f.size * (dx * 0.55 - dy * 0.31), y + f.size * (dy * 0.55 + dx * 0.31));
    }
    ctx.stroke();
  }
}

export function fireworks(ctx, t, gain) {
  const phase = mod(t, 5.15);
  for (const [index, fire] of rockets.entries()) {
    const age = phase - fire.start;
    const travel = 0.51;
    if (age < 0 || age > travel + 1.72) continue;
    const color = fire.shape === "ring" ? [255, 157, 95] : fire.shape === "willow" ? [255, 208, 129] : [255, 231, 177];
    if (age < travel) {
      const p = age / travel;
      const x = fire.x + (1 - p) * (index % 2 === 0 ? -12 : 8);
      const y = fire.y + (134 - fire.y) * (1 - p) ** 1.46;
      const plume = ctx.createLinearGradient(x, y, x, y + 22);
      plume.addColorStop(0, rgba(color, gain * 0.89));
      plume.addColorStop(1, rgba(color, 0));
      line(ctx, x, y, x - (index % 2 === 0 ? 1.6 : -1.2), y + 22, plume, 0.87);
      glow(ctx, x, y, 7.4, color, gain * 0.54);
      dot(ctx, x, y, 0.88, [255, 242, 202], gain);
      continue;
    }
    const u = age - travel;
    if (u < 0.65) glow(ctx, fire.x, fire.y, 58, color, gain * 0.54 * (1 - u / 0.65) ** 2);
    for (const [i, spark] of fire.sparks.entries()) {
      const willow = fire.shape === "willow";
      const life = (willow ? 1.25 : 0.83) + spark.life * 0.47;
      if (u > life) continue;
      const speed = fire.shape === "ring" ? (i % 3 === 0 ? 19 : 35 + spark.speed * 4) : 15 + spark.speed * 31;
      const fall = willow ? 28 : 9;
      const distance = speed * (1 - Math.exp(-u * 3));
      const tailAge = Math.max(0, u - (willow ? 0.19 : 0.07));
      const tailDistance = speed * (1 - Math.exp(-tailAge * 3));
      const dx = Math.cos(spark.angle);
      const dy = Math.sin(spark.angle);
      const x = fire.x + dx * distance;
      const y = fire.y + dy * distance + fall * u * u;
      const a = gain * (1 - u / life) ** 1.12 * (0.57 + 0.43 * Math.sin(15 * u + spark.phase) ** 2) * fadePastTitle(y);
      line(ctx, fire.x + dx * tailDistance, fire.y + dy * tailDistance + fall * tailAge * tailAge,
        x, y, rgba(color, a * (willow ? 0.82 : 0.67)), 0.53);
      dot(ctx, x, y, 0.36 + spark.size * 0.47, [255, 242, 204], a);
    }
  }
}

function lamp(ctx, x, y, w, angle, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  glow(ctx, 0, 0, w * 3.4, RED, alpha * 0.46);
  const paint = ctx.createLinearGradient(-w, 0, w, 0);
  paint.addColorStop(0, rgba([162, 40, 21], alpha));
  paint.addColorStop(0.42, rgba([255, 127, 61], alpha));
  paint.addColorStop(0.58, rgba([255, 159, 81], alpha));
  paint.addColorStop(1, rgba([176, 44, 22], alpha));
  ctx.fillStyle = paint;
  ctx.beginPath();
  ctx.moveTo(-w * 0.64, -w * 1.05);
  ctx.bezierCurveTo(-w * 1.28, -w * 0.41, -w * 1.24, w * 0.66, -w * 0.61, w * 0.94);
  ctx.quadraticCurveTo(0, w * 1.11, w * 0.61, w * 0.94);
  ctx.bezierCurveTo(w * 1.24, w * 0.66, w * 1.28, -w * 0.41, w * 0.64, -w * 1.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba([255, 200, 125], alpha * 0.57);
  ctx.lineWidth = w * 0.12;
  ctx.beginPath();
  ctx.moveTo(-w * 0.6, -w * 1.02);
  ctx.lineTo(w * 0.6, -w * 1.02);
  ctx.moveTo(-w * 0.52, w * 0.89);
  ctx.quadraticCurveTo(0, w * 1.04, w * 0.52, w * 0.89);
  ctx.stroke();
  ctx.strokeStyle = rgba([151, 48, 28], alpha * 0.62);
  ctx.lineWidth = w * 0.06;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(w * 0.25 * side, -w * 1.02);
    ctx.quadraticCurveTo(w * 0.62 * side, 0, w * 0.25 * side, w * 0.92);
    ctx.stroke();
  }
  if (w >= 4.5) {
    line(ctx, -w * 0.35, -w * 1.16, w * 0.35, -w * 1.16, rgba([255, 188, 110], alpha * 0.82), w * 0.14);
    line(ctx, 0, w * 0.95, w * 0.13, w * 1.8, rgba([255, 197, 118], alpha * 0.75), w * 0.1);
    for (const side of [-1, 0, 1]) {
      line(ctx, w * 0.13, w * 1.73, w * (0.13 + side * 0.14), w * 2.12, rgba([252, 156, 79], alpha * 0.72), 0.43);
    }
  }
  ctx.restore();
}

export function lanternSky(ctx, t, gain) {
  glow(ctx, 122 + 16 * Math.sin(t * 0.53), 34, 59, [233, 99, 60], gain * 0.14);
  for (const e of embers) {
    const y = mod(e.y - t * e.speed, H + 28) - 14;
    const x = e.x + 10 * Math.sin(t * 0.47 + e.phase);
    const a = gain * (0.28 + 0.4 * Math.sin(t * 2.45 + e.phase) ** 2) * (1 - clamp((y - 54) / 185));
    dot(ctx, x, y, e.size, WARM, a);
  }
  for (const l of lanterns) {
    const y = mod(l.y - t * l.speed, H + 43) - 21;
    const x = l.x + 12 * Math.sin(t * 0.58 + l.phase);
    const a = gain * l.alpha * fadePastTitle(y) * (0.79 + 0.21 * Math.sin(t * 2.5 + l.phase) ** 2);
    lamp(ctx, x, y, l.size, Math.sin(t * 0.75 + l.phase) * 0.19, a);
  }
  const ascent = mod(t, 5.4) / 5.4;
  const x = 122 + 19 * Math.sin(t * 0.65);
  const y = 82 - 73 * ascent;
  const alpha = gain * clamp(ascent * 9) * clamp((1 - ascent) * 6) * 0.94;
  lamp(ctx, x, y, 8.3 + ascent * 1.5, Math.sin(t * 1.3) * 0.18, alpha);
}

const heartLights = samples(408, 23, (r) => ({
  x: 9 + r() * 178, y: r() * 139, speed: 8 + r() * 13, phase: r() * TAU, size: 1.5 + r() ** 1.6 * 4.6,
}));
const flowerPetals = samples(512, 30, (r) => ({
  x: r() * W, y: r() * 145, speed: 11 + r() * 15, phase: r() * TAU, size: 1.4 + r() * 3.2,
}));
const starLights = samples(616, 38, (r) => ({
  x: 5 + r() * 186, y: r() * 93, phase: r() * TAU, size: 0.35 + r() ** 2 * 2.2,
}));
const confettiColors = [[245, 151, 214], [165, 156, 254], [117, 224, 220], [255, 212, 135]];
const confetti = samples(503, 46, (r, i) => ({
  x: r() * W, y: r() * 151, speed: 13 + r() * 20, phase: r() * TAU,
  size: 0.6 + r() * 1.2, color: confettiColors[i % confettiColors.length],
}));
const balloons = samples(710, 7, (r, i) => ({
  x: 14 + i * 27 + r() * 9, y: r() * 131, speed: 8 + r() * 7, phase: r() * TAU,
  size: 4.5 + r() * 3.4, color: confettiColors[i % confettiColors.length],
}));
const fireflies = samples(916, 28, (r) => ({
  x: r() * W, y: 7 + r() * 99, phase: r() * TAU, size: 0.36 + r() * 0.66,
}));
const partyBurst = samples(1010, 43, (r, i) => ({
  vx: (r() - 0.5) * 168, vy: -18 - r() * 79, angle: r() * TAU, spin: r() * 9 - 4.5,
  size: 0.8 + r() * 1.35, color: confettiColors[i % confettiColors.length],
}));

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.94);
  ctx.bezierCurveTo(-s * 2.34, -s * 0.55, -s * 0.95, -s * 1.6, 0, -s * 0.61);
  ctx.bezierCurveTo(s * 0.95, -s * 1.6, s * 2.34, -s * 0.55, 0, s * 0.94);
  ctx.closePath();
}

export function hearts(ctx, t, gain, elapsed) {
  const rose = [255, 126, 172];
  for (const light of heartLights) {
    const y = mod(light.y - t * light.speed, 139) - 13;
    const x = light.x + 11 * Math.sin(t * 0.72 + light.phase);
    const alpha = gain * (0.31 + 0.45 * Math.sin(t * 0.73 + light.phase) ** 2) * fadePastTitle(y);
    glow(ctx, x, y, light.size * 3, rose, alpha * 0.37);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.72 + light.phase) * 0.36);
    const s = light.size;
    ctx.fillStyle = rgba(rose, alpha);
    heartPath(ctx, s);
    ctx.fill();
    ctx.restore();
  }
  const p = mod(elapsed, 4.8);
  const pulse = 1 + 0.11 * Math.sin(t * 5) ** 2;
  const bright = [255, 197, 220];
  for (const [index, offset] of [-1, 1].entries()) {
    const approach = easeOut(p / 1.65);
    const x = 124 + offset * (38 - approach * 25);
    const y = 33 + offset * 7 + Math.sin(t * 1.5 + index) * 2;
    const a = gain * clamp(p * 3) * clamp((4.8 - p) * 2.4);
    glow(ctx, x, y, 26, rose, a * 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(offset * 0.24);
    heartPath(ctx, (index === 0 ? 11 : 9) * pulse);
    ctx.strokeStyle = rgba(bright, a * 0.91);
    ctx.lineWidth = 0.68;
    ctx.stroke();
    ctx.restore();
  }
}

export function petals(ctx, t, gain) {
  for (const petal of flowerPetals) {
    const y = mod(petal.y + t * petal.speed, 145) - 14;
    const x = petal.x + 15 * Math.sin(t * 0.72 + petal.phase);
    const turn = t * 0.86 + petal.phase;
    const alpha = gain * (0.53 + 0.38 * Math.cos(turn) ** 2) * fadePastTitle(y);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.scale(0.44 + 0.56 * Math.abs(Math.sin(turn)), 1);
    const s = petal.size;
    const paint = ctx.createLinearGradient(0, -s, 0, s);
    paint.addColorStop(0, rgba([255, 214, 201], alpha));
    paint.addColorStop(1, rgba([237, 119, 138], alpha * 0.7));
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s, s * 0.36, -s * 0.77, -s * 0.62, 0, -s);
    ctx.bezierCurveTo(s, -s * 0.64, s * 0.74, s * 0.2, 0, s);
    ctx.fill();
    ctx.restore();
  }
  for (const [i, x] of [54, 147].entries()) {
    const y = [24, 37][i];
    const phase = mod(t + i * 1.25, 5.2);
    const size = 6 + easeOut(phase / 1.65) * 12;
    const a = gain * clamp(phase * 2) * clamp((5.2 - phase) * 1.2);
    glow(ctx, x, y, size * 1.9, [245, 157, 155], a * 0.31);
    ctx.strokeStyle = rgba([255, 210, 199], a * 0.7);
    ctx.lineWidth = 0.58;
    ctx.beginPath();
    for (let lobe = 0; lobe < 7; lobe++) {
      const angle = lobe * TAU / 7 + t * 0.16 + i;
      const px = x + Math.cos(angle) * size * 0.51;
      const py = y + Math.sin(angle) * size * 0.51;
      ctx.moveTo(px + Math.cos(angle) * size * 0.48, py + Math.sin(angle) * size * 0.48);
      ctx.ellipse(px, py, size * 0.48, size * 0.26, angle, 0, TAU);
    }
    ctx.stroke();
    dot(ctx, x, y, 1.5, [255, 234, 191], a);
  }
}

export function starlight(ctx, t, gain) {
  const ice = [164, 211, 255];
  const constellation = [[28, 43], [47, 26], [67, 32], [92, 19], [110, 27]];
  const reveal = mod(t, 6.3);
  for (let i = 0; i < constellation.length; i++) {
    const [x, y] = constellation[i];
    const shine = gain * (0.72 + 0.28 * Math.sin(t * 2.5 + i) ** 2);
    dot(ctx, x, y, 0.79, [228, 243, 255], shine);
    if (i === 0) continue;
    const [previousX, previousY] = constellation[i - 1];
    const p = easeOut((reveal - 0.1 - i * 0.24) / 0.69);
    const alpha = shine * clamp((6.3 - reveal) * 1.4) * 0.61;
    line(ctx, previousX, previousY, previousX + (x - previousX) * p, previousY + (y - previousY) * p, rgba(ice, alpha), 0.47);
  }
  for (const star of starLights) {
    const alpha = gain * (0.25 + 0.71 * Math.sin(t * 1.67 + star.phase) ** 2);
    if (star.size < 1.25) {
      dot(ctx, star.x, star.y, star.size, ice, alpha);
      continue;
    }
    glow(ctx, star.x, star.y, star.size * 3.8, ice, alpha * 0.43);
    ctx.fillStyle = rgba(ice, alpha);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      const size = star.size * (i % 2 === 0 ? 1.7 : 0.36);
      ctx.lineTo(star.x + Math.cos(angle) * size, star.y + Math.sin(angle) * size);
    }
    ctx.fill();
  }
  for (const [index, delay] of [0, 2.35].entries()) {
    const p = mod(t - delay, 4.7);
    if (p > 1.25) continue;
    const x = 46 + index * 47 + 78 * p;
    const y = 11 + index * 17 + 24 * p;
    const alpha = gain * Math.sin(p / 1.25 * Math.PI);
    const tail = ctx.createLinearGradient(x - 37, y - 11.4, x, y);
    tail.addColorStop(0, rgba(ice, 0));
    tail.addColorStop(1, rgba(ice, alpha));
    ctx.strokeStyle = tail;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - 37, y - 11.4);
    ctx.lineTo(x, y);
    ctx.stroke();
    glow(ctx, x, y, 6.4, ice, alpha * 0.48);
  }
}

export function birthday(ctx, t, gain, elapsed) {
  for (const paper of confetti) {
    const y = mod(paper.y + t * paper.speed, 151) - 14;
    const x = paper.x + 9 * Math.sin(t * 1.1 + paper.phase);
    const alpha = gain * (0.28 + 0.57 * Math.sin(t * 1.52 + paper.phase) ** 2) * (1 - clamp((y - 72) / 101));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.5 + paper.phase);
    ctx.fillStyle = rgba(paper.color, alpha);
    ctx.fillRect(-paper.size, -0.6, paper.size * 2, 1.2);
    ctx.restore();
  }
  for (const balloon of balloons) {
    const y = mod(balloon.y - t * balloon.speed, 131) - 13;
    const x = balloon.x + 8 * Math.sin(t * 0.62 + balloon.phase);
    const s = balloon.size;
    const alpha = gain * (0.8 - 0.57 * clamp((y - 30) / 109));
    glow(ctx, x, y, s * 2.85, balloon.color, alpha * 0.38);
    const paint = ctx.createRadialGradient(x - s * 0.34, y - s * 0.42, 0, x, y, s * 1.25);
    paint.addColorStop(0, rgba([255, 245, 255], alpha));
    paint.addColorStop(0.5, rgba(balloon.color, alpha * 0.85));
    paint.addColorStop(1, rgba(balloon.color, alpha * 0.34));
    ctx.fillStyle = paint;
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.82, s * 1.08, -0.16, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(balloon.color, alpha * 0.64);
    ctx.lineWidth = 0.42;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.16, y + s);
    ctx.bezierCurveTo(x - 1.9, y + s + 6, x + 4, y + s + 10, x + 1, y + s + 16);
    ctx.stroke();
  }
  const burst = elapsed < 2.9 ? elapsed : mod(elapsed - 2.9, 5.9) - 1.6;
  if (burst >= 0 && burst < 2.8) {
    const a = gain * clamp(burst * 12) * (1 - burst / 2.8) ** 1.35;
    glow(ctx, 119, 55, 43, [218, 164, 255], a * Math.exp(-burst * 4.3) * 0.66);
    for (const paper of partyBurst) {
      const x = 119 + paper.vx * (1 - Math.exp(-burst * 1.85)) / 1.7;
      const y = 55 + paper.vy * burst + 37 * burst * burst;
      if (y < -8 || y > 147) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(paper.angle + burst * paper.spin);
      ctx.fillStyle = rgba(paper.color, a * fadePastTitle(y));
      ctx.fillRect(-paper.size, -0.54, paper.size * 2, 1.08);
      ctx.restore();
    }
  }
}

export function ripples(ctx, t, gain) {
  const jade = [116, 234, 198];
  for (const [index, x] of [44, 134, 96].entries()) {
    const y = 35 + 14 * index;
    for (let ring = 0; ring < 4; ring++) {
      const p = mod(t * (0.38 + index * 0.05) + ring / 4 + index * 0.22, 1);
      const size = 4 + 72 * p;
      ctx.strokeStyle = rgba(jade, gain * 0.62 * Math.sin(p * Math.PI) * (1 - p * 0.6));
      ctx.lineWidth = 0.48 + 0.58 * (1 - p);
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.23, -0.15, 0, TAU);
      ctx.stroke();
    }
  }
  for (const light of fireflies) {
    const x = light.x + 13 * Math.sin(t * 0.65 + light.phase);
    const y = light.y + 4 * Math.cos(t * 0.7 + light.phase);
    dot(ctx, x, y, light.size, jade, gain * (0.27 + 0.49 * Math.sin(t + light.phase) ** 2));
  }
  const crossing = mod(t, 6.8) / 6.8;
  const x = -24 + crossing * 248;
  const y = 47 + 4 * Math.sin(t * 0.95);
  const alpha = gain * clamp(crossing * 7) * clamp((1 - crossing) * 7);
  ctx.strokeStyle = rgba(jade, alpha * 0.62);
  ctx.lineWidth = 0.46;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 5);
  ctx.quadraticCurveTo(x - 24, y + 10, x - 45, y + 5 + Math.sin(t * 2.6) * 4);
  ctx.moveTo(x + 3, y + 6);
  ctx.quadraticCurveTo(x - 20, y + 16, x - 35, y + 13 + Math.cos(t * 2.6) * 4);
  ctx.stroke();
  ctx.fillStyle = rgba([157, 234, 201], alpha * 0.78);
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 1);
  ctx.quadraticCurveTo(x + 6, y + 4, x + 19, y - 4);
  ctx.quadraticCurveTo(x + 12, y + 7, x - 3, y + 5);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const oarX = x - 4 + i * 5;
    line(ctx, oarX, y - 1, oarX - 3 + Math.sin(t * 6 - i) * 3, y + 7, rgba([216, 255, 227], alpha * 0.86));
  }
}

export function moon(ctx, t, gain, elapsed) {
  const gold = [255, 223, 159];
  const x = 140 + 4 * Math.sin(t * 0.41);
  const y = 39 + 20 * (1 - easeOut(elapsed / 2.65)) + 3 * Math.sin(t * 0.61);
  glow(ctx, x, y, 43, gold, gain * 0.57);
  const surface = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 15);
  surface.addColorStop(0, rgba([255, 247, 218], gain * 0.99));
  surface.addColorStop(0.67, rgba(gold, gain * 0.94));
  surface.addColorStop(1, rgba([235, 181, 117], gain * 0.72));
  ctx.fillStyle = surface;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, TAU);
  ctx.fill();
  for (const [dx, dy, size] of [[4, -5, 3], [-5, 2, 3.7], [5, 5, 2], [-1, 7, 2.4]]) {
    glow(ctx, x + dx, y + dy, size, [188, 139, 92], gain * 0.27);
  }
  for (const [i, offset] of [0, 66, 146].entries()) {
    const cx = mod(t * (8 + i) + offset + 30, W + 92) - 46;
    const cy = 41 + i * 10;
    const cloud = ctx.createLinearGradient(cx - 36, cy, cx + 36, cy);
    cloud.addColorStop(0, rgba([106, 110, 153], 0));
    cloud.addColorStop(0.53, rgba([107, 109, 148], gain * (0.58 - i * 0.09)));
    cloud.addColorStop(1, rgba([106, 110, 153], 0));
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 37, 4 + i, -0.07, 0, TAU);
    ctx.fill();
  }
  for (const light of fireflies) {
    const px = light.x + 9 * Math.cos(t * 0.68 + light.phase);
    const py = light.y + 7 * Math.sin(t * 0.55 + light.phase);
    const alpha = gain * (0.23 + 0.68 * Math.sin(t * 1.18 + light.phase) ** 2);
    dot(ctx, px, py, light.size, gold, alpha);
  }
}
