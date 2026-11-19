/* Shared copy for the mockup (Bahasa Indonesia, BPOM-safe "membantu…" wording). */
const ARTICLES = [
  { slug:'facial-wash-kulit-berjerawat', cat:'Panduan Produk', q:'facial wash untuk kulit berjerawat', img:'wash', date:'24 Sep 2026', min:6,
    t:'Facial wash untuk kulit berjerawat: cara memilih yang sesuai', d:'Kenali tekstur, bahan, dan kebiasaan mencuci muka yang membantu menjaga kulit berminyak tetap bersih tanpa terasa tertarik.' },
  { slug:'noda-hitam-realistis-dan-mitos', cat:'Kulit Bernoda', q:'cara merawat kulit bernoda', img:'portrait2', date:'17 Sep 2026', min:7,
    t:'Noda hitam di wajah: yang realistis dan yang mitos', d:'Noda hitam butuh waktu dan konsistensi. Ini rutinitas harian, peran tabir surya, dan bahan seperti kunyit yang membantu kulit tampak lebih merata.' },
  { slug:'serum-vitamin-c-pemula', cat:'Serum', q:'serum vitamin c untuk pemula', img:'serumModel', date:'10 Sep 2026', min:5,
    t:'Serum vitamin C untuk pemula: urutan pakai dan tips memilih', d:'Kapan dipakai, berapa tetes, dan bagaimana memadukannya dengan facial wash dan tabir surya agar kulit tampak lebih segar.' },
  { slug:'skincare-kulit-berminyak', cat:'Kulit Berminyak', q:'skincare untuk kulit berminyak', img:'hijab2', date:'3 Sep 2026', min:5,
    t:'Skincare untuk kulit berminyak di cuaca panas dan lembap', d:'Kulit berminyak tetap butuh pelembap. Ini cara menyusun rutinitas ringan yang membantu mengontrol tampilan kilap sepanjang hari.' },
  { slug:'urutan-skincare-pagi-malam', cat:'Rutinitas', q:'urutan skincare pagi dan malam', img:'mirror', date:'27 Agu 2026', min:4,
    t:'Urutan skincare pagi dan malam untuk pemula', d:'Mulai dari tiga langkah: bersihkan, seimbangkan, rawat. Tambahkan produk baru satu per satu dan perhatikan respons kulitmu.' },
  { slug:'manfaat-neem-untuk-kulit', cat:'Bahan Herbal', q:'manfaat daun neem untuk wajah', img:'neem', date:'20 Agu 2026', min:6,
    t:'Mengenal neem: dari tradisi herbal ke facial wash harian', d:'Neem sudah lama dikenal dalam tradisi herbal India. Begini peran ekstrak daun neem di dalam formula perawatan wajah.' }
];
/* ILLUSTRATIVE reviews: placeholder copy for the mockup, not real customer quotes. */
const REVIEWS = [
  { n:'Nadia R.', c:'Jakarta', r:5, p:'Purifying Neem Face Wash', img:'portrait3', t:'Wajah terasa bersih dan segar setelah dipakai, tidak licin. Busanya pas, tidak berlebihan. Sudah botol ketiga.' },
  { n:'Putri A.', c:'Surabaya', r:5, p:'Dark Spot Turmeric Face Serum', img:'hijab3', t:'Teksturnya ringan dan cepat meresap, enak dipakai sebelum pelembap. Aromanya lembut, tidak menyengat.' },
  { n:'Dimas P.', c:'Yogyakarta', r:4, p:'Oil Control Lemon Face Wash', img:null, t:'Cocok buat aku yang sering naik motor siang hari. Setelah cuci muka wajah terasa lebih segar dan tidak terlalu mengilap.' },
  { n:'Ayu K.', c:'Denpasar', r:5, p:'Purifying Neem Face Mask', img:'hijab5', t:'Aku pakai dua kali seminggu. Setelah dibilas kulit terasa lebih bersih, dan pori-pori tampak lebih rapi.' },
  { n:'Sarah M.', c:'Medan', r:4, p:'Purifying Neem Face Wash', img:null, t:'Di kulitku agak terasa kering, jadi sekarang selalu lanjut pakai pelembap. Dengan begitu nyaman dipakai pagi dan malam.' },
  { n:'Intan L.', c:'Semarang', r:5, p:'Brightening Vitamin C Orange Face Wash', img:'hijab', t:'Wanginya segar seperti jeruk. Wajah terasa bersih dan tampak lebih cerah setelah cuci muka pagi.' },
  { n:'Fitri H.', c:'Makassar', r:5, p:'Refreshing & Clarifying Toner', img:null, t:'Toner favorit untuk cuaca panas. Adem di kulit dan tidak lengket, aku simpan di kulkas.' },
  { n:'Rizky S.', c:'Bandung', r:4, p:'Purifying Neem Face Serum', img:'portrait2', t:'Serumnya ringan, tidak bikin wajah terasa berat. Mudah dipadukan dengan pelembap gel.' }
];
const FAQ_HOME = [
  ['Apakah produk Himalaya terdaftar di BPOM?','Ya. Produk Himalaya yang dijual resmi di Indonesia terdaftar di BPOM. Nomor notifikasi tercantum di kemasan dan di setiap halaman produk, dan bisa kamu cek di cekbpom.pom.go.id.'],
  ['Facial wash mana yang cocok untuk kulit berjerawat?','Purifying Neem Face Wash diformulasikan untuk kulit berminyak dan mudah berjerawat. Neem dan kunyit di dalamnya membantu membersihkan kotoran dan minyak berlebih. Jika kulitmu cenderung kering, lanjutkan dengan pelembap.'],
  ['Di mana membeli produk Himalaya yang asli?','Di official store Himalaya di Shopee, Tokopedia, TikTok Shop, Lazada, dan Watsons. Tombol "Beli" di setiap produk mengarahkan langsung ke toko resmi tersebut.'],
  ['Apakah facial wash boleh dipakai dua kali sehari?','Boleh. Gunakan pagi dan malam, pijat lembut sekitar 30 detik lalu bilas. Jika kulit terasa kering atau tertarik, kurangi menjadi sekali sehari dan tambahkan pelembap.'],
  ['Bagaimana memilih produk sesuai jenis kulit?','Mulai dari kebutuhan utama kulitmu: jerawat, noda hitam, kusam, berminyak, atau kering. Di halaman Perawatan Wajah, setiap produk bisa difilter sesuai kebutuhan dan jenisnya.']
];
const STEPS = [
  { n:'Langkah 1', t:'Bersihkan', d:'Cuci muka pagi dan malam untuk mengangkat kotoran, minyak dan sisa tabir surya.', img:'wash', pid:'himalaya-purifying-neem-face-wash' },
  { n:'Langkah 2', t:'Seimbangkan', d:'Usapkan toner dengan kapas untuk membantu menyegarkan kulit dan menyiapkannya untuk langkah berikutnya.', img:'gel2', pid:'refreshing-clarifying-toner' },
  { n:'Langkah 3', t:'Rawat', d:'Serum sesuai kebutuhan, lalu pelembap. Tambahkan masker 1 sampai 2 kali seminggu.', img:'serumModel', pid:'himalaya-purifying-neem-face-serum' }
];
const INGREDIENTS = [
  { n:'Neem', l:'Azadirachta indica', img:'neem', d:'Daun neem sudah lama dikenal dalam tradisi herbal India. Di rangkaian Purifying Neem, ekstraknya membantu membersihkan kotoran dan minyak berlebih di permukaan kulit.' },
  { n:'Kunyit', l:'Curcuma longa', img:'turmeric', d:'Rempah yang akrab di dapur Indonesia. Di rangkaian Dark Spot, kunyit membantu kulit tampak lebih cerah dan warnanya lebih merata.' },
  { n:'Lidah Buaya', l:'Aloe barbadensis', img:'aloe', d:'Gel lidah buaya membantu menjaga kelembapan kulit, sehingga wajah tetap terasa nyaman setelah dibersihkan.' },
  { n:'Lemon', l:'Citrus limon', img:'gel4', d:'Di Oil Control Lemon Face Wash, lemon membantu mengurangi tampilan kilap minyak di wajah.' },
  { n:'Jeruk & Vitamin C', l:'Citrus sinensis', img:'dropper', d:'Di rangkaian Brightening, jeruk dan vitamin C membantu kulit tampak lebih segar dan bercahaya.' }
];
