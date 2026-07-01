const ADMIN_INFO = {
  name: "Nguyễn Hoàng Khánh Nam",
  tele: "dzimeomeo",
  tiktok: "hkhanhnam206",
  zalo: "84993329535",
  facebook: "https://www.facebook.com/share/1HhBfNH5tC/?mibextid=wwXIfr"
};

const OS_LIST = [
  { id: "ios", name: "iOS", vendor: "Apple", mono: "iOS" },
  { id: "android", name: "Android", vendor: "Google / OEM", mono: "AND" },
  { id: "harmony", name: "HarmonyOS", vendor: "Huawei", mono: "HM" }
];

const DEVICES = [];
function d(id, name, brand, os, screen, ppi, refresh, ram, tier, year) {
  DEVICES.push({ id, name, brand, os, screen, ppi, refresh, ram, tier, year });
}

d("ip6", "iPhone 6", "Apple", "ios", 4.7, 326, 60, 1, 1, 2014);
d("ip6p", "iPhone 6 Plus", "Apple", "ios", 5.5, 401, 60, 1, 1, 2014);
d("ip6s", "iPhone 6s", "Apple", "ios", 4.7, 326, 60, 2, 1, 2015);
d("ip6sp", "iPhone 6s Plus", "Apple", "ios", 5.5, 401, 60, 2, 1, 2015);
d("ip7", "iPhone 7", "Apple", "ios", 4.7, 326, 60, 2, 2, 2016);
d("ip7p", "iPhone 7 Plus", "Apple", "ios", 5.5, 401, 60, 3, 2, 2016);
d("ip8", "iPhone 8", "Apple", "ios", 4.7, 326, 60, 2, 2, 2017);
d("ip8p", "iPhone 8 Plus", "Apple", "ios", 5.5, 401, 60, 3, 2, 2017);
d("ipx", "iPhone X", "Apple", "ios", 5.8, 458, 60, 3, 2, 2017);
d("ipxr", "iPhone XR", "Apple", "ios", 6.1, 326, 60, 3, 2, 2018);
d("ipxs", "iPhone XS", "Apple", "ios", 5.8, 458, 60, 4, 2, 2018);
d("ipxsm", "iPhone XS Max", "Apple", "ios", 6.5, 458, 60, 4, 2, 2018);
d("ipse20", "iPhone SE 2020", "Apple", "ios", 4.7, 326, 60, 3, 2, 2020);
d("ip11", "iPhone 11", "Apple", "ios", 6.1, 326, 60, 4, 2, 2019);
d("ip11pro", "iPhone 11 Pro", "Apple", "ios", 5.8, 458, 60, 4, 3, 2019);
d("ip11pm", "iPhone 11 Pro Max", "Apple", "ios", 6.5, 458, 60, 4, 3, 2019);
d("ip12mini", "iPhone 12 mini", "Apple", "ios", 5.4, 476, 60, 4, 3, 2020);
d("ip12", "iPhone 12", "Apple", "ios", 6.1, 460, 60, 4, 3, 2020);
d("ip12pro", "iPhone 12 Pro", "Apple", "ios", 6.1, 460, 60, 6, 3, 2020);
d("ip12pm", "iPhone 12 Pro Max", "Apple", "ios", 6.7, 458, 60, 6, 3, 2020);
d("ip13mini", "iPhone 13 mini", "Apple", "ios", 5.4, 476, 60, 4, 3, 2021);
d("ip13", "iPhone 13", "Apple", "ios", 6.1, 460, 60, 4, 3, 2021);
d("ip13pro", "iPhone 13 Pro", "Apple", "ios", 6.1, 460, 120, 6, 4, 2021);
d("ip13pm", "iPhone 13 Pro Max", "Apple", "ios", 6.7, 458, 120, 6, 4, 2021);
d("ipse22", "iPhone SE 2022", "Apple", "ios", 4.7, 326, 60, 4, 2, 2022);
d("ip14", "iPhone 14", "Apple", "ios", 6.1, 460, 60, 6, 3, 2022);
d("ip14plus", "iPhone 14 Plus", "Apple", "ios", 6.7, 458, 60, 6, 3, 2022);
d("ip14pro", "iPhone 14 Pro", "Apple", "ios", 6.1, 460, 120, 6, 4, 2022);
d("ip14pm", "iPhone 14 Pro Max", "Apple", "ios", 6.7, 460, 120, 6, 4, 2022);
d("ip15", "iPhone 15", "Apple", "ios", 6.1, 460, 60, 6, 4, 2023);
d("ip15plus", "iPhone 15 Plus", "Apple", "ios", 6.7, 460, 60, 6, 4, 2023);
d("ip15pro", "iPhone 15 Pro", "Apple", "ios", 6.1, 460, 120, 8, 4, 2023);
d("ip15pm", "iPhone 15 Pro Max", "Apple", "ios", 6.7, 460, 120, 8, 5, 2023);
d("ip16", "iPhone 16", "Apple", "ios", 6.1, 460, 60, 8, 4, 2024);
d("ip16plus", "iPhone 16 Plus", "Apple", "ios", 6.7, 460, 60, 8, 4, 2024);
d("ip16pro", "iPhone 16 Pro", "Apple", "ios", 6.3, 460, 120, 8, 5, 2024);
d("ip16pm", "iPhone 16 Pro Max", "Apple", "ios", 6.9, 460, 120, 8, 5, 2024);

