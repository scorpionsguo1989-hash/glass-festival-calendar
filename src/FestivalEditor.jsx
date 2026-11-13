import { useLayoutEffect, useRef, useState } from "react";
import { dateFromKey } from "./calendar.js";
import { EFFECTS } from "./effects.js";
import { MAX_EVENT_NAME } from "./personalFestivals.js";
import { MotionPreview } from "./MotionPreview.jsx";

function emptyDraft(date) {
  return { id: "", name: "", date, repeat: true, scene: "birthday" };
}

function scheduleLabel(item) {
  const { year, month, day } = dateFromKey(item.date);
  return (item.repeat ? "每年" : year + "年") + (month + 1) + "月" + day + "日";
}

export function FestivalEditor({ currentDate, initial, entries, reduced, onClose, onSave, onRemove, onRestore }) {
  const [draft, setDraft] = useState(() => initial ?? emptyDraft(currentDate));
  const [error, setError] = useState("");
  const [removed, setRemoved] = useState(null);
  const dialog = useRef(null);
  const nameInput = useRef(null);

  useLayoutEffect(() => {
    const modal = dialog.current;
    modal.showModal();
    nameInput.current?.focus();
    return () => modal.close();
  }, []);

  function edit(item) {
    setDraft(item);
    setError("");
    nameInput.current?.focus();
  }

  function update(event) {
    const { name, value, type, checked } = event.currentTarget;
    setDraft((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  function save(event) {
    event.preventDefault();
    const name = draft.name.trim();
    const date = new FormData(event.currentTarget).get("date");
    if (!name || !dateFromKey(date)) {
      setError("请填写节日名称并选一个有效日期。");
      return;
    }
    const entry = { ...draft, name, date, id: draft.id || crypto.randomUUID() };
    if (!onSave(entry)) setError("当前浏览器无法保存设置，请检查本地存储权限。");
  }

  function remove() {
    const savedEntry = entries.find((entry) => entry.id === draft.id);
    if (!onRemove(draft.id)) {
      setError("当前浏览器无法更新设置。");
      return;
    }
    setRemoved(savedEntry ?? null);
    edit(emptyDraft(currentDate));
  }

  function restore() {
    if (!onRestore(removed)) {
      setError("当前浏览器无法恢复设置。");
      return;
    }
    edit(removed);
    setRemoved(null);
  }

  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, "zh-CN"));

  return (
    <dialog
      ref={dialog}
      className="festival-editor"
      aria-labelledby="editor-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      <form onSubmit={save}>
        <header className="editor-header">
          <h2 id="editor-title">自定义节日</h2>
          <button type="button" className="editor-text-button" onClick={onClose}>关闭</button>
        </header>
        <div className="editor-body">
          <div className="editor-fields">
            <label className="field">
              名称
              <input
                ref={nameInput}
                name="name"
                value={draft.name}
                placeholder="例如：我的生日"
                maxLength={MAX_EVENT_NAME}
                required
                onChange={update}
              />
            </label>
            <label className="field">
              日期
              <input key={draft.id} type="date" name="date" defaultValue={draft.date} required />
            </label>
            <label className="repeat-field">
              <input type="checkbox" name="repeat" checked={draft.repeat} onChange={update} />
              每年重复
            </label>
            <label className="field">
              动效
              <select name="scene" value={draft.scene} onChange={update}>
                {Object.entries(EFFECTS).map(([key, effect]) => <option key={key} value={key}>{effect.label}</option>)}
              </select>
            </label>
          </div>
          <div className="editor-preview-column">
            <p>动效预览</p>
            <MotionPreview scene={draft.scene} reduced={reduced} />
          </div>
        </div>
        {error && <p className="editor-error" role="alert">{error}</p>}
        {removed && (
          <p className="editor-notice" role="status">
            已移除「{removed.name}」
            <button className="editor-text-button" type="button" onClick={restore}>撤销</button>
          </p>
        )}
        <div className="editor-actions">
          {draft.id && <button type="button" className="editor-remove" onClick={remove}>移除节日</button>}
          <button className="editor-save" type="submit">保存</button>
        </div>
        {ordered.length > 0 && (
          <section className="saved-festivals" aria-label="已设置的节日">
            <div className="saved-header">
              <h3>已设置</h3>
              {draft.id && (
                <button className="editor-text-button" type="button" onClick={() => edit(emptyDraft(currentDate))}>新增</button>
              )}
            </div>
            {ordered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="saved-festival"
                aria-pressed={draft.id === entry.id}
                onClick={() => edit(entry)}
              >
                <span>{entry.name}</span><small>{scheduleLabel(entry)}</small>
              </button>
            ))}
          </section>
        )}
      </form>
    </dialog>
  );
}
