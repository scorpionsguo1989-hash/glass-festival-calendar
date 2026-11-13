import { auraColors, sceneColors } from "./effects.js";
import { Sky } from "./Sky.jsx";

export function MotionPreview({ scene, reduced, replay }) {
  return (
    <div className="effect-preview" style={sceneColors(scene)} aria-hidden="true">
      <div className={"aura aura--" + scene} data-active="true" style={auraColors(scene)} />
      <div className="glass-edge" />
      <Sky scene={scene} running={!reduced} replay={replay} />
    </div>
  );
}