d("s8", "Samsung Galaxy S8", "Samsung", "android", 5.8, 570, 60, 4, 2, 2017);
d("s8p", "Samsung Galaxy S8+", "Samsung", "android", 6.2, 529, 60, 4, 2, 2017);
d("s9", "Samsung Galaxy S9", "Samsung", "android", 5.8, 570, 60, 4, 2, 2018);
d("s9p", "Samsung Galaxy S9+", "Samsung", "android", 6.2, 529, 60, 6, 3, 2018);
d("s10e", "Samsung Galaxy S10e", "Samsung", "android", 5.8, 438, 60, 6, 3, 2019);
d("s10", "Samsung Galaxy S10", "Samsung", "android", 6.1, 550, 60, 8, 3, 2019);
d("s10p", "Samsung Galaxy S10+", "Samsung", "android", 6.4, 522, 60, 8, 3, 2019);
d("note10", "Samsung Galaxy Note 10", "Samsung", "android", 6.3, 401, 60, 8, 3, 2019);
d("note10p", "Samsung Galaxy Note 10+", "Samsung", "android", 6.8, 498, 60, 12, 4, 2019);
d("s20", "Samsung Galaxy S20", "Samsung", "android", 6.2, 563, 120, 8, 4, 2020);
d("s20p", "Samsung Galaxy S20+", "Samsung", "android", 6.7, 525, 120, 12, 4, 2020);
d("s20u", "Samsung Galaxy S20 Ultra", "Samsung", "android", 6.9, 511, 120, 12, 4, 2020);
d("note20", "Samsung Galaxy Note 20", "Samsung", "android", 6.7, 393, 60, 8, 4, 2020);
d("note20u", "Samsung Galaxy Note 20 Ultra", "Samsung", "android", 6.9, 496, 120, 8, 4, 2020);
d("s21", "Samsung Galaxy S21", "Samsung", "android", 6.2, 421, 120, 8, 4, 2021);
d("s21p", "Samsung Galaxy S21+", "Samsung", "android", 6.7, 394, 120, 8, 4, 2021);
d("s21u", "Samsung Galaxy S21 Ultra", "Samsung", "android", 6.8, 515, 120, 12, 5, 2021);
d("s22", "Samsung Galaxy S22", "Samsung", "android", 6.1, 425, 120, 8, 4, 2022);
d("s22p", "Samsung Galaxy S22+", "Samsung", "android", 6.6, 393, 120, 8, 4, 2022);
d("s22u", "Samsung Galaxy S22 Ultra", "Samsung", "android", 6.8, 500, 120, 12, 5, 2022);
d("s23", "Samsung Galaxy S23", "Samsung", "android", 6.1, 425, 120, 8, 4, 2023);
d("s23p", "Samsung Galaxy S23+", "Samsung", "android", 6.6, 393, 120, 8, 5, 2023);
d("s23u", "Samsung Galaxy S23 Ultra", "Samsung", "android", 6.8, 500, 120, 12, 5, 2023);
d("s24", "Samsung Galaxy S24", "Samsung", "android", 6.2, 416, 120, 8, 4, 2024);
d("s24p", "Samsung Galaxy S24+", "Samsung", "android", 6.7, 513, 120, 12, 5, 2024);
d("s24u", "Samsung Galaxy S24 Ultra", "Samsung", "android", 6.8, 505, 120, 12, 5, 2024);
d("zflip4", "Samsung Galaxy Z Flip4", "Samsung", "android", 6.7, 425, 120, 8, 4, 2022);
d("zfold4", "Samsung Galaxy Z Fold4", "Samsung", "android", 7.6, 374, 120, 12, 5, 2022);
d("zflip5", "Samsung Galaxy Z Flip5", "Samsung", "android", 6.7, 425, 120, 8, 4, 2023);
d("zfold5", "Samsung Galaxy Z Fold5", "Samsung", "android", 7.6, 374, 120, 12, 5, 2023);
d("a10", "Samsung Galaxy A10", "Samsung", "android", 6.2, 271, 60, 2, 1, 2019);
d("a20", "Samsung Galaxy A20", "Samsung", "android", 6.4, 270, 60, 3, 1, 2019);
d("a30", "Samsung Galaxy A30", "Samsung", "android", 6.4, 270, 60, 4, 1, 2019);
d("a50", "Samsung Galaxy A50", "Samsung", "android", 6.4, 403, 60, 4, 2, 2019);
d("a51", "Samsung Galaxy A51", "Samsung", "android", 6.5, 405, 60, 4, 2, 2020);
d("a52", "Samsung Galaxy A52", "Samsung", "android", 6.5, 407, 90, 6, 2, 2021);
d("a53", "Samsung Galaxy A53", "Samsung", "android", 6.5, 405, 120, 6, 3, 2022);
d("a54", "Samsung Galaxy A54", "Samsung", "android", 6.4, 403, 120, 8, 3, 2023);
d("a55", "Samsung Galaxy A55", "Samsung", "android", 6.6, 390, 120, 8, 3, 2024);
d("a70", "Samsung Galaxy A70", "Samsung", "android", 6.7, 393, 60, 6, 2, 2019);
d("a73", "Samsung Galaxy A73", "Samsung", "android", 6.7, 393, 90, 8, 3, 2022);
d("a34", "Samsung Galaxy A34", "Samsung", "android", 6.6, 390, 120, 8, 2, 2023);
d("a35", "Samsung Galaxy A35", "Samsung", "android", 6.6, 390, 120, 8, 3, 2024);
d("a14", "Samsung Galaxy A14", "Samsung", "android", 6.6, 401, 90, 4, 1, 2023);
d("a15", "Samsung Galaxy A15", "Samsung", "android", 6.5, 385, 90, 4, 1, 2024);
d("a25", "Samsung Galaxy A25", "Samsung", "android", 6.5, 401, 120, 6, 2, 2024);
d("m14", "Samsung Galaxy M14", "Samsung", "android", 6.6, 400, 90, 4, 1, 2023);

