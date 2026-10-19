(() => {
  const cfg = window.SAFEHOUSE_CONFIG || {};

  // ---------- links from config ----------
  document.querySelectorAll("[data-link]").forEach((el) => {
    const url = cfg[el.dataset.link];
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.dataset.pending = "true";
      el.addEventListener("click", (e) => e.preventDefault());
    }
  });
  document.querySelectorAll("[data-label]").forEach((el) => {
    const label = cfg[el.dataset.label];
    if (label) el.textContent = label;
  });

  // ---------- discord announcements (WidgetBot) ----------
  if (cfg.discordServerId && cfg.discordAnnouncementsChannelId) {
    const frame = document.createElement("iframe");
    frame.src = `https://e.widgetbot.io/channels/${cfg.discordServerId}/${cfg.discordAnnouncementsChannelId}`;
    frame.title = "Safehouse Discord announcements";
    frame.loading = "lazy";
    frame.allow = "clipboard-write; fullscreen";
    const body = document.getElementById("ann-body");
    body.replaceChildren(frame);
  }

  // ---------- tap vibration waves ----------
  const canvas = document.getElementById("waves");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waves = [];
  let dpr = 1;
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  resize();
  addEventListener("resize", resize);

  const LIFE = 1400; // ms per wave

  function spawn(x, y) {
    const now = performance.now();
    // a primary wobbling ring and two trailing echoes
    for (let i = 0; i < 3; i++) waves.push({ x, y, t0: now + i * 120, seed: Math.random() * 10 });
    if (navigator.vibrate) navigator.vibrate([14, 40, 8]);
    if (!running) { running = true; requestAnimationFrame(draw); }
  }

  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const maxR = Math.min(Math.max(innerWidth, innerHeight) * 0.35, 320);

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      const p = (now - w.t0) / LIFE;
      if (p < 0) continue;
      if (p >= 1) { waves.splice(i, 1); continue; }

      const ease = 1 - Math.pow(1 - p, 3);
      const r = 6 + ease * maxR;
      const alpha = (1 - p) * (1 - p);
      // amplitude decays as the ring travels: the "vibration"
      const amp = reduced ? 0 : 7 * (1 - p);
      const freq = 14;

      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 90) {
        const rr = r + amp * Math.sin(a * freq + w.seed + now * 0.018);
        const px = (w.x + Math.cos(a) * rr) * dpr;
        const py = (w.y + Math.sin(a) * rr) * dpr;
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.lineWidth = (2.2 - p * 1.4) * dpr;
      ctx.strokeStyle = `rgba(255, 138, 61, ${alpha * 0.9})`;
      ctx.shadowColor = "rgba(255, 106, 26, 0.9)";
      ctx.shadowBlur = 18 * dpr;
      ctx.stroke();

      // soft core flash right at the tap
      if (p < 0.25) {
        const g = ctx.createRadialGradient(w.x * dpr, w.y * dpr, 0, w.x * dpr, w.y * dpr, 60 * dpr);
        g.addColorStop(0, `rgba(255, 210, 170, ${(0.25 - p) * 1.6})`);
        g.addColorStop(1, "rgba(255, 106, 26, 0)");
        ctx.shadowBlur = 0;
        ctx.fillStyle = g;
        ctx.fillRect((w.x - 60) * dpr, (w.y - 60) * dpr, 120 * dpr, 120 * dpr);
      }
    }

    if (waves.length) requestAnimationFrame(draw);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  const hint = document.querySelector(".tap-hint");
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, iframe, .announcements")) return;
    spawn(e.clientX, e.clientY);
    hint && hint.classList.add("gone");
  });
})();
