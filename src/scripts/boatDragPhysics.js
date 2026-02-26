export function initBoatDragPhysics(options = {}) {
  const {
    boatSelector = '#waveBoat',
    containerSelector = '.wave-background',
    waveSelector = '.wave-container-3',
    waveFallbackRatio = 0.62,
    gravity = 0.4,
    driftClass = 'visible',
    launchClass = 'launching',
    steadyClasses = [],
    activeClasses = null,
    enablePointerOnActive = false,
    clearAnimationDelay = false,
    launchDistance = 13,
    launchDurationMs = 3000,
    driftDurationMs = 25000,
    driftAnimationName = 'boatDrift',
    getBoatBottomPx,
    createSplash,
  } = options;

  const boat = typeof boatSelector === 'string' ? document.querySelector(boatSelector) : boatSelector;
  const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
  if (!boat || !container) return null;

  let dragging = false;
  let physicsActive = false;
  let physicsRaf = null;
  let vx = 0, vy = 0;
  let posHistory = [];
  let cachedWaveY = null;

  const resetAnimatedClasses = [driftClass, launchClass, ...steadyClasses].filter(Boolean);

  if (enablePointerOnActive && Array.isArray(activeClasses) && activeClasses.length) {
    const observer = new MutationObserver(() => {
      if (activeClasses.some((c) => boat.classList.contains(c))) {
        boat.style.pointerEvents = 'auto';
        boat.style.cursor = 'grab';
      }
    });
    observer.observe(boat, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('resize', () => { cachedWaveY = null; }, { passive: true });

  function getWaveY() {
    if (cachedWaveY !== null) return cachedWaveY;
    const wave3 = container.querySelector(waveSelector) || document.querySelector(waveSelector);
    if (!wave3) return container.getBoundingClientRect().height * waveFallbackRatio;
    const r = wave3.getBoundingClientRect();
    const bg = container.getBoundingClientRect();
    cachedWaveY = (r.top + (500 / 800) * r.height) - bg.top;
    return cachedWaveY;
  }

  function resolveBottom(bgRect, waveY) {
    if (typeof getBoatBottomPx === 'function') {
      return getBoatBottomPx({ bgRect, waveY, boat, container });
    }
    return bgRect.height - waveY - 8;
  }

  function lockPosition() {
    const rect = boat.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;

    boat.classList.remove(...resetAnimatedClasses);
    boat.getAnimations().forEach((a) => a.cancel());
    if (clearAnimationDelay) boat.style.animationDelay = '';
    boat.style.opacity = '1';
    boat.style.left = x + 'px';
    boat.style.top = y + 'px';
    boat.style.bottom = 'auto';
    boat.style.transform = '';
    return { x, y };
  }

  boat.addEventListener('pointerdown', (e) => {
    if (Array.isArray(activeClasses) && activeClasses.length && !activeClasses.some((c) => boat.classList.contains(c))) {
      return;
    }
    e.preventDefault();
    document.body.style.userSelect = 'none';
    if (physicsActive) {
      cancelAnimationFrame(physicsRaf);
      physicsActive = false;
    }
    lockPosition();
    dragging = true;
    vx = 0;
    vy = 0;
    posHistory = [];
    boat.style.cursor = 'grabbing';
    try { boat.setPointerCapture(e.pointerId); } catch {}
  });

  boat.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const bg = container.getBoundingClientRect();
    const x = e.clientX - bg.left - boat.offsetWidth / 2;
    const y = e.clientY - bg.top - boat.offsetHeight / 2;
    boat.style.left = x + 'px';
    boat.style.top = y + 'px';

    posHistory.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    if (posHistory.length > 6) posHistory.shift();

    if (posHistory.length >= 2) {
      const a = posHistory[posHistory.length - 2];
      const b = posHistory[posHistory.length - 1];
      boat.style.transform = `rotate(${Math.max(-25, Math.min(25, (b.x - a.x) * 2))}deg)`;
    }
  });

  function resumeDrift(currentX) {
    const bgRect = container.getBoundingClientRect();
    const waveY = getWaveY();
    currentX = ((currentX % bgRect.width) + bgRect.width) % bgRect.width;
    const landedLeftPct = (currentX / bgRect.width) * 100;
    const startLeftPx = Number.isFinite(parseFloat(boat.style.left))
      ? parseFloat(boat.style.left)
      : currentX;

    boat.style.left = startLeftPx + 'px';
    boat.style.transform = '';
    if (clearAnimationDelay) boat.style.animationDelay = '';
    boat.style.opacity = '1';
    const currentRect = boat.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const exactBottomPx = containerRect.bottom - currentRect.bottom;
    if (Number.isFinite(exactBottomPx)) {
      boat.style.bottom = exactBottomPx + 'px';
    } else {
      boat.style.bottom = resolveBottom(bgRect, waveY) + 'px';
    }
    boat.style.top = '';

    boat.classList.add(launchClass, ...steadyClasses);

    const endLeftPct = landedLeftPct + launchDistance;
    const endLeftPx = startLeftPx + (bgRect.width * launchDistance / 100);
    const launchAnim = boat.animate([
      { left: startLeftPx + 'px' },
      { left: endLeftPx + 'px' }
    ], {
      duration: launchDurationMs,
      easing: 'cubic-bezier(0.3, 0, 0.8, 0.8)',
      fill: 'forwards'
    });

    launchAnim.finished.then(() => {
      const priorBob = boat.getAnimations().find((a) => a.animationName === 'boatBob');
      const bobTime = priorBob?.currentTime ?? null;
      const beforeRect = boat.getBoundingClientRect();
      // Commit the launch endpoint before canceling WAAPI so left doesn't snap
      // back to the pre-launch inline value for a frame.
      boat.style.left = endLeftPct + '%';
      launchAnim.cancel();
      boat.classList.remove(launchClass);
      boat.classList.add(driftClass, ...steadyClasses);
      if (bobTime !== null) {
        const nextBob = boat.getAnimations().find((a) => a.animationName === 'boatBob');
        if (nextBob) nextBob.currentTime = bobTime;
      }

      const driftProgress = Math.max(0, Math.min(1, (endLeftPct + 5) / 110));
      const driftTimeMs = driftProgress * driftDurationMs;
      const driftAnim = boat.getAnimations().find((a) => a.animationName === driftAnimationName);
      if (driftAnim) driftAnim.currentTime = driftTimeMs;

      // Keep the visual y-position continuous across the class swap.
      const afterRect = boat.getBoundingClientRect();
      const deltaY = beforeRect.top - afterRect.top;
      if (Math.abs(deltaY) > 0.01) {
        const currentBottom = parseFloat(boat.style.bottom);
        if (Number.isFinite(currentBottom)) {
          boat.style.bottom = (currentBottom + deltaY) + 'px';
        }
      }
    });
  }

  function bobberPop(startX, startY) {
    const bgRect = container.getBoundingClientRect();
    const waveY = getWaveY();
    const targetBottom = resolveBottom(bgRect, waveY);
    const surfaceY = bgRect.height - targetBottom - boat.offsetHeight;

    const popAnim = boat.animate([
      { top: startY + 'px' },
      { top: surfaceY + 'px' }
    ], {
      duration: 650,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.55)',
      fill: 'forwards'
    });

    setTimeout(() => {
      if (typeof createSplash === 'function') {
        createSplash(
          bgRect.left + startX + boat.offsetWidth / 2,
          bgRect.top + bgRect.height - targetBottom - Math.round(boat.offsetHeight * 0.25) + 2
        );
      }
    }, 295);

    popAnim.finished.then(() => {
      boat.style.top = surfaceY + 'px';
      popAnim.cancel();
      setTimeout(() => resumeDrift(startX), 100);
    });
  }

  function runFall() {
    let x = parseFloat(boat.style.left);
    let y = parseFloat(boat.style.top);
    const bgRectInit = container.getBoundingClientRect();

    if (x > bgRectInit.width) x = ((x % bgRectInit.width) + bgRectInit.width) % bgRectInit.width;
    else if (x < -boat.offsetWidth) x = bgRectInit.width - (Math.abs(x) % bgRectInit.width);

    if (y + boat.offsetHeight > getWaveY() + 8) {
      physicsActive = false;
      bobberPop(x, y);
      return;
    }

    function step() {
      if (!physicsActive) return;

      vy += gravity;
      vx *= 0.99;
      x += vx;
      y += vy;

      const bgRect = container.getBoundingClientRect();
      const waveY = getWaveY();
      boat.style.transform = `rotate(${Math.max(-20, Math.min(20, vx * 1.5))}deg)`;

      if (y > bgRect.height + boat.offsetHeight) {
        y = -boat.offsetHeight;
        vy = Math.min(vy, 8);
      }

      if (x > bgRect.width) x = -boat.offsetWidth;
      else if (x < -boat.offsetWidth) x = bgRect.width;

      const landingBottom = resolveBottom(bgRect, waveY);
      const landingY = bgRect.height - landingBottom - boat.offsetHeight;
      const boatBottom = y + boat.offsetHeight;
      if (boatBottom >= bgRect.height - landingBottom && vy > 0) {
        physicsActive = false;
        y = landingY;
        boat.style.left = x + 'px';
        boat.style.top = y + 'px';
        boat.style.transform = '';

        if (typeof createSplash === 'function') {
          createSplash(
            bgRect.left + x + boat.offsetWidth / 2,
            bgRect.top + bgRect.height - landingBottom - Math.round(boat.offsetHeight * 0.25) + 2
          );
        }

        setTimeout(() => resumeDrift(x), 150);
        return;
      }

      boat.style.left = x + 'px';
      boat.style.top = y + 'px';
      physicsRaf = requestAnimationFrame(step);
    }

    physicsRaf = requestAnimationFrame(step);
  }

  function handleRelease() {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    boat.style.cursor = 'grab';

    const velScale = window.innerWidth < 768 ? 1.25 : 0.5;
    if (posHistory.length >= 2) {
      const newest = posHistory[posHistory.length - 1];
      const oldest = posHistory[0];
      const dt = Math.max(16, newest.t - oldest.t) / 1000;
      vx = (newest.x - oldest.x) / dt * 0.016 * velScale;
      vy = (newest.y - oldest.y) / dt * 0.016 * velScale;
    } else {
      vx = 0;
      vy = 0;
    }

    physicsActive = true;
    runFall();
  }

  boat.addEventListener('pointerup', handleRelease);
  boat.addEventListener('pointercancel', handleRelease);
  window.addEventListener('pointerup', () => { if (dragging) handleRelease(); });
  window.addEventListener('pointercancel', () => { if (dragging) handleRelease(); });
  window.addEventListener('pointermove', (e) => { if (dragging && e.buttons === 0) handleRelease(); });
  window.addEventListener('blur', () => { if (dragging) handleRelease(); });

  return {
    boat,
    container,
    getWaveY,
    lockPosition,
    resumeDrift,
  };
}