d("mi8", "Xiaomi Mi 8", "Xiaomi", "android", 6.21, 402, 60, 6, 3, 2018);
d("mi9", "Xiaomi Mi 9", "Xiaomi", "android", 6.39, 403, 60, 6, 3, 2019);
d("mi10", "Xiaomi Mi 10", "Xiaomi", "android", 6.67, 386, 90, 8, 4, 2020);
d("mi11", "Xiaomi Mi 11", "Xiaomi", "android", 6.81, 515, 120, 8, 4, 2021);
d("mi11u", "Xiaomi Mi 11 Ultra", "Xiaomi", "android", 6.81, 515, 120, 12, 5, 2021);
d("mi12", "Xiaomi 12", "Xiaomi", "android", 6.28, 419, 120, 8, 4, 2022);
d("mi12pro", "Xiaomi 12 Pro", "Xiaomi", "android", 6.73, 522, 120, 8, 5, 2022);
d("mi13", "Xiaomi 13", "Xiaomi", "android", 6.36, 414, 120, 8, 4, 2022);
d("mi13pro", "Xiaomi 13 Pro", "Xiaomi", "android", 6.73, 522, 120, 12, 5, 2023);
d("mi13ultra", "Xiaomi 13 Ultra", "Xiaomi", "android", 6.73, 522, 120, 16, 5, 2023);
d("mi14", "Xiaomi 14", "Xiaomi", "android", 6.36, 460, 120, 12, 5, 2023);
d("mi14ultra", "Xiaomi 14 Ultra", "Xiaomi", "android", 6.73, 522, 120, 16, 5, 2024);
d("rdnote9", "Redmi Note 9", "Redmi", "android", 6.53, 395, 60, 4, 1, 2020);
d("rdnote10", "Redmi Note 10", "Redmi", "android", 6.43, 409, 60, 4, 2, 2021);
d("rdnote11", "Redmi Note 11", "Redmi", "android", 6.43, 409, 90, 6, 2, 2022);
d("rdnote12", "Redmi Note 12", "Redmi", "android", 6.67, 395, 120, 6, 2, 2022);
d("rdnote12pro", "Redmi Note 12 Pro", "Redmi", "android", 6.67, 395, 120, 8, 3, 2023);
d("rdnote13", "Redmi Note 13", "Redmi", "android", 6.67, 395, 120, 6, 2, 2023);
d("rdnote13pro", "Redmi Note 13 Pro", "Redmi", "android", 6.67, 395, 120, 8, 3, 2023);
d("rd10", "Redmi 10", "Redmi", "android", 6.5, 270, 90, 4, 1, 2021);
d("rd12", "Redmi 12", "Redmi", "android", 6.79, 264, 90, 6, 1, 2023);
d("rd12c", "Redmi 12C", "Redmi", "android", 6.71, 269, 60, 4, 1, 2023);
d("rd13c", "Redmi 13C", "Redmi", "android", 6.74, 263, 90, 6, 1, 2024);
d("pocof3", "POCO F3", "POCO", "android", 6.67, 395, 120, 6, 4, 2021);
d("pocof4", "POCO F4", "POCO", "android", 6.67, 395, 120, 6, 4, 2022);
d("pocof5", "POCO F5", "POCO", "android", 6.67, 395, 120, 8, 4, 2023);
d("pocox3", "POCO X3", "POCO", "android", 6.67, 395, 120, 6, 2, 2020);
d("pocox4", "POCO X4 Pro", "POCO", "android", 6.67, 395, 120, 6, 3, 2022);
d("pocox5", "POCO X5", "POCO", "android", 6.67, 395, 120, 6, 2, 2023);
d("pocox5pro", "POCO X5 Pro", "POCO", "android", 6.67, 395, 120, 8, 3, 2023);
d("pocom5", "POCO M5", "POCO", "android", 6.58, 269, 90, 4, 1, 2022);

