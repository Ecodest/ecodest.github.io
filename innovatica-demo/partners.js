import { place } from "./interactions.js";

export async function mountPartners(parent, device, variant) {
  const page = parent.closest(".layout");
  const request = document.createComment("partners-loading");
  parent.append(request);
  const items = await (await fetch("partners.json", { cache: "no-store" })).json();
  if (!request.isConnected || page?.dataset.page !== "home") return;
  const rail = document.createElement("div");
  rail.className = "partner-scroll";
  rail.dataset.device = device;
  rail.setAttribute("role", "region");
  rail.setAttribute("aria-label", "Наши партнёры — прокрутка по вертикали");
  rail.tabIndex = 0;
  place(rail, device === "desktop" ? [880,3500,490,800] : [0,3300,375,88], variant.width, variant.height);
  for (const item of items) {
    const cell = document.createElement("div");
    const logo = document.createElement("img");
    logo.src = "demo-art/" + item.image;
    logo.alt = item.alt;
    logo.draggable = false;
    cell.append(logo);
    rail.append(cell);
  }
  rail.addEventListener("keydown", event => {
    const actions = { ArrowDown: 80, ArrowUp: -80, PageDown: rail.clientHeight * .8, PageUp: -rail.clientHeight * .8 };
    if (event.key in actions) {
      event.preventDefault();
      rail.scrollBy({ top: actions[event.key], behavior: "instant" });
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      rail.scrollTop = event.key === "Home" ? 0 : rail.scrollHeight;
    }
  });
  request.replaceWith(rail);
}
