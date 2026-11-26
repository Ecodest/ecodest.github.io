import { place, scrollInDemo } from "./interactions.js";

const job = "UX/UI-дизайнер";
const directions = ["Все направления", "Дизайн", "ML", "Аналитика", "Backend", "Другие вакансии"];

function filterGroup(label, values, onChange, optional = false) {
  const group = document.createElement("div");
  group.className = "job-filters";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", label);
  const controls = values.map((value, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = value;
    button.setAttribute("aria-pressed", String(!optional && index === 0));
    button.addEventListener("click", () => {
      const reset = optional && button.getAttribute("aria-pressed") === "true";
      controls.forEach((control) => control.setAttribute("aria-pressed", String(!reset && control === button)));
      onChange(reset ? 0 : optional ? index + 1 : index);
    });
    group.append(button);
    return button;
  });
  return group;
}

function jobDetails() {
  const details = document.createElement("div");
  details.className = "job-details";
  for (const [heading, items] of [
    ["Чем предстоит заниматься", [
      "Проектирование пользовательской логики и сценариев для городских сервисов (ЖКХ, транспорт, медицина, афиша и др.)",
      "Разработка пользовательских решений для сложных жизненных сценариев (оплата, обращения, статусы услуг)",
      "Дизайн адаптивных веб-приложений в Фигме",
      "Создание графических элементов в рамках продукта: иконки, иллюстрации, заглушки, баннеры",
      "Формирование и поддержка базовой дизайн-системы: компоненты, кнопки, отступы, шрифты и стили",
      "Взаимодействие с разработчиками для удобства и скорости вёрстки",
      "Участие в первичных проверках интерфейсов и коридорных тестированиях",
    ]],
    ["Какие знания и навыки необходимы", [
      "Опыт работы дизайнером в веб- или мобильных продуктах от 1,5–2 лет",
      "Уверенное владение Фигмой: компоненты, авто-раскладка, стили",
      "Базовое владение Иллюстратором и Фотошопом",
      "Понимание адаптивного дизайна и особенностей веб-приложений",
      "Умение работать со сложными данными и упрощать их до понятных пользовательских решений",
      "Ориентация на пользовательский опыт",
    ]],
    ["Будет преимуществом", [
      "Опыт работы с государственными или муниципальными сервисами, финтехом, электронной коммерцией или агрегаторами",
      "Опыт проведения базовых коридорных тестирований",
    ]],
    ["Мы с удовольствием предложим тебе", [
      "Официальное оформление с первого дня работы",
      "График 5/2 с 09:00 до 18:00",
      "Бесплатный интернет и телевидение",
      "Спортивно-оздоровительные мероприятия",
      "Скидки от партнёров",
      "Обучение в корпоративной академии и доступ к корпоративной библиотеке",
    ]],
  ]) {
    const title = document.createElement("h3");
    title.textContent = heading;
    const list = document.createElement("ul");
    for (const item of items) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    }
    details.append(title, list);
  }
  return details;
}