d("oppoa5", "OPPO A5", "OPPO", "android", 6.5, 270, 60, 3, 1, 2019);
d("oppoa54", "OPPO A54", "OPPO", "android", 6.51, 270, 60, 4, 1, 2021);
d("oppoa57", "OPPO A57", "OPPO", "android", 6.56, 264, 60, 4, 1, 2022);
d("oppoa74", "OPPO A74", "OPPO", "android", 6.43, 409, 60, 6, 2, 2021);
d("oppoa77", "OPPO A77", "OPPO", "android", 6.56, 264, 60, 6, 2, 2022);
d("oppoa78", "OPPO A78", "OPPO", "android", 6.56, 264, 60, 8, 2, 2023);
d("oppoa96", "OPPO A96", "OPPO", "android", 6.59, 269, 60, 8, 2, 2022);
d("oppoa98", "OPPO A98", "OPPO", "android", 6.72, 264, 90, 8, 3, 2023);
d("reno4", "OPPO Reno4", "OPPO", "android", 6.4, 401, 60, 8, 3, 2020);
d("reno5", "OPPO Reno5", "OPPO", "android", 6.43, 409, 60, 8, 3, 2020);
d("reno6", "OPPO Reno6", "OPPO", "android", 6.43, 409, 90, 8, 3, 2021);
d("reno7", "OPPO Reno7", "OPPO", "android", 6.43, 409, 90, 8, 3, 2022);
d("reno8", "OPPO Reno8", "OPPO", "android", 6.4, 401, 90, 8, 3, 2022);
d("reno9", "OPPO Reno9", "OPPO", "android", 6.7, 394, 120, 8, 4, 2023);
d("reno10", "OPPO Reno10", "OPPO", "android", 6.7, 394, 120, 8, 4, 2023);
d("reno11", "OPPO Reno11", "OPPO", "android", 6.7, 394, 120, 12, 4, 2024);
d("findx3", "OPPO Find X3", "OPPO", "android", 6.7, 450, 120, 12, 5, 2021);
d("findx5", "OPPO Find X5", "OPPO", "android", 6.55, 402, 120, 8, 5, 2022);
d("findx6", "OPPO Find X6", "OPPO", "android", 6.74, 450, 120, 12, 5, 2023);
d("findx7", "OPPO Find X7", "OPPO", "android", 6.78, 452, 120, 12, 5, 2024);

