(() => {
  const landscape = document.querySelector('.world-landscape');
  const contact = document.querySelector('footer.contact');
  if (!landscape || !contact) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value) => Math.min(1, Math.max(0, value));
  let position = 0, target = 0, frame = 0, lastFrame = 0;
  let contactStart = 0, scrollEnd = 0, skyLimit = 0, imageLimit = 0;
  let ready = false;

  function paint() {
    landscape.style.transform = `translateY(${-position}px)`;
  }

  function follow(now) {
    const elapsed = Math.min(64, now - lastFrame);
    lastFrame = now;
    position += (target - position) * (1 - Math.exp(-elapsed / 240));
    if (Math.abs(target - position) < .1) position = target;
    paint();
    frame = position === target ? 0 : requestAnimationFrame(follow);
  }

  function update() {
    const skyProgress = clamp(scrollY / Math.max(1, contactStart));
    const contactProgress = clamp((scrollY - contactStart) / Math.max(1, scrollEnd - contactStart));
    target = skyLimit * skyProgress + (imageLimit - skyLimit) * contactProgress;
    if (scrollY < contactStart) position = Math.min(position, skyLimit);

    if (!ready || reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      ready = true;
      position = target;
      paint();
    } else if (!frame && position !== target) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(follow);
    }
  }

  function measure() {
    const scroller = document.scrollingElement;
    const viewportHeight = scroller.clientHeight;
    const imageHeight = landscape.offsetHeight;
    const background = landscape.parentElement.getBoundingClientRect();
    scrollEnd = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    contactStart = Math.min(scrollEnd, Math.max(0, scrollY + contact.getBoundingClientRect().top - viewportHeight * .82));
    // Keep the first ridge below the visible canvas until the contact section enters.
    imageLimit = Math.max(0, imageHeight - background.height);
    skyLimit = Math.min(imageLimit, Math.max(0, imageHeight * .78 - viewportHeight + background.top));
    update();
  }

  landscape.addEventListener('load', measure);
  reducedMotion.addEventListener('change', update);
  addEventListener('scroll', update, { passive: true });
  const observer = new ResizeObserver(measure);
  observer.observe(document.body);
  observer.observe(landscape.parentElement);
  observer.observe(landscape);
  measure();
  window.backgroundState = () => ({ position, target, start: contactStart });
})();
