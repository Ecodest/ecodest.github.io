import { addInlineForm, place, scrollInDemo } from "./interactions.js?v=expertise-2";

import { mountCareer, mountHomeJobs } from "./career.js";
import { refineArtwork } from "./refinements.js";

import { mountPartners } from "./partners.js";
import { mountMobileHomeRails } from "./home-mobile.js?v=partners-8";
import { mountMotion, mountProductArt } from "./motion.js";

const params = new URLSearchParams(location.search);
const device = params.get("device") === "desktop" ? "desktop" : "mobile";
document.documentElement.dataset.demoDevice = device;
const [layouts, artwork] = await Promise.all(
  ["layouts.json", "demo-art/index.json"].map(async (path) => (await fetch(path, { cache: "no-store" })).json()),
);
const layout = document.querySelector(".layout");
const image = document.querySelector(".layout-image");
const hotspots = document.querySelector(".hotspots");
const careerTop = document.createElement("div");
careerTop.className = "career-top-controls";
layout.append(careerTop);
const fixedNav = document.createElement("div");
fixedNav.className = "demo-fixed-nav";
layout.prepend(fixedNav);
const mobileNav = document.createElement("nav");
mobileNav.className = "demo-mobile-nav";
mobileNav.setAttribute("aria-label", "Навигация на мобильном");
if (device === "mobile") document.body.append(mobileNav);
const motion = document.createElement("div");
motion.className = "motion-layer";
layout.append(motion);
const panel = document.querySelector(".panel");
const panelTitle = document.querySelector("#panel-title");
const panelContent = document.querySelector(".panel-content");

const nav = [
  ["about", "О компании", "About"],
  ["products", "Продукты", "Products"],
  ["expertise", "Экспертиза", "Expertise"],
  ["investors", "Инвесторам", "For investors"],
  ["career", "Карьера", "Career"],
  ["contacts", "Контакты", "Contacts"],
];
let currentPage;
let expertiseProject = "bank";
let expertiseRequest = 0;
let focusInlineForm;
let navigationVersion = 0;
let feedbackRequest = 0;
let stopHomeRails = () => {};

function reportScroll() {
  fixedNav.classList.toggle("is-scrolled", scrollY > fixedNav.offsetHeight);
  mobileNav.classList.toggle("is-scrolled", scrollY > 2);
  const travel = document.documentElement.scrollHeight - innerHeight;
  parent.postMessage({ type: "backfolio-scroll-position", position: travel > 0 ? scrollY / travel : 0 }, location.origin);
}

function button(label, action) {
  const item = document.createElement("button");
  item.type = "button";
  item.setAttribute("aria-label", label);
  item.addEventListener("click", action);
  return item;
}

function hotspot(label, box, action, parent = hotspots) {
  const item = button(label, action);
  item.className = "hotspot";
  for (const [index, property] of ["left", "top", "width", "height"].entries()) {
    item.style[property] = box[index] + "%";
  }
  parent.append(item);
  return item;
}

function openPanel(title, content, kind = "") {
  panel.dataset.kind = kind;
  panelTitle.textContent = title;
  panelTitle.removeAttribute("autofocus");
  panelContent.replaceChildren(content);
  panel.showModal();
}

function showMenu() {
  const content = document.createElement("div");
  content.className = "burger-content";
  const main = button("Главная", () => { panel.close(); navigate("home"); });
  main.className = "burger-home";
  const mark = document.createElement("img");
  mark.src = "logo.svg";
  mark.alt = "";
  main.append(mark);
  const links = document.createElement("nav");
  links.setAttribute("aria-label", "Разделы сайта");
  const english = currentPage === "investors-en";
  for (const [id, ru, en] of nav) {
    const label = english ? en : ru;
    const item = button(label, () => { panel.close(); navigate(id); });
    item.textContent = label;
    if (id === currentPage) item.setAttribute("aria-current", "page");
    links.append(item);
  }
  const language = button(english ? "Русский" : "English", () => {
    panel.close();
    navigate(english ? "investors" : "investors-en");
  });
  language.textContent = english ? "Русский" : "English";
  links.append(language);
  const contact = button("Связаться", () => {
    panel.close();
    openFeedback();
  });
  contact.className = "burger-contact";
  contact.textContent = english ? "Submit a request" : "Связаться";
  content.append(main, links, contact);
  openPanel("Меню", content, "burger");
}

