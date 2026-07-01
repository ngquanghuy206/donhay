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

  const base = 100 + tierNorm * 40 + refreshNorm * 30 + ppiNorm * 16 + screenNorm * 22;

  const lookAround = Math.round(clamp(base, 60, 200));
  const hongTam = Math.round(clamp(base + 8 + tierNorm * 14, 60, 200));
  const scope2x = Math.round(clamp(base + 26 + refreshNorm * 20 - screenNorm * 6, 60, 200));
  const scope4x = Math.round(clamp(base + 14 + refreshNorm * 14, 60, 200));
  const sungNgam = Math.round(clamp(66 + tierNorm * 28 + screenNorm * 14, 50, 150));
  const cameraTuDo = Math.round(clamp(62 + tierNorm * 24 + ramNorm * 8, 50, 150));

  const dpi = Math.round(clamp(360 + ppiNorm * 340 + tierNorm * 160 + refreshNorm * 60, 300, 1000));
  // Kích thước nút bắn tính theo % màn hình. Giữ trong khoảng 20-50, máy cấu hình mạnh hơn thì nhích lên gần 50.
  const fireButtonSize = Math.round(clamp(24 + tierNorm * 18 + ramNorm * 6, 21, 49));

  return {
    lookAround, hongTam, scope2x, scope4x, sungNgam, cameraTuDo, dpi, fireButtonSize
  };
}

const state = { os: null, device: null };

// Domain chính thức của từng hãng để lấy logo thật (favicon chất lượng cao)
const BRAND_DOMAIN = {
  Samsung: "samsung.com",
  Xiaomi: "mi.com",
  Redmi: "mi.com",
  POCO: "po.co",
  OPPO: "oppo.com",
  vivo: "vivo.com",
  realme: "realme.com",
  OnePlus: "oneplus.com",
  Google: "google.com",
  ASUS: "asus.com",
  Nothing: "nothing.tech",
  Sony: "sony.com",
  Motorola: "motorola.com",
  Nokia: "nokia.com",
  Infinix: "infinixmobility.com",
  Tecno: "tecno-mobile.com",
  itel: "itel-mobile.com"
};

function brandLogoIcon(brand) {
  const domain = BRAND_DOMAIN[brand];
  if (!domain) return `<span class="os-badge-text">${initialsOf(brand)}</span>`;
  return `<img src="https://www.google.com/s2/favicons?sz=128&domain=${domain}" alt="${brand}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'os-badge-text',textContent:'${initialsOf(
    brand
  )}'}))" />`;
}

// Tách phần Android ra thành từng hãng riêng (Samsung 1 ô, OPPO 1 ô, ...),
// giữ nguyên iOS và HarmonyOS làm 1 ô như cũ.
function buildPlatformList() {
  const androidBrands = [...new Set(DEVICES.filter((d) => d.os === "android").map((d) => d.brand))].sort((a, b) =>
    a.localeCompare(b)
  );
  const androidPlatforms = androidBrands.map((brand) => ({
    id: "android-" + brand.replace(/\s+/g, "_"),
    name: brand,
    vendor: "Android",
    baseOs: "android",
    brand,
    icon: brandLogoIcon(brand)
  }));
  const iosPlatform = OS_LIST.find((o) => o.id === "ios");
  const harmonyPlatform = OS_LIST.find((o) => o.id === "harmony");
  return [
    { ...iosPlatform, baseOs: "ios" },
    ...androidPlatforms,
    { ...harmonyPlatform, baseOs: "harmony" }
  ];
}

let PLATFORM_LIST = [];

function getPlatform(id) {
  return PLATFORM_LIST.find((p) => p.id === id);
}

function devicesForPlatform(platform) {
  if (!platform) return [];
  if (platform.baseOs === "android") {
    return DEVICES.filter((dv) => dv.os === "android" && dv.brand === platform.brand);
  }
  return DEVICES.filter((dv) => dv.os === platform.baseOs);
}

function osDisplayName(baseOs) {
  if (baseOs === "ios") return "iOS";
  if (baseOs === "harmony") return "HarmonyOS";
  return "Android";
}

// Tìm platform (ô hãng/hệ điều hành) tương ứng với 1 thiết bị bất kỳ
function findPlatformForDevice(device) {
  if (device.os === "android") {
    return PLATFORM_LIST.find((p) => p.baseOs === "android" && p.brand === device.brand);
  }
  return PLATFORM_LIST.find((p) => p.baseOs === device.os);
}

