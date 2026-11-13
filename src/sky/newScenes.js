import { W, TAU, clamp, mod, rgba, samples, glow, dot, line, easeOut, fadePastTitle } from "./drawing.js";

const gold = [255, 210, 137];
const ivory = [255, 235, 189];
const cyan = [173, 227, 246];
const violet = [194, 165, 255];
const coral = [255, 117, 79];
const jade = [154, 213, 184];

function ring(ctx, x, y, radius, color, alpha, width = 0.6) {
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.stroke();
}

export function clock(ctx, t, gain) {
  const x = 128;
  const y = 39;
  const phase = mod(t, 6.1);
  const face = easeOut(phase / 1.55);
  const beat = Math.exp(-Math.max(0, phase - 1.86) * 4.4) * clamp((phase - 1.86) * 17);
  glow(ctx, x, y, 48, gold, gain * (0.19 + beat * 0.52));
  ring(ctx, x, y, 24, ivory, gain * 0.67, 0.55);
  ring(ctx, x, y, 21.5, gold, gain * 0.24, 0.5);
  for (let i = 0; i < 60; i++) {
    const a = i * TAU / 60;
    const major = i % 5 === 0;
    const end = 20.1;
    const start = major ? 17.9 : 19.3;
    line(ctx, x + Math.sin(a) * start, y - Math.cos(a) * start,
      x + Math.sin(a) * end, y - Math.cos(a) * end, rgba(ivory, gain * (major ? 0.8 : 0.34)), major ? 0.72 : 0.35);
  }
  const minute = -1.2 * (1 - face);
  line(ctx, x, y, x + Math.sin(minute) * 17, y - Math.cos(minute) * 17, rgba(ivory, gain), 0.9);
  line(ctx, x, y, x - 2.5 * (1 - face), y - 10.9, rgba(gold, gain * 0.89), 1.2);
  const seconds = t * 0.69;
  line(ctx, x, y, x + Math.sin(seconds) * 18.2, y - Math.cos(seconds) * 18.2, rgba(coral, gain * 0.75), 0.46);
  dot(ctx, x, y, 1.3, ivory, gain);
  for (let i = 0; i < 2; i++) {
    const p = (phase - 1.9 - i * 0.24) / 1.42;
    if (p > 0 && p < 1) ring(ctx, x, y, 24 + p * 42, gold, gain * (1 - p) ** 2 * 0.64);
  }
}

const crackerBits = samples(325, 60, (r, i) => ({
  angle: r() * TAU, speed: 25 + r() * 43, spin: r() * 8 - 4, delay: i % 3 * 0.35,
  color: i % 3 === 0 ? coral : gold, size: 0.46 + r() * 1.15,
}));

export function crackers(ctx, t, gain) {
  const phase = mod(t, 4.1);
  const sway = Math.sin(t * 1.8) * 5;
  const smoke = clamp((phase - 0.67) * 1.3) * clamp((4.1 - phase) * 1.2);
  glow(ctx, 129 - (phase - 0.67) * 6, 37 - (phase - 0.67) * 8, 14 + phase * 4,
    [230, 144, 116], gain * smoke * 0.24);
  ctx.strokeStyle = rgba(gold, gain * 0.62);
  ctx.lineWidth = 0.54;
  ctx.beginPath();
  ctx.moveTo(126, 0);
  ctx.quadraticCurveTo(120 + sway, 17, 132 + sway, 47);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const y = 7 + i * 4.4;
    const x = 124 + sway * i / 8 + (i % 2 === 0 ? -4.7 : 3.8);
    const consumed = clamp((phase - 0.38 - (8 - i) * 0.17) * 12);
    const a = gain * (1 - consumed);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i % 2 === 0 ? -0.56 : 0.55);
    ctx.fillStyle = rgba(i % 3 === 0 ? [226, 71, 53] : [183, 53, 36], a);
    ctx.fillRect(-2.5, -4.6, 5, 9.2);
    line(ctx, -2.3, 2.8, 2.3, 2.8, rgba(gold, a * 0.86), 0.82);
    ctx.restore();
    if (consumed > 0 && consumed < 1) glow(ctx, x, y, 16, ivory, gain * Math.sin(consumed * Math.PI) * 0.78);
  }
  for (const bit of crackerBits) {
    const age = phase - 0.41 - bit.delay;
    if (age < 0 || age > 1.32) continue;
    const x = 126 + Math.cos(bit.angle) * bit.speed * age;
    const y = 41 - bit.delay * 43 + Math.sin(bit.angle) * bit.speed * age + 23 * age * age;
    const a = gain * (1 - age / 1.32) ** 1.5 * fadePastTitle(y);
    if (bit.size < 1) {
      dot(ctx, x, y, bit.size, ivory, a);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(bit.angle + age * bit.spin);
      ctx.fillStyle = rgba(bit.color, a);
      ctx.fillRect(-bit.size, -0.55, bit.size * 2, 1.1);
      ctx.restore();
    }
  }
}