async function openFeedback() {
  const version = navigationVersion;
  const request = ++feedbackRequest;
  const onCurrentPage = currentPage !== "career" && focusInlineForm;
  if (onCurrentPage) {
    if (!image.complete) await image.decode().catch(() => {});
    if (version === navigationVersion && request === feedbackRequest) focusInlineForm(null, { feedback: true });
    return;
  }
  const contacts = layouts.find(({ id }) => id === "contacts")[device];
  const preview = new Image();
  preview.src = contacts.image;
  await preview.decode().catch(() => {});
  if (version === navigationVersion && request === feedbackRequest) navigate("contacts", { feedback: true });
}

function addPatch(patch, variant, parent = hotspots) {
  if (!patch) return;
  const [file, box] = patch;
  const strip = document.createElement("img");
  strip.src = "demo-art/" + file;
  strip.alt = "";
  strip.className = "art-patch";
  place(strip, box, variant.width, variant.height);
  parent.prepend(strip);
}

function renderDesktopNav(id, english) {
  const home = id === "home";
  fixedNav.dataset.page = home ? "home" : english ? "english" : "inner";
  const homeButton = button("Главная", () => navigate("home"));
  homeButton.className = "demo-home";
  const icon = document.createElement("img");
  icon.src = "logo.svg";
  icon.alt = "";
  homeButton.append(icon);
  fixedNav.append(homeButton);
  for (const [key, ru, en] of nav) {
    const item = button(ru, () => navigate(key));
    item.textContent = english ? en : ru;
    if (id === key || (english && key === "investors")) item.setAttribute("aria-current", "page");
    fixedNav.append(item);
  }
  const language = button(english ? "RU" : "EN", () => navigate(english ? "investors" : "investors-en"));
  language.textContent = english ? "RU" : "EN";
  fixedNav.append(language);
  if (!home) {
    const request = button("Связаться", openFeedback);
    request.textContent = english ? "Submit a request" : "Связаться";
    fixedNav.append(request);
  }
}

function renderFooter(patch, variant) {
  if (!patch) return;
  const [, [x, y, w, h], boundary] = patch;
  addPatch(patch, variant);
  const glow = document.createElement("div");
  glow.className = "footer-breath";
  const desktop = device === "desktop";
  const rise = desktop ? 275 : 165;
  place(glow, [0, boundary - rise, variant.width, rise], variant.width, variant.height);
  hotspots.append(glow);
  const links = document.createElement("nav");
  links.className = "demo-footer-nav";
  links.setAttribute("aria-label", "Навигация в подвале");
  place(links, [x, y, w, h], variant.width, variant.height);
  for (const [key, label] of nav) {
    const item = button(label, () => navigate(key));
    item.textContent = label;
    item.dataset.link = key;
    links.append(item);
  }
  hotspots.append(links);
}

function showDocument(label, english = false) {
  const message = document.createElement("p");
  message.textContent = english ? "This document is unavailable in the demo." : "Документ недоступен в демоверсии.";
  openPanel(label, message);
}

