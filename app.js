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
// Một số hãng có tên hiển thị khác tên tìm kiếm trên API
// (vd Sony Ericsson đã đổi brand thành "Sony" từ 2012)
const BRAND_SEARCH_ALIAS = {
  "Sony Ericsson": "Sony Ericsson",  // Wikidata có, MobileAPI dùng tên này
  "Redmi": "Redmi",
  "POCO": "Poco",
  "itel": "itel",
};

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
  itel: "itel-mobile.com",
  BlackBerry: "blackberry.com",
  Lenovo: "lenovo.com",
  Panasonic: "panasonic.com",
  HTC: "htc.com",
  LG: "lg.com",
  Meizu: "meizu.com",
  ZTE: "ztedevices.com",
  Sharp: "sharp-world.com",
  TCL: "tcl.com",
  Honor: "hihonor.com",
  Alcatel: "alcatelmobile.com",
  Lava: "lavamobiles.com",
  Micromax: "micromaxinfo.com",
  Huawei: "huawei.com",
  "Sony Ericsson": "sonymobile.com"
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
// extraBrands: tên hãng lấy thêm được từ MobileAPI.dev (ngoài các hãng đã gõ tay trong data.js).
function buildPlatformList(extraBrands = []) {
  const hardcodedBrands = [...new Set(DEVICES.filter((d) => d.os === "android").map((d) => d.brand))];
  const existingNorm = new Set(hardcodedBrands.map(normalizeName));
  // Apple/Huawei không được coi là hãng Android riêng — chúng đã có ô iOS/HarmonyOS.
  const skip = new Set(["apple", "huawei"]);
  const discoveredBrands = extraBrands.filter((b) => {
    const n = normalizeName(b);
    if (!n || skip.has(n) || existingNorm.has(n)) return false;
    existingNorm.add(n);
    return true;
  });
  const androidBrands = [...hardcodedBrands, ...discoveredBrands].sort((a, b) => a.localeCompare(b));
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

// ============ Tự động bổ sung TÊN MÁY qua MobileAPI.dev ============
// Mục đích: data.js chỉ chứa danh sách gõ tay (hữu hạn). Hàm dưới đây gọi MobileAPI.dev
// để lấy thêm các model và hãng mà data.js chưa có.

const MOBILEAPI_CONFIG = {
  baseUrl: "https://api.mobileapi.dev",
  apiKey: "f483213689edc132ad7e06dc306b310e2ed4b7ea"
};

function normalizeName(n) {
  return n.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// /aggregate?distinct=Brand, NHƯNG cách đó bắt buộc phải dùng Master Key (key toàn quyền,
// bỏ qua mọi luật bảo mật). Master Key TUYỆT ĐỐI không được đặt trong code chạy ở trình
// duyệt người dùng — bất kỳ ai mở DevTools/Network tab cũng lấy được và có thể xoá/sửa/ghi
// đè toàn bộ dataset của app. Vì vậy hàm dưới đây chỉ dùng REST API Key (key giới hạn quyền,
// an toàn hơn khi lộ ra): gọi API nhiều lần, mỗi lần chỉ lấy cột "Brand" của 1000 dòng, phân
// trang bằng skip, rồi tự gộp trùng (dedupe) ở phía JS để suy ra danh sách hãng đầy đủ.



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


// ---- Wikidata: bổ sung máy mới/flagship ----
function fetchWikidataModelsForBrand(brandName) {
  if (wikidataBrandCache.has(brandName)) return wikidataBrandCache.get(brandName);

  const promise = (async () => {
    const safeBrand = brandName.replace(/["\\]/g, "");
    // Mở rộng so với trước: (1) dùng lớp "phone model" rộng hơn (bắt cả điện thoại phổ thông,
    // không chỉ smartphone), (2) khớp CẢ 2 thuộc tính manufacturer (P176) VÀ brand (P1716) vì
    // nhiều model chỉ khai 1 trong 2, (3) so khớp kiểu "chứa" thay vì phải khớp tuyệt đối 100%
    // (bắt được "Samsung Electronics", "Sony Mobile"...), (4) nâng giới hạn kết quả 80 -> 400.
    const sparql = `
      SELECT DISTINCT ?item ?itemLabel ?image ?pubdate WHERE {
        ?item wdt:P31 wd:Q22811462 .
        { ?item wdt:P176 ?brandEntity . } UNION { ?item wdt:P1716 ?brandEntity . }
        ?brandEntity rdfs:label ?blabel .
        FILTER(LANG(?blabel) = "en")
        FILTER(CONTAINS(LCASE(STR(?blabel)), LCASE("${safeBrand}")))
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P577 ?pubdate. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 400`;
    const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
    try {
      const res = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
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
      return { items: out, ok: true };
    } catch (err) {
      return { items: [], ok: false, error: String((err && err.message) || err) };
    }
  })();

  wikidataBrandCache.set(brandName, promise);
  return promise;
}

// Rút gọn 1 record thiết bị trả về từ MobileAPI.dev thành dạng dùng chung trong app.
// Field name chưa 100% chắc chắn (docs không show đủ), nên thử nhiều khả năng phổ biến.
function normalizeMobileApiDevice(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = raw.name || raw.device_name || raw.model || null;
  if (!name) return null;
  const releaseStr = raw.release_date || raw.launch_date || "";
  const yearMatch = String(releaseStr).match(/(19|20)\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : raw.year || null;
  const imgB64 = raw.main_image_b64 || raw.thumbnail_b64 || raw.image_b64 || null;
  const imgUrl = raw.main_image_url || raw.thumbnail_url || raw.image_url || raw.image || null;
  return {
    name,
    year,
    image: imgB64 ? `data:image/jpeg;base64,${imgB64}` : imgUrl || null
  };
}

// Cố gắng đọc mảng thiết bị ra khỏi response, dù không chắc chắn 100% tên field bọc ngoài
// (results / devices / data / hoặc mảng thẳng) vì tài liệu công khai không show đủ chi tiết này.
function extractMobileApiList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.results)) return json.results;
  if (Array.isArray(json.devices)) return json.devices;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

// ---- Khám phá danh sách hãng để tạo ô trên grid ----
// MobileAPI.dev gói free không có endpoint liệt kê hãng (chỉ paid plan mới có,
// và gọi từ browser bị CORS block). Dùng BRAND_DOMAIN làm nguồn hãng chuẩn.
// Khi người dùng bấm vào ô hãng, fetchMobileApiModelsForBrand sẽ gọi /devices/search/
// để tải toàn bộ dòng máy của hãng đó.
let brandDiscoveryPromise = null;
function discoverAllBrandsFromMobileApi() {
  if (brandDiscoveryPromise) return brandDiscoveryPromise;
  brandDiscoveryPromise = Promise.resolve({ brands: Object.keys(BRAND_DOMAIN), ok: true });
  return brandDiscoveryPromise;
}

const mobileApiBrandCache = new Map();
function fetchMobileApiModelsForBrand(brandName) {
  if (mobileApiBrandCache.has(brandName)) return mobileApiBrandCache.get(brandName);

  const promise = (async () => {
    const items = [];
    const seen = new Set();
    const maxPages = 30; // an toàn (30 trang x 50 máy = tối đa 1500 máy/hãng)
    try {
      for (let page = 1; page <= maxPages; page++) {
        const url =
          `${MOBILEAPI_CONFIG.baseUrl}/devices/search/?name=${encodeURIComponent(brandName)}` +
          `&manufacturer=${encodeURIComponent(brandName)}&page=${page}&key=${MOBILEAPI_CONFIG.apiKey}`;
        const res = await fetch(url);

        if (res.status === 429) {
          // Hết quota 1.000 request/tháng — dừng ngay, không thử lại (thử lại cũng vô ích).
          throw new Error("HTTP 429: đã dùng hết quota MobileAPI.dev tháng này");
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const rows = extractMobileApiList(json);
        if (rows.length === 0) break;

        rows.forEach((r) => {
          const item = normalizeMobileApiDevice(r);
          if (!item) return;
          const key = item.name.toLowerCase();
          if (seen.has(key)) return;
          seen.add(key);
          items.push(item);
        });

        if (rows.length < 50) break; // trang cuối (ít hơn 1 trang đầy)
        await new Promise((r) => setTimeout(r, 120)); // giãn nhịp nhẹ giữa các trang
      }
      return { items, ok: true };
    } catch (err) {
      const message = String((err && err.message) || err);
      console.error(`[fetchMobileApiModelsForBrand] "${brandName}" failed:`, message, err);
      return { items, ok: items.length > 0, error: message };
    }
  })();

  mobileApiBrandCache.set(brandName, promise);
  return promise;
}

// Bổ sung DEVICES từ cả 2 nguồn, so khớp tên đã chuẩn hoá để tránh trùng lặp.
// Trả về { addedCount, ok } — ok=false nếu CẢ 2 nguồn đều lỗi (mất mạng, API die, ...),
// để UI phân biệt được "gọi API xong nhưng không có máy mới" với "gọi API bị lỗi".
async function augmentDevicesForPlatform(platform) {
  // QUAN TRỌNG: với iOS/HarmonyOS, tên hãng thật để tra API là "Apple"/"Huawei"
  // (platform.vendor), KHÔNG PHẢI platform.name ("iOS"/"HarmonyOS") — 2 API này
  // không hiểu tên hệ điều hành, chỉ hiểu tên hãng sản xuất.
  const brandName = platform.baseOs === "android" ? platform.brand : platform.vendor;
  if (!brandName) return { addedCount: 0, ok: false };
  // Alias tên tìm kiếm: một số hãng dùng tên khác trên Wikidata/MobileAPI
  const searchName = BRAND_SEARCH_ALIAS[brandName] || brandName;

  const sameGroup = DEVICES.filter((dv) =>
    platform.baseOs === "android" ? dv.brand === brandName : dv.os === platform.baseOs
  );
  const existingNorm = sameGroup.map((dv) => normalizeName(dv.name));
  const targetOs = platform.baseOs === "android" ? "android" : platform.baseOs;
  let addedCount = 0;

  const [wd, mapi] = await Promise.all([
    fetchWikidataModelsForBrand(searchName),
    fetchMobileApiModelsForBrand(searchName)
  ]);
  const wdResults = wd.items;
  const mapiResults = mapi.items;
  const ok = wd.ok || mapi.ok;
  const errorReason = !ok ? wd.error || mapi.error : null;

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
    addedCount++;
  });

  mapiResults.forEach((r) => {
    if (!r.year || r.year < 2010) return;
    const norm = normalizeName(r.name);
    const isDup = existingNorm.some((ex) => ex === norm || ex.includes(norm) || norm.includes(ex));
    if (isDup) return;
    const id = "mapi-" + norm;
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
    addedCount++;
  });

  return { addedCount, ok, error: errorReason };
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
const syncStatus = document.getElementById("syncStatus");
const brandDiscoveryStatus = document.getElementById("brandDiscoveryStatus");
const searchSuggestions = document.getElementById("searchSuggestions");

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
  searchSuggestions.classList.remove("is-open");
  searchInput.placeholder = `Tìm dòng máy ${platform.name}, ví dụ: ${sampleDeviceFor(platform)}`;
  renderDeviceGrid(devicesForPlatform(platform));
  searchInput.focus();
  refreshFromWikidata(platform);
}

// Sau khi hiện danh sách máy có sẵn, gọi MobileAPI.dev + Wikidata để bổ sung thêm các model
// chưa có trong data.js. Có hiện trạng thái đang tải / kết quả / lỗi để người dùng biết
// chắc API có chạy hay không, thay vì im lặng hoàn toàn như trước.
function setSyncStatus(mode, text) {
  setStatusEl(syncStatus, mode, text);
}

function setStatusEl(el, mode, text) {
  el.classList.remove("hidden", "is-loading", "is-error", "is-done");
  if (mode) el.classList.add(mode);
  el.textContent = text;
}

function refreshFromWikidata(platform) {
  // Ẩn status bar — không hiện "đang tải" hay thông báo nào
  syncStatus.classList.add("hidden");

  augmentDevicesForPlatform(platform).then(({ addedCount }) => {
    if (state.os !== platform.id) return;
    if (addedCount > 0) {
      const q = searchInput.value.trim().toLowerCase();
      const all = devicesForPlatform(platform);
      const filtered = q ? all.filter((dv) => dv.name.toLowerCase().includes(q)) : all;
      renderDeviceGrid(filtered);
    }
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
    searchSuggestions.classList.remove("is-open");
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

// ---- Dropdown gợi ý cho ô tìm kiếm trong màn hình chọn máy ----
function renderSearchSuggestions(query) {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    searchSuggestions.innerHTML = "";
    searchSuggestions.classList.remove("is-open");
    return;
  }
  const platform = getPlatform(state.os);
  if (!platform) return;
  const all = devicesForPlatform(platform);
  const matches = all.filter((dv) => dv.name.toLowerCase().includes(q)).slice(0, 8);

  if (matches.length === 0) {
    searchSuggestions.innerHTML = `<div class="suggestion-empty">Không tìm thấy dòng máy phù hợp</div>`;
    searchSuggestions.classList.add("is-open");
    return;
  }

  searchSuggestions.innerHTML = matches
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
  searchSuggestions.classList.add("is-open");

  searchSuggestions.querySelectorAll(".suggestion-item").forEach((el) => {
    el.addEventListener("click", () => {
      const device = DEVICES.find((dv) => dv.id === el.dataset.id);
      searchSuggestions.classList.remove("is-open");
      searchInput.value = "";
      pickDevice(device);
    });
    const device = DEVICES.find((dv) => dv.id === el.dataset.id);
    const thumb = el.querySelector(".suggestion-thumb");
    fetchDeviceImage(device).then((src) => { if (src) applyPhoto(thumb, src); });
  });
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
    renderSearchSuggestions(v);
  }, 120);
});

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim().length > 0) renderSearchSuggestions(searchInput.value);
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

// Xây lưới hãng từ BRAND_DOMAIN — thêm ô cho mọi hãng chưa có trong data.js.
// Khi bấm vào ô hãng, MobileAPI.dev sẽ tải dòng máy của hãng đó qua /devices/search/.
discoverAllBrandsFromMobileApi().then(({ brands }) => {
  const rebuilt = buildPlatformList(brands);
  PLATFORM_LIST = rebuilt;
  brandDiscoveryStatus.classList.add("hidden");
  renderOsGrid();
});