export function riddles(ctx, t, gain) {
  const silkColors = [[236, 149, 140], [239, 196, 133], [197, 166, 224], [247, 167, 146]];
  for (const [i, x] of [23, 60, 108, 151].entries()) {
    const y = [33, 44, 24, 45][i];
    const sway = Math.sin(t * 1.34 + i * 0.92);
    const offset = sway * (3 + i);
    const a = gain * (0.76 + 0.17 * Math.sin(t * 1.3 + i));
    line(ctx, x, 0, x + offset, y - 9, rgba(ivory, a * 0.55), 0.53);
    glow(ctx, x + offset, y, 19, silkColors[i], a * 0.3);
    ctx.save();
    ctx.translate(x + offset, y);
    ctx.rotate(sway * 0.18);
    ctx.scale(0.52 + 0.48 * Math.abs(Math.cos(t * 0.73 + i)), 1);
    const paper = ctx.createLinearGradient(-6, -9, 6, 10);
    paper.addColorStop(0, rgba(ivory, a));
    paper.addColorStop(1, rgba(silkColors[i], a * 0.72));
    ctx.fillStyle = paper;
    ctx.fillRect(-6, -9, 12, 19);
    ctx.strokeStyle = rgba([93, 50, 65], a * 0.63);
    ctx.lineWidth = 0.53;
    ctx.strokeRect(-4.4, -7.4, 8.8, 15.8);
    for (const [j, length] of [6, 4, 6].entries()) {
      line(ctx, -3, -3.3 + j * 2.8, length - 3, -3.6 + j * 2.8, rgba([106, 62, 64], a * 0.68), 0.64);
    }
    line(ctx, 0, 10, sway * 2, 17, rgba(gold, a * 0.88), 0.84);
    ctx.restore();
  }
}

const raindrops = samples(198, 76, (r) => ({
  x: r() * (W + 26), y: r() * 149, speed: 21 + r() * 55, length: 3 + r() ** 1.8 * 15, alpha: 0.1 + r() * 0.34,
}));
const willowLeaves = samples(334, 14, (r) => ({
  x: r() * W, y: r() * 121, speed: 7 + r() * 11, phase: r() * TAU, size: 1.8 + r() * 4.9,
}));

export function rain(ctx, t, gain) {
  for (const drop of raindrops) {
    const y = mod(drop.y + t * drop.speed, 149) - 13;
    const x = mod(drop.x - t * drop.speed * 0.44, W + 26) - 12;
    line(ctx, x, y, x - drop.length * 0.45, y + drop.length,
      rgba(cyan, gain * drop.alpha * fadePastTitle(y)), drop.length > 12 ? 0.64 : 0.35);
  }
  for (const leaf of willowLeaves) {
    const y = mod(leaf.y + t * leaf.speed, 121) - 8;
    const x = mod(leaf.x - t * 11 + 9 * Math.sin(t + leaf.phase), W + 18) - 8;
    const a = gain * fadePastTitle(y) * 0.7;
    const size = leaf.size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(1.2 + Math.sin(t * 1.3 + leaf.phase) * 0.55);
    ctx.fillStyle = rgba(jade, a);
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.quadraticCurveTo(0, -size * 0.54, size, 0);
    ctx.quadraticCurveTo(size * 0.1, size * 0.28, -size, 0);
    ctx.fill();
    line(ctx, -size * 0.6, 0, size * 0.78, 0, rgba(cyan, a * 0.55), 0.35);
    ctx.restore();
  }
}

