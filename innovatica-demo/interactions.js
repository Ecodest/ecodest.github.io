const fields = {
  career: {
    desktop: {
      name: [312, 4930, 256, 48], surname: [592, 4930, 256, 48], vacancy: [872, 4930, 256, 48],
      phone: [312, 5002, 396, 48], email: [732, 5002, 396, 48],
      message: [312, 5074, 816, 96], attachment: [312, 5194, 816, 96],
      consent: [314, 5314, 20, 24], submit: [592, 5418, 256, 48],
    },
    mobile: {
      name: [24, 4997, 327, 48], surname: [24, 5053, 327, 48], vacancy: [24, 5109, 327, 48],
      phone: [24, 5181, 327, 48], email: [24, 5237, 327, 48],
      message: [24, 5309, 327, 96], attachment: [24, 5413, 327, 96],
      consent: [26, 5544, 20, 24], submit: [60, 5645, 256, 48],
    },
  },

};

const contactStarts = {
  home: [7465, 5934],
  about: [6746, 4607],
  products: [2244, 2499],
  investors: [4943, 4517],
  contacts: [4971, 2818],
};

function contactBoxes(id, device, variant) {
  const start = id === "expertise" ? [variant.formStart, variant.formStart] : contactStarts[id];
  if (!start) return null;
  if (device === "desktop") {
    const y = start[0];
    return {
      name: [312,y,396,48], organization: [732,y,396,48],
      phone: [312,y+72,396,48], email: [732,y+72,396,48],
      message: [312,y+144,816,96], attachment: [312,y+264,816,96],
      consent: [314,y+385,20,24], submit: [592,y+464,256,48],
    };
  }
  const y = start[1];
  return {
    name: [24,y,327,48], organization: [24,y+64,327,48],
    phone: [24,y+128,327,48], email: [24,y+192,327,48],
    message: [24,y+256,327,96], attachment: [24,y+368,327,96],
    consent: [26,y+484,16,16], submit: id === "about" ? [118,5152,139,48] : id === "expertise" ? [118,y+544,139,48] : [112,y+568,151,48],
  };
}

export function place(element, box, width, height) {
  for (const [index, property] of ["left", "top", "width", "height"].entries()) {
    element.style[property] = box[index] / (index % 2 ? height : width) * 100 + "%";
  }
}

export function scrollInDemo(target, block = "center") {
  const bounds = target.getBoundingClientRect();
  const offset = block === "start"
    ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    : (innerHeight - bounds.height) / 2;
  window.scrollTo({
    top: scrollY + bounds.top - offset,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export function addInlineForm(parent, id, device, variant) {
  const career = id === "career";
  const boxes = career ? fields.career[device] : contactBoxes(id, device, variant);
  if (!boxes) return null;
  const form = document.createElement("form");
  form.className = "inline-demo-form";
  form.setAttribute("aria-label", career ? "Отправить резюме" : "Ответим на ваши вопросы");
  const labels = {
    name: "Имя", surname: "Фамилия", organization: "Организация", vacancy: "Вакансия",
    phone: "Телефон", email: "Email", message: career ? "Сопроводительное письмо" : "Ваше сообщение",
    attachment: "Прикрепить файл", consent: "Согласие на обработку персональных данных",
  };
  const updateStatus = () => { status.textContent = ""; };
  for (const [key, box] of Object.entries(boxes)) {
    const field = document.createElement({ message: "textarea", vacancy: "select", submit: "button" }[key] || "input");
    field.className = "inline-control";
    field.name = key;
    if (key === "consent" || key === "submit") {
      place(field, box, variant.width, variant.height);
      if (key === "submit") {
        field.type = "submit";
        field.textContent = "Отправить";
      } else {
        field.type = "checkbox";
        field.setAttribute("aria-label", labels[key]);
        field.required = true;
      }
      form.append(field);
      continue;
    }
    const wrapper = document.createElement("label");
    wrapper.className = "inline-field";
    wrapper.dataset.field = key;
    place(wrapper, box, variant.width, variant.height);
    const caption = document.createElement("span");
    caption.textContent = labels[key];
    field.setAttribute("aria-label", labels[key]);
    if (key === "attachment") {
      field.type = "file";
      const hint = document.createElement("strong");
      hint.textContent = device === "mobile" ? "Прикрепить файл" : "прикрепите его";
      const showFile = () => {
        if (field.files.length) caption.textContent = field.files[0].name;
        else caption.replaceChildren(career && device !== "mobile" ? "Перенесите сюда резюме или " : device === "mobile" ? "" : "Перенесите файл сюда или ", hint);
      };
      showFile();
      field.addEventListener("change", showFile);
      wrapper.addEventListener("dragover", (e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      });
      wrapper.addEventListener("drop", (e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        const files = new DataTransfer();
        files.items.add(e.dataTransfer.files[0]);
        field.files = files.files;
        showFile();
        updateStatus();
      });
    } else if (key === "vacancy") {
      for (const option of [
        "Вакансия", "UX/UI-дизайнер", "Аналитик", "Инженер ML", "Информационная безопасность",
        "Маркетинг", "Менеджмент", "Разработка", "Тестировщик", "Другая вакансия",
      ]) field.add(new Option(option, option === "Вакансия" ? "" : option));
      field.required = true;
    } else {
      field.placeholder = " ";
      if (field instanceof HTMLInputElement) {
        field.type = { phone: "tel", email: "email" }[key] || "text";
        field.autocomplete = {
          name: career ? "given-name" : "name", surname: "family-name", organization: "organization", phone: "tel", email: "email",
        }[key];
      }
      field.required = ["name", "surname", "email"].includes(key) || (!career && key === "message");
    }
    wrapper.append(field, caption);
    form.append(wrapper);
  }
  const status = document.createElement("output");
  status.className = "inline-demo-status";
  status.setAttribute("role", "status");
  const [x, y, w, h] = boxes.submit;
  place(status, [x, y+h+8, w, h], variant.width, variant.height);
  form.append(status);
  form.addEventListener("input", updateStatus);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "Данные остались в браузере";
  });
  parent.append(form);
  return (vacancy, { feedback = false } = {}) => {
    if (typeof vacancy === "string" && form.elements.vacancy) form.elements.vacancy.value = vacancy;
    const name = form.elements.name;
    if (feedback) {
      const offset = Math.min(device === "mobile" ? 170 : 230, innerHeight * .42);
      window.scrollTo({ top: scrollY + name.getBoundingClientRect().top - offset, behavior: "instant" });
    } else {
      scrollInDemo(name);
    }
    if (!matchMedia("(pointer: coarse)").matches) name.focus({ preventScroll: true });
  };
}