function renderReports(id, variant) {
  const area = id === "home"
    ? (device === "desktop" ? [0, 4927, 1440, 214] : [0, 3810, 375, 280])
    : (device === "desktop" ? [96, 3050, 1249, 560] : [24, 3434, 328, 333]);
  const reports = document.createElement("section");
  reports.className = "annual-reports";
  reports.dataset.page = id;
  reports.setAttribute("aria-label", "Отчётные годы");
  place(reports, area, variant.width, variant.height);
  const mobile = device === "mobile";
  const years = mobile ? document.createElement("div") : reports;
  if (mobile) {
    years.className = "home-report-years";
    years.setAttribute("aria-label", "Годовые отчёты");
    years.tabIndex = 0;
    reports.append(years);
  }
  for (const year of [2024, 2025]) {
    const group = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = year;
    group.append(heading);
    const links = document.createElement("div");
    links.className = "report-links";
    for (const [title, label] of [["Отчёт за " + year, "Отчёт за " + year], ["IR-презентация", "IR-презентация за " + year]]) {
      const item = button(label, () => showDocument(label));
      item.textContent = title;
      const icon = document.createElement("span");
      icon.className = "stable-icon";
      icon.dataset.icon = "download";
      icon.setAttribute("aria-hidden", "true");
      item.append(icon);
      links.append(item);
    }
    group.append(links);
    years.append(group);
  }
  if (mobile) {
    const previous = button("Показать отчёт за 2024", () => goToYear(0));
    const next = button("Показать отчёт за 2025", () => goToYear(1));
    previous.className = "home-report-turn previous";
    next.className = "home-report-turn next";
    previous.textContent = "←";
    next.textContent = "→";
    function goToYear(index) {
      years.scrollTo({
        left: index * years.clientWidth,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
    const sync = () => {
      const first = years.scrollLeft < years.clientWidth / 2;
      previous.disabled = first;
      next.disabled = !first;
    };
    years.addEventListener("scroll", sync, { passive: true });
    reports.append(previous, next);
    requestAnimationFrame(() => {
      years.scrollLeft = years.clientWidth;
      sync();
    });
  }
  const note = document.createElement("p");
  note.className = "report-note";
  note.textContent = "Отчёты обновляются ежегодно после публикации официальной отчётности";
  reports.append(note);
  if (id === "investors") {
    const actions = document.createElement("div");
    actions.className = "report-actions";
    const contact = button("Связаться с нами", openFeedback);
    contact.textContent = "Связаться с нами";
    const charter = button("Устав компании", () => showDocument("Устав компании"));
    charter.textContent = "Устав компании ↓";
    actions.append(contact, charter);
    reports.append(actions);
  }
  hotspots.append(reports);
}

const pressArtwork = new Set([
  "home-hero", "home-contact", "home-investors", "home-charter",
  "investor-contact", "charter-read", "charter-download",
]);

function artworkAction(label, box, variant, action, tone, art = "", visualLabel = label) {
  const control = button(label, action);
  control.className = "hotspot artwork-action";
  control.dataset.tone = tone;
  place(control, box, variant.width, variant.height);
  if (art) {
    const overlay = document.createElement("img");
    overlay.src = "demo-art/hover-" + art + ".webp";
    overlay.alt = "";
    control.append(overlay);
    if (pressArtwork.has(art)) {
      const pressed = document.createElement("img");
      pressed.className = "artwork-press";
      pressed.src = "demo-art/press-" + art + ".webp";
      pressed.alt = "";
      control.append(pressed);
    }
  } else if (tone !== "product" && tone !== "icon") {
    const overlay = document.createElement("span");
    overlay.setAttribute("aria-hidden", "true");
    overlay.textContent = visualLabel;
    control.append(overlay);
  }
  hotspots.append(control);
  return control;
}

function stableArtworkAction(label, box, variant, action, tone, text = label, icon = "") {
  const control = artworkAction(label, box, variant, action, tone, "", text);
  control.classList.add("stable-action");
  if (icon) {
    const mark = document.createElement("span");
    mark.className = "stable-icon";
    mark.dataset.icon = icon;
    control.firstElementChild.append(mark);
  }
  return control;
}

function renderResources(variant) {
  const desktop = device === "desktop";
  const resources = ["Вконтакте", "TikTok", "Instagram", "YouTube", "X (Twitter)", "Хабр", "GitHub", "Dprofile", "Behance", "Dribbble", "LinkedIn"];
  const positions = desktop
    ? [1544,1810,2075,2374,2639,3119,3384,3649,3914,4179,4444]
    : [832,985,1137,1324,1477,1798,1951,2104,2256,2409,2561];
  const buttons = resources.map((label, index) => stableArtworkAction(
    label, [desktop ? 592 : 60, positions[index], 256, 48], variant,
    () => openPanel(label, document.createTextNode("Ссылка недоступна в демоверсии.")),
    "secondary", label + (label === "Instagram" ? "*" : ""), "up",
  ));
  if (!desktop) return;
  for (const [index, resource] of [3,2,4,1,0,5,10,6,9,7,8].entries()) {
    artworkAction("Перейти к разделу «" + resources[resource] + "»", [44 + index * 124, 936, 76, 74], variant, () => {
      const target = buttons[resource];
      scrollInDemo(target);
      target.focus({ preventScroll: true });
    }, "icon");
  }
}

// Native tabs keep the three supplied screen states inside one demo section.
function renderExpertise(entry, variant) {
  const tabs = document.createElement("div");
  tabs.className = "expertise-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Проекты экспертизы");
  const desktop = device === "desktop";
  place(tabs, desktop ? [465,1242,510,62] : [0,944,375,58], variant.width, variant.height);
  const selectedProject = entry?.projects?.find(project => project.id === expertiseProject);
  image.id = "expertise-project";
  image.setAttribute("role", "tabpanel");
  image.setAttribute("aria-labelledby", "expertise-tab-" + expertiseProject);
  image.alt = "Экспертиза — " + selectedProject.title;
  for (const project of entry.projects) {
    const selected = project.id === expertiseProject;
    const tab = button(project.title, async event => {
      if (project.id === expertiseProject) return;
      const request = ++expertiseRequest;
      const version = navigationVersion;
      const preload = new Image();
      preload.src = project[device].image;
      tab.setAttribute("aria-busy", "true");
      try { await preload.decode(); } catch {
        tab.removeAttribute("aria-busy");
        if (version === navigationVersion) showDocument(project.title);
        return;
      }
      if (request !== expertiseRequest || version !== navigationVersion) return;
      const top = scrollY;
      const keyboard = event.detail === 0;
      expertiseProject = project.id;
      navigate("expertise", { preserveScroll: top });
      if (keyboard) document.getElementById("expertise-tab-" + project.id).focus({ preventScroll: true });
    });
    tab.textContent = project.title;
    tab.id = "expertise-tab-" + project.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "expertise-project");
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tabs.append(tab);
  }
  tabs.addEventListener("keydown", event => {
    const buttons = [...tabs.children];
    let index = buttons.indexOf(document.activeElement);
    if (event.key === "ArrowRight") index = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft") index = (index + buttons.length - 1) % buttons.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[index].focus({ preventScroll: true });
    buttons[index].click();
  });
  hotspots.append(tabs);
  requestAnimationFrame(() => {
    const active = tabs.querySelector('[aria-selected="true"]');
    tabs.scrollLeft = active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2;
  });
}

function navigate(id, options = {}) {
  const english = id === "investors-en";
  const entry = english ? {
    title: "For investors",
    desktop: { image: "investors-reference.png", width: 1860, height: 1040 },
  } : layouts.find((page) => page.id === id);
  const expertise = id === "expertise" ? entry?.projects?.find(project => project.id === expertiseProject) : null;
  const variant = expertise?.[device] ?? entry?.[device] ?? (english ? entry?.desktop : null);
  if (!variant) return;
  navigationVersion++;
  currentPage = id;
  stopHomeRails();
  stopHomeRails = () => {};
  image.removeAttribute("role");
  image.removeAttribute("aria-labelledby");
  image.removeAttribute("id");
  image.width = variant.width;
  image.height = variant.height;
  image.alt = "Инноватика Системс — " + entry.title;
  image.src = variant.image;
  hotspots.replaceChildren();
  hotspots.removeAttribute("style");
  hotspots.classList.remove("career-art-controls");
  careerTop.replaceChildren();
  careerTop.style.height = id === "career" ? variant.height / variant.width * 100 + "cqw" : "";
  layout.querySelector(".career-jobs")?.remove();
  layout.querySelector(".career-bottom")?.remove();
  layout.dataset.page = id;
  image.style.height = "";
  fixedNav.replaceChildren();
  const inlineForm = addInlineForm(hotspots, id, device, variant);
  focusInlineForm = inlineForm;
  const isHome = id === "home";
  const patches = artwork[id + "-" + device];
  addPatch(patches?.header, variant, id === "career" ? careerTop : hotspots);
  renderFooter(variant.footer ?? patches?.footer, variant);
  mountMotion(motion, id, device, variant, patches?.circuit);
  if (device === "desktop" && !english && id !== "expertise" && !motion.querySelector(".demo-hero-art")) {
    const logoBox = id === "home" ? [210,34,43,52] : [100,34,44,52];
    addPatch(["logo-clean-" + id + "-desktop.webp", logoBox], variant, id === "career" ? careerTop : hotspots);
  }
  if (id === "expertise") renderExpertise(entry, variant);
  if (id === "home") renderReports(id, variant);
  refineArtwork(hotspots, id, device, variant, showDocument);
  if (device === "desktop") {
    renderDesktopNav(id, english);
    if (english) {
      hotspot("Contact", [37.4, 77.1, 8.7, 6.1], openFeedback);
      for (const [label, box] of [
        ["Financial report 2024", [18, 62.5, 15, 5]],
        ["IR Presentation 2024", [36.5, 62.5, 12, 5]],
        ["Financial report 2025", [50.5, 62.5, 15, 5]],
        ["IR Presentation 2025", [69, 62.5, 12, 5]],
        ["Company charter", [47, 77.1, 14.6, 6.1]],
      ]) {
        hotspot(label, box, () => showDocument(label, true));
      }
    }
  } else {
    mobileNav.classList.toggle("is-over-art", !english && !motion.querySelector(".demo-hero-art"));
    mobileNav.replaceChildren();
    for (const [label, filename, action] of [
      ["Главная", "logo.svg", () => navigate("home")],
      ["Меню", "menu.svg", showMenu],
    ]) {
      const control = button(label, action);
      control.className = "mobile-home mobile-hero-control";
      const icon = document.createElement("img");
      icon.src = filename;
      icon.alt = "";
      control.append(icon);
      mobileNav.append(control);
    }
  }
  if (isHome) {
    const desktop = device === "desktop";
    const cards = [
      ["Cheget", "cheget", [96,2713,1248,272], [24,2214,327,190]],
      ["Kuliev", "kuliev", [96,3009,400,272], [24,2454,327,190]],
      ["Baksan", "baksan", [520,3009,400,272], [24,2694,327,190]],
      ["Elbrus Cortex", "elbrus", [944,3009,400,272], [24,2934,327,190]],
    ];
    const productGrid = desktop ? null : document.createElement("div");
    const cardGap = 18;
    if (productGrid) {
      productGrid.className = "mobile-product-grid";
      place(productGrid, [0,2210,375,920], variant.width, variant.height);
      hotspots.append(productGrid);
    }
    for (const [index, [label, art, full, compact]] of cards.entries()) {
      const box = desktop ? full : [compact[0], 2236 + index * (compact[3] + cardGap), compact[2], compact[3]];
      const control = artworkAction(label, box, variant, () => navigate("products"), "product");
      mountProductArt(control, device, art);
    }
    mountPartners(hotspots, device, variant).catch(error => console.warn("Partner logos unavailable", error));
    if (!desktop) stopHomeRails = mountMobileHomeRails(hotspots, variant);
    for (const [label, art, full, compact, action, tone] of [
      ["Обсудить проект", "home-hero", [621,587,198,49], [89,484,197,48], openFeedback, "hero"],
      ["Обсудить проект", "home-contact", [96,6870,198,49], [89,5646,197,48], openFeedback, "primary"],
      ["Наши ресурсы", "home-resources", [96,6940,198,46], [89,5699,197,44], () => navigate("contacts"), "text"],
      ["Связаться с нами", "home-investors", [508,5161,201,49], [47,4114,281,48], openFeedback, "primary"],
      ["Устав компании", "home-charter", [724,5161,208,49], [47,4178,281,48], () => showDocument("Устав компании"), "secondary"],
    ]) {
      if (tone === "secondary" || tone === "primary" || tone === "hero") {
        stableArtworkAction(label, desktop ? full : compact, variant, action, tone, label, tone === "secondary" ? "download" : "");
      } else {
        artworkAction(label, desktop ? full : compact, variant, action, tone, desktop ? art : "");
      }
    }
    mountHomeJobs(hotspots, variant, desktop, navigate);
  }
  if (id === "investors") {
    const desktop = device === "desktop";
    stableArtworkAction("Связаться с нами", desktop ? [202,2493,201,49] : [88,2856,200,48], variant, openFeedback, "primary");
    stableArtworkAction("Читать устав", desktop ? [176,4051,193,49] : [48,4000,280,48], variant, () => showDocument("Устав компании"), "primary", "Читать", "external");
    stableArtworkAction("Скачать устав", desktop ? [176,4116,193,48] : [48,4065,280,48], variant, () => showDocument("Устав компании"), "secondary", "Скачать", "download");
  }
  if (id === "contacts") renderResources(variant);
  if (id === "products") {
    const desktop = device === "desktop";
    const products = desktop
      ? [["Cheget", 144, 704, 278], ["Kuliev", 144, 1084, 278], ["Baksan", 144, 1464, 278], ["Elbrus Cortex", 144, 1844, 278]]
      : [["Elbrus Cortex", 48, 2234, 278]];
    if (!desktop) {
      for (const [file, box] of [
        ["button", [56,685,264,57]], ["arrow", [141,306,22,24]], ["chevron", [300,305,26,25]],
      ]) addPatch(["products-mobile-cheget-" + file + ".webp", box], variant);
    }
    for (const [name, x, y, width] of products) {
      stableArtworkAction(name + " — скоро", [x,y,width,48], variant, () => {
        openPanel(name, document.createTextNode("Страница продукта пока недоступна."));
      }, "secondary", "Перейти к продукту (скоро)");
    }
  }
  const showCareerTarget = id === "career"
    ? mountCareer(layout, image, hotspots, device, variant, inlineForm, options.requestedJob)
    : null;
  if (options.feedback && inlineForm) inlineForm(null, { feedback: true });
  else scrollTo({ top: options.preserveScroll ?? 0, behavior: "instant" });
  showCareerTarget?.(options.resume);
  reportScroll();
}

panel.querySelector(".close").addEventListener("click", () => panel.close());
panel.addEventListener("click", (event) => {
  if (event.target !== panel) return;
  const box = panel.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) panel.close();
});
addEventListener("scroll", reportScroll, { passive: true });
addEventListener("resize", reportScroll);
image.addEventListener("load", reportScroll);
addEventListener("message", ({ source, origin, data }) => {
  if (source !== parent || origin !== location.origin || data?.type !== "backfolio-scroll-to") return;
  if (Number.isFinite(data.position)) scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * data.position);
});
document.addEventListener("click", () => parent.postMessage({ type: "backfolio-demo-interaction" }, location.origin));
// Touch press starts on contact, including browsers that defer :active until a tap.
layout.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || !event.isPrimary) return;
  const control = event.target.closest(
    ".artwork-action, :is(.report-card, .annual-reports, .home-jobs, .career-jobs) button:enabled",
  );
  if (!control) return;
  control.setAttribute("data-touch-press", "");
  const listeners = new AbortController();
  const release = (end) => {
    if (end.type !== "blur" && end.pointerId !== event.pointerId) return;
    control.removeAttribute("data-touch-press");
    listeners.abort();
  };
  for (const type of ["pointerup", "pointercancel", "blur"]) {
    window.addEventListener(type, release, { signal: listeners.signal, capture: true });
  }
}, { passive: true });
navigate("home");