export function mountCareer(layout, image, hotspots, device, variant, apply, requestedJob) {
  const desktop = device === "desktop";
  const [start, end] = desktop ? [1870, 4690] : [1520, 4820];
  image.style.height = start / variant.width * 100 + "cqw";
  const bottom = document.createElement("img");
  bottom.className = "career-bottom";
  bottom.src = variant.image;
  bottom.alt = "";
  bottom.style.height = (variant.height - end) / variant.width * 100 + "cqw";
  const section = document.createElement("section");
  section.className = "career-jobs";
  section.setAttribute("aria-label", "Вакансии");
  const list = document.createElement("div");
  list.className = "career-job-list";
  let filter = 0;
  let page = 1;

  function render(openIndex) {
    list.replaceChildren();
    if (filter > 1) {
      const empty = document.createElement("p");
      empty.textContent = "По этому направлению пока нет вакансий.";
      list.append(empty);
      return;
    }
    if (page > 1) {
      const empty = document.createElement("p");
      empty.textContent = "На этой странице пока нет вакансий.";
      list.append(empty);
      return;
    }
    for (let index = 0; index < (desktop ? 5 : 4); index++) {
      const entry = document.createElement("article");
      entry.className = "career-job";
      const meta = document.createElement("p");
      meta.className = "job-meta";
      meta.textContent = "Design · Нальчик · Full-time";
      const title = document.createElement("h2");
      title.textContent = job;
      const intro = document.createElement("p");
      intro.className = "job-intro";
      intro.textContent = "Проектирование интерфейсов и пользовательских сценариев, работа с дизайн-системой и участие в проверках интерфейса.";
      const description = jobDetails();
      description.id = "career-job-description-" + index;
      const actions = document.createElement("div");
      actions.className = "job-actions";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.setAttribute("aria-controls", description.id);
      const setOpen = (open) => {
        description.hidden = !open;
        intro.hidden = open;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Скрыть текст" : "Подробнее";
      };
      setOpen(index === openIndex);
      toggle.addEventListener("click", () => {
        const opening = description.hidden;
        setOpen(opening);
        if (opening || toggle.getBoundingClientRect().top < 75) {
          scrollInDemo(opening ? entry : toggle, "start");
        }
      });
      const respond = document.createElement("button");
      respond.type = "button";
      respond.className = "job-apply";
      respond.textContent = "Откликнуться";
      respond.addEventListener("click", () => apply(job));
      actions.append(toggle, respond);
      entry.append(meta, title, intro, description, actions);
      list.append(entry);
    }
  }

  const pagination = document.createElement("nav");
  pagination.className = "career-pagination";
  pagination.setAttribute("aria-label", "Страницы вакансий");
  const selectPage = (next) => {
    page = next;
    render();
    for (const control of pagination.children) {
      if (control.dataset.middle) {
        control.dataset.page = next > 3 && next < 9 ? next : 2;
        control.textContent = control.dataset.page;
        control.setAttribute("aria-label", "Страница вакансий " + control.dataset.page);
      }
      const current = Number(control.dataset.page) === next;
      if (current) control.setAttribute("aria-current", "page");
      else control.removeAttribute("aria-current");
      if (control.dataset.step) control.disabled = next + Number(control.dataset.step) < 1 || next + Number(control.dataset.step) > 9;
      if (control.dataset.page === "4" && !control.dataset.middle) control.disabled = next === 4;
    }
  };
  for (const [label, target, step] of [["‹", 0, -1], ["1", 1], ["2", 2], ["3", 3], ["…", 4], ["9", 9], ["›", 0, 1]]) {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    if (step) {
      control.dataset.step = step;
      control.setAttribute("aria-label", step < 0 ? "Предыдущая страница вакансий" : "Следующая страница вакансий");
    } else {
      control.dataset.page = target;
      if (target === 2) control.dataset.middle = "true";
      control.setAttribute("aria-label", "Страница вакансий " + target);
    }
    control.addEventListener("click", () => selectPage(step ? page + step : Number(control.dataset.page)));
    pagination.append(control);
  }
  section.append(filterGroup("Направление", directions, (index) => {
    filter = index;
    selectPage(1);
    if (index === 5) apply("Другая вакансия");
  }), list);
  section.append(pagination);
  selectPage(1);
  if (requestedJob != null) render(requestedJob);
  image.after(section, bottom);
  // The footer and resume form still use the coordinates of the original export.
  hotspots.classList.add("career-art-controls");
  hotspots.style.height = variant.height / variant.width * 100 + "cqw";
  return (resume) => {
    if (resume) requestAnimationFrame(() => apply("Другая вакансия"));
    else if (requestedJob != null && list.children[requestedJob]) {
      requestAnimationFrame(() => scrollInDemo(list.children[requestedJob], "start"));
    }
  };
}

export function mountHomeJobs(parent, variant, desktop, navigate) {
  const section = document.createElement("section");
  section.className = "home-jobs";
  section.setAttribute("aria-label", "Вакансии на главной");
  place(section, desktop ? [94, 5734, 1252, 424] : [0, 4550, 375, 780], variant.width, variant.height);
  const grid = document.createElement("div");
  grid.className = "home-job-grid";
  const active = [0, 0, 0];
  const vacancyCards = [];
  const filter = (index) => (value) => {
    active[index] = value;
    const show = [0, 2].includes(active[0]) && [0, 3].includes(active[1]) && active[2] < 2;
    vacancyCards.forEach((card) => { card.hidden = !show; });
    empty.hidden = show;
  };
  const filters = document.createElement("div");
  filters.className = "home-job-filters";
  const cities = filterGroup("Город", ["Все города", "Удалённо", "Нальчик", "Москва"], filter(0));
  const directions = filterGroup("Направление", ["Все направления", "Backend", "ML", "Design"], filter(1));
  if (!desktop) {
    for (const row of [cities, directions]) {
      row.classList.add("home-jobs-filter-strip");
      row.tabIndex = 0;
    }
  }
  filters.append(cities, directions);
  filters.append(filterGroup("Занятость", ["Full-time", "Part-time"], filter(2), true));
  const all = document.createElement("button");
  all.className = "all-jobs";
  all.type = "button";
  all.textContent = "Все вакансии";
  all.addEventListener("click", () => navigate("career"));
  filters.append(all);
  const empty = document.createElement("p");
  empty.textContent = "По выбранным фильтрам нет вакансий.";
  empty.hidden = true;
  grid.append(empty);
  for (let index = 0; index <= (desktop ? 5 : 4); index++) {
    const resume = index === (desktop ? 5 : 4);
    const card = document.createElement("button");
    card.type = "button";
    const title = document.createElement("strong");
    title.textContent = resume ? "Нет нужной вакансии?" : job;
    const meta = document.createElement("span");
    meta.textContent = resume ? "Можете отправить ваше резюме →" : "Data · Нальчик · Full-time";
    card.append(title, meta);
    card.addEventListener("click", () => navigate("career", resume ? { resume } : { requestedJob: index }));
    if (!resume) vacancyCards.push(card);
    else card.classList.add("home-resume-link");
    grid.append(card);
  }
  section.append(filters, grid);
  parent.append(section);
}
