function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function norm(v, min, max) {
  return clamp((v - min) / (max - min), 0, 1);
}

function computeSensitivity(device) {
  const screenNorm = 1 - norm(device.screen, 4.7, 7.6);
  const refreshNorm = norm(device.refresh, 60, 165);
  const ppiNorm = norm(device.ppi, 260, 505);
  const tierNorm = norm(device.tier, 1, 5);
  const ramNorm = norm(device.ram, 4, 16);

  const base = 88 + tierNorm * 32 + refreshNorm * 26 + ppiNorm * 14 + screenNorm * 18;

  const lookAround = Math.round(clamp(base, 60, 200));
  const hongTam = Math.round(clamp(base + 6 + tierNorm * 12, 60, 200));
  const scope2x = Math.round(clamp(base + 22 + refreshNorm * 18 - screenNorm * 6, 60, 200));
  const scope4x = Math.round(clamp(base + 10 + refreshNorm * 12, 60, 200));
  const sungNgam = Math.round(clamp(66 + tierNorm * 28 + screenNorm * 14, 50, 150));
  const cameraTuDo = Math.round(clamp(62 + tierNorm * 24 + ramNorm * 8, 50, 150));

  const dpi = Math.round(clamp(360 + ppiNorm * 340 + tierNorm * 160 + refreshNorm * 60, 300, 1000));
  const fireButtonSize = Math.round(clamp(102 + (1 - screenNorm) * 26 + tierNorm * 8, 90, 150));

  return {
    lookAround, hongTam, scope2x, scope4x, sungNgam, cameraTuDo, dpi, fireButtonSize
  };
}

const state = { os: null, device: null };

const osGrid = document.getElementById("osGrid");
const searchSection = document.getElementById("searchSection");
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const quickSearchInput = document.getElementById("quickSearchInput");
const quickSuggestions = document.getElementById("quickSuggestions");
const resultSection = document.getElementById("resultSection");
const resultDeviceName = document.getElementById("resultDeviceName");
const resultDeviceMeta = document.getElementById("resultDeviceMeta");
const barsWrap = document.getElementById("barsWrap");
const extraStats = document.getElementById("extraStats");
const activeOsLabel = document.getElementById("activeOsLabel");
const changeOsBtn = document.getElementById("changeOsBtn");

function renderAdmin() {
  document.getElementById("adminName").textContent = ADMIN_INFO.name;
  document.getElementById("adminInitials").textContent = ADMIN_INFO.name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const links = document.getElementById("adminLinks");
  const items = [
    { label: "Telegram", value: "@" + ADMIN_INFO.tele, href: "https://t.me/" + ADMIN_INFO.tele },
    { label: "TikTok", value: "@" + ADMIN_INFO.tiktok, href: "https://www.tiktok.com/@" + ADMIN_INFO.tiktok },
    { label: "Zalo", value: ADMIN_INFO.zalo, href: "https://zalo.me/" + ADMIN_INFO.zalo },
    { label: "Facebook", value: "Trang cá nhân", href: ADMIN_INFO.facebook }
  ];
  links.innerHTML = items
    .map(
      (it) =>
        `<a class="admin-link" href="${it.href}" target="_blank" rel="noopener">
          <span class="admin-link-label">${it.label}</span>
          <span class="admin-link-value">${it.value}</span>
        </a>`
    )
    .join("");
}

function renderOsGrid() {
  osGrid.innerHTML = OS_LIST.map(
    (os) => `
      <button class="os-card" data-os="${os.id}">
        <span class="os-badge">${os.mono}</span>
        <span class="os-name">${os.name}</span>
        <span class="os-vendor">${os.vendor}</span>
      </button>`
  ).join("");

  osGrid.querySelectorAll(".os-card").forEach((btn) => {
    btn.addEventListener("click", () => selectOs(btn.dataset.os));
  });
}

function selectOs(osId) {
  state.os = osId;
  state.device = null;
  const os = OS_LIST.find((o) => o.id === osId);
  activeOsLabel.textContent = os.name;
  osGrid.parentElement.classList.add("is-collapsed");
  searchSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  searchInput.value = "";
  searchInput.placeholder = `Tìm dòng máy ${os.name}, ví dụ: ${sampleDeviceFor(osId)}`;
  suggestions.innerHTML = "";
  searchInput.focus();
}

