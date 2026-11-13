import { EFFECTS } from "../effects.js";
import { W, H, clamp, easeOut, glow, rgba } from "./drawing.js";
import { ribbons, snow, fireworks, lanternSky, hearts, petals, starlight, birthday, ripples, moon } from "./festivalScenes.js";
import { clock, crackers, riddles, rain, sparks, kites, magpies, silk, chrysanthemums, frost } from "./newScenes.js";

export const scenes = {
  idle: { draw: (ctx, t, gain) => ribbons(ctx, t, gain), offset: 1.2, poster: 1.4 },
  snow: { draw: snow, offset: 1.8, poster: 1.1 },
  fireworks: { draw: fireworks, offset: 0, poster: 1.2 },
  lanterns: { draw: lanternSky, offset: 0.7, poster: 1.4 },
  hearts: { draw: hearts, offset: 0.3, poster: 1.9 },
  petals: { draw: petals, offset: 0.3, poster: 1.4 },
  starlight: { draw: starlight, offset: 0, poster: 1.12 },
  birthday: { draw: birthday, offset: 0.35, poster: 0.94 },
  ripples: { draw: ripples, offset: 0.2, poster: 3.3 },
  moon: { draw: moon, offset: 0.4, poster: 2.35 },
  clock: { draw: clock, offset: 0, poster: 2.28 },
  crackers: { draw: crackers, offset: 0, poster: 0.96 },
  riddles: { draw: riddles, offset: 0.2, poster: 1.25 },
  rain: { draw: rain, offset: 0.4, poster: 1.3 },
  sparks: { draw: sparks, offset: 0.2, poster: 1.2 },
  kites: { draw: kites, offset: 0.2, poster: 1.25 },
  magpies: { draw: magpies, offset: 0, poster: 2.1 },
  silk: { draw: silk, offset: 0.3, poster: 1.6 },
  chrysanthemums: { draw: chrysanthemums, offset: 0.2, poster: 2.7 },
  frost: { draw: frost, offset: 0.2, poster: 2.85 },
};

const accents = Object.fromEntries(
  Object.entries(EFFECTS).map(([scene, effect]) => [scene, effect.accent.split(" ").map(Number)]),
);

function lightOnGlass(ctx, scene, elapsed, gain) {
  const phase = clamp(elapsed / 1.32);
  if (phase === 0 || phase === 1 || scene === "idle") return;
  const alpha = gain * Math.sin(Math.PI * phase);
  const x = -36 + (W + 72) * easeOut(phase);
  const color = accents[scene];
  glow(ctx, x, 32, 63, color, alpha * 0.21);

  const edge = ctx.createLinearGradient(x - 50, 16, x + 50, 5);
  edge.addColorStop(0, rgba(color, 0));
  edge.addColorStop(0.5, rgba(color, alpha * 0.77));
  edge.addColorStop(1, rgba(color, 0));
  ctx.lineWidth = 1;
  ctx.strokeStyle = edge;
  ctx.beginPath();
  ctx.roundRect(0.8, 0.8, W - 1.6, H - 1.6, 16.3);
  ctx.stroke();
}

export function paintScene(ctx, { scene, elapsed }, gain = 1) {
  if (gain <= 0) return;
  const { draw, offset } = scenes[scene];
  lightOnGlass(ctx, scene, elapsed, gain);
  draw(ctx, elapsed + offset, gain, elapsed);
}