const forge = samples(652, 46, (r, i) => ({
  shift: r() * 1.9, vx: (r() - 0.5) * 87, vy: 30 + r() * 58, life: 0.45 + r() * 0.78,
  color: i % 4 === 0 ? coral : i % 4 === 1 ? ivory : gold,
}));

export function sparks(ctx, t, gain) {
  const sourceX = 117;
  const sourceY = 67;
  glow(ctx, sourceX, sourceY, 39, coral, gain * (0.19 + 0.1 * Math.sin(t * 5) ** 2));
  const metal = ctx.createLinearGradient(sourceX - 33, sourceY, sourceX + 35, sourceY);
  metal.addColorStop(0, rgba(gold, 0));
  metal.addColorStop(0.52, rgba(gold, gain * 0.88));
  metal.addColorStop(1, rgba(gold, 0));
  line(ctx, sourceX - 33, sourceY + 1.5, sourceX + 35, sourceY + 1.5, metal, 1.5);
  line(ctx, sourceX - 18, sourceY + 5, sourceX + 25, sourceY + 5, rgba(coral, gain * 0.33), 0.62);
  for (const ember of forge) {
    const p = mod(t + ember.shift, 1.9);
    if (p > ember.life) continue;
    const past = Math.max(0, p - 0.08);
    const x = sourceX + ember.vx * p;
    const y = sourceY - ember.vy * p + 36 * p * p;
    const alpha = gain * (1 - p / ember.life) ** 0.83;
    line(ctx, sourceX + ember.vx * past, sourceY - ember.vy * past + 36 * past * past,
      x, y, rgba(ember.color, alpha * 0.78), 0.6);
    dot(ctx, x, y, 0.7, ember.color, alpha);
  }
}

const kiteColors = [[125, 215, 246], [255, 183, 121], [229, 147, 181]];

export function kites(ctx, t, gain) {
  for (const [i, baseX] of [31, 99, 149].entries()) {
    const x = baseX + 9 * Math.sin(t * 0.96 + i * 1.6);
    const y = [25, 43, 27][i] + 8 * Math.cos(t * 0.72 + i);
    const size = [7, 10, 7.5][i];
    const bend = Math.sin(t * 2.2 + i);
    const color = kiteColors[i];
    ctx.strokeStyle = rgba(cyan, gain * 0.52);
    ctx.lineWidth = 0.47;
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.bezierCurveTo(x + 10 * bend, y + 22, x - 23, y + 28, x - 20 + 4 * bend, y + 41);
    ctx.stroke();
    for (let j = 1; j <= 3; j++) {
      const u = j / 3.6;
      const tx = x - 20 * u + bend * 4 * Math.sin(u * Math.PI);
      const ty = y + size + (41 - size) * u;
      line(ctx, tx - 2, ty - 1, tx + 2, ty + 1, rgba(color, gain * 0.69), 1);
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.26 + bend * 0.23);
    ctx.fillStyle = rgba(color, gain * 0.82);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.8, -1);
    ctx.lineTo(0, size * 1.15);
    ctx.lineTo(-size * 0.8, -1);
    ctx.closePath();
    ctx.fill();
    line(ctx, 0, -size, 0, size * 1.15, rgba(ivory, gain * 0.72), 0.46);
    line(ctx, -size * 0.8, -1, size * 0.8, -1, rgba(ivory, gain * 0.58), 0.44);
    ctx.restore();
  }
}

const bridgeStars = samples(889, 52, (r) => ({
  p: r(), depth: (r() - 0.5) * 31, size: 0.32 + r() * 0.89, phase: r() * TAU,
}));

function bridge(p) {
  return [13 + 170 * p, 57 - 31 * Math.sin(Math.PI * p)];
}

