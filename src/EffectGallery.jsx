import { useLayoutEffect, useRef, useState } from "react";
import { KEYFRAMES, presetFestivalsOn } from "./calendar.js";
import { EFFECTS } from "./effects.js";
import { MotionPreview } from "./MotionPreview.jsx";

const examples = new Map(KEYFRAMES.map((date) => {
  const festival = presetFestivalsOn(date)[0];
  return [festival.scene, { date, festival }];
}));

export function EffectGallery({ initialScene, reduced, onClose, onJump }) {
  const [choice, setChoice] = useState({ scene: initialScene, replay: 0 });
  const dialog = useRef(null);
  const example = examples.get(choice.scene);

  useLayoutEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    return () => modal.close();
  }, []);

  function select(scene) {
    setChoice((previous) => ({ scene, replay: previous.replay + 1 }));
  }

  return (
    <dialog
      ref={dialog}
      className="festival-editor effect-gallery"
      aria-labelledby="gallery-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="editor-header">
        <h2 id="gallery-title">动效一览</h2>
        <button type="button" className="editor-text-button" onClick={onClose}>关闭</button>
      </header>
      <div className="gallery-body">
        <section className="gallery-sample" aria-label="当前动效">
          <MotionPreview scene={choice.scene} reduced={reduced} replay={choice.replay} />
          <div className="gallery-caption">
            <p aria-live="polite">{EFFECTS[choice.scene].label}</p>
            {!reduced && (
              <button className="editor-text-button" type="button" onClick={() => select(choice.scene)}>重播</button>
            )}
          </div>
          {example && (
            <button className="gallery-jump" type="button" onClick={() => onJump(example.date, example.festival.id)}>
              在日历中看{example.festival.name}
            </button>
          )}
        </section>
        <div className="gallery-options" role="group" aria-label="选择动效">
          {Object.entries(EFFECTS).map(([scene, effect]) => {
            const name = examples.get(scene)?.festival.name ?? (scene === "birthday" ? "生日" : "日常");
            return (
              <button
                type="button"
                key={scene}
                className="gallery-option"
                style={{ "--option-color": effect.accent }}
                aria-pressed={choice.scene === scene}
                onClick={() => select(scene)}
              >
                <span>{name}</span>
                <small>{effect.label}</small>
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
