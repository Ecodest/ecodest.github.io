const story = document.querySelector(".innovatica-story");
if (story) {
  const line = story.querySelector(".case-story-line");
  const steps = [...story.querySelectorAll(".case-story-step")];
  const path = line.querySelector("path");
  story.classList.add("story-fitted");
  const narrow = window.portfolioMobileLayout ?? matchMedia("(max-width: 760px) and (pointer: coarse)");
  const fitLine = () => {
    line.setAttribute("viewBox", `0 0 1000 ${story.clientHeight}`);
    const centers = steps.map(step => step.offsetTop + step.offsetHeight / 2);
    const segments = steps.slice(0, -1).map((_, index) => {
      const [from, to, firstControl, firstBend, lastBend, lastControl] = index % 2
        ? [940, 60, 895, 840, 160, 105] : [60, 940, 105, 160, 840, 895];
      const start = centers[index];
      const join = steps[index + 1].offsetTop;
      const end = centers[index + 1];
      return `C${from} ${start + (join - start) * .55} ${firstControl} ${join} ${firstBend} ${join}H${lastBend}C${lastControl} ${join} ${to} ${join + (end - join) * .45} ${to} ${end}`;
    });
    const mobilePath = narrow.matches && window.portfolioMobileStory?.(steps, centers);
    path.setAttribute("d", mobilePath || "M60 " + centers[0] + segments.join(""));
    line.style.maskImage = centers.map((y, index) =>
      `radial-gradient(circle at ${index % 2 ? 94 : 6}% ${y}px, transparent 8px, #0002 22px, #000a 43px, #000 58px)`,
    ).join(",");
  };
  const observer = new ResizeObserver(fitLine);
  for (const step of steps) observer.observe(step);
  narrow.addEventListener("change", fitLine);
  fitLine();
}

