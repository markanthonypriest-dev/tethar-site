/* Tethar — Live demo interactions + upload studio */
(function () {
  'use strict';

  /* ============================================================
     1. Interactive phone: tabs, toggles, protection count, approve
     ============================================================ */
  var tabs = document.querySelectorAll('.d-tab');
  var views = document.querySelectorAll('.d-view');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      views.forEach(function (v) { v.classList.toggle('active', v.getAttribute('data-view') === name); });
    });
  });

  // Protection toggles + live count
  var toggles = document.querySelectorAll('.d-view[data-view="dash"] [data-toggle]');
  var protCount = document.getElementById('protCount');
  function refreshCount() {
    if (!protCount) return;
    var on = 0;
    toggles.forEach(function (s) { if (s.classList.contains('on')) on++; });
    protCount.textContent = on + ' of ' + toggles.length + ' active';
    protCount.style.color = on >= 3 ? 'var(--mint-400)' : on >= 2 ? 'var(--amber-400)' : 'var(--coral-500)';
  }
  toggles.forEach(function (s) {
    s.addEventListener('click', function () { s.classList.toggle('on'); refreshCount(); });
  });
  refreshCount();

  // Animate the screen-time ring on load
  var arc = document.getElementById('ringArc');
  if (arc) {
    arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,.61,.36,1)';
    var target = arc.getAttribute('stroke-dashoffset');
    arc.setAttribute('stroke-dashoffset', '314');
    setTimeout(function () { arc.setAttribute('stroke-dashoffset', target); }, 350);
  }

  // Approve pending app request
  var reqBtn = document.getElementById('reqBtn');
  if (reqBtn) {
    reqBtn.addEventListener('click', function () {
      var row = document.getElementById('reqRow');
      var empty = document.getElementById('reqEmpty');
      if (row) row.style.display = 'none';
      if (empty) empty.style.display = 'block';
      // Add to the allowed apps list above
      var appsCard = document.querySelector('.d-view[data-view="apps"] .d-card');
      if (appsCard) {
        var newRow = document.createElement('div');
        newRow.className = 'd-app-row';
        newRow.innerHTML = '<span class="d-app-ic" style="background:#000">🎮</span><span class="nm">PixelQuest</span><span class="mini ok">Allowed</span>';
        appsCard.appendChild(newRow);
      }
    });
  }

  /* ============================================================
     2. Studio tab switching (media / build)
     ============================================================ */
  var studioBtns = document.querySelectorAll('[data-studio]');
  var studioPanels = document.querySelectorAll('[data-studio-panel]');
  studioBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-studio');
      studioBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      studioPanels.forEach(function (p) {
        p.style.display = p.getAttribute('data-studio-panel') === name ? '' : 'none';
      });
    });
  });

  /* ============================================================
     3. Media upload studio (images persisted, videos in-session)
     ============================================================ */
  var STORE_KEY = 'tethar.demo.media.v1';
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var gallery = document.getElementById('gallery');
  var emptyState = document.getElementById('emptyState');
  var itemCount = document.getElementById('itemCount');
  var clearAll = document.getElementById('clearAll');

  // In-memory list: { id, name, type: 'image'|'video', src, persist:boolean }
  var items = [];

  function loadSaved() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        JSON.parse(raw).forEach(function (it) {
          items.push({ id: it.id, name: it.name, type: 'image', src: it.src, persist: true });
        });
      }
    } catch (e) { /* ignore */ }
  }

  function saveImages() {
    try {
      var toSave = items.filter(function (i) { return i.persist; })
        .map(function (i) { return { id: i.id, name: i.name, src: i.src }; });
      localStorage.setItem(STORE_KEY, JSON.stringify(toSave));
    } catch (e) {
      // Likely quota exceeded — fail quietly, media stays for the session
      console.warn('Tethar demo: could not persist images (storage full).');
    }
  }

  function uid() {
    return 'm' + (items.reduce(function (m, i) {
      var n = parseInt(i.id.slice(1), 10); return isNaN(n) ? m : Math.max(m, n);
    }, 0) + 1) + '-' + (performance.now() | 0);
  }

  function render() {
    if (!gallery) return;
    gallery.innerHTML = '';
    items.forEach(function (it) {
      var media = it.type === 'video'
        ? '<video src="' + it.src + '" muted loop playsinline preload="metadata"></video><span class="play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>'
        : '<img src="' + it.src + '" alt="' + escapeHtml(it.name) + '">';
      var el = document.createElement('div');
      el.className = 'demo-item';
      el.innerHTML =
        '<div class="demo-frame">' +
          '<span class="demo-type">' + (it.type === 'video' ? 'Recording' : 'Screen') + '</span>' +
          '<div class="demo-media" data-open="' + it.id + '">' + media + '</div>' +
        '</div>' +
        '<div class="demo-cap"><span class="nm" title="' + escapeHtml(it.name) + '">' + escapeHtml(it.name) + '</span>' +
        '<button class="rm" data-remove="' + it.id + '" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button></div>';
      gallery.appendChild(el);
    });
    if (itemCount) itemCount.textContent = String(items.length);
    if (emptyState) emptyState.style.display = items.length ? 'none' : '';
    if (clearAll) clearAll.style.display = items.length ? '' : 'none';
    // Autoplay video previews softly
    gallery.querySelectorAll('video').forEach(function (v) { v.play().catch(function () {}); });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList);
    files.forEach(function (file) {
      var isImage = file.type.indexOf('image') === 0;
      var isVideo = file.type.indexOf('video') === 0;
      if (!isImage && !isVideo) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        items.push({
          id: uid(),
          name: file.name,
          type: isVideo ? 'video' : 'image',
          src: e.target.result,
          persist: isImage // only images are small enough to reliably persist
        });
        render();
        if (isImage) saveImages();
      };
      reader.readAsDataURL(file);
    });
  }

  if (dropzone) {
    fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        if (ev === 'dragleave' && dropzone.contains(e.relatedTarget)) return;
        dropzone.classList.remove('drag');
      });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  // Gallery clicks: remove or open in lightbox
  if (gallery) {
    gallery.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-remove]');
      if (rm) {
        var rid = rm.getAttribute('data-remove');
        items = items.filter(function (i) { return i.id !== rid; });
        render(); saveImages();
        return;
      }
      var open = e.target.closest('[data-open]');
      if (open) openLightbox(open.getAttribute('data-open'));
    });
  }

  if (clearAll) {
    clearAll.addEventListener('click', function () {
      items = [];
      render();
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    });
  }

  /* Lightbox */
  var lightbox = document.getElementById('lightbox');
  var lbBody = document.getElementById('lbBody');
  var lbClose = document.getElementById('lbClose');
  function openLightbox(id) {
    var it = items.filter(function (i) { return i.id === id; })[0];
    if (!it || !lightbox) return;
    lbBody.innerHTML = it.type === 'video'
      ? '<video src="' + it.src + '" controls autoplay loop playsinline style="width:100%;height:100%;object-fit:contain"></video>'
      : '<img src="' + it.src + '" alt="' + escapeHtml(it.name) + '" style="width:100%;height:100%;object-fit:contain">';
    lightbox.classList.add('open');
  }
  function closeLightbox() { if (lightbox) { lightbox.classList.remove('open'); lbBody.innerHTML = ''; } }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });

  loadSaved();
  render();

  /* ============================================================
     4. Build (APK/AAB) cataloguing — local reference only
     ============================================================ */
  var buildInput = document.getElementById('buildInput');
  var buildList = document.getElementById('buildList');
  var builds = [];
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  function renderBuilds() {
    if (!buildList) return;
    buildList.innerHTML = '';
    builds.forEach(function (b, idx) {
      var card = document.createElement('div');
      card.className = 'build-card';
      card.innerHTML =
        '<div class="b-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg></div>' +
        '<div class="b-meta"><b>' + escapeHtml(b.name) + '</b><small>' + fmtSize(b.size) + ' · ready to demo · added just now</small></div>' +
        '<button class="rm" data-build="' + idx + '" aria-label="Remove" style="width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted)"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
      buildList.appendChild(card);
    });
  }
  if (buildInput) {
    buildInput.addEventListener('change', function () {
      Array.prototype.slice.call(buildInput.files).forEach(function (f) {
        builds.push({ name: f.name, size: f.size });
      });
      buildInput.value = '';
      renderBuilds();
    });
    buildList.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-build]');
      if (rm) { builds.splice(parseInt(rm.getAttribute('data-build'), 10), 1); renderBuilds(); }
    });
  }
})();

