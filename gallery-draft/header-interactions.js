(()=>{const narrow=matchMedia('(max-width: 760px)');const island=document.querySelector('.header-island');if(!island)return;let previous=scrollY,travel=0,frame=0;function show(){document.body.classList.remove('header-nav-hidden');island.inert=false}addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{const y=scrollY,delta=y-previous;previous=y;if(narrow.matches||y<80||island.querySelector(':focus-visible')){show();travel=0}else{travel=Math.sign(delta)===Math.sign(travel)?travel+delta:delta;if(travel>4){document.body.classList.add('header-nav-hidden');island.inert=true}else if(travel< -4)show()}frame=0})},{passive:true});narrow.addEventListener('change',()=>{travel=0;previous=scrollY;show()});island.addEventListener('focusin',show);addEventListener('keydown',e=>{if(e.key==='Tab')show()})})();
{ const wordmark = document.querySelector(".site-header .wordmark"); if (wordmark) wordmark.textContent = window.portfolioText?.("Е. Федорова") ?? "Е. Федорова"; }


(() => {
  const narrow = window.portfolioMobileLayout ?? matchMedia("(max-width: 760px) and (pointer: coarse)");
  const contact = document.querySelector(".site-header .header-contact");
  if (contact && !contact.querySelector(".header-contact-label")) {
    for (const node of [...contact.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
      const label = document.createElement("span");
      label.className = "mobile-contact-label";
      label.textContent = node.textContent;
      node.replaceWith(label);
    }
  }
  const viewport = document.querySelector('meta[name="viewport"]');
  const original = viewport?.content;
  function fitViewport() {
    if (viewport && original && !original.includes("viewport-fit")) {
      viewport.content = narrow.matches ? original + ",viewport-fit=cover" : original;
    }
  }
  fitViewport();
  narrow.addEventListener("change", fitViewport);

  if (narrow.matches) document.querySelector('.demo-controls button[data-device="mobile"]')?.click();

  function mobileStoryPath(steps, centers) {
    const segments = steps.slice(1).map((step, index) => {
      const reverse = index % 2 !== 0;
      const from = reverse ? 940 : 60;
      const to = reverse ? 60 : 940;
      const direction = reverse ? -1 : 1;
      const start = centers[index], end = centers[index + 1], join = step.offsetTop;
      const storyTop = step.parentElement.getBoundingClientRect().top;
      const previousCopy = steps[index].querySelector('.case-story-copy').getBoundingClientRect();
      const nextCopy = step.querySelector('.case-story-copy').getBoundingClientRect();
      const exit = previousCopy.bottom - storyTop + 16;
      const entry = nextCopy.top - storyTop - 16;
      const bend = 178, handle = 94;
      return `L${from} ${exit}C${from} ${join} ${from+direction*handle} ${join} ${from+direction*bend} ${join}H${to-direction*bend}C${to-direction*handle} ${join} ${to} ${join} ${to} ${entry}L${to} ${end}`;
    });
    return "M60 " + centers[0] + segments.join("");
  }
  window.portfolioMobileStory = mobileStoryPath;
  const story = document.querySelector(".case-story:not(.innovatica-story)");
  if (story) {
    const svg = story.querySelector(".case-story-line");
    const path = svg.querySelector("path");
    const viewBox = svg.getAttribute("viewBox");
    const original = path.getAttribute("d");
    const steps = [...story.querySelectorAll(".case-story-step")];
    function fit() {
      if (!narrow.matches) {
        svg.setAttribute("viewBox", viewBox);
        path.setAttribute("d", original);
        return;
      }
      svg.setAttribute("viewBox", `0 0 1000 ${story.clientHeight}`);
      path.setAttribute("d", mobileStoryPath(steps, steps.map(step => step.offsetTop + step.offsetHeight / 2)));
    }
    const observer = new ResizeObserver(fit);
    steps.forEach(step => observer.observe(step));
    narrow.addEventListener("change", fit);
    fit();
  }
})();

(() => {
  const mobile = window.portfolioMobileLayout;
  const email = document.querySelector('.cv-profile-actions a[href^="mailto:"]');
  const role = document.querySelector('.cv-role');
  if (!mobile || !email || !role) return;
  const address = email.parentElement;
  email.classList.add('cv-profile-email');
  function placeEmail() {
    if (mobile.matches) role.after(email);
    else address.prepend(email);
  }
  mobile.addEventListener('change', placeEmail);
  placeEmail();
})();
