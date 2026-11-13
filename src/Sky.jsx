import { useLayoutEffect, useRef } from "react";
import { H, W } from "./sky/drawing.js";
import { paintScene, scenes } from "./sky/scenes.js";

const FADE_SECONDS = 0.32;

function newFrame(scene, running) {
  return { scene, elapsed: running ? 0 : scenes[scene].poster };
}

export function Sky({ scene, running, replay = 0 }) {
  const surface = useRef(null);
  const model = useRef({ current: newFrame(scene, running), previous: null, blend: 1, replay });
  const paint = useRef(null);

  useLayoutEffect(() => {
    const canvas = surface.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    paint.current = () => {
      const { current, previous, blend } = model.current;
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (previous) paintScene(ctx, previous, 1 - blend);
      paintScene(ctx, current, blend);
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (width < 1 || height < 1) return;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      paint.current();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => {
      observer.disconnect();
      paint.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const state = model.current;
    const changedScene = state.current.scene !== scene;
    if (changedScene || state.replay !== replay) {
      // During rapid switching, fade from the scene that is currently strongest.
      state.previous = running && changedScene
        ? (state.blend < 0.5 ? state.previous ?? state.current : state.current)
        : null;
      state.current = newFrame(scene, running);
      state.blend = state.previous ? 0 : 1;
      state.replay = replay;
    }
    paint.current?.();
    if (!running) return;

    let request;
    let last;
    const animate = (now) => {
      const delta = last === undefined ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      state.current.elapsed += delta;
      if (state.previous) {
        state.previous.elapsed += delta;
        state.blend = Math.min(1, state.blend + delta / FADE_SECONDS);
        if (state.blend === 1) state.previous = null;
      }
      paint.current?.();
      request = requestAnimationFrame(animate);
    };
    request = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(request);
  }, [scene, running, replay]);

  return <canvas className="sky" ref={surface} aria-hidden="true" />;
}