d("vy11", "vivo Y11", "vivo", "android", 6.35, 270, 60, 3, 1, 2019);
d("vy15", "vivo Y15", "vivo", "android", 6.35, 269, 60, 4, 1, 2019);
d("vy20", "vivo Y20", "vivo", "android", 6.51, 270, 60, 4, 1, 2020);
d("vy21", "vivo Y21", "vivo", "android", 6.51, 269, 60, 4, 1, 2021);
d("vy22", "vivo Y22", "vivo", "android", 6.55, 269, 90, 4, 1, 2022);
d("vy33", "vivo Y33s", "vivo", "android", 6.58, 264, 60, 8, 2, 2021);
d("vy36", "vivo Y36", "vivo", "android", 6.64, 263, 90, 8, 2, 2023);
d("vy55", "vivo Y55", "vivo", "android", 6.64, 263, 90, 6, 2, 2023);
d("vv17", "vivo V17", "vivo", "android", 6.44, 409, 60, 8, 2, 2019);
d("vv19", "vivo V19", "vivo", "android", 6.44, 409, 60, 8, 2, 2020);
d("vv21", "vivo V21", "vivo", "android", 6.44, 409, 60, 8, 3, 2021);
d("vv23", "vivo V23", "vivo", "android", 6.44, 409, 90, 8, 3, 2022);
d("vv25", "vivo V25", "vivo", "android", 6.44, 409, 90, 8, 3, 2022);
d("vv27", "vivo V27", "vivo", "android", 6.78, 388, 120, 8, 3, 2023);
d("vv29", "vivo V29", "vivo", "android", 6.78, 388, 120, 8, 4, 2023);
d("vx50", "vivo X50", "vivo", "android", 6.56, 401, 90, 8, 3, 2020);
d("vx60", "vivo X60", "vivo", "android", 6.56, 398, 60, 8, 4, 2021);
d("vx70", "vivo X70 Pro", "vivo", "android", 6.56, 452, 120, 12, 4, 2021);
d("vx80", "vivo X80", "vivo", "android", 6.78, 452, 120, 12, 5, 2022);
d("vx90", "vivo X90", "vivo", "android", 6.78, 450, 120, 12, 5, 2023);
d("vx100", "vivo X100", "vivo", "android", 6.78, 452, 120, 16, 5, 2023);