export function magpies(ctx, t, gain) {
  const phase = mod(t, 5);
  for (const star of bridgeStars) {
    const [x, y] = bridge(star.p);
    const alpha = gain * (0.38 + 0.59 * Math.sin(t * 1.9 + star.phase) ** 2);
    dot(ctx, x, y + star.depth, star.size, violet, alpha);
  }
  for (const [i, side] of [-1, 1].entries()) {
    const meet = easeOut(phase / 3);
    const p = 0.5 + side * (0.39 - meet * 0.33);
    const [x, y] = bridge(p);
    const flap = Math.sin(t * 9.7 + i * 0.74);
    const fade = gain * clamp((5 - phase) * 3);
    glow(ctx, x, y - 3, 12, violet, fade * 0.43);
    ctx.save();
    ctx.translate(x, y - 4);
    ctx.scale(-side, 1);
    ctx.fillStyle = rgba([228, 215, 255], fade * 0.94);
    ctx.beginPath();
    ctx.moveTo(6.7, 0);
    ctx.quadraticCurveTo(2, -2.7, 0, -1);
    ctx.quadraticCurveTo(-1, -6.5 * flap, -9, -5 * flap);
    ctx.lineTo(-6, 1.3);
    ctx.lineTo(-10.2, 4.8);
    ctx.quadraticCurveTo(-3.8, 4.2, 2.8, 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

const silkDust = samples(418, 30, (r) => ({
  x: r() * W, y: r() * 65, phase: r() * TAU, size: 0.3 + r() * 0.78,
}));

export function silk(ctx, t, gain, elapsed) {
  const right = 18 + (W + 2) * easeOut(elapsed / 1.35);
  const width = right + 12;
  const wave = (x) => 51 - x * 0.23 + 10 * Math.sin(x * 0.033 - t * 1.7);
  const hem = (x) => wave(x) + 10 + 13 * Math.sin(Math.PI * clamp(x / W))
    + 4 * Math.sin(x * 0.047 - t * 1.4);
  const fabric = ctx.createLinearGradient(18, 50, W - 21, 12);
  fabric.addColorStop(0, rgba([138, 27, 45], gain * 0.62));
  fabric.addColorStop(0.3, rgba([234, 68, 75], gain * 0.8));
  fabric.addColorStop(0.54, rgba([134, 23, 50], gain * 0.84));
  fabric.addColorStop(0.79, rgba([255, 132, 97], gain * 0.83));
  fabric.addColorStop(1, rgba([178, 44, 58], gain * 0.67));
  ctx.fillStyle = fabric;
  ctx.beginPath();
  ctx.moveTo(-12, wave(-12));
  for (let i = 1; i <= 54; i++) {
    const x = -12 + width * i / 54;
    ctx.lineTo(x, wave(x));
  }
  for (let i = 54; i >= 0; i--) {
    const x = -12 + width * i / 54;
    ctx.lineTo(x, hem(x));
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(gold, gain * 0.64);
  ctx.lineWidth = 0.76;
  ctx.beginPath();
  ctx.moveTo(-12, hem(-12));
  for (let i = 1; i <= 54; i++) {
    const x = -12 + width * i / 54;
    ctx.lineTo(x, hem(x));
  }
  ctx.stroke();
  ctx.strokeStyle = rgba(ivory, gain * 0.29);
  ctx.lineWidth = 0.48;
  ctx.beginPath();
  ctx.moveTo(-12, wave(-12) + 3);
  for (let i = 1; i <= 54; i++) {
    const x = -12 + width * i / 54;
    ctx.lineTo(x, wave(x) + 3);
  }
  ctx.stroke();
  for (const light of silkDust) {
    const x = mod(light.x + t * 9, W);
    const y = light.y + 5 * Math.sin(t + light.phase);
    dot(ctx, x, y, light.size, gold, gain * (0.26 + 0.66 * Math.sin(t * 1.8 + light.phase) ** 2));
  }
}

export function chrysanthemums(ctx, t, gain, elapsed) {
  const bloom = 0.16 + 0.84 * easeOut(elapsed / 2.1);
  for (const [i, x] of [47, 127, 162].entries()) {
    const y = [35, 33, 54][i];
    const size = [13, 19, 9][i] * bloom * (1 + Math.sin(t * 1.5 + i) * 0.045);
    glow(ctx, x, y, size * 1.95, gold, gain * 0.32);
    const bend = i % 2 === 0 ? -1 : 1;
    ctx.strokeStyle = rgba(jade, gain * 0.42 * bloom);
    ctx.lineWidth = 0.58;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.37);
    ctx.quadraticCurveTo(x + size * bend * 0.45, y + size * 0.99, x + size * bend * 0.13, y + size * 1.55);
    ctx.stroke();
    ctx.fillStyle = rgba(jade, gain * 0.24 * bloom);
    ctx.beginPath();
    ctx.moveTo(x + size * bend * 0.19, y + size * 1.34);
    ctx.quadraticCurveTo(x + size * bend * 0.62, y + size * 0.84, x + size * bend * 0.9, y + size);
    ctx.quadraticCurveTo(x + size * bend * 0.63, y + size * 1.37, x + size * bend * 0.19, y + size * 1.34);
    ctx.fill();
    for (let layer = 0; layer < 3; layer++) {
      const color = layer === 0 ? [231, 153, 83] : layer === 1 ? gold : ivory;
      const length = size * (1 - layer * 0.24);
      ctx.lineWidth = 0.65 + layer * 0.11;
      ctx.strokeStyle = rgba(color, gain * (0.58 + layer * 0.15));
      ctx.beginPath();
      for (let petal = 0; petal < 13; petal++) {
        const angle = TAU * petal / 13 + i + layer * 0.22 + t * 0.055;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        ctx.moveTo(x + dx * length * 0.22, y + dy * length * 0.22);
        const px = x + (dx + dy * 0.12) * length;
        const py = y + (dy - dx * 0.12) * length;
        ctx.quadraticCurveTo(x + (dx - dy * 0.15) * length * 0.72, y + (dy + dx * 0.15) * length * 0.72, px, py);
        ctx.quadraticCurveTo(x + (dx + dy * 0.34) * length * 0.71, y + (dy - dx * 0.34) * length * 0.71,
          x + dx * length * 0.22, y + dy * length * 0.22);
      }
      ctx.stroke();
    }
    dot(ctx, x, y, size * 0.16, gold, gain * 0.89);
  }
}

function crystal(ctx, x, y, size, rotation, gain) {
  ctx.strokeStyle = rgba(cyan, gain);
  ctx.lineWidth = 0.52;
  ctx.beginPath();
  for (let branch = 0; branch < 6; branch++) {
    const angle = branch * TAU / 6 + rotation;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * dx, y + size * dy);
    for (const length of [0.43, 0.65, 0.83]) {
      const px = x + size * length * dx;
      const py = y + size * length * dy;
      const twig = size * (0.15 - length * 0.06);
      ctx.moveTo(px + twig * (dx * 0.92 - dy), py + twig * (dy * 0.92 + dx));
      ctx.lineTo(px, py);
      ctx.lineTo(px + twig * (dx * 0.92 + dy), py + twig * (dy * 0.92 - dx));
    }
  }
  ctx.stroke();
}

export function frost(ctx, t, gain, elapsed) {
  for (const [i, node] of [[6, 13, 26], [43, 19, 14], [142, 31, 22], [191, 73, 23], [180, 9, 13]].entries()) {
    const [x, y, size] = node;
    const growth = easeOut((elapsed - i * 0.13) / 1.9);
    const twinkle = 0.73 + 0.27 * Math.sin(t * 1.58 + i) ** 2;
    if (growth <= 0) continue;
    glow(ctx, x, y, size * 1.75, violet, gain * growth * twinkle * 0.24);
    crystal(ctx, x, y, size * growth, i * 0.38, gain * twinkle * growth * 0.91);
    dot(ctx, x, y, 0.9, ivory, gain * twinkle * growth);
  }
}
