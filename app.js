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

// ============ Tự động bổ sung TÊN MÁY theo hãng qua 2 nguồn API ============
// Mục đích: data.js chỉ chứa danh sách gõ tay (hữu hạn). 2 lớp dưới đây gọi API để lấy thêm
// các model điện thoại của cùng hãng mà data.js chưa có:
//  1) Back4App "Cell Phone Dataset" — dữ liệu THẬT (màn hình/PPI/RAM đo thật), nhiều máy
//     cũ/tầm trung (dữ liệu gốc dừng khoảng 2013-2017, không có tần số quét).
//  2) Wikidata SPARQL — bổ sung thêm các máy MỚI/flagship mà Back4App chưa có.
// Các thông số Back4App không cung cấp (tần số quét, tier...) và toàn bộ thông số từ Wikidata
// đều được ƯỚC TÍNH theo năm ra mắt, đánh dấu estimated:true để người dùng biết rõ.
const wikidataBrandCache = new Map();
const back4appBrandCache = new Map();

const BACK4APP_CONFIG = {
  appId: "Oi6ZV2c0Yi52c66yJy5pRZXjQzEO13IQA0IHbci6",
  restKey: "1SCkdow2T8WpTiTkvO8CXJkZ7KuRws9oWqwx4oYA",
  baseUrl: "https://parseapi.back4app.com",
  className: "Dataset_Cell_Phones_Model_Brand"
};