d("rmc11", "realme C11", "realme", "android", 6.5, 270, 60, 2, 1, 2020);
d("rmc15", "realme C15", "realme", "android", 6.5, 270, 60, 4, 1, 2020);
d("rmc21", "realme C21", "realme", "android", 6.5, 270, 60, 4, 1, 2021);
d("rmc25", "realme C25", "realme", "android", 6.5, 270, 60, 4, 1, 2021);
d("rmc30", "realme C30", "realme", "android", 6.5, 269, 60, 3, 1, 2022);
d("rmc33", "realme C33", "realme", "android", 6.5, 269, 60, 4, 1, 2022);
d("rmc35", "realme C35", "realme", "android", 6.6, 411, 60, 4, 1, 2022);
d("rmc51", "realme C51", "realme", "android", 6.74, 264, 90, 6, 1, 2023);
d("rmc53", "realme C53", "realme", "android", 6.74, 264, 90, 6, 1, 2023);
d("rmc55", "realme C55", "realme", "android", 6.72, 264, 90, 6, 1, 2023);
d("rm5", "realme 5", "realme", "android", 6.5, 269, 60, 3, 1, 2019);
d("rm6", "realme 6", "realme", "android", 6.5, 405, 90, 4, 2, 2020);
d("rm7", "realme 7", "realme", "android", 6.5, 401, 90, 6, 2, 2020);
d("rm8", "realme 8", "realme", "android", 6.4, 411, 60, 6, 2, 2021);
d("rm9", "realme 9", "realme", "android", 6.4, 411, 90, 6, 2, 2022);
d("rm10", "realme 10", "realme", "android", 6.4, 411, 90, 8, 2, 2022);
d("rm11pro", "realme 11 Pro", "realme", "android", 6.7, 394, 120, 8, 3, 2023);
d("rmgt", "realme GT", "realme", "android", 6.43, 409, 120, 8, 5, 2021);
d("rmgt2", "realme GT2", "realme", "android", 6.62, 394, 120, 8, 5, 2022);
d("rmgtneo3", "realme GT Neo3", "realme", "android", 6.7, 394, 120, 12, 5, 2022);
d("rmgtneo5", "realme GT Neo5", "realme", "android", 6.74, 450, 144, 12, 5, 2023);
d("rmnarzo50", "realme Narzo 50", "realme", "android", 6.6, 269, 90, 6, 2, 2022);

d("op6", "OnePlus 6", "OnePlus", "android", 6.28, 402, 60, 6, 3, 2018);
d("op6t", "OnePlus 6T", "OnePlus", "android", 6.41, 402, 60, 6, 3, 2018);
d("op7", "OnePlus 7", "OnePlus", "android", 6.41, 402, 60, 6, 3, 2019);
d("op7pro", "OnePlus 7 Pro", "OnePlus", "android", 6.67, 516, 90, 8, 4, 2019);
d("op7t", "OnePlus 7T", "OnePlus", "android", 6.55, 402, 90, 8, 4, 2019);
d("op8", "OnePlus 8", "OnePlus", "android", 6.55, 402, 90, 8, 4, 2020);
d("op8pro", "OnePlus 8 Pro", "OnePlus", "android", 6.78, 513, 120, 12, 5, 2020);
d("op8t", "OnePlus 8T", "OnePlus", "android", 6.55, 402, 120, 8, 4, 2020);
d("op9", "OnePlus 9", "OnePlus", "android", 6.55, 402, 120, 8, 5, 2021);
d("op9pro", "OnePlus 9 Pro", "OnePlus", "android", 6.7, 525, 120, 12, 5, 2021);
d("op9r", "OnePlus 9R", "OnePlus", "android", 6.55, 402, 120, 8, 4, 2021);
d("op9rt", "OnePlus 9RT", "OnePlus", "android", 6.62, 394, 120, 8, 5, 2021);
d("op10pro", "OnePlus 10 Pro", "OnePlus", "android", 6.7, 525, 120, 12, 5, 2022);
d("op10t", "OnePlus 10T", "OnePlus", "android", 6.7, 394, 120, 16, 5, 2022);
d("op11", "OnePlus 11", "OnePlus", "android", 6.7, 450, 120, 16, 5, 2023);
d("op11r", "OnePlus 11R", "OnePlus", "android", 6.74, 394, 120, 16, 4, 2023);
d("opnord", "OnePlus Nord", "OnePlus", "android", 6.44, 408, 90, 8, 3, 2020);
d("opnord2", "OnePlus Nord 2", "OnePlus", "android", 6.43, 409, 90, 8, 4, 2021);
d("opnord3", "OnePlus Nord 3", "OnePlus", "android", 6.74, 450, 120, 16, 4, 2023);
d("opnordce", "OnePlus Nord CE", "OnePlus", "android", 6.43, 409, 90, 8, 3, 2021);

