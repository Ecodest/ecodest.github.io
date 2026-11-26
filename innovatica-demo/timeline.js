import { place } from "./interactions.js";

const entries = [
  {
    title: "Идея и прототип",
    copy: "Формируется концепция компании. Определяются базовые принципы и ориентиры. Разрабатывается первый прототип, который становится отправной точкой для последующего развития",
    desktop: [204,3540,498,148],
    mobile: [24,2132,305,132],
  },
  {
    title: "Формирование команды и подхода",
    copy: "Компания формирует ядро команды и переходит к системной проработке продуктовой и технологической повестки. Закладываются ключевые принципы архитектуры и организационной модели, обеспечивающие дальнейшее масштабирование",
    desktop: [780,3924,540,166],
    mobile: [24,2407,305,180],
  },
  {
    title: "Первый продукт",
    copy: "Компания получает официальное юридическое оформление и начинает операционную деятельность. Выстраивается взаимодействие с госсектором и образовательными организациями, закладывается основа для стабильного развития",
    desktop: [356,4361,510,166],
    mobile: [24,2726,305,180],
  },
  {
    title: "Масштабирование",
    copy: "Компания достигает нового уровня организационной зрелости и переходит к дивизиональной модели управления. Фокус смещается на создание комплексных data-driven решений и формирование устойчивых конкурентных преимуществ",
    desktop: [562,4798,540,150],
    mobile: [24,3043,305,160],
  },
];

let cleanup = () => {};
export function mountTimeline(parent, id, device, variant) {
  cleanup();
  if (id !== "about") return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const blocks = entries.map(entry => {
    const block = document.createElement("section");
    block.className = "timeline-copy";
    place(block, entry[device], variant.width, variant.height);
    const title = document.createElement("h3");
    title.textContent = entry.title;
    const copy = document.createElement("p");
    copy.textContent = entry.copy;
    block.append(title, copy);
    parent.append(block);
    return block;
  });
  let frame = 0;
  function update() {
    frame = 0;
    for (const block of blocks) {
      const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .88 - block.getBoundingClientRect().top) / (innerHeight * .38)));
      block.style.setProperty("--copy-opacity", .5 + .5 * progress);
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  addEventListener("scroll", schedule, {passive: true});
  addEventListener("resize", schedule);
  reduced.addEventListener("change", schedule);
  update();
  cleanup = () => {
    cancelAnimationFrame(frame);
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    reduced.removeEventListener("change", schedule);
  };
}
