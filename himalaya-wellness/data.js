/* p = price in rupiah. null = not shown on the site (toner: by brief; others: store data looked wrong, Nov 2026). */
const PRODUCTS=[
 {
  "id": "himalaya-brightening-vitamin-c-orange-face-serum",
  "n": "Brightening Vitamin C Orange Face Serum",
  "t": "Serum",
  "c": [
   "mencerahkan"
  ],
  "k": "Semua jenis kulit",
  "s": "Serum wajah",
  "r": 4.7,
  "u": 212,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/11_1.jpg?v=1763045169&width=900",
  "vs": [
   "15ml"
  ],
  "p": 61800,
  "clean": false
 },
 {
  "id": "himalaya-brightening-vitamin-c-orange-face-wash",
  "n": "Brightening Vitamin C Orange Face Wash",
  "t": "Facial Wash",
  "c": [
   "mencerahkan"
  ],
  "k": "Semua jenis kulit",
  "s": "Sabun cuci muka",
  "r": 4.6,
  "u": 340,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/10_1_1.jpg?v=1780547636&width=900",
  "vs": [
   "100ml"
  ],
  "p": 42200,
  "clean": false
 },
 {
  "id": "himalaya-dark-spot-treatment-turmeric-face-serum",
  "n": "Dark Spot Turmeric Face Serum",
  "t": "Serum",
  "c": [
   "noda"
  ],
  "k": "Kulit kusam & bernoda",
  "s": "Serum wajah",
  "r": 4.6,
  "u": 158,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/1_DSTSerum.jpg?v=1763088528&width=900",
  "vs": [
   "15ml"
  ],
  "p": 61800,
  "clean": false
 },
 {
  "id": "himalaya-dark-spot-clearing-turmeric-clay-stick-mask",
  "n": "Dark Spot Turmeric Clay Stick Mask",
  "t": "Masker",
  "c": [
   "noda"
  ],
  "k": "Kulit kusam & bernoda",
  "s": "Masker stik",
  "r": 4.5,
  "u": 97,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/DST-StickMask-1.png?v=1763042804&width=900",
  "vs": [
   "30g"
  ],
  "p": 66500,
  "clean": false
 },
 {
  "id": "himalaya-dark-spot-treatment-turmeric-face-mask",
  "n": "Dark Spot Turmeric Face Mask",
  "t": "Masker",
  "c": [
   "noda",
   "mencerahkan"
  ],
  "k": "Kulit kusam & bernoda",
  "s": "Masker wajah",
  "r": 4.6,
  "u": 126,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/1_DSTFM.jpg?v=1763042635&width=900",
  "vs": [
   "100ml"
  ],
  "p": 53700,
  "clean": false
 },
 {
  "id": "himalaya-dark-spot-treatment-turmeric-face-wash",
  "n": "Dark Spot Turmeric Face Wash",
  "t": "Facial Wash",
  "c": [
   "noda"
  ],
  "k": "Kulit kusam & bernoda",
  "s": "Sabun cuci muka",
  "r": 4.7,
  "u": 284,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/1_DSTFW.jpg?v=1763042122&width=900",
  "vs": [
   "100ml"
  ],
  "p": 44900,
  "clean": false
 },
 {
  "id": "himalaya-purifying-neem-face-serum",
  "n": "Purifying Neem Face Serum",
  "t": "Serum",
  "c": [
   "jerawat",
   "berminyak"
  ],
  "k": "Kulit berminyak & berjerawat",
  "s": "Serum wajah",
  "r": 4.6,
  "u": 173,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/SLIDE1_296ee4ec-0d2a-4a64-ad0c-c846406c098a.jpg?v=1763039217&width=900",
  "vs": [
   "15ml"
  ],
  "p": 61800,
  "clean": false
 },
 {
  "id": "himalaya-purifying-neem-clay-stick-mask",
  "n": "Purifying Neem Clay Stick Mask",
  "t": "Masker",
  "c": [
   "jerawat",
   "berminyak"
  ],
  "k": "Kulit berminyak & berjerawat",
  "s": "Masker stik",
  "r": 4.5,
  "u": 109,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/SLIDE1_fb0a2519-26c1-4aa4-a7f3-12eab5cb7daf.jpg?v=1763036642&width=900",
  "vs": [
   "30g"
  ],
  "p": 66500,
  "clean": false
 },
 {
  "id": "himalaya-purifying-neem-face-mask",
  "n": "Purifying Neem Face Mask",
  "t": "Masker",
  "c": [
   "jerawat",
   "berminyak"
  ],
  "k": "Kulit berminyak & berjerawat",
  "s": "Masker wajah",
  "r": 4.6,
  "u": 231,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/SLIDE1_803417ac-e633-4d4b-88bc-c18529cf99bf.png?v=1763032899&width=900",
  "vs": [
   "50ml",
   "100ml",
   "150ml"
  ],
  "p": 47200,
  "clean": false
 },
 {
  "id": "himalaya-purifying-neem-face-wash",
  "n": "Purifying Neem Face Wash",
  "t": "Facial Wash",
  "c": [
   "jerawat",
   "berminyak"
  ],
  "k": "Kulit berminyak & berjerawat",
  "s": "Sabun cuci muka",
  "r": 4.7,
  "u": 512,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/SLIDE1_d4f44029-2d3c-414e-9f3f-e5c1588e6429.jpg?v=1762925511&width=900",
  "vs": [
   "50ml",
   "100ml",
   "150ml"
  ],
  "p": 44900,
  "clean": false
 },
 {
  "id": "oil-control-lemon-face-wash",
  "n": "Oil Control Lemon Face Wash",
  "t": "Facial Wash",
  "c": [
   "berminyak"
  ],
  "k": "Kulit berminyak",
  "s": "Sabun cuci muka",
  "r": 4.5,
  "u": 188,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/2_b3c0cd22-bf78-430d-b172-8ff5910af9a1.jpg?v=1768806463&width=900",
  "vs": [
   "50ml",
   "100ml"
  ],
  "p": null,
  "clean": false
 },
 {
  "id": "refreshing-clarifying-toner",
  "n": "Refreshing & Clarifying Toner",
  "t": "Toner",
  "c": [
   "berminyak"
  ],
  "k": "Kulit normal hingga berminyak",
  "s": "Toner wajah",
  "r": 4.4,
  "u": 76,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/products/Refreshing-Clarifying-Toner-200ml.jpg?v=1739857949&width=900",
  "vs": [
   "100ml",
   "200ml"
  ],
  "p": null,
  "clean": true
 },
 {
  "id": "moisturizing-aloe-vera-face-wash",
  "n": "Moisturizing Aloe Vera Face Wash",
  "t": "Facial Wash",
  "c": [
   "kering"
  ],
  "k": "Kulit kering & normal",
  "s": "Sabun cuci muka",
  "r": 4.6,
  "u": 143,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/2.jpg?v=1768806019&width=900",
  "vs": [
   "100ml"
  ],
  "p": null,
  "clean": false
 },
 {
  "id": "gentle-exfoliating-daily-face-wash",
  "n": "Gentle Exfoliating Daily Face Wash",
  "t": "Scrub",
  "c": [
   "kering",
   "mencerahkan"
  ],
  "k": "Kulit normal, eksfoliasi ringan",
  "s": "Scrub wajah",
  "r": 4.5,
  "u": 64,
  "img": "https://cdn.shopify.com/s/files/1/0516/2473/9002/files/2_6e78ddc4-abce-48fa-b2fd-7a36f7e7944e.jpg?v=1768807284&width=900",
  "vs": [
   "50ml",
   "100ml"
  ],
  "p": null,
  "clean": false
 }
];