d("pixel3", "Google Pixel 3", "Google", "android", 5.5, 443, 60, 4, 3, 2018);
d("pixel4", "Google Pixel 4", "Google", "android", 5.7, 444, 90, 6, 3, 2019);
d("pixel4a", "Google Pixel 4a", "Google", "android", 5.81, 443, 60, 6, 3, 2020);
d("pixel5", "Google Pixel 5", "Google", "android", 6.0, 432, 90, 8, 3, 2020);
d("pixel5a", "Google Pixel 5a", "Google", "android", 6.34, 413, 60, 6, 3, 2021);
d("pixel6", "Google Pixel 6", "Google", "android", 6.4, 411, 90, 8, 4, 2021);
d("pixel6a", "Google Pixel 6a", "Google", "android", 6.1, 429, 60, 6, 4, 2022);
d("pixel6pro", "Google Pixel 6 Pro", "Google", "android", 6.7, 512, 120, 12, 4, 2021);
d("pixel7", "Google Pixel 7", "Google", "android", 6.3, 416, 90, 8, 4, 2022);
d("pixel7a", "Google Pixel 7a", "Google", "android", 6.1, 429, 90, 8, 4, 2023);
d("pixel7pro", "Google Pixel 7 Pro", "Google", "android", 6.7, 512, 120, 12, 5, 2022);
d("pixel8", "Google Pixel 8", "Google", "android", 6.2, 428, 120, 8, 4, 2023);
d("pixel8a", "Google Pixel 8a", "Google", "android", 6.1, 430, 120, 8, 4, 2024);
d("pixel8pro", "Google Pixel 8 Pro", "Google", "android", 6.7, 489, 120, 12, 5, 2023);
d("pixel9", "Google Pixel 9", "Google", "android", 6.3, 422, 120, 12, 5, 2024);
d("pixel9pro", "Google Pixel 9 Pro", "Google", "android", 6.3, 495, 120, 16, 5, 2024);

d("huap20", "Huawei P20", "Huawei", "harmony", 5.8, 429, 60, 4, 2, 2018);
d("huap30", "Huawei P30", "Huawei", "harmony", 6.1, 422, 60, 6, 3, 2019);
d("huap30pro", "Huawei P30 Pro", "Huawei", "harmony", 6.47, 398, 60, 8, 3, 2019);
d("huap40", "Huawei P40", "Huawei", "harmony", 6.1, 422, 60, 8, 4, 2020);
d("huap40pro", "Huawei P40 Pro", "Huawei", "harmony", 6.58, 441, 90, 8, 4, 2020);
d("huap50", "Huawei P50", "Huawei", "harmony", 6.5, 407, 90, 8, 4, 2021);
d("huap50pro", "Huawei P50 Pro", "Huawei", "harmony", 6.6, 450, 120, 8, 5, 2021);
d("huap60", "Huawei P60", "Huawei", "harmony", 6.67, 460, 120, 8, 4, 2023);
d("huap60pro", "Huawei P60 Pro", "Huawei", "harmony", 6.67, 460, 120, 8, 4, 2023);
d("huamate20", "Huawei Mate 20", "Huawei", "harmony", 6.53, 381, 60, 4, 3, 2018);
d("huamate30", "Huawei Mate 30", "Huawei", "harmony", 6.62, 409, 60, 8, 3, 2019);
d("huamate40", "Huawei Mate 40", "Huawei", "harmony", 6.5, 409, 60, 8, 4, 2020);
d("huamate50", "Huawei Mate 50", "Huawei", "harmony", 6.7, 407, 120, 8, 4, 2022);
d("huamate60", "Huawei Mate 60", "Huawei", "harmony", 6.69, 460, 120, 12, 5, 2023);
d("huamate60pro", "Huawei Mate 60 Pro", "Huawei", "harmony", 6.82, 460, 120, 12, 5, 2023);
d("huanova9", "Huawei Nova 9", "Huawei", "harmony", 6.57, 392, 120, 8, 3, 2021);
d("huanova10", "Huawei Nova 10", "Huawei", "harmony", 6.67, 392, 120, 8, 3, 2022);
d("huanova11", "Huawei Nova 11", "Huawei", "harmony", 6.7, 392, 60, 8, 3, 2023);
d("huanova12", "Huawei Nova 12", "Huawei", "harmony", 6.7, 392, 120, 8, 3, 2023);

