import { place } from "./interactions.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const blocks = {
  products: [[0, 13, 24, 36, 47, 62, 85], [0, 7, 22, 35, 48, 63, 85]],
  contacts: [[0, 15, 21, 46, 80, 93], [0, 10, 17, 38, 67, 85]],
  "investors-en": [[0, 28, 48, 65], []],
};

let dispose = () => {};
const artURL = (name) => "demo-art/" + name + ".webp";

function positioned(parent, name, box, variant) {
  const element = document.createElement("div");
  element.className = name;
  place(element, box, variant.width, variant.height);
  parent.append(element);
  return element;
}

function image(parent, name, file) {
  const element = document.createElement("img");
  element.className = name;
  element.alt = "";
  element.src = artURL(file);
  parent.append(element);
  return element;
}

export function mountProductArt(control, device, name) {
  const art = document.createElement("span");
  art.className = "product-art";
  art.setAttribute("aria-hidden", "true");
  const file = "product-" + device + "-" + name;
  image(art, "product-base", file + "-base");
  image(art, "product-figure", file + "-figure");
  image(art, "product-type", file + "-type");
  control.append(art);
}

function mountHero(layer, id, device, variant) {
  const desktop = device === "desktop";
  const home = id === "home";
  const height = home ? (desktop ? 900 : 764) : (desktop ? 1135 : 600);
  const hero = positioned(layer, "demo-hero-art " + (home ? "home-rings" : "about-board"), [0, 0, variant.width, height], variant);
  const scene = document.createElement("div");
  scene.className = "hero-scene";
  hero.append(scene);
  image(scene, "hero-background", home ? (desktop ? "home-rings" : "home-mobile-rings") : "about-" + device + "-plate-retouched");
  if (!home) {
    const traces = document.createElement("div");
    traces.className = "board-traces";
    traces.style.maskImage = 'url("' + artURL("about-" + device + "-traces") + '")';
    traces.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
    scene.append(traces);
    const chip = document.createElement("i");
    chip.className = "board-emblem-glow";
    scene.append(chip);
  }
  const copy = document.createElement("div");
  copy.className = "motion-hero-copy";
  const title = document.createElement("strong");
  title.textContent = "Инноватика Системс";
  if (home) {
    const lead = document.createElement("p");
    lead.textContent = "Проектируем, внедряем и сопровождаем комплексные ИТ-решения для государственных и корпоративных организаций.";
    const purpose = document.createElement("p");
    purpose.textContent = "Наша задача — сделать данные понятными, процессы — управляемыми, результаты — предсказуемыми.";
    copy.append(title, lead, purpose);
  } else {
    const label = document.createElement("span");
    label.textContent = "О компании";
    copy.append(label, title);
  }
  hero.append(copy);
  return { hero, scene, copy };
}

function mountKey(layer, device, variant) {
  const desktop = device === "desktop";
  const region = desktop ? [0,1815,1440,590] : [0,1340,375,738];
  const key = positioned(layer, "metric-key-layer", region, variant);
  const stage = { width: region[2], height: region[3] };
  const sprite = image(key, "metric-key-sprite", "home-key-sprite");
  place(sprite, desktop ? [486,65,420,490] : [70,20,243,297], stage.width, stage.height);
  const metrics = [
    ["+50%", "Повышение точности прогнозирования с использованием моделей машинного обучения и сценарного анализа"],
    ["+60%", "Ускорение подготовки управленческих решений за счёт автоматизации аналитики и объединения данных"],
    ["+70%", "Снижение объёма ручной обработки данных благодаря ИИ-агентам и автоматическим аналитическим процессам"],
    ["в 4 раза", "Быстрее выявление аномалий и рисков через интеллектуальный мониторинг данных"],
  ];
  const boxes = desktop
    ? [[250,40,400,170], [869,79,397,169], [178,330,400,194], [753,330,400,170]]
    : [[24,12,327,154], [24,364,327,154], [24,184,327,162], [24,536,327,154]];
  for (const [index, [title, description]] of metrics.entries()) {
    const card = positioned(key, "metric-key-card", boxes[index], stage);
    const heading = document.createElement("strong");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = description;
    card.append(heading, text);
  }
  return { key, sprite };
}

export function mountMotion(layer, id, device, variant, circuit) {
  dispose();
  layer.replaceChildren();
  const reduced = reduceMotion.matches;
  if (id === "investors") {
    positioned(layer, "investor-graph-feather", device === "desktop" ? [0, 746, 1440, 180] : [0, 530, 375, 144], variant);
  }
  if (reduced) return;
  const desktop = device === "desktop";
  const { hero, scene, copy } = id === "home" || id === "about" ? mountHero(layer, id, device, variant) : {};
  const { key, sprite } = id === "home" ? mountKey(layer, device, variant) : {};
  if (circuit) {
    const [file, box] = circuit;
    const glow = positioned(layer, "circuit-traces", box, variant);
    glow.style.maskImage = 'url("demo-art/' + file + '")';
    glow.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
  }
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      target.classList.toggle("motion-in-view", isIntersecting);
      if (target.classList.contains("section-entry") && isIntersecting) {
        target.classList.add("is-visible");
        observer.unobserve(target);
      }
    }
  });
  for (const [index, start] of (blocks[id]?.[desktop ? 0 : 1] ?? []).entries()) {
    const cover = document.createElement("div");
    cover.className = "section-entry";
    cover.style.top = start + "%";
    cover.style.height = (Math.min(blocks[id][desktop ? 0 : 1][index + 1] ?? 100, start + 7) - start) + "%";
    layer.append(cover);
    observer.observe(cover);
  }
  for (const target of layer.querySelectorAll(".demo-hero-art, .circuit-traces")) observer.observe(target);

  let frame = 0;
  const paint = () => {
    frame = 0;
    if (hero) {
      const progress = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
      scene.style.transform = "translate3d(0," + progress * (id === "home" ? 57 : 29) + "%,0)";
      if (id === "home") copy.style.transform = "translate3d(0," + progress * hero.offsetHeight * .24 + "px,0)";
      else {
        copy.style.transform = "translate3d(0," + -progress * hero.offsetHeight * .32 + "px,0)";
        copy.style.opacity = Math.max(0, 1 - progress * 2.6);
      }
    }
    if (key) {
      const bounds = key.getBoundingClientRect();
      const range = innerHeight + bounds.height * (desktop ? .25 : .8);
      const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / range));
      const offset = desktop ? (1 - progress) * 24 : 8 + (1 - progress) * 110;
      sprite.style.transform = "translate3d(0," + offset + "%,0)";
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  if (hero) {
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    schedule();
  }
  dispose = () => {
    observer.disconnect();
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    cancelAnimationFrame(frame);
  };
}