/* ============================================================
   5. Interactive app tour — tap through the real screens
   ============================================================ */
(function () {
  'use strict';
  var img = document.getElementById('tourImg');
  if (!img) return;
  var titleEl = document.getElementById('tourTitle');
  var descEl = document.getElementById('tourDesc');
  var chipsEl = document.getElementById('tourChips');
  var hotEl = document.getElementById('tourHotspots');
  var prevBtn = document.getElementById('tourPrev');
  var nextBtn = document.getElementById('tourNext');

  // hotspot coords are percentages of the screen image {x, y, w, h, go}
  var SCREENS = [
    { id: 'home', img: 'app-home.jpg', title: 'Home dashboard',
      desc: 'App-usage breakdown, battery, signal and quick actions at a glance.',
      hotspots: [ { x: 38, y: 91, w: 25, h: 9, go: 'config' } ] },
    { id: 'location', img: 'app-location.jpg', title: 'Live location',
      desc: 'Where your child is, with location history and place alerts.',
      hotspots: [ { x: 12, y: 91, w: 25, h: 9, go: 'home' }, { x: 38, y: 91, w: 25, h: 9, go: 'config' } ] },
    { id: 'config', img: 'app-config.jpg', title: 'Configuration',
      desc: 'Every setting for your child, in one place.',
      hotspots: [
        { x: 5, y: 40, w: 82, h: 10, go: 'appaccess' },
        { x: 5, y: 51, w: 82, h: 10, go: 'downtime' },
        { x: 5, y: 62, w: 82, h: 10, go: 'usagelimits' },
        { x: 5, y: 73, w: 82, h: 10, go: 'location' },
        { x: 5, y: 84, w: 82, h: 7, go: 'filtering' },
        { x: 12, y: 92, w: 24, h: 8, go: 'home' }
      ] },
    { id: 'appaccess', img: 'app-appaccess.jpg', title: 'App access',
      desc: 'Choose exactly which apps your child can use.',
      hotspots: [ { x: 1, y: 5, w: 16, h: 6, go: 'config' } ] },
    { id: 'usagelimits', img: 'app-usagelimits.jpg', title: 'App usage limits',
      desc: 'Set how long each app can be used across the week.',
      hotspots: [ { x: 1, y: 5, w: 16, h: 6, go: 'config' } ] },
    { id: 'downtime', img: 'app-downtime.jpg', title: 'Downtime',
      desc: 'Set daily hours when the phone winds down.',
      hotspots: [ { x: 1, y: 5, w: 16, h: 6, go: 'config' } ] },
    { id: 'filtering', img: 'app-filtering.jpg', title: 'Internet filtering',
      desc: 'Keep unsafe sites off‑limits; allow only the ones you trust.',
      hotspots: [ { x: 1, y: 5, w: 16, h: 6, go: 'config' } ] },
    { id: 'reports', img: 'app-reports.jpg', title: 'Reports & history',
      desc: 'Usage reports and a day-by-day location timeline.',
      hotspots: [ { x: 12, y: 92, w: 24, h: 8, go: 'home' } ] }
  ];
  var byId = {};
  SCREENS.forEach(function (s) { byId[s.id] = s; });
  var order = SCREENS.map(function (s) { return s.id; });
  var cur = 'home';

  function render(id) {
    var s = byId[id];
    if (!s) return;
    cur = id;
    img.style.opacity = '0';
    setTimeout(function () {
      img.src = 'assets/img/' + s.img;
      img.alt = 'Tethar parent app — ' + s.title;
      img.style.opacity = '1';
    }, 140);
    titleEl.textContent = s.title;
    descEl.textContent = s.desc;
    Array.prototype.forEach.call(chipsEl.children, function (b) {
      b.classList.toggle('active', b.getAttribute('data-id') === id);
    });
    hotEl.innerHTML = '';
    (s.hotspots || []).forEach(function (h) {
      var b = document.createElement('button');
      b.style.left = h.x + '%'; b.style.top = h.y + '%';
      b.style.width = h.w + '%'; b.style.height = h.h + '%';
      var dest = byId[h.go];
      b.setAttribute('aria-label', 'Open ' + (dest ? dest.title : h.go));
      b.addEventListener('click', function () { render(h.go); });
      hotEl.appendChild(b);
    });
  }

  SCREENS.forEach(function (s) {
    var b = document.createElement('button');
    b.textContent = s.title;
    b.setAttribute('data-id', s.id);
    b.addEventListener('click', function () { render(s.id); });
    chipsEl.appendChild(b);
  });
  prevBtn.addEventListener('click', function () {
    render(order[(order.indexOf(cur) - 1 + order.length) % order.length]);
  });
  nextBtn.addEventListener('click', function () {
    render(order[(order.indexOf(cur) + 1) % order.length]);
  });

  render('home');
})();