d("honor50", "Honor 50", "Honor", "harmony", 6.57, 401, 120, 8, 3, 2021);
d("honor60", "Honor 60", "Honor", "harmony", 6.67, 394, 120, 8, 3, 2021);
d("honor70", "Honor 70", "Honor", "harmony", 6.67, 394, 120, 8, 3, 2022);
d("honor80", "Honor 80", "Honor", "harmony", 6.67, 394, 120, 8, 3, 2022);
d("honor90", "Honor 90", "Honor", "harmony", 6.7, 394, 120, 8, 3, 2023);
d("honormagic5", "Honor Magic5", "Honor", "harmony", 6.73, 402, 120, 8, 5, 2023);
d("honormagic6", "Honor Magic6", "Honor", "harmony", 6.78, 460, 120, 12, 5, 2024);
d("honorx8", "Honor X8", "Honor", "harmony", 6.7, 396, 90, 6, 2, 2022);
d("honorx9", "Honor X9", "Honor", "harmony", 6.78, 388, 120, 8, 3, 2023);

d("rog5", "ASUS ROG Phone 5", "ASUS", "android", 6.78, 395, 144, 12, 5, 2021);
d("rog6", "ASUS ROG Phone 6", "ASUS", "android", 6.78, 395, 165, 12, 5, 2022);
d("rog7", "ASUS ROG Phone 7", "ASUS", "android", 6.78, 395, 165, 16, 5, 2023);
d("rog8", "ASUS ROG Phone 8", "ASUS", "android", 6.78, 388, 165, 16, 5, 2024);

d("nothing1", "Nothing Phone 1", "Nothing", "android", 6.55, 402, 120, 8, 4, 2022);
d("nothing2", "Nothing Phone 2", "Nothing", "android", 6.7, 394, 120, 12, 5, 2023);
d("nothing2a", "Nothing Phone 2a", "Nothing", "android", 6.7, 394, 120, 8, 3, 2024);

d("sonyxperia1iv", "Sony Xperia 1 IV", "Sony", "android", 6.5, 643, 120, 12, 5, 2022);
d("sonyxperia1v", "Sony Xperia 1 V", "Sony", "android", 6.5, 643, 120, 12, 5, 2023);
d("sonyxperia5v", "Sony Xperia 5 V", "Sony", "android", 6.1, 449, 120, 8, 5, 2023);

d("motoedge30", "Motorola Edge 30", "Motorola", "android", 6.5, 400, 144, 8, 4, 2022);
d("motog60", "Motorola Moto G60", "Motorola", "android", 6.8, 396, 120, 6, 2, 2021);
d("motog84", "Motorola Moto G84", "Motorola", "android", 6.55, 394, 120, 8, 2, 2023);

d("nokiag21", "Nokia G21", "Nokia", "android", 6.5, 269, 90, 4, 1, 2022);
d("nokiax30", "Nokia X30", "Nokia", "android", 6.43, 409, 60, 8, 2, 2022);

d("infnote11", "Infinix Note 11", "Infinix", "android", 6.7, 396, 90, 6, 1, 2021);
d("infnote12", "Infinix Note 12", "Infinix", "android", 6.7, 396, 120, 6, 2, 2022);
d("infnote30", "Infinix Note 30", "Infinix", "android", 6.78, 388, 120, 8, 2, 2023);
d("infhot30", "Infinix Hot 30", "Infinix", "android", 6.78, 264, 90, 6, 1, 2023);
d("infzero30", "Infinix Zero 30", "Infinix", "android", 6.78, 388, 144, 8, 3, 2023);

d("tecspark9", "Tecno Spark 9", "Tecno", "android", 6.6, 270, 60, 4, 1, 2022);
d("tecspark10", "Tecno Spark 10", "Tecno", "android", 6.6, 270, 90, 4, 1, 2023);
d("teccamon19", "Tecno Camon 19", "Tecno", "android", 6.8, 394, 60, 8, 2, 2022);
d("tecphantomx", "Tecno Phantom X2", "Tecno", "android", 6.8, 388, 90, 8, 3, 2022);

d("itela60", "itel A60", "itel", "android", 6.6, 267, 60, 3, 1, 2023);