const osGrid = document.getElementById("osGrid");
const searchSection = document.getElementById("searchSection");
const searchInput = document.getElementById("searchInput");
const deviceGrid = document.getElementById("deviceGrid");
const quickSearchInput = document.getElementById("quickSearchInput");
const quickSuggestions = document.getElementById("quickSuggestions");
const resultSection = document.getElementById("resultSection");
const resultDeviceName = document.getElementById("resultDeviceName");
const resultDeviceMeta = document.getElementById("resultDeviceMeta");
const barsWrap = document.getElementById("barsWrap");
const extraStats = document.getElementById("extraStats");
const activeOsLabel = document.getElementById("activeOsLabel");
const changeOsBtn = document.getElementById("changeOsBtn");
const quickSearchPanel = document.getElementById("quickSearchPanel");
const osPanelTitle = document.getElementById("osPanelTitle");

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
    { label: "Facebook", value: "Khánh Nam", href: ADMIN_INFO.facebook }
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
  osGrid.innerHTML = PLATFORM_LIST.map(
    (p) => `
      <button class="os-card" data-os="${p.id}">
        <span class="os-badge">${p.icon}</span>
        <span class="os-name">${p.name}</span>
        <span class="os-vendor">${p.vendor}</span>
      </button>`
  ).join("");

  osGrid.querySelectorAll(".os-card").forEach((btn) => {
    btn.addEventListener("click", () => selectOs(btn.dataset.os));
  });
}

function selectOs(platformId) {
  state.os = platformId;
  state.device = null;
  const platform = getPlatform(platformId);
  activeOsLabel.textContent = platform.name;
  osGrid.parentElement.classList.add("is-collapsed");
  quickSearchPanel.classList.add("hidden");
  osPanelTitle.textContent = "Chọn hệ điều hành";
  searchSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  searchInput.value = "";
  searchInput.placeholder = `Tìm dòng máy ${platform.name}, ví dụ: ${sampleDeviceFor(platform)}`;
  renderDeviceGrid(devicesForPlatform(platform));
  searchInput.focus();
}

function pickDevice(device) {
  const platform = findPlatformForDevice(device);
  state.os = platform.id;
  state.device = device;
  activeOsLabel.textContent = platform.name;
  osGrid.parentElement.classList.add("is-collapsed");
  quickSearchPanel.classList.add("hidden");
  osPanelTitle.textContent = "Chọn hệ điều hành";
  searchSection.classList.remove("hidden");
  searchInput.value = "";
  searchInput.placeholder = `Tìm dòng máy ${platform.name}, ví dụ: ${sampleDeviceFor(platform)}`;
  renderDeviceGrid(devicesForPlatform(platform));
  quickSearchInput.value = "";
  quickSuggestions.classList.remove("is-open");
  showResult(device);
}

function sampleDeviceFor(platform) {
  const list = devicesForPlatform(platform);
  return list.length ? list[0].name : "";
}

changeOsBtn.addEventListener("click", () => {
  osGrid.parentElement.classList.remove("is-collapsed");
  quickSearchPanel.classList.remove("hidden");
  osPanelTitle.textContent = "Hoặc chọn hệ điều hành";
  searchSection.classList.add("hidden");
  resultSection.classList.add("hidden");
});

