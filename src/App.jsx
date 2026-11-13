import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sky } from "./Sky.jsx";
import { EffectGallery } from "./EffectGallery.jsx";
import { FestivalEditor } from "./FestivalEditor.jsx";
import { EFFECTS, auraColors, sceneColors } from "./effects.js";
import {
  KEYFRAMES, WEEKDAYS, asKey, calendarGrid, dateFromKey, displayLabels, presetFestivalsOn, stepDate, stepMonth,
} from "./calendar.js";
import { PERSONAL_FESTIVALS_KEY, readPersonalFestivals, updatePersonalFestivals } from "./personalFestivals.js";

const navKeys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const reducedQuery = "(prefers-reduced-motion: reduce)";
const monthOrdinal = (date) => date.year * 12 + date.month;

export function App() {
  const [frame, setFrame] = useState(() => ({
    date: KEYFRAMES[0], direction: 1, eventId: presetFestivalsOn(KEYFRAMES[0])[0]?.id, replay: 0,
  }));
  const [personalFestivals, setPersonalFestivals] = useState(readPersonalFestivals);
  const [editor, setEditor] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [reduced, setReduced] = useState(() => matchMedia(reducedQuery).matches);
  const [mode, setMode] = useState(() =>
    matchMedia(reducedQuery).matches || new URLSearchParams(location.search).get("play") === "0" ? "paused" : "tour",
  );
  const frameRef = useRef(frame);
  const modeRef = useRef(mode);
  const nextFocus = useRef(null);
  const tilt = useRef(null);
  const dates = useRef(new Map());
  const hold = useRef(null);
  const { date, direction, eventId, replay } = frame;
  const grid = calendarGrid(date, personalFestivals);
  const selected = date.day === null ? null : asKey(date);
  const position = grid.findIndex(({ key }) => key === selected);
  const dayEvents = grid[position]?.events ?? [];
  const activeEvent = dayEvents.find((item) => item.id === eventId) ?? dayEvents[0];
  const nextEvent = dayEvents.length > 1 ? dayEvents[(dayEvents.indexOf(activeEvent) + 1) % dayEvents.length] : null;
  const { title, date: caption, month, scene } = displayLabels(date, activeEvent);
  const focusable = selected ?? grid.find((day) => day.inMonth)?.key;

  function changeDate(next, nextEventId = null) {
    const previous = frameRef.current;
    const travel = Math.sign(monthOrdinal(next) - monthOrdinal(previous.date));
    const nextFrame = { date: next, direction: travel || previous.direction, eventId: nextEventId, replay: previous.replay + 1 };
    frameRef.current = nextFrame;
    setFrame(nextFrame);
  }

  function changeMode(next) {
    modeRef.current = next;
    setMode(next);
  }

  useEffect(() => {
    const pref = matchMedia(reducedQuery);
    const onChange = () => {
      setReduced(pref.matches);
      if (pref.matches) changeMode("paused");
    };
    pref.addEventListener("change", onChange);
    return () => pref.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const syncPersonalFestivals = (event) => {
      if (event.key === PERSONAL_FESTIVALS_KEY || event.key === null) setPersonalFestivals(readPersonalFestivals());
    };
    window.addEventListener("storage", syncPersonalFestivals);
    return () => window.removeEventListener("storage", syncPersonalFestivals);
  }, []);

  useEffect(() => {
    if (mode !== "tour") return;
    const index = KEYFRAMES.findIndex((item) => monthOrdinal(item) === monthOrdinal(date) && item.day === date.day);
    const wait = hold.current ?? KEYFRAMES[index]?.hold ?? (index < 0 ? 2500 : 4900);
    const deadline = performance.now() + wait;
    hold.current = null;
    const timer = setTimeout(() => {
      if (modeRef.current === "tour") {
        const next = KEYFRAMES[(index + 1) % KEYFRAMES.length];
        changeDate(next, presetFestivalsOn(next)[0]?.id);
      }
    }, wait);
    return () => {
      clearTimeout(timer);
      if (modeRef.current === "paused") hold.current = Math.max(180, deadline - performance.now());
    };
  }, [date, mode]);

  useLayoutEffect(() => {
    if (!nextFocus.current) return;
    dates.current.get(nextFocus.current)?.focus({ preventScroll: true });
    nextFocus.current = null;
  }, [frame]);

  function chooseDate(next, focus = false, chosenEvent = null) {
    if (focus) nextFocus.current = asKey(next);
    hold.current = null;
    changeMode(reduced ? "paused" : "manual");
    changeDate(next, chosenEvent);
  }

  function flip(delta) {
    chooseDate(stepMonth(frameRef.current.date, delta));
  }

  function navigate(event, day) {
    if (!(event.key in navKeys)) return;
    event.preventDefault();
    chooseDate(stepDate(day, navKeys[event.key]), true);
  }

  function pointerMove(event) {
    if (reduced || modeRef.current === "paused" || event.pointerType !== "mouse" || !tilt.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tilt.current.style.setProperty("--rx", -y * 8 + "deg");
    tilt.current.style.setProperty("--ry", x * 10 + "deg");
  }

  function pointerLeave() {
    tilt.current?.style.setProperty("--rx", "0deg");
    tilt.current?.style.setProperty("--ry", "0deg");
  }

  function openEditor() {
    setEditor({
      currentDate: asKey({ ...date, day: date.day ?? 1 }),
      initial: personalFestivals.find((item) => item.id === activeEvent?.id),
      resumeMode: modeRef.current,
    });
    changeMode("paused");
  }

  function closeEditor() {
    changeMode(reduced ? "paused" : editor.resumeMode);
    setEditor(null);
  }

  function openGallery() {
    setGallery({ scene, resumeMode: modeRef.current });
    changeMode("paused");
  }

  function closeGallery() {
    changeMode(reduced ? "paused" : gallery.resumeMode);
    setGallery(null);
  }

  function jumpFromGallery(next, chosenEvent) {
    setGallery(null);
    chooseDate(next, true, chosenEvent);
  }

  function persist(change) {
    try {
      setPersonalFestivals(updatePersonalFestivals(change));
      return true;
    } catch {
      return false;
    }
  }

  function upsertFestival(item) {
    return persist((entries) => {
      if (!entries.some((entry) => entry.id === item.id)) return [...entries, item];
      return entries.map((entry) => entry.id === item.id ? item : entry);
    });
  }

  function saveFestival(item) {
    if (!upsertFestival(item)) return false;
    const savedDate = dateFromKey(item.date);
    const occurrence = { ...savedDate, year: frameRef.current.date.year };
    const sameDayThisYear = asKey(occurrence).slice(-5) === item.date.slice(-5);
    setEditor(null);
    chooseDate(item.repeat && sameDayThisYear ? occurrence : savedDate, true, item.id);
    return true;
  }

  return (
    <main className="experience" data-mode={mode} data-scene={scene} style={sceneColors(scene)} aria-label="节日玻璃日历">
      <div className="stage">
        {Object.keys(EFFECTS).map((kind) => (
          <div key={kind} className={"aura aura--" + kind} data-active={kind === scene} style={auraColors(kind)} aria-hidden="true" />
        ))}
        <div className="widget" onPointerMove={pointerMove} onPointerLeave={pointerLeave}>
          <section className="glass" ref={tilt} aria-label={month} aria-describedby="calendar-help">
            <div className="glass-edge" aria-hidden="true" />
            <Sky scene={scene} running={mode !== "paused" && !reduced} replay={replay} />
            <nav className="month-nav" aria-label="切换月份">
              <button type="button" className="month-step" aria-label="上个月" onClick={() => flip(-1)}>
                <span className="month-icon month-icon--left" aria-hidden="true" />
              </button>
              <button type="button" className="month-step" aria-label="下个月" onClick={() => flip(1)}>
                <span className="month-icon month-icon--right" aria-hidden="true" />
              </button>
            </nav>
            <header className="scene-header" aria-live={mode === "tour" ? "off" : "polite"} aria-atomic="true">
              <div className="scene-label" key={caption + title}>
                <p className="eyebrow">{caption}</p>
                <div className="title-row">
                  <h1>{title}</h1>
                  {nextEvent && (
                    <button
                      type="button"
                      className="event-switch"
                      aria-label={"切换到" + nextEvent.name}
                      onClick={() => chooseDate(date, false, nextEvent.id)}
                    >
                      切换
                    </button>
                  )}
                </div>
              </div>
            </header>
            <div className="calendar-grid">
              <div className="weekdays" aria-hidden="true">
                {WEEKDAYS.map((day) => <abbr key={day} title={"星期" + day}>{day}</abbr>)}
              </div>
              <div className="calendar-window">
                <div
                  key={monthOrdinal(date)}
                  className="days"
                  role="group"
                  aria-label={month + "日期"}
                  data-direction={direction}
                  style={{ "--row-height": grid.length === 42 ? "9.15cqw" : "10.95cqw" }}
                >
                  {position >= 0 && (
                    <span className="selection" aria-hidden="true" style={{ "--column": position % 7, "--row": Math.floor(position / 7) }}>
                      {activeEvent && <span key={replay} className="selection-pulse" />}
                    </span>
                  )}
                  {grid.map((day) => {
                    const first = day.events[0];
                    const names = day.events.map((item) => item.name).join("、");
                    return (
                      <button
                        key={day.key}
                        type="button"
                        className="day"
                        ref={(node) => {
                          if (node) dates.current.set(day.key, node);
                          else dates.current.delete(day.key);
                        }}
                        data-outside={!day.inMonth}
                        data-event={first?.scene}
                        style={first ? { "--dot": "rgb(" + EFFECTS[first.scene].accent + ")" } : undefined}
                        title={names || undefined}
                        aria-label={names ? day.label + "，" + names : day.label}
                        aria-pressed={day.key === selected}
                        tabIndex={day.key === focusable ? 0 : -1}
                        onClick={() => chooseDate(day)}
                        onKeyDown={(event) => navigate(event, day)}
                      >
                        <span>{day.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="sr-only" id="calendar-help">带圆点的日期有节日。用方向键移动日期。可以在动效一览预览画面，也可以添加生日和纪念日。农历节日和节气覆盖2026年至2030年。</p>
          </section>
        </div>
      </div>
      <div className="calendar-tools">
        <button type="button" className="customize" aria-haspopup="dialog" onClick={openEditor}>自定义节日</button>
        <button type="button" className="customize" aria-haspopup="dialog" onClick={openGallery}>动效一览</button>
      </div>
      <button
        type="button"
        className="playback"
        aria-label={mode === "paused" ? "播放节日演示" : "暂停节日演示"}
        onClick={() => changeMode(mode === "paused" ? "tour" : "paused")}
      >
        {mode === "paused" ? "播放" : "暂停"}
      </button>
      {editor && (
        <FestivalEditor
          currentDate={editor.currentDate}
          initial={editor.initial}
          entries={personalFestivals}
          reduced={reduced}
          onClose={closeEditor}
          onSave={saveFestival}
          onRemove={(id) => persist((entries) => entries.filter((item) => item.id !== id))}
          onRestore={upsertFestival}
        />
      )}
      {gallery && (
        <EffectGallery initialScene={gallery.scene} reduced={reduced} onClose={closeGallery} onJump={jumpFromGallery} />
      )}
    </main>
  );
}