function pickDevice(device) {
  state.os = device.os;
  const os = OS_LIST.find((o) => o.id === device.os);
  activeOsLabel.textContent = os.name;
  osGrid.parentElement.classList.add("is-collapsed");
  searchSection.classList.remove("hidden");
  searchInput.value = device.name;
  searchInput.placeholder = `Tìm dòng máy ${os.name}, ví dụ: ${sampleDeviceFor(device.os)}`;
  suggestions.innerHTML = "";
  quickSearchInput.value = "";
  quickSuggestions.classList.remove("is-open");
  showResult(device);
}

function sampleDeviceFor(osId) {
  const d = DEVICES.find((d) => d.os === osId);
  return d ? d.name : "";
}

changeOsBtn.addEventListener("click", () => {
  osGrid.parentElement.classList.remove("is-collapsed");
  searchSection.classList.add("hidden");
  resultSection.classList.add("hidden");
});

function renderSuggestions(query) {
  if (!state.os || query.trim().length === 0) {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    return;
  }
  const q = query.trim().toLowerCase();
  const matches = DEVICES.filter((d) => d.os === state.os && d.name.toLowerCase().includes(q)).slice(0, 8);

  if (matches.length === 0) {
    suggestions.innerHTML = `<div class="suggestion-empty">Không tìm thấy dòng máy phù hợp</div>`;
    suggestions.classList.add("is-open");
    return;
  }

  suggestions.innerHTML = matches
    .map(
      (d) => `
      <button class="suggestion-item" data-id="${d.id}">
        <span class="suggestion-thumb" style="--seed:${hashHue(d.name)}">${initialsOf(d.name)}</span>
        <span class="suggestion-text">
          <span class="suggestion-name">${highlight(d.name, q)}</span>
          <span class="suggestion-sub">${d.brand} · ${d.year}</span>
        </span>
      </button>`
    )
    .join("");
  suggestions.classList.add("is-open");

  suggestions.querySelectorAll(".suggestion-item").forEach((el) => {
    el.addEventListener("click", () => {
      const device = DEVICES.find((d) => d.id === el.dataset.id);
      suggestions.classList.remove("is-open");
      pickDevice(device);
    });

    const device = DEVICES.find((dv) => dv.id === el.dataset.id);
    const thumb = el.querySelector(".suggestion-thumb");
    fetchDeviceImage(device.brand + " " + device.name).then((src) => {
      if (src) {
        thumb.style.backgroundImage = `url(${src})`;
        thumb.style.backgroundSize = "cover";
        thumb.style.backgroundPosition = "center";
        thumb.textContent = "";
      }
    });
  });
}

function renderQuickSuggestions(query) {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    quickSuggestions.innerHTML = "";
    quickSuggestions.classList.remove("is-open");
    return;
  }
  const matches = DEVICES.filter((dv) => dv.name.toLowerCase().includes(q)).slice(0, 8);

  if (matches.length === 0) {
    quickSuggestions.innerHTML = `<div class="suggestion-empty">Không tìm thấy dòng máy phù hợp</div>`;
    quickSuggestions.classList.add("is-open");
    return;
  }

  quickSuggestions.innerHTML = matches
    .map(
      (dv) => `
      <button class="suggestion-item" data-id="${dv.id}">
        <span class="suggestion-thumb" style="--seed:${hashHue(dv.name)}">${initialsOf(dv.name)}</span>
        <span class="suggestion-text">
          <span class="suggestion-name">${highlight(dv.name, q)}</span>
          <span class="suggestion-sub">${dv.brand} · ${OS_LIST.find((o) => o.id === dv.os).name} · ${dv.year}</span>
        </span>
      </button>`
    )
    .join("");
  quickSuggestions.classList.add("is-open");

  quickSuggestions.querySelectorAll(".suggestion-item").forEach((el) => {
    el.addEventListener("click", () => {
      const device = DEVICES.find((dv) => dv.id === el.dataset.id);
      quickSuggestions.classList.remove("is-open");
      pickDevice(device);
    });

    const device = DEVICES.find((dv) => dv.id === el.dataset.id);
    const thumb = el.querySelector(".suggestion-thumb");
    fetchDeviceImage(device.brand + " " + device.name).then((src) => {
      if (src) {
        thumb.style.backgroundImage = `url(${src})`;
        thumb.style.backgroundSize = "cover";
        thumb.style.backgroundPosition = "center";
        thumb.textContent = "";
      }
    });
  });
}

let quickDebounceTimer = null;
quickSearchInput.addEventListener("input", (e) => {
  clearTimeout(quickDebounceTimer);
  const v = e.target.value;
  quickDebounceTimer = setTimeout(() => renderQuickSuggestions(v), 120);
});