// Danh sách máy dạng lưới thẻ 2 cột: hiện ảnh máy, thông tin máy và nút "Xem độ nhạy"
function renderDeviceGrid(list) {
  if (!list || list.length === 0) {
    deviceGrid.innerHTML = `<div class="suggestion-empty">Không tìm thấy dòng máy phù hợp</div>`;
    return;
  }

  deviceGrid.innerHTML = list
    .map(
      (dv) => `
      <div class="device-card" data-id="${dv.id}">
        <div class="device-card-photo" data-photo>${initialsOf(dv.name)}</div>
        <div class="device-card-body">
          <div class="device-card-name">${dv.name}</div>
          <div class="device-card-meta">${dv.screen}" · ${dv.ppi} PPI · ${dv.refresh}Hz · ${dv.ram}GB · ${dv.year}</div>
        </div>
        <button class="device-card-btn" data-view type="button">Xem độ nhạy</button>
      </div>`
    )
    .join("");

  deviceGrid.querySelectorAll(".device-card").forEach((card) => {
    const device = DEVICES.find((dv) => dv.id === card.dataset.id);
    const photoEl = card.querySelector("[data-photo]");
    fetchDeviceImage(device).then((src) => {
      if (src) applyPhoto(photoEl, src);
    });
    card.querySelector("[data-view]").addEventListener("click", (e) => {
      e.stopPropagation();
      pickDevice(device);
    });
    card.addEventListener("click", () => pickDevice(device));
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
        <span class="suggestion-thumb">${initialsOf(dv.name)}</span>
        <span class="suggestion-text">
          <span class="suggestion-name">${highlight(dv.name, q)}</span>
          <span class="suggestion-sub">${dv.brand} · ${osDisplayName(dv.os)} · ${dv.year}</span>
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
    fetchDeviceImage(device).then((src) => {
      if (src) applyPhoto(thumb, src);
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
    quickSuggestions.classList.remove("is-open");
  }
});

// Áp ảnh thật vào 1 khung ảnh: hiện trọn vẹn ảnh (không bị cắt/zoom lạ), nền trắng cho dễ nhìn
function applyPhoto(el, src) {
  el.classList.add("thumb-photo", "photo-loaded");
  el.style.backgroundImage = `url(${src})`;
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundPosition = "center";
  el.textContent = "";
}

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

const imageCache = new Map();

// Lấy ảnh thật của máy từ Wikipedia theo 2 bước cho chính xác:
// B1: opensearch để tìm ĐÚNG tên trang Wikipedia khớp với tên máy
// B2: dùng REST summary API lấy ảnh đại diện (thumbnail) của đúng trang đó
async function wikiThumbFor(query) {
  try {
    const searchUrl =
      "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&namespace=0&limit=1&search=" +
      encodeURIComponent(query);
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();
    const title = searchJson && searchJson[1] && searchJson[1][0];
    if (!title) return null;

    const summaryUrl =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_"));
    const summaryRes = await fetch(summaryUrl);
    const summaryJson = await summaryRes.json();
    return (
      (summaryJson.thumbnail && summaryJson.thumbnail.source) ||
      (summaryJson.originalimage && summaryJson.originalimage.source) ||
      null
    );
  } catch (err) {
    return null;
  }
}

// Nguồn ảnh dự phòng khi bài Wikipedia không có ảnh đại diện: tìm trực tiếp trên Wikimedia Commons
async function commonsThumbFor(query) {
  try {
    const searchUrl =
      "https://commons.wikimedia.org/w/api.php?origin=*&action=query&list=search&srnamespace=6&srlimit=1&format=json&srsearch=" +
      encodeURIComponent(query);
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();
    const title = searchJson && searchJson.query && searchJson.query.search && searchJson.query.search[0] && searchJson.query.search[0].title;
    if (!title) return null;

    const infoUrl =
      "https://commons.wikimedia.org/w/api.php?origin=*&action=query&titles=" +
      encodeURIComponent(title) +
      "&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json";
    const infoRes = await fetch(infoUrl);
    const infoJson = await infoRes.json();
    const pages = infoJson.query && infoJson.query.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    const info = page && page.imageinfo && page.imageinfo[0];
    return (info && (info.thumburl || info.url)) || null;
  } catch (err) {
    return null;
  }
}

// Cache theo Promise (không chỉ theo giá trị) để khung ảnh trong lưới và khung ảnh ở trang kết quả
// dùng chung đúng 1 lần tải — bấm vào là ảnh hiện ngay chứ không phải đợi tải lại lần 2.
function fetchDeviceImage(device) {
  const key = device.id;
  if (imageCache.has(key)) return imageCache.get(key);

  const promise = (async () => {
    // Nhiều tên máy đã có sẵn tên hãng ở đầu (vd "ASUS ROG Phone 5", "Samsung Galaxy S24").
    // Nếu ghép thêm brand vào sẽ bị lặp từ ("ASUS ASUS ROG Phone 5") khiến Wikipedia không tìm ra trang.
    const nameStartsWithBrand = device.name.toLowerCase().startsWith(device.brand.toLowerCase());
    const primaryQuery = nameStartsWithBrand ? device.name : `${device.brand} ${device.name}`;
    const fallbackQuery = `${device.brand} ${device.name}`;

    let thumb = await wikiThumbFor(primaryQuery);
    if (!thumb && fallbackQuery !== primaryQuery) thumb = await wikiThumbFor(fallbackQuery);
    if (!thumb) thumb = await wikiThumbFor(device.name);
    if (!thumb) thumb = await commonsThumbFor(primaryQuery);
    if (!thumb && fallbackQuery !== primaryQuery) thumb = await commonsThumbFor(fallbackQuery);
    return thumb;
  })();

  imageCache.set(key, promise);
  return promise;
}

let debounceTimer = null;
searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const v = e.target.value;
  debounceTimer = setTimeout(() => {
    const platform = getPlatform(state.os);
    if (!platform) return;
    const q = v.trim().toLowerCase();
    const all = devicesForPlatform(platform);
    const filtered = q ? all.filter((dv) => dv.name.toLowerCase().includes(q)) : all;
    renderDeviceGrid(filtered);
  }, 120);
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
  photoBox.classList.remove("thumb-photo", "photo-loaded");
  photoBox.style.backgroundImage = "none";
  photoBox.textContent = initialsOf(device.name);
  fetchDeviceImage(device).then((src) => {
    if (state.device !== device) return;
    photoBox.classList.remove("is-loading");
    if (src) applyPhoto(photoBox, src);
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

PLATFORM_LIST = buildPlatformList();
renderAdmin();
renderOsGrid();