function normalizeName(n) {
  return n.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Ước tính thông số hợp lý theo năm ra mắt, dựa theo xu hướng chung của thị trường
// (không chính xác 100% nhưng đủ dùng để tính độ nhạy tương đối).
function estimateSpecsForYear(year) {
  const y = clamp(year || 2022, 2014, 2027);
  const screen = Math.round((5.5 + (y - 2014) * 0.09) * 100) / 100;
  const ppi = Math.round(clamp(380 + (y - 2014) * 6, 380, 500));
  const refresh = y >= 2022 ? 120 : y >= 2019 ? 90 : 60;
  const ram = Math.round(clamp(3 + (y - 2014) * 0.75, 3, 16));
  const tier = Math.round(clamp(2 + (y - 2016) * 0.28, 1, 5));
  return { screen: clamp(screen, 4.7, 7.6), ppi, refresh, ram, tier };
}

// ---- Back4App: đọc thông số THẬT từ dataset GSMArena đã clone ----
function parseAnnouncedYear(str) {
  if (!str) return null;
  const m = str.match(/(20\d{2}|19\d{2})/);
  return m ? parseInt(m[1], 10) : null;
}

// Cột "Display_resolution" trong dataset này thực ra chứa SỐ INCH màn hình (bị đặt tên ngược).
function parseScreenInches(str) {
  if (!str) return null;
  const m = str.match(/([\d.]+)\s*inches/i);
  return m ? parseFloat(m[1]) : null;
}

// Cột "Display_size" trong dataset này thực ra chứa ĐỘ PHÂN GIẢI + mật độ điểm ảnh (ppi).
function parsePpi(str) {
  if (!str) return null;
  const m = str.match(/~?(\d+)\s*ppi/i);
  return m ? parseInt(m[1], 10) : null;
}

function parseRamGb(str) {
  if (!str || /undefined/i.test(str)) return null;
  const gb = [...str.matchAll(/([\d.]+)\s*GB/gi)].map((m) => parseFloat(m[1]));
  if (gb.length) return Math.max(...gb);
  const mb = [...str.matchAll(/([\d.]+)\s*MB/gi)].map((m) => parseFloat(m[1]) / 1024);
  if (mb.length) return Math.max(...mb);
  return null;
}

function fetchBack4AppModelsForBrand(brandName) {
  if (back4appBrandCache.has(brandName)) return back4appBrandCache.get(brandName);

  const promise = (async () => {
    try {
      const safeBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const where = { Brand: { $regex: "^" + safeBrand + "$", $options: "i" } };
      const url =
        `${BACK4APP_CONFIG.baseUrl}/classes/${BACK4APP_CONFIG.className}` +
        `?limit=1000&keys=Brand,Model,RAM,Display_resolution,Display_size,Announced,Status` +
        `&where=${encodeURIComponent(JSON.stringify(where))}`;
      const res = await fetch(url, {
        headers: {
          "X-Parse-Application-Id": BACK4APP_CONFIG.appId,
          "X-Parse-REST-API-Key": BACK4APP_CONFIG.restKey
        }
      });
      const json = await res.json();
      const rows = json.results || [];
      return rows
        .map((r) => {
          const model = (r.Model || "").replace(/^_+/, "").trim();
          if (!model) return null;
          return {
            model,
            year: parseAnnouncedYear(r.Announced),
            screen: parseScreenInches(r.Display_resolution),
            ppi: parsePpi(r.Display_size),
            ram: parseRamGb(r.RAM)
          };
        })
        .filter(Boolean);
    } catch (err) {
      return [];
    }
  })();

  back4appBrandCache.set(brandName, promise);
  return promise;
}

// ---- Wikidata: bổ sung máy mới/flagship mà Back4App (dữ liệu cũ) chưa có ----
function fetchWikidataModelsForBrand(brandName) {
  if (wikidataBrandCache.has(brandName)) return wikidataBrandCache.get(brandName);

  const promise = (async () => {
    const safeBrand = brandName.replace(/["\\]/g, "");
    const sparql = `
      SELECT DISTINCT ?item ?itemLabel ?image ?pubdate WHERE {
        ?item wdt:P31 wd:Q19723451 .
        ?item wdt:P176 ?manufacturer .
        ?manufacturer rdfs:label ?mlabel .
        FILTER(LANG(?mlabel) = "en" && LCASE(STR(?mlabel)) = LCASE("${safeBrand}"))
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P577 ?pubdate. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 80`;
    const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
    try {
      const res = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
      const json = await res.json();
      const rows = (json.results && json.results.bindings) || [];
      const out = [];
      const seen = new Set();
      rows.forEach((row) => {
        const label = row.itemLabel && row.itemLabel.value;
        if (!label) return;
        const key = label.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push({
          qid: row.item.value.split("/").pop(),
          name: label,
          year: row.pubdate ? new Date(row.pubdate.value).getFullYear() : null,
          image: row.image ? row.image.value : null
        });
      });
      return out;
    } catch (err) {
      return [];
    }
  })();

  wikidataBrandCache.set(brandName, promise);
  return promise;
}

// Bổ sung DEVICES từ cả 2 nguồn, so khớp tên đã chuẩn hoá để tránh trùng lặp.
// Trả về true nếu có thêm máy mới.
async function augmentDevicesForPlatform(platform) {
  const brandName = platform.baseOs === "android" ? platform.brand : platform.name;
  if (!brandName) return false;

  const sameGroup = DEVICES.filter((dv) =>
    platform.baseOs === "android" ? dv.brand === brandName : dv.os === platform.baseOs
  );
  const existingNorm = sameGroup.map((dv) => normalizeName(dv.name));
  const targetOs = platform.baseOs === "android" ? "android" : platform.baseOs;
  let added = false;

  const [b4aResults, wdResults] = await Promise.all([
    fetchBack4AppModelsForBrand(brandName),
    fetchWikidataModelsForBrand(brandName)
  ]);

  b4aResults.forEach((r) => {
    if (!r.year || r.year < 2010) return;
    const fullName = `${brandName} ${r.model}`.trim();
    const norm = normalizeName(fullName);
    const isDup = existingNorm.some((ex) => ex === norm || ex.includes(norm) || norm.includes(ex));
    if (isDup) return;
    const id = "b4a-" + norm;
    if (DEVICES.some((dv) => dv.id === id)) return;

    const fallback = estimateSpecsForYear(r.year);
    DEVICES.push({
      id,
      name: fullName,
      brand: brandName,
      os: targetOs,
      screen: r.screen || fallback.screen,
      ppi: r.ppi || fallback.ppi,
      refresh: fallback.refresh, // dataset không có tần số quét
      ram: r.ram || fallback.ram,
      tier: fallback.tier,
      year: r.year,
      estimated: true
    });
    existingNorm.push(norm);
    added = true;
  });

  wdResults.forEach((r) => {
    if (!r.year || r.year < 2014) return;
    const norm = normalizeName(r.name);
    const isDup = existingNorm.some((ex) => ex === norm || ex.includes(norm) || norm.includes(ex));
    if (isDup) return;
    const id = "wd-" + r.qid;
    if (DEVICES.some((dv) => dv.id === id)) return;

    const specs = estimateSpecsForYear(r.year);
    DEVICES.push({
      id,
      name: r.name,
      brand: brandName,
      os: targetOs,
      screen: specs.screen,
      ppi: specs.ppi,
      refresh: specs.refresh,
      ram: specs.ram,
      tier: specs.tier,
      year: r.year,
      estimated: true
    });
    if (r.image) imageCache.set(id, Promise.resolve(r.image));
    existingNorm.push(norm);
    added = true;
  });

  return added;
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
  refreshFromWikidata(platform);
}

// Sau khi hiện danh sách máy có sẵn, âm thầm gọi Wikidata để bổ sung thêm các model
// chưa có trong data.js. Khi có máy mới, render lại lưới (giữ nguyên từ khoá đang tìm).
function refreshFromWikidata(platform) {
  augmentDevicesForPlatform(platform).then((added) => {
    if (!added || state.os !== platform.id) return;
    const q = searchInput.value.trim().toLowerCase();
    const all = devicesForPlatform(platform);
    const filtered = q ? all.filter((dv) => dv.name.toLowerCase().includes(q)) : all;
    renderDeviceGrid(filtered);
  });
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
  refreshFromWikidata(platform);
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
          <div class="device-card-name">${dv.name}${dv.estimated ? ' <span class="est-badge" title="Thông số ước tính tự động, chưa kiểm chứng thủ công">ước tính</span>' : ""}</div>
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

// Kiểm tra trang Wikipedia tìm được có thực sự khớp với tên máy không, để tránh việc
// opensearch "đoán bừa" ra một trang không liên quan (tòa nhà, phong cảnh, v.v.) khi máy đó chưa có bài viết riêng.
function isRelevantTitle(title, device) {
  const t = title.toLowerCase();
  const tokens = device.name.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  let matched = 0;
  tokens.forEach((tok) => {
    if (t.includes(tok)) matched++;
  });
  return matched / tokens.length >= 0.6;
}

// Lấy ảnh thật của máy từ Wikipedia theo 2 bước cho chính xác:
// B1: opensearch để tìm ĐÚNG tên trang Wikipedia khớp với tên máy
// B2: dùng REST summary API lấy ảnh đại diện (thumbnail) của đúng trang đó
async function wikiThumbFor(query, device) {
  try {
    const searchUrl =
      "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&namespace=0&limit=1&search=" +
      encodeURIComponent(query);
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();
    const title = searchJson && searchJson[1] && searchJson[1][0];
    if (!title) return null;
    if (!isRelevantTitle(title, device)) return null;

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

// Các loại thực thể Wikidata coi là "điện thoại/thiết bị di động" hợp lệ.
// Dùng để lọc bỏ kết quả tìm nhầm (ví dụ tìm ra 1 bài báo, 1 công ty, 1 tòa nhà...).
const WIKIDATA_PHONE_TYPES = new Set([
  "Q19723451", // smartphone model
  "Q22645", // mobile phone
  "Q5082128", // smartphone
  "Q15102060" // phone model
]);

// Đệ quy kiểm tra P31 (instance of) và P279 (subclass of) của 1 entity Wikidata
// xem có thuộc nhóm điện thoại hay không, để tránh gắn nhầm ảnh từ 1 trang không liên quan.
function wikidataIsPhoneEntity(entity) {
  const claims = entity.claims || {};
  const relations = [...(claims.P31 || []), ...(claims.P279 || [])];
  for (const rel of relations) {
    const val = rel.mainsnak && rel.mainsnak.datavalue && rel.mainsnak.datavalue.value;
    const id = val && val.id;
    if (id && WIKIDATA_PHONE_TYPES.has(id)) return true;
  }
  return false;
}

// Lấy ảnh máy từ Wikidata — dùng làm lớp tra cứu BỔ SUNG khi Wikipedia không có trang/ảnh riêng
// (ví dụ các model mới hoặc ít phổ biến hơn). Có lọc 2 lớp để không dính ảnh sai:
// 1) tên trang khớp đủ với tên máy (isRelevantTitle)
// 2) entity Wikidata thực sự là điện thoại/model điện thoại (P31/P279)
async function wikidataThumbFor(query, device) {
  try {
    const searchUrl =
      "https://www.wikidata.org/w/api.php?origin=*&action=wbsearchentities&format=json&language=en&type=item&limit=5&search=" +
      encodeURIComponent(query);
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();
    const candidates = (searchJson && searchJson.search) || [];

    for (const cand of candidates) {
      const label = cand.label;
      if (!label || !isRelevantTitle(label, device)) continue;

      const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${cand.id}.json`;
      const entityRes = await fetch(entityUrl);
      const entityJson = await entityRes.json();
      const entity = entityJson.entities && entityJson.entities[cand.id];
      if (!entity || !wikidataIsPhoneEntity(entity)) continue;

      const imageClaim = entity.claims && entity.claims.P18 && entity.claims.P18[0];
      const fileName =
        imageClaim && imageClaim.mainsnak.datavalue && imageClaim.mainsnak.datavalue.value;
      if (!fileName) continue;

      return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(fileName) + "?width=600";
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Tìm ảnh trực tiếp trên Wikimedia Commons (kho ảnh chung, KHÔNG cần bài Wikipedia hay claim
// P18 trên Wikidata). Nhiều máy mới (vd Pixel 9, Pixel 9 Pro) chưa có ảnh gắn vào trang
// Wikipedia/Wikidata nhưng Commons vẫn có ảnh nếu tìm đúng theo tên file/category.
async function commonsSearchThumbFor(query, device) {
  try {
    const searchUrl =
      "https://commons.wikimedia.org/w/api.php?origin=*&action=query&list=search&format=json&srnamespace=6&srlimit=5&srsearch=" +
      encodeURIComponent(query);
    const res = await fetch(searchUrl);
    const json = await res.json();
    const hits = (json.query && json.query.search) || [];
    for (const hit of hits) {
      const fileName = (hit.title || "").replace(/^File:/, "");
      if (!fileName) continue;
      if (!isRelevantTitle(fileName, device)) continue;
      // Bỏ qua file không phải ảnh (vd .pdf, .svg biểu đồ...)
      if (!/\.(jpe?g|png|webp)$/i.test(fileName)) continue;
      return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(fileName) + "?width=600";
    }
    return null;
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

    // 1) Ưu tiên Wikipedia trước (ổn định, ảnh chất lượng cao cho các máy phổ biến)
    let thumb = await wikiThumbFor(primaryQuery, device);
    if (!thumb && fallbackQuery !== primaryQuery) thumb = await wikiThumbFor(fallbackQuery, device);

    // 2) Nếu Wikipedia không có (máy mới/ít phổ biến), thử Wikidata
    if (!thumb) thumb = await wikidataThumbFor(primaryQuery, device);
    if (!thumb && fallbackQuery !== primaryQuery) thumb = await wikidataThumbFor(fallbackQuery, device);

    // 3) Nếu cả hai đều không có, tìm thẳng trên Wikimedia Commons (bắt được nhiều máy mới hơn)
    if (!thumb) thumb = await commonsSearchThumbFor(primaryQuery, device);
    if (!thumb && fallbackQuery !== primaryQuery) thumb = await commonsSearchThumbFor(fallbackQuery, device);

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
  resultDeviceMeta.textContent =
    `${device.screen}" · ${device.ppi} PPI · ${device.refresh}Hz · ${device.ram}GB RAM · ${device.year}` +
    (device.estimated ? " · thông số ước tính" : "");

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