quickSearchInput.addEventListener("focus", () => {
  if (quickSearchInput.value.trim().length > 0) renderQuickSuggestions(quickSearchInput.value);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) {
    suggestions.classList.remove("is-open");
    quickSuggestions.classList.remove("is-open");
  }
});

function highlight(name, q) {
  const idx = name.toLowerCase().indexOf(q);
  if (idx === -1) return name;
  return (
    name.slice(0, idx) +
    "<mark>" +
    name.slice(idx, idx + q.length) +
    "</mark>" +
    name.slice(idx + q.length)
  );
}

function initialsOf(name) {
  return name
    .split(" ")
    .filter((w) => /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

const imageCache = new Map();

async function fetchDeviceImage(name) {
  if (imageCache.has(name)) return imageCache.get(name);
  const url = "https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=" +
    encodeURIComponent(name + " smartphone") +
    "&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=360&format=json";
  try {
    const res = await fetch(url);
    const json = await res.json();
    const pages = json && json.query && json.query.pages;
    let thumb = null;
    if (pages) {
      const page = Object.values(pages)[0];
      if (page && page.thumbnail && page.thumbnail.source) thumb = page.thumbnail.source;
    }
    imageCache.set(name, thumb);
    return thumb;
  } catch (err) {
    imageCache.set(name, null);
    return null;
  }
}

let debounceTimer = null;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const v = e.target.value;
  debounceTimer = setTimeout(() => renderSuggestions(v), 120);
});

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim().length > 0) renderSuggestions(searchInput.value);
});

const STAT_ROWS = [
  { key: "lookAround", label: "Nhìn xung quanh" },
  { key: "hongTam", label: "Ống ngắm hồng tâm" },
  { key: "scope2x", label: "Ống ngắm 2x" },
  { key: "scope4x", label: "Ống ngắm 4x" },
  { key: "sungNgam", label: "Ống ngắm súng ngắm" },
  { key: "cameraTuDo", label: "Nút camera tự do" }
];

function showResult(device) {
  state.device = device;
  const values = computeSensitivity(device);

  resultDeviceName.textContent = device.name;
  resultDeviceMeta.textContent = `${device.screen}" · ${device.ppi} PPI · ${device.refresh}Hz · ${device.ram}GB RAM · ${device.year}`;

  const photoBox = document.getElementById("resultPhoto");
  photoBox.classList.add("is-loading");
  photoBox.style.backgroundImage = "none";
  photoBox.textContent = initialsOf(device.name);
  fetchDeviceImage(device.brand + " " + device.name).then((src) => {
    if (state.device !== device) return;
    photoBox.classList.remove("is-loading");
    if (src) {
      photoBox.style.backgroundImage = `url(${src})`;
      photoBox.style.backgroundSize = "cover";
      photoBox.style.backgroundPosition = "center";
      photoBox.textContent = "";
    }
  });

  barsWrap.innerHTML = STAT_ROWS.map(
    (row) => `
    <div class="stat-row" data-target="${values[row.key]}">
      <div class="stat-row-top">
        <span class="stat-label">${row.label}</span>
        <span class="stat-value" data-count>0</span>
      </div>
      <div class="stat-track">
        <div class="stat-fill" data-fill></div>
      </div>
    </div>`
  ).join("");

  extraStats.innerHTML = `
    <div class="extra-card">
      <span class="extra-label">DPI đề xuất</span>
      <span class="extra-value" data-count-extra="${values.dpi}">0</span>
    </div>
    <div class="extra-card">
      <span class="extra-label">Kích thước nút bắn</span>
      <span class="extra-value" data-count-extra="${values.fireButtonSize}">0</span>%
    </div>`;

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  animateResult();
}

function animateResult() {
  const rows = barsWrap.querySelectorAll(".stat-row");
  rows.forEach((row, i) => {
    const target = Number(row.dataset.target);
    const fill = row.querySelector("[data-fill]");
    const count = row.querySelector("[data-count]");
    fill.style.transition = "none";
    fill.style.width = "0%";
    count.textContent = "0";

    setTimeout(() => {
      fill.style.transition = "width 1.1s cubic-bezier(.16,.9,.2,1)";
      fill.style.width = `${clamp((target / 200) * 100, 2, 100)}%`;
      runCounter(count, target, 1100);
    }, 90 * i);
  });

  extraStats.querySelectorAll("[data-count-extra]").forEach((el, i) => {
    const target = Number(el.dataset.countExtra);
    el.textContent = "0";
    setTimeout(() => runCounter(el, target, 900), 100 + i * 120);
  });
}

function runCounter(el, target, duration) {
  const start = performance.now();
  function tick(now) {
    const p = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

renderAdmin();
renderOsGrid();
