/* Image sources for the mockup.
   PACK: clean packshots. Where Himalaya India (himalayawellness.in, the face-care
   products.json) sells the same product, its white-background FOP shot is used.
   Otherwise the entry falls back to the Indonesian store image in data.js (see
   `fit:'cover'`). Hotlinked from cdn.shopify.com for the mockup only.
   IMG: lifestyle and model photos. PLACEHOLDERS ONLY, hotlinked from
   images.unsplash.com. Replace them with Himalaya-owned photography before launch. */
const IN = 'https://cdn.shopify.com/s/files/1/0272/4714/9155/';
const PACK = {
  'himalaya-brightening-vitamin-c-orange-face-wash': IN + 'files/7409343-2_Himalaya-Brightening-Vitamin-C-Orange-Face-Wash_50ml_FOP.jpg?v=1702875810',
  'himalaya-dark-spot-treatment-turmeric-face-serum': IN + 'files/Himalaya-Dark-Spot-Clearing-Turmeric-Face-Serum_Carton_30ml_FOP.jpg?v=1703063016',
  'himalaya-dark-spot-treatment-turmeric-face-mask': IN + 'files/Dark-Spot-Clearing-Turmeric-Face-Pack_100g_FOP.jpg?v=1697711529',
  'himalaya-dark-spot-treatment-turmeric-face-wash': IN + 'files/Himalaya-Dark-Spot-Clearing-Turmeric-Face-Wash1.jpg?v=1697090104',
  'himalaya-purifying-neem-face-serum': IN + 'files/8006273-1_HimalayaPurifyingNeemFaceSerum15mlCarton_FOP.jpg?v=1773297921',
  'himalaya-purifying-neem-face-mask': IN + 'files/7307784-2_HimalayaPurifyingNeemPack100gTube_FOP.png?v=1785850441',
  'himalaya-purifying-neem-face-wash': IN + 'files/PentaNeemF_100_jpg_jpg.jpg?v=1789447757',
  'oil-control-lemon-face-wash': IN + 'files/7555390-4_Himalaya-Oil-Clear-Lemon-Face-Wash-50-ml-Tube-3D_FOP.jpg?v=1737613147',
  'refreshing-clarifying-toner': IN + 'products/refreshing_clarifying-toner.jpg?v=1622096102',
  /* Cropped from the Indonesian store's banner images (the packshot only, without the banner claims); no India equivalent exists */
  'himalaya-brightening-vitamin-c-orange-face-serum': 'img/pack/vitc-serum.jpg?v=1',
  'himalaya-purifying-neem-clay-stick-mask': 'img/pack/neem-clay-stick.jpg?v=1',
  'himalaya-dark-spot-clearing-turmeric-clay-stick-mask': 'img/pack/dark-spot-clay-stick.jpg?v=1',
  'gentle-exfoliating-daily-face-wash': 'img/pack/gentle-exfoliating.jpg?v=2',
  'moisturizing-aloe-vera-face-wash': IN + 'files/7949501-1_HimalayaHydratingAloeVeraFaceWash50ml_FOP.jpg?v=1772455081'
};
/* Gallery for produk.html (Purifying Neem Face Wash): the 50/100/150ml fronts and the 50ml back, from Himalaya India */
const NEEM_GALLERY = [
  IN + 'files/PentaNeemF_100_jpg_jpg.jpg?v=1789447757',
  IN + 'files/PentaNeemF_50_jpg.jpg?v=1789447744',
  IN + 'files/PentaNeemF_150_jpg.jpg?v=1789447767',
  IN + 'files/PentaNeemB_50_jpg_jpg.jpg?v=1789447744'
];
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=75`;
const IMG = { // placeholder Unsplash photos
  heroModel: U('photo-1589525231707-f2de2428f59c'),   // Asian woman, soft green background
  leafModel: U('photo-1645627590046-a957f2989f64'),   // woman with a big leaf
  serumModel: U('photo-1599847896696-7e19dbd9d2e8'),  // woman holding a dropper bottle
  hijab: U('photo-1550546094-9835463f9f71'),          // woman in hijab among greenery
  hijab2: U('photo-1558027309-0844844295f7'),
  hijab3: U('photo-1574297500578-afae55026ff3'),
  portrait2: U('photo-1687298703924-0d11be697d8b'),
  portrait3: U('photo-1516974409143-b067ec3e0ec8'),
  portrait4: U('photo-1702312686957-572286d28e11'),
  mirror: U('photo-1599847987657-881f11b92a75'),
  cream: U('photo-1728727267814-792db55ce678'),
  wash: U('photo-1670201203208-055d6d79db4a'),
  wash2: U('photo-1707303674503-83668192088e'),
  applyCream: U('photo-1693004927824-f2623bbedc8b'),
  applyCream2: U('photo-1660911582546-2897e25c3b26'),
  towel: U('photo-1648203276014-20f97ba1f817'),
  neem: U('photo-1669574753106-28167b097433'),
  neem2: U('photo-1564505676257-57af8f7e43ab'),
  neem3: U('photo-1777025082461-762b0d5b6b39'),
  turmeric: U('photo-1666818398897-381dd5eb9139'),
  turmericPowder: U('photo-1615485500834-bc10199bc727'),
  turmeric2: U('photo-1741513599050-487ccfb86275'),
  swatch: U('photo-1585945037805-5fd82c2e60b1'),
  creamSwirl: U('photo-1749143930790-65db0ee6d222'),
  creamDab: U('photo-1608068811588-3a67006b7489'),
  gel1: U('photo-1748543668687-624e058c367c'),
  gel2: U('photo-1748543668676-ea8241cb3886'),
  gel3: U('photo-1748543668646-e81cda0890f3'),
  gel4: U('photo-1748543668643-1ada33167539'),
  leafDrop: U('photo-1610797145210-42a1a511ba4c'),
  leafDrop2: U('photo-1587499211760-9b9b4de880f9'),
  leafDrop3: U('photo-1722589232503-950690542dc5'),
  leafTex: U('photo-1487017931017-0e0d9e02bb0c'),
  apothecary: U('photo-1611073761742-bce90ccd60ae'),
  spices: U('photo-1581600140682-d4e68c8cde32'),
  dropper: U('photo-1573461160327-b450ce3d8e7f'),
  dropper2: U('photo-1672062519629-abe610383152'),
  dropper3: U('photo-1707539160277-e39464517645'),
  aloe: U('photo-1570295835271-04c05b4ed943'),
  aloe2: U('photo-1671166739837-b175ef95cb48'),
  hijab4: U('photo-1643712854985-79ff3bee400b'),
  hijab5: U('photo-1710488140888-88896ecafdcd')
};
