import { place } from "./interactions.js";

const benefits = [
  ["comfort", "Комфортные условия", "Офис или удалёнка по московскому времени — на ваше усмотрение"],
  ["health", "Забота о здоровье", "ДМС, телемедицина, чекапы"],
  ["growth", "Развитие в профессии", "Менторство, командные мероприятия, условия роста"],
  ["start", "Эффективный старт", "Стажёрские программы, программы карьерного старта, обучение ИТ-профессиям"],
];

function mountRail(parent, variant, label, name, box, items) {
  const rail = document.createElement("div");
  rail.className = "mobile-home-rail " + name;
  rail.setAttribute("role", "region");
  rail.setAttribute("aria-label", label);
  rail.tabIndex = 0;
  place(rail, box, variant.width, variant.height);
  const track = document.createElement("div");
  track.className = "mobile-home-rail-track";
  rail.append(track);
  parent.append(rail);

  const group = document.createElement("div");
  group.className = "mobile-home-rail-group";
  group.append(...items);
  track.append(group);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return () => {};
  const copy = group.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  track.append(copy, copy.cloneNode(true));

  let frame = 0;
  let last = 0;
  let fraction = 0;
  let previous = 0;
  let resumeAfter = 0;
  let pointer = false;
  let visible = false;
  function pause() {
    resumeAfter = performance.now() + 4200;
  }
  function step(now) {
    frame = 0;
    if (!visible || reduce.matches || document.hidden) return;
    const dt = last ? Math.min(now - last, 40) : 0;
    last = now;
    if (previous !== rail.scrollLeft) {
      fraction = 0;
      pause();
    }
    if (!pointer && !rail.matches(":focus-within") && now >= resumeAfter) {
      const width = copy.offsetLeft - group.offsetLeft;
      if (width > 0) {
        fraction += dt * .017;
        const pixels = Math.floor(fraction);
        fraction -= pixels;
        if (pixels) rail.scrollLeft = (rail.scrollLeft + pixels) % width;
      }
    }
    previous = rail.scrollLeft;
    frame = requestAnimationFrame(step);
  }
  const schedule = () => {
    if (frame || !visible || reduce.matches || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(step);
  };
  const listeners = new AbortController();
  const options = { signal: listeners.signal, passive: true };
  rail.addEventListener("pointerdown", () => { pointer = true; pause(); }, options);
  for (const event of ["pointerup", "pointercancel"]) {
    window.addEventListener(event, () => { pointer = false; }, options);
  }
  rail.addEventListener("wheel", pause, options);
  document.addEventListener("visibilitychange", schedule, options);
  reduce.addEventListener("change", schedule, options);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(rail);
  return () => {
    listeners.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}

export function mountMobileHomeRails(parent, variant) {
  const cards = benefits.map(([icon, title, copy]) => {
    const card = document.createElement("article");
    const mark = document.createElement("span");
    mark.className = "benefit-mark";
    mark.dataset.icon = icon;
    mark.setAttribute("aria-hidden", "true");
    const heading = document.createElement("h3");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = copy;
    card.append(mark, heading, text);
    return card;
  });
  const stopBenefits = mountRail(parent, variant, "Условия работы", "benefits-rail", [0,4372,375,155], cards);
  return stopBenefits;
}
