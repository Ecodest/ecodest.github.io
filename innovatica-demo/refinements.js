import { place } from "./interactions.js";
import { mountTimeline } from "./timeline.js";
import { drawReportGraph } from "./report-graph.js";

const metrics = {
  cagr: ["CAGR", "32%"],
  revenue: ["Выручка", "96М ₽"],
  profit: ["Валовая прибыль", "54М ₽"],
  ebitda: ["EBITDA", "21М ₽"],
  margin: ["Рентабельность", "22%"],
  cash: ["Свободный денежный поток", "14М ₽"],
};

function overlay(parent, className, box, variant) {
  const element = document.createElement("div");
  element.className = className;
  place(element, box, variant.width, variant.height);
  parent.append(element);
  return element;
}

export function refineArtwork(parent, id, device, variant, showDocument) {
  const desktop = device === "desktop";
  mountTimeline(parent, id, device, variant);
  if (id === "home" || id === "investors") {
    const keys = id === "home"
      ? (desktop ? ["cagr", "revenue", "profit", "cash", "ebitda", "margin"] : ["cagr", "revenue", "profit", "ebitda", "margin", "cash"])
      : ["cagr", "revenue", "ebitda", "margin", "profit", "cash"];
    const boxes = id === "home"
      ? (desktop
        ? keys.map((_, i) => [95 + i * 212, 4775, 190, 68])
        : keys.map((_, i) => [40 + i % 2 * 152, 3520 + Math.floor(i / 2) * 92, 143, 58]))
      : (desktop
        ? [[185,1665,210,160],[443,1665,210,160],[701,1665,210,160],[960,1665,280,160],[185,1950,310,160],[548,1950,440,160]]
        : keys.map((_, i) => [48,1350 + i * 224,280,130]));
    for (const [index, key] of keys.entries()) {
      const [label, value] = metrics[key];
      const element = overlay(parent, "metric-value" + (id === "investors" ? " is-card" : ""), boxes[index], variant);
      element.textContent = value;
      element.setAttribute("aria-label", label + " " + value);
    }
    if (!desktop && id === "home") {
      const label = overlay(parent, "metric-label", [40,3577,143,25], variant);
      label.textContent = "CAGR";
    }
  }
  if (id === "investors") {
    const carousel = document.createElement("section");
    carousel.className = "report-carousel";
    carousel.setAttribute("aria-label", "Годовые отчёты");
    carousel.tabIndex = 0;
    place(carousel, desktop ? [0,3070,1440,560] : [0,3440,375,333], variant.width, variant.height);
    for (const year of [2024,2025]) {
      const card = document.createElement("article");
      card.className = "report-card";
      card.setAttribute("aria-label", "Годовой отчёт " + year);
      const graph = document.createElement("canvas");
      graph.setAttribute("aria-hidden", "true");
      drawReportGraph(graph, year);
      const title = document.createElement("h3");
      title.textContent = "Годовой отчёт";
      const badge = document.createElement("span");
      badge.className = "report-year";
      badge.textContent = year;
      title.append(badge);
      const description = document.createElement("p");
      description.textContent = "В этом году продолжает наблюдаться стабильный рост без резких скачков";
      card.append(graph, title, description);
      for (const label of ["Скачать отчёт", "Смотреть презентацию"]) {
        const control = document.createElement("button");
        control.type = "button";
        control.className = "report-document";
        const text = document.createElement("span");
        text.textContent = label;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.className = "stable-icon";
        icon.dataset.icon = label === "Скачать отчёт" ? "download" : "external";
        control.append(text, icon);
        control.setAttribute("aria-label", label + " за " + year);
        control.addEventListener("click", () => showDocument(label + " за " + year));
        card.append(control);
      }
      carousel.append(card);
    }
    parent.append(carousel);
    requestAnimationFrame(() => {
      carousel.scrollLeft = carousel.scrollWidth - carousel.clientWidth;
    });
  }
  if (id === "about" && desktop) {
    // Leave a visible gap between the timeline border and the vertical circuit.
    overlay(parent, "art-clear", [978,5010,20,35], variant);
    overlay(parent, "art-clear", [985,5002,6,7], variant);
  }
}