const gallery = document.querySelector(".layout-gallery");
if (gallery) {
  const stage = gallery.querySelector(".layout-stage");
  const slots = [...stage.querySelectorAll(".layout-slot")];
  const slides = slots.map(slot => slot.querySelector(".layout-slide"));
  const dots = [...gallery.querySelectorAll(".layout-dot")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let expandedIndex = null;
  let expansionScroll = 0;
  let restingTransform;
  let disclosureMotion;
  let tiltMotion;
  let galleryViewportTop = 120;
  let disclosureScroll;
  let frame = 0;
  let swipe;
  let swipeUntil = 0;
  const center = slot => slot.offsetLeft + slot.offsetWidth / 2;
  const wrap = value => (value + slides.length) % slides.length;
  function sizeStage() {
    stage.style.height = slides[index].offsetHeight + 12 + "px";
    if (disclosureScroll) {
      const { from, to } = disclosureScroll;
      const progress = disclosureMotion?.effect.getComputedTiming().progress ?? 1;
      window.scrollTo({ top: from + (to - from) * progress, behavior: "instant" });
    }
  }
  function draw() {
    frame = 0;
    if (expandedIndex !== null) { sizeStage(); return; }
    const previousIndex = index;
    const viewportCenter = stage.scrollLeft + stage.clientWidth / 2;
    const step = slots[0].offsetWidth;
    let closest = 0;
    let best = Infinity;
    slots.forEach((slot, i) => {
      const delta = (center(slot) - viewportCenter) / step;
      const depth = Math.abs(delta);
      if (depth < best) { best = depth; closest = i; }
      slot.style.zIndex = String(Math.round(100 - Math.min(depth, 3) * 20));
      // The homepage's depth curve, with a continuous 20% center emphasis.
      // At one slot away, the visual size matches the previous small cards.
      const centerEmphasis = 1 + .2 * Math.max(0, 1 - depth);
      const scale = (1 - Math.min(depth * .12, .3)) * centerEmphasis / 1.2;
      slides[i].style.transform = `translateX(-50%) perspective(1000px) rotateY(${reduceMotion.matches ? 0 : -Math.max(-2, Math.min(2, delta)) * 23}deg) scale(${scale})`;
      slides[i].style.visibility = depth > 3 ? "hidden" : "visible";
    });
    index = closest;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.hidden = false;
      slide.dataset.slot = active ? "current" : i > index ? "next" : "previous";
      const side = slide.querySelector(".layout-side-card");
      side.hidden = active;
      side.tabIndex = Math.abs(i - index) > 2 || active ? -1 : 0;
      slide.querySelector(".longread-toggle").hidden = !active;
      for (const note of slide.querySelectorAll(".note")) note.inert = !active;
      dots[i].setAttribute("aria-pressed", String(active));
    });
    if (previousIndex !== index || !stage.style.height) sizeStage();
  }
  function alignPreviews() {
    // All frames share geometry; the transform origin keeps their centers aligned.
    slides.forEach(slide => {
      const preview = slide.querySelector(".longread-preview");
      slide.style.transformOrigin = "50% " + (preview.offsetTop + preview.offsetHeight / 2) + "px";
    });
  }
  function requestDraw() { if (!frame) frame = requestAnimationFrame(draw); }
  function closeNotes() {
    for (const tip of gallery.querySelectorAll(".tip:popover-open")) {
      tip.hidePopover();
      gallery.querySelector('[aria-controls="' + tip.id + '"]').setAttribute("aria-expanded", "false");
    }
  }
  function select(i, animate = true) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (expandedIndex !== null) return;
    closeNotes();
    stage.scrollTo({ left: center(slots[i]) - stage.clientWidth / 2, behavior: !animate || reduceMotion.matches ? "instant" : "smooth" });
    if (!animate || reduceMotion.matches) draw();
  }
  function lockControls(locked) {
    dots.forEach(dot => { dot.disabled = locked; });
    slides.forEach(slide => { slide.querySelector(".layout-side-card").disabled = locked; });
  }
  function collapse() {
    if (expandedIndex === null) return;
    expandedIndex = null;
    gallery.classList.remove("is-expanded");
    lockControls(false);
    stage.scrollLeft = expansionScroll;
    draw();
  }
  dots.forEach((dot, i) => dot.addEventListener("click", event => select(i, event.detail > 0)));
  slides.forEach((slide, i) => {
    slide.querySelector(".layout-side-card").addEventListener("click", event => select(i, event.detail > 0));
    const toggle = slide.querySelector(".longread-toggle");
    const preview = slide.querySelector(".longread-preview");
    // Own this gallery's disclosure before the shared case handler runs.
    toggle.addEventListener("click", event => {
      event.stopImmediatePropagation();
      closeNotes();
      const opening = toggle.getAttribute("aria-expanded") !== "true";
      const fromHeight = getComputedStyle(preview).height;
      const fromTransform = tiltMotion ? getComputedStyle(slide).transform : slide.style.transform;
      disclosureMotion?.cancel();
      tiltMotion?.cancel();
      disclosureMotion = tiltMotion = null;
      if (opening && expandedIndex === null) {
        restingTransform = slide.style.transform;
        expansionScroll = stage.scrollLeft;
        galleryViewportTop = stage.getBoundingClientRect().top;
        expandedIndex = i;
        gallery.classList.add("is-expanded");
        lockControls(true);
      }
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.textContent = opening ? "Свернуть" : "Развернуть";
      const scrollFrom = scrollY;
      disclosureScroll = {
        from: scrollFrom,
        to: opening ? scrollFrom : Math.max(0, scrollFrom + stage.getBoundingClientRect().top - galleryViewportTop),
      };
      preview.classList.toggle("is-expanded", opening);
      const toHeight = getComputedStyle(preview).height;
      const toTransform = opening
        ? restingTransform.replace(/rotateY\([^)]*\)/, "rotateY(0deg)")
        : restingTransform;
      slide.style.transform = toTransform;

      const finish = () => {
        disclosureMotion?.cancel();
        tiltMotion?.cancel();
        disclosureMotion = tiltMotion = null;
        if (!opening) collapse();
        sizeStage();
        disclosureScroll = null;
      };
      if (reduceMotion.matches || event.detail === 0) { finish(); return; }

      // Keep the current geometry applied until height, tilt, and scroll settle together.
      const timing = { duration: 312, easing: "ease-in-out", fill: "both" };
      const motion = preview.animate([{ height: fromHeight }, { height: toHeight }], timing);
      disclosureMotion = motion;
      if (fromTransform !== toTransform) {
        tiltMotion = slide.animate([{ transform: fromTransform }, { transform: toTransform }], timing);
      }
      motion.finished.then(() => {
        if (disclosureMotion === motion) finish();
      }).catch(() => {});
      sizeStage();
    }, true);
  });
  stage.addEventListener("scroll", () => {
    if (expandedIndex !== null) { stage.scrollLeft = expansionScroll; return; }
    if (gallery.querySelector(".tip:popover-open")) closeNotes();
    requestDraw();
  }, { passive: true });
  // Trackpad/wheel deltas drive the native scroll position directly.
  // Leave vertical page scrolling and pinch-to-zoom to the browser.
  stage.addEventListener("wheel", event => {
    if (expandedIndex !== null || event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1;
    const delta = event.deltaX * unit * 1.2;
    const canScroll = delta < 0 ? stage.scrollLeft > 0 : stage.scrollLeft < stage.scrollWidth - stage.clientWidth;
    if (!canScroll) return;
    event.preventDefault();
    stage.scrollBy({ left: delta, behavior: "instant" });
  }, { passive: false });
  stage.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") swipe = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" && swipe && Math.abs(event.clientX - swipe.x) > 20) swipeUntil = Date.now() + 500;
  });
  stage.addEventListener("pointerup", () => { swipe = null; });
  stage.addEventListener("pointercancel", () => { swipe = null; });
  stage.addEventListener("click", event => { if (Date.now() < swipeUntil) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  gallery.addEventListener("keydown", event => {
    if (expandedIndex !== null || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || event.target.closest(".tip")) return;
    event.preventDefault();
    const focusedDot = dots.indexOf(event.target);
    const base = focusedDot < 0 ? index : focusedDot;
    const next = event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : wrap(base + (event.key === "ArrowRight" ? 1 : -1));
    select(next, false);
    dots[next].focus({ preventScroll: true });
  });
  let measuredWidth = stage.clientWidth;
  const resize = new ResizeObserver(() => {
    const width = stage.clientWidth;
    if (width !== measuredWidth) {
      measuredWidth = width;
      alignPreviews();
      if (expandedIndex === null) select(index, false);
    }
    sizeStage();
  });
  slides.forEach(slide => resize.observe(slide));
  resize.observe(gallery);
  reduceMotion.addEventListener("change", () => {
    disclosureMotion?.finish();
    if (expandedIndex === null) select(index, false);
  });
  draw();
  alignPreviews();
}
