/* =========================================================================
   BCT Travel — të dhënat e faqes
   Këtu ndryshoni kontaktet, ofertat, çmimet dhe datat. Çdo gjë tjetër
   në faqe (tabela e nisjeve, filtrat, llogaritja e çmimit, portali B2B)
   ndërtohet automatikisht nga kjo listë.
   ========================================================================= */
window.BCT = {};

BCT.config = {
  brand: 'BCT Travel',
  domain: 'bct-travel.com',
  email: 'info@bct-travel.com',
  phoneDisplay: '+383 48 667 888',
  whatsapp: '38348667888',    // pa "+" dhe pa hapësira
  priceApi: '',               // adresa e Worker-it 24/7, p.sh. 'https://bct-flights.EMRI.workers.dev' (shih paketën bct-flights-24-7)
  address: 'Kosovë',
  nye: { offerId: 'dubai-viti-ri', departure: '2026-12-29T07:00:00+01:00' },
  hub: { lat: 42.57, lon: 21.04, label: 'Prishtinë', code: 'PRN' },
  hubs: { TIA: { lat: 41.41, lon: 19.72, label: 'Tiranë / Shkup' } },  // Maldivet dhe Japonia nisen nga Tirana ose Shkupi
  socials: { instagram: '#', facebook: '#', tiktok: '#' }
};

BCT.cats = [
  ['all', 'Të gjitha'], ['beach', 'Plazh'], ['safari', 'Safari'], ['luxury', 'Luks'],
  ['honeymoon', 'Muaj mjalti'], ['family', 'Familje'], ['newyear', 'Viti i Ri'],
  ['earlybooking', 'Early Booking'], ['city', 'Qytet'], ['culture', 'Kulturë'], ['rare', 'Të rralla']
];

BCT.dests = [
  { key: 'maldive', lat: 4.18, lon: 73.51, origin: 'TIA', mood: 'maldive', name: 'Maldive', code: 'MLE', scene: 'maldives', main: true,
    line: 'Lagunë e tejdukshme, vila mbi ujë dhe qetësi e vërtetë.', season: 'Nëntor – prill', flight: 'Me një ndalesë' },
  { key: 'zanzibar', lat: -6.16, lon: 39.2, mood: 'zanzibar', name: 'Zanzibar dhe Tanzani', code: 'ZNZ', scene: 'zanzibar', main: true,
    line: 'Savana e Tanzanisë dhe plazhet e Oqeanit Indian.', season: 'Qershor – tetor, dhjetor – shkurt', flight: 'Me një ndalesë' },
  { key: 'dubai', lat: 25.25, lon: 55.36, mood: 'dubai', name: 'Dubai', code: 'DXB', scene: 'dubai', main: true,
    line: 'Rrokaqiej, shkretëtirë dhe Viti i Ri më i ndritshëm.', season: 'Tetor – prill', flight: 'Nga Prishtina' },
  { key: 'antalya', lat: 36.9, lon: 30.8, mood: 'antalya', name: 'Antalya', code: 'AYT', scene: 'antalya', main: true,
    line: 'Ultra All Inclusive me plazh, për gjithë familjen.', season: 'Maj – tetor', flight: 'Charter direkt' },
  { key: 'bodrum', lat: 37.25, lon: 27.66, mood: 'bodrum', name: 'Bodrum', code: 'BJV', scene: 'bodrum', main: true,
    line: 'Egjeu, shtëpitë e bardha dhe mbrëmjet në marinë.', season: 'Maj – shtator', flight: 'Charter direkt' },
  { key: 'laponi', lat: 66.56, lon: 25.83, mood: 'laponi', name: 'Laponi', code: 'RVN', scene: 'lapland', season: 'Dhjetor – mars' },
  { key: 'jordani', lat: 31.72, lon: 35.99, mood: 'jordani', name: 'Jordani', code: 'AMM', scene: 'jordan', season: 'Mars – maj, tetor – nëntor' },
  { key: 'seychelles', lat: -4.67, lon: 55.52, mood: 'seychelles', name: 'Seychelles', code: 'SEZ', scene: 'seychelles', season: 'Prill – maj, tetor – nëntor' },
  { key: 'japoni', lat: 35.55, lon: 139.78, origin: 'TIA', mood: 'japoni', name: 'Japoni', code: 'HND', scene: 'japan', season: 'Fund marsi – prill' }
];

/* Fushat e një oferte
   price: çmimi "nga" për person në dhomë dyshe · old: çmimi para zbritjes
   commission: komisioni B2B (0.08 = 8%) · child: koeficienti për fëmijë 2–11 vjeç
   single: shtesa për dhomë teke · options: zgjedhjet që ndryshojnë çmimin (d = € për person)
   days: [titulli, përshkrimi, sa ditë zgjat] · dates: [data, vende të lira, shënim]  */
BCT.offers = [
  {
    id: 'maldive-vila', mood: 'maldive', dest: 'maldive', cats: ['beach', 'luxury', 'honeymoon'], rank: 1,
    title: 'Vila mbi ujë në Maldive', board: 'MALDIVE',
    sub: 'Resort 5★ në ishull privat, me lagunë dhe shkëmbinj koralorë për snorkeling.',
    route: ['TIA/SKP', 'MLE'], via: 'Nisje nga Tirana ose Shkupi, sipas kompanisë ajrore, me një ndalesë',
    nights: 7, stay: 'Resort 5★', meal: 'Gjysmë pension',
    price: 2890, commission: .08, child: .7, single: .6,
    scene: 'maldives', tag: 'Vilë mbi ujë',
    highlights: [
      'Vilë mbi ujë me shkallë direkt në lagunë',
      'Transfer me skaf ose me hidroplan, sipas zgjedhjes',
      'Snorkeling me breshka dhe peshq tropikalë pranë resortit',
      'Për çiftet në muaj mjalti: dekorim i vilës dhe darkë në plazh, sipas resortit'
    ],
    options: [
      { name: 'Vila', choices: [{ l: 'Beach Villa', d: 0 }, { l: 'Water Villa', d: 490 }, { l: 'Water Villa me pishinë', d: 1190 }] },
      { name: 'Pensioni', choices: [{ l: 'Gjysmë pension', d: 0 }, { l: 'Pension i plotë', d: 240 }, { l: 'All Inclusive', d: 520 }] },
      { name: 'Transferi', choices: [{ l: 'Me skaf', d: 0 }, { l: 'Me hidroplan', d: 480 }] }
    ],
    days: [
      ['Tiranë ose Shkup – Malé', 'Fluturim me një ndalesë, nga Tirana ose Shkupi sipas kompanisë ajrore. Në mbërritje, transfer me skaf ose me hidroplan deri në resort.'],
      ['Ditët në resort', 'Snorkeling, sporte ujore, spa ose thjesht shezlongu mbi lagunë. Opsionale: delfinët në perëndim, peshkim tradicional, piknik në një ishull të shkretë.', 6],
      ['Kthimi', 'Transfer në aeroportin e Malé-së dhe fluturim kthyes për në Tiranë ose Shkup.']
    ],
    incl: ['Fluturim kthyes nga Tirana ose Shkupi, me një ndalesë', 'Transferet aeroport – resort – aeroport', '7 netë në resort 5★', 'Pensioni i zgjedhur', 'Taksat e aeroportit', 'Asistencë nga BCT Travel gjatë gjithë udhëtimit'],
    excl: ['Sigurimi i udhëtimit', 'Ekskursionet opsionale', 'Bakshishet dhe shpenzimet personale'],
    dates: [['2026-11-14', 6], ['2026-12-05', 3], ['2027-01-16', 8], ['2027-02-13', 4], ['2027-03-13', 10]]
  },
  {
    id: 'zanzibar-safari', mood: 'safari', dest: 'zanzibar', cats: ['safari', 'beach', 'luxury', 'honeymoon'], rank: 2,
    title: 'Safari në Tanzani dhe plazh në Zanzibar', board: 'SAFARI+ZANZIBAR',
    sub: 'Parqet e veriut të Tanzanisë me xhip 4×4, pastaj një javë në Oqeanin Indian.',
    route: ['PRN', 'JRO', 'ZNZ'], via: 'Me një ndalesë, plus fluturim i brendshëm Arusha – Zanzibar',
    nights: 11, stay: 'Lodge dhe resort 4★', meal: 'Pension i plotë në safari, All Inclusive në plazh',
    price: 2990, commission: .09, child: .75, single: .45,
    scene: 'safari', tag: 'Safari + plazh',
    highlights: [
      'Krateri Ngorongoro, një nga vendet më të pasura me kafshë të egra në Afrikë',
      'Safari me xhip 4×4 me tavan që hapet dhe guidë profesional',
      'Fluturim i brendshëm nga Arusha në Zanzibar, pa humbur kohë në rrugë',
      'Plazh All Inclusive në Nungwi ose Kendwa'
    ],
    options: [
      { key: 'safari', name: 'Safari', def: 1, choices: [
        { l: '2 ditë', s: 'Tarangire dhe Ngorongoro', d: -420, n: -1, v: 2 },
        { l: '3 ditë', s: 'Tarangire, Manyara dhe Ngorongoro', d: 0, n: 0, v: 3 },
        { l: '4 ditë', s: 'Tarangire, Serengeti dhe Ngorongoro', d: 690, n: 1, v: 4 }] },
      { key: 'beach', name: 'Plazhi në Zanzibar', def: 1, choices: [
        { l: '5 netë', d: -280, n: -2, v: 5 }, { l: '7 netë', d: 0, n: 0, v: 7 }, { l: '10 netë', d: 390, n: 3, v: 10 }] },
      { key: 'level', name: 'Niveli', choices: [{ l: 'Komfort 4★', s: 'Lodge dhe resort 4★', d: 0 }, { l: 'Luks 5★', s: 'Lodge dhe resort 5★', d: 690 }] }
    ],
    plan(v) {
      const P = {
        tar: ['Safari: Tarangire', 'Elefantët dhe baobabët shekullorë të Tarangire-s.'],
        man: ['Safari: liqeni Manyara', 'Pylli pranë liqenit, flamingot dhe luanët që ngjiten nëpër pemë.'],
        ser: ['Safari: Serengeti', 'Fusha pa fund, gepardë dhe, në sezon, migrimi i madh.'],
        ser2: ['Safari: Serengeti', 'Gjithë dita në savanë, me drekë në natyrë.'],
        ngo: ['Safari: krateri Ngorongoro', 'Zbritje në krater: luanë, rinocerontë, bualla dhe flamingo.']
      };
      const parks = { 2: ['tar', 'ngo'], 3: ['tar', 'man', 'ngo'], 4: ['tar', 'ser', 'ser2', 'ngo'] }[v.safari].map(k => P[k]);
      return [
        ['Prishtinë – Kilimanjaro', 'Fluturim me një ndalesë, transfer në Arusha, darkë dhe fjetje.'],
        ...parks,
        ['Arusha – Zanzibar', 'Fluturim i brendshëm i shkurtër dhe transfer në resort në plazh.'],
        ['Ditët në plazh', 'All Inclusive në Nungwi ose Kendwa. Opsionale: Stone Town, Prison Island, Safari Blue.', v.beach - 1],
        ['Kthimi', 'Transfer në aeroportin e Zanzibarit dhe fluturim për në Prishtinë.']
      ];
    },
    incl: ['Fluturim kthyes nga Prishtina, me një ndalesë', 'Fluturimi i brendshëm Arusha – Zanzibar', 'Safari me xhip 4×4, guidë dhe hyrjet në parqe', 'Lodge në safari me pension të plotë', 'Resort në plazh me All Inclusive', 'Asistencë nga BCT Travel'],
    excl: ['Viza dhe sigurimi i udhëtimit', 'Bakshishet për guidat', 'Ekskursionet opsionale në Zanzibar'],
    dates: [['2026-11-19', 6], ['2027-01-14', 8], ['2027-02-11', 5], ['2027-06-24', 10], ['2027-08-05', 8, 'Migrimi i madh']]
  },
  {
    id: 'dubai-viti-ri', mood: 'dubai', dest: 'dubai', cats: ['newyear', 'city', 'luxury'], rank: 3,
    title: 'Viti i Ri në Dubai', board: 'DUBAI VITI I RI',
    sub: 'Pesë netë në hotel 5★ dhe nata e 31 dhjetorit me pamje nga fishekzjarrët e Burj Khalifas.',
    route: ['PRN', 'DXB'], via: 'Nga Prishtina',
    nights: 5, stay: 'Hotel 5★', meal: 'Mëngjes',
    price: 1490, commission: .09, child: .7, single: .7,
    scene: 'dubai', sceneOpts: { fireworks: true }, tag: '29 dhjetor – 3 janar',
    highlights: [
      'Fishekzjarrët e Vitit të Ri te Burj Khalifa',
      'Burj Khalifa, katet 124 dhe 125, me hyrje të rezervuar',
      'Safari në shkretëtirë me xhip dhe darkë BBQ në kamp',
      'Ditë e lirë për plazh, Dubai Mall ose Abu Dhabi'
    ],
    options: [
      { name: 'Hoteli', choices: [{ l: '5★ në Downtown', d: 0 }, { l: '5★ në Palm Jumeirah', d: 380 }] },
      { name: 'Nata e Vitit të Ri', choices: [{ l: 'Pa program', d: 0 }, { l: 'Darkë gala në lundrim', d: 290 }, { l: 'Darkë me pamje nga Burj Khalifa', d: 590 }] }
    ],
    days: [
      ['29 dhjetor: mbërritja', 'Transfer në hotel dhe mbrëmje e lirë në Dubai Marina.'],
      ['30 dhjetor: qyteti', 'Tur me guidë në Dubain e vjetër dhe të ri, pastaj ngjitja në Burj Khalifa.'],
      ['31 dhjetor: Viti i Ri', 'Ditë e lirë. Në mbrëmje, programi i zgjedhur dhe fishekzjarrët e mesnatës.'],
      ['1 janar: pushim', 'Plazh, pishinë ose Dubai Mall.'],
      ['2 janar: shkretëtira', 'Safari me xhip mbi duna, perëndimi dhe darkë BBQ në kamp.'],
      ['3 janar: kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina', 'Transferet aeroport – hotel – aeroport', '5 netë në hotel 5★ me mëngjes', 'Tur i qytetit me guidë', 'Hyrja në Burj Khalifa, katet 124–125', 'Safari në shkretëtirë me darkë', 'Asistencë nga BCT Travel'],
    excl: ['Viza, aty ku kërkohet (ju ndihmojmë me aplikimin)', 'Taksa turistike e hotelit (Tourism Dirham), paguhet në hotel', 'Sigurimi i udhëtimit'],
    dates: [['2026-12-29', 5]]
  },
  {
    id: 'zanzibar-plazh', mood: 'zanzibar', dest: 'zanzibar', cats: ['beach', 'honeymoon', 'family'], rank: 4,
    title: 'Zanzibar, Nungwi dhe Kendwa', board: 'ZANZIBAR',
    sub: 'Plazhet e veriut të ishullit, ku zbatica ndihet më pak dhe perëndimet janë më të bukurat.',
    route: ['PRN', 'ZNZ'], via: 'Me një ndalesë',
    nights: 7, stay: 'Resort 4★ në plazh', meal: 'All Inclusive',
    price: 1590, commission: .09, child: .65, single: .5,
    scene: 'zanzibar', tag: 'All Inclusive',
    highlights: [
      'Resort në plazh me rërë të bardhë, në Nungwi ose Kendwa',
      'Stone Town, qyteti i vjetër nën mbrojtjen e UNESCO-s',
      'Prison Island dhe breshkat gjigante',
      'Safari Blue: lundrim me dhow, snorkeling dhe drekë me fruta deti'
    ],
    options: [
      { name: 'Hoteli', choices: [{ l: 'Resort 4★', d: 0 }, { l: 'Resort 5★', d: 420 }, { l: 'Boutique 5★ me vila', d: 890 }] },
      { name: 'Ekskursionet', choices: [{ l: 'Pa ekskursione', d: 0 }, { l: 'Stone Town dhe Prison Island', d: 95 }, { l: 'Paketa e plotë me Safari Blue', d: 210 }] }
    ],
    days: [
      ['Prishtinë – Zanzibar', 'Fluturim me një ndalesë dhe transfer në resort.'],
      ['Ditët në plazh', 'All Inclusive në resort. Ekskursione sipas paketës: Stone Town, Prison Island, Safari Blue, pylli Jozani me majmunët colobus të kuq.', 6],
      ['Kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina, me një ndalesë', 'Transferet aeroport – hotel – aeroport', '7 netë All Inclusive', 'Asistencë nga BCT Travel'],
    excl: ['Viza dhe sigurimi i udhëtimit', 'Ekskursionet, kur nuk janë zgjedhur në paketë', 'Shpenzimet personale'],
    dates: [['2026-11-20', 7], ['2026-12-26', 4], ['2027-01-15', 9], ['2027-02-12', 8], ['2027-07-09', 10]]
  },
  {
    id: 'antalya-uai', mood: 'antalya', dest: 'antalya', cats: ['beach', 'family', 'earlybooking'], rank: 5,
    title: 'Antalya Ultra All Inclusive', board: 'ANTALYA',
    sub: 'Resorte 5★ në Side, Lara dhe Belek, me fluturim charter direkt nga Prishtina. Çmime Early Booking për verën 2027.',
    route: ['PRN', 'AYT'], via: 'Charter direkt nga Prishtina, rreth dy orë',
    nights: 7, stay: 'Resort 5★', meal: 'Ultra All Inclusive',
    price: 679, old: 849, commission: .10, child: .4, single: .5,
    scene: 'antalya', tag: 'Charter direkt',
    highlights: [
      'Fluturim charter direkt nga Prishtina, rreth dy orë',
      'Ultra All Inclusive me aquapark dhe mini-klub për fëmijët',
      'Plazh me rërë dhe pishina në çdo resort',
      'Çmim Early Booking, deri në 20% më i ulët se në sezon'
    ],
    options: [
      { name: 'Zona dhe hoteli', choices: [{ l: 'Side, 5★', d: 0 }, { l: 'Lara, 5★', d: 80 }, { l: 'Belek, 5★ Deluxe', d: 210 }] },
      { name: 'Dhoma', choices: [{ l: 'Standarde', d: 0 }, { l: 'Familjare', d: 95 }, { l: 'Swim-up', d: 240 }] }
    ],
    days: [
      ['Prishtinë – Antalya', 'Fluturim charter direkt dhe transfer në resort.'],
      ['Ditët në resort', 'Ultra All Inclusive. Opsionale: ujëvara Düden, qyteti i vjetër Kaleiçi, rafting në Köprülü.', 6],
      ['Kthimi', 'Transfer në aeroport dhe fluturim charter për në Prishtinë.']
    ],
    incl: ['Fluturim charter kthyes nga Prishtina', 'Transferet aeroport – hotel – aeroport', '7 netë Ultra All Inclusive', 'Asistencë nga BCT Travel'],
    excl: ['Sigurimi i udhëtimit', 'Ekskursionet opsionale'],
    dates: [['2027-05-29', 20], ['2027-06-12', 14], ['2027-06-26', 9], ['2027-07-10', 6], ['2027-07-24', 4], ['2027-08-07', 5], ['2027-08-21', 11], ['2027-09-04', 18]]
  },
  {
    id: 'bodrum-uai', mood: 'bodrum', dest: 'bodrum', cats: ['beach', 'family', 'earlybooking'], rank: 6,
    title: 'Bodrum Ultra All Inclusive', board: 'BODRUM',
    sub: 'Resorte 5★ me plazh privat në gjiret e Bodrumit, me fluturim charter direkt nga Prishtina.',
    route: ['PRN', 'BJV'], via: 'Charter direkt nga Prishtina',
    nights: 7, stay: 'Resort 5★', meal: 'Ultra All Inclusive',
    price: 729, old: 899, commission: .10, child: .4, single: .5,
    scene: 'bodrum', tag: 'Charter direkt',
    highlights: [
      'Fluturim charter direkt nga Prishtina',
      'Resort 5★ me plazh privat dhe skelë',
      'Kalaja e Shën Pjetrit dhe marina e Bodrumit',
      'Mbrëmjet në Bodrum, Yalıkavak dhe Gümbet'
    ],
    options: [
      { name: 'Zona dhe hoteli', choices: [{ l: 'Turgutreis, 5★', d: 0 }, { l: 'Torba, 5★', d: 90 }, { l: 'Yalıkavak, 5★ Deluxe', d: 260 }] },
      { name: 'Dhoma', choices: [{ l: 'Standarde', d: 0 }, { l: 'Me pamje nga deti', d: 110 }, { l: 'Suitë familjare', d: 190 }] }
    ],
    days: [
      ['Prishtinë – Bodrum', 'Fluturim charter direkt dhe transfer në resort.'],
      ['Ditët në resort', 'Ultra All Inclusive. Opsionale: lundrim me gulet, kalaja e Shën Pjetrit, Efesi.', 6],
      ['Kthimi', 'Transfer në aeroport dhe fluturim charter për në Prishtinë.']
    ],
    incl: ['Fluturim charter kthyes nga Prishtina', 'Transferet aeroport – hotel – aeroport', '7 netë Ultra All Inclusive', 'Asistencë nga BCT Travel'],
    excl: ['Sigurimi i udhëtimit', 'Ekskursionet opsionale'],
    dates: [['2027-05-22', 22], ['2027-06-05', 15], ['2027-06-19', 10], ['2027-07-03', 5], ['2027-07-17', 3], ['2027-07-31', 6], ['2027-08-14', 9], ['2027-08-28', 16]]
  },
  {
    id: 'maldive-smart', mood: 'maldive-dusk', dest: 'maldive', cats: ['beach'], rank: 7,
    title: 'Maldive me buxhet: ishull lokal dhe resort', board: 'MALDIVE SMART',
    sub: 'Tri netë në një ishull lokal dhe katër netë në resort 4★: mënyra më e mençur për t’i parë Maldivet.',
    route: ['TIA/SKP', 'MLE'], via: 'Nisje nga Tirana ose Shkupi, sipas kompanisë ajrore, me një ndalesë',
    nights: 7, stay: 'Guesthouse dhe resort 4★', meal: 'Mëngjes, pastaj gjysmë pension',
    price: 1790, commission: .09, child: .7, single: .55,
    scene: 'maldives', sceneOpts: { sunset: true }, tag: 'Ishull lokal + resort',
    highlights: [
      'Ekskursion me varkë: delfinët dhe një ishull rëre në mes të oqeanit',
      'Plazh i dedikuar për turistët në ishullin lokal',
      'Katër netë në resort me lagunë dhe pishinë',
      'Jeta e vërtetë e Maldiveve, para luksit të resortit'
    ],
    options: [
      { name: 'Resorti', choices: [{ l: 'Beach Bungalow 4★', d: 0 }, { l: 'Water Bungalow 4★', d: 420 }, { l: 'Resort 5★', d: 690 }] }
    ],
    days: [
      ['Tiranë ose Shkup – Malé – ishulli lokal', 'Fluturim me një ndalesë dhe transfer me skaf deri në ishullin lokal.'],
      ['Ishulli lokal', 'Snorkeling, ekskursioni me delfinët dhe ishulli i rërës, perëndimi nga skela.', 2],
      ['Transfer në resort', 'Me skaf në resortin 4★, me gjysmë pension.'],
      ['Ditët në resort', 'Laguna, pishina dhe sportet ujore.', 3],
      ['Kthimi', 'Transfer në Malé dhe fluturim për në Tiranë ose Shkup.']
    ],
    incl: ['Fluturim kthyes nga Tirana ose Shkupi, me një ndalesë', 'Transferet me skaf', '3 netë në guesthouse me mëngjes', '4 netë në resort 4★ me gjysmë pension', 'Ekskursioni me delfinët dhe ishullin e rërës', 'Asistencë nga BCT Travel'],
    excl: ['Sigurimi i udhëtimit', 'Ekskursionet e tjera opsionale', 'Shpenzimet personale'],
    dates: [['2026-11-21', 9], ['2027-01-23', 7], ['2027-02-27', 5], ['2027-04-10', 10]]
  },
  {
    id: 'dubai-abudhabi', mood: 'desert', dest: 'dubai', cats: ['city', 'family'], rank: 8,
    title: 'Dubai dhe Abu Dhabi', board: 'DUBAI+ABU DHABI',
    sub: 'Gjashtë netë mes rrokaqiejve, dunave dhe Xhamisë së Bardhë të Abu Dhabit.',
    route: ['PRN', 'DXB'], via: 'Nga Prishtina',
    nights: 6, stay: 'Hotel 4★', meal: 'Mëngjes',
    price: 949, commission: .10, child: .65, single: .7,
    scene: 'dubai', tag: 'Qytet + shkretëtirë',
    highlights: [
      'Burj Khalifa, Dubai Mall dhe shfaqja e shatërvanëve',
      'Safari në shkretëtirë me xhip mbi duna',
      'Xhamia Sheikh Zayed në Abu Dhabi',
      'Abra mbi Dubai Creek dhe tregjet e arit dhe të erëzave'
    ],
    options: [
      { name: 'Hoteli', choices: [{ l: '4★ në Deira', d: 0 }, { l: '4★ në Downtown', d: 160 }, { l: '5★ në plazh, JBR', d: 390 }] },
      { name: 'Aktivitete shtesë', choices: [{ l: 'Asnjë', d: 0 }, { l: 'Darkë në lundrim me dhow', d: 65 }, { l: 'Aquaventure dhe Ferrari World', d: 210 }] }
    ],
    days: [
      ['Mbërritja', 'Fluturim nga Prishtina dhe transfer në hotel.'],
      ['Dubai i vjetër dhe i ri', 'Abra mbi Dubai Creek, tregu i arit dhe i erëzave, Burj Khalifa dhe shatërvanët.'],
      ['Abu Dhabi', 'Xhamia Sheikh Zayed dhe Corniche. Opsionale: Louvre Abu Dhabi.'],
      ['Shkretëtira', 'Paradite e lirë, pasdite safari me xhip dhe darkë BBQ.'],
      ['Ditë të lira', 'Plazh, parqe ujore ose blerje.', 2],
      ['Kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina', 'Transferet', '6 netë me mëngjes', 'Tur i Dubait dhe tur në Abu Dhabi', 'Safari në shkretëtirë me darkë', 'Asistencë nga BCT Travel'],
    excl: ['Viza, aty ku kërkohet (ju ndihmojmë me aplikimin)', 'Hyrja në Burj Khalifa', 'Taksa turistike e hotelit, paguhet në hotel'],
    dates: [['2026-11-07', 10], ['2026-11-28', 7], ['2027-02-06', 8], ['2027-03-20', 9], ['2027-04-17', 10]]
  },
  {
    id: 'bodrum-gulet', mood: 'aegean-dusk', dest: 'bodrum', cats: ['luxury', 'honeymoon', 'beach'], rank: 9,
    title: 'Bodrum luks me gulet privat', board: 'BODRUM GULET',
    sub: 'Hotel butik 5★ në Yalıkavak dhe një ditë lundrim privat me gulet nëpër gjiret e Egjeut.',
    route: ['PRN', 'BJV'], via: 'Charter direkt nga Prishtina',
    nights: 7, stay: 'Hotel butik 5★', meal: 'Mëngjes',
    price: 1290, commission: .09, child: .6, single: .6,
    scene: 'bodrum', sceneOpts: { gulet: true }, tag: 'Gulet privat',
    highlights: [
      'Gulet privat për një ditë: gjire të fshehta, not dhe drekë me peshk të freskët',
      'Hotel butik 5★ në Yalıkavak, pranë marinës',
      'Transfer privat nga aeroporti',
      'Ritëm i qetë, larg resorteve të mëdha'
    ],
    options: [
      { name: 'Dhoma', choices: [{ l: 'Deluxe', d: 0 }, { l: 'Suitë me pishinë private', d: 540 }] },
      { name: 'Guleti', choices: [{ l: 'Një ditë', d: 0 }, { l: 'Dy ditë', d: 270 }] }
    ],
    days: [
      ['Prishtinë – Bodrum', 'Fluturim charter direkt dhe transfer privat në hotel.'],
      ['Yalıkavak dhe Bodrumi', 'Marina, plazhet dhe qyteti i vjetër, në ritmin tuaj.', 2],
      ['Dita me gulet', 'Lundrim privat nëpër gjiret e Egjeut, me ndalesa për not dhe drekë në bord.'],
      ['Ditë të lira', 'Spa, plazh ose ekskursion opsional.', 3],
      ['Kthimi', 'Transfer privat në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim charter kthyes nga Prishtina', 'Transfer privat aeroport – hotel – aeroport', '7 netë në hotel butik 5★ me mëngjes', 'Një ditë me gulet privat, me drekë', 'Asistencë nga BCT Travel'],
    excl: ['Sigurimi i udhëtimit', 'Pijet në gulet', 'Shpenzimet personale'],
    dates: [['2027-06-05', 6], ['2027-06-26', 6], ['2027-09-11', 6]]
  },
  {
    id: 'laponi-aurora', mood: 'laponi', dest: 'laponi', cats: ['rare', 'honeymoon'], rank: 10,
    title: 'Aurora në Laponi', board: 'LAPONI AURORA',
    sub: 'Dy netë në iglo prej xhami nën dritat e veriut, safari me huski dhe Rrethi Polar Arktik.',
    route: ['PRN', 'RVN'], via: 'Me një ndalesë',
    nights: 4, stay: 'Iglo xhami dhe hotel 4★', meal: 'Gjysmë pension',
    price: 2190, commission: .10, child: .8, single: .6,
    scene: 'lapland', tag: 'Grup deri në 12 veta',
    highlights: [
      'Dy netë në iglo prej xhami, me aurorën mbi shtrat kur qielli është i kthjellët',
      'Safari me qen huski dhe vizitë në një fermë drenushash',
      'Rrethi Polar Arktik dhe fshati i Santa Claus-it në Rovaniemi',
      'Veshje termike dimërore të përfshira'
    ],
    note: 'Aurora është fenomen natyror: shihet shpesh nga dhjetori deri në mars, por nuk mund të garantohet.',
    options: [
      { name: 'Akomodimi', choices: [{ l: '2 netë iglo, 2 netë hotel', d: 0 }, { l: '4 netë iglo', d: 690 }] },
      { name: 'Aktivitetet', choices: [{ l: 'Huski dhe drenusha', d: 0 }, { l: 'Shto motor bore natën', d: 230 }] }
    ],
    days: [
      ['Prishtinë – Rovaniemi', 'Fluturim me një ndalesë, transfer dhe marrja e veshjeve termike.'],
      ['Huski dhe Santa Claus', 'Safari me huski në pyll dhe Rrethi Polar Arktik.'],
      ['Igloja prej xhami', 'Transfer në iglo. Natën, kërkimi i aurorës me guidë.'],
      ['Drenushat dhe sauna', 'Fermë drenushash dhe sauna finlandeze. Nata e dytë në iglo.'],
      ['Kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina, me një ndalesë', 'Transferet', '2 netë iglo dhe 2 netë hotel 4★, gjysmë pension', 'Safari me huski dhe ferma e drenushave', 'Veshje termike', 'Asistencë nga BCT Travel'],
    excl: ['Sigurimi i udhëtimit', 'Aktivitetet opsionale'],
    dates: [['2026-12-17', 4], ['2027-01-14', 6], ['2027-02-11', 8], ['2027-03-11', 8]]
  },
  {
    id: 'jordani-petra', mood: 'jordani', dest: 'jordani', cats: ['rare', 'culture'], rank: 11,
    title: 'Petra dhe Wadi Rum', board: 'PETRA+WADI RUM',
    sub: 'Qyteti rozë i Petrës, një natë në kupolë nën yjet e shkretëtirës dhe noti në Detin e Vdekur.',
    route: ['PRN', 'AMM'], via: 'Me një ndalesë',
    nights: 6, stay: 'Hotel 4★ dhe kamp me kupola', meal: 'Gjysmë pension',
    price: 1390, commission: .10, child: .75, single: .45,
    scene: 'jordan', tag: 'Grup deri në 12 veta',
    highlights: [
      'Petra me guidë: Siq-u, Thesari dhe Manastiri',
      'Natë në kupolë panoramike në Wadi Rum, Lugina e Hënës',
      'Xhip 4×4 në shkretëtirë dhe perëndimi mbi shkëmbinjtë e kuq',
      'Noti në Detin e Vdekur, rreth 430 metra nën nivelin e detit'
    ],
    options: [
      { name: 'Kampi në Wadi Rum', choices: [{ l: 'Kupolë standarde', d: 0 }, { l: 'Kupolë panoramike', d: 180 }] },
      { name: 'Petra', choices: [{ l: 'Vizitë ditore', d: 0 }, { l: 'Shto Petrën natën', d: 45 }] }
    ],
    days: [
      ['Prishtinë – Aman', 'Fluturim me një ndalesë dhe transfer në hotel.'],
      ['Xherashi dhe Amani', 'Qyteti romak i Xherashit dhe kalaja e Amanit.'],
      ['Rruga e Mbretërve', 'Mali Nebo dhe Madaba, pastaj vazhdimi drejt Petrës.'],
      ['Petra', 'Gjithë dita në Petra me guidë, nga Siq-u deri te Manastiri.'],
      ['Wadi Rum', 'Xhip 4×4, perëndimi në shkretëtirë dhe nata në kupolë.'],
      ['Deti i Vdekur', 'Not në Detin e Vdekur dhe pushim në resort.'],
      ['Kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina, me një ndalesë', 'Transport privat me guidë', '5 netë hotel 4★ dhe 1 natë kamp, gjysmë pension', 'Hyrjet në Petra, Xherash dhe Wadi Rum', 'Asistencë nga BCT Travel'],
    excl: ['Viza, aty ku kërkohet (ju ndihmojmë me aplikimin)', 'Sigurimi i udhëtimit', 'Bakshishet'],
    dates: [['2026-11-07', 8], ['2027-03-13', 10], ['2027-04-10', 6], ['2027-05-01', 9]]
  },
  {
    id: 'seychelles-ishujt', mood: 'seychelles', dest: 'seychelles', cats: ['rare', 'beach', 'honeymoon'], rank: 12,
    title: 'Seychelles: Mahé, Praslin dhe La Digue', board: 'SEYCHELLES',
    sub: 'Tri ishuj, plazhe me shkëmbinj graniti dhe pylli i palmave coco de mer.',
    route: ['PRN', 'SEZ'], via: 'Me një ndalesë',
    nights: 9, stay: 'Hotele butik 4★', meal: 'Mëngjes',
    price: 2790, commission: .09, child: .7, single: .55,
    scene: 'seychelles', tag: 'Tre ishuj',
    highlights: [
      'Anse Source d’Argent në La Digue, me biçikletë',
      'Vallée de Mai në Praslin, pylli i palmave coco de mer nën mbrojtjen e UNESCO-s',
      'Ishulli Curieuse dhe breshkat gjigante',
      'Tragetet mes ishujve të përfshira'
    ],
    options: [
      { name: 'Hotelet', choices: [{ l: 'Butik 4★', d: 0 }, { l: 'Resort 5★', d: 1150 }] },
      { name: 'Pensioni', choices: [{ l: 'Mëngjes', d: 0 }, { l: 'Gjysmë pension', d: 320 }] }
    ],
    days: [
      ['Prishtinë – Mahé', 'Fluturim me një ndalesë dhe transfer në hotel.'],
      ['Mahé', 'Plazhi Beau Vallon dhe tregu i Victorias.'],
      ['Praslin', 'Traget për në Praslin dhe pasdite në Anse Lazio.'],
      ['Vallée de Mai', 'Pylli i palmave coco de mer.'],
      ['Curieuse dhe St Pierre', 'Breshkat gjigante dhe snorkeling.'],
      ['La Digue', 'Traget i shkurtër, biçikleta dhe Anse Source d’Argent.', 2],
      ['Kthim në Mahé', 'Traget dhe ditë të lira në plazh.', 2],
      ['Kthimi', 'Transfer në aeroport dhe fluturim për në Prishtinë.']
    ],
    incl: ['Fluturim kthyes nga Prishtina, me një ndalesë', 'Tragetet dhe transferet', '9 netë me mëngjes', 'Ekskursioni Curieuse dhe St Pierre', 'Asistencë nga BCT Travel'],
    excl: ['Autorizimi elektronik i udhëtimit për Seychelles (e plotësojmë bashkë)', 'Sigurimi i udhëtimit', 'Biçikletat në La Digue'],
    dates: [['2026-11-12', 6], ['2027-04-08', 8], ['2027-05-06', 10]]
  },
  {
    id: 'japoni-sakura', mood: 'japoni', dest: 'japoni', cats: ['rare', 'culture'], rank: 13,
    title: 'Japonia në kohën e sakurës', board: 'JAPONI SAKURA',
    sub: 'Tokio, Mali Fuji, Kioto dhe Osaka, kur lulëzojnë qershitë.',
    route: ['TIA/SKP', 'HND'], via: 'Nisje nga Tirana ose Shkupi, sipas kompanisë ajrore, me një ndalesë',
    nights: 10, stay: 'Hotele 4★ dhe një natë ryokan', meal: 'Mëngjes',
    price: 3590, commission: .08, child: .85, single: .5,
    scene: 'japan', tag: 'Grup deri në 12 veta',
    highlights: [
      'Treni i shpejtë Shinkansen nga Tokio në Kioto',
      'Një natë në ryokan tradicional me onsen në Hakone',
      'Tempujt e Kiotos dhe pylli i bambusë në Arashiyama',
      'Lulëzimi i qershive, zakonisht nga fundi i marsit deri në fillim të prillit'
    ],
    options: [
      { name: 'Hotelet', choices: [{ l: '4★', d: 0 }, { l: '5★', d: 890 }] },
      { name: 'Shtesë', choices: [{ l: 'Pa shtesë', d: 0 }, { l: 'Nara dhe Hiroshima', d: 340 }] }
    ],
    days: [
      ['Tiranë ose Shkup – Tokio', 'Fluturim me një ndalesë, nga Tirana ose Shkupi sipas kompanisë ajrore.'],
      ['Tokio', 'Asakusa, Shibuya dhe parqet me qershi.', 3],
      ['Hakone dhe Fuji', 'Liqeni Ashi, pamje nga Fuji dhe nata në ryokan.'],
      ['Kioto', 'Shinkansen për në Kioto, Fushimi Inari, Kiyomizu-dera dhe Arashiyama.', 3],
      ['Osaka', 'Kalaja e Osakës dhe ushqimi i rrugës në Dotonbori.', 2],
      ['Kthimi', 'Fluturim për në Tiranë ose Shkup.']
    ],
    incl: ['Fluturim kthyes nga Tirana ose Shkupi, me një ndalesë', 'Treni Shinkansen sipas programit', '9 netë hotel 4★ dhe 1 natë ryokan me darkë', 'Guidë gjatë turit', 'Asistencë nga BCT Travel'],
    excl: ['Viza, aty ku kërkohet (ju ndihmojmë me aplikimin)', 'Sigurimi i udhëtimit', 'Drekat dhe darkat, përveç ryokan-it'],
    dates: [['2027-03-25', 8], ['2027-04-01', 6]]
  }
];

/* Bileta avioni: destinacionet me nisje nga Prishtina.
   new: true = linjë e re (shfaqet me shenjën "E re"). major: true = emri shfaqet mbi glob. */
BCT.flightCountries = {
  DE: ['Gjermania', 'Gjermani'], CH: ['Zvicra', 'Zvicër'], SE: ['Suedia', 'Suedi'], IT: ['Italia', 'Itali'],
  BE: ['Belgjika', 'Belgjikë'], FR: ['Franca', 'Francë'], AT: ['Austria', 'Austri'], NO: ['Norvegjia', 'Norvegji'],
  FI: ['Finlanda', 'Finlandë'], GB: ['Mbretëria e Bashkuar', 'Mbretërinë e Bashkuar'], LU: ['Luksemburgu', 'Luksemburg'],
  SI: ['Sllovenia', 'Slloveni'], SK: ['Sllovakia', 'Sllovaki'], MK: ['Maqedonia e Veriut', 'Maqedoninë e Veriut']
};
BCT.flights = [
  { code: 'BER', city: 'Berlin Brandenburg', c: 'DE', lat: 52.37, lon: 13.50, new: true, major: true },
  { code: 'BRE', city: 'Bremen', c: 'DE', lat: 53.05, lon: 8.79 },
  { code: 'DTM', city: 'Dortmund', c: 'DE', lat: 51.52, lon: 7.61 },
  { code: 'DUS', city: 'Düsseldorf', c: 'DE', lat: 51.29, lon: 6.77, major: true },
  { code: 'HHN', city: 'Frankfurt Hahn', c: 'DE', lat: 49.95, lon: 7.26 },
  { code: 'HAM', city: 'Hamburg', c: 'DE', lat: 53.63, lon: 9.99, new: true, major: true },
  { code: 'HAJ', city: 'Hannover', c: 'DE', lat: 52.46, lon: 9.69 },
  { code: 'FKB', city: 'Karlsruhe / Baden-Baden', c: 'DE', lat: 48.78, lon: 8.08, new: true },
  { code: 'CGN', city: 'Këln / Bon', c: 'DE', lat: 50.87, lon: 7.14 },
  { code: 'FMM', city: 'Memmingen / Mynih Perëndim', c: 'DE', lat: 47.99, lon: 10.24 },
  { code: 'MUC', city: 'Mynih', c: 'DE', lat: 48.35, lon: 11.79, major: true },
  { code: 'FMO', city: 'Münster / Osnabrück', c: 'DE', lat: 52.13, lon: 7.68 },
  { code: 'NUE', city: 'Nürnberg', c: 'DE', lat: 49.50, lon: 11.08 },
  { code: 'STR', city: 'Shtutgart', c: 'DE', lat: 48.69, lon: 9.22 },
  { code: 'ZRH', city: 'Zürich', c: 'CH', lat: 47.46, lon: 8.55, major: true },
  { code: 'GVA', city: 'Gjenevë', c: 'CH', lat: 46.24, lon: 6.11, major: true },
  { code: 'BSL', city: 'Basel-Mulhouse-Freiburg', c: 'FR', lat: 47.59, lon: 7.53, new: true },
  { code: 'MMX', city: 'Malmö', c: 'SE', lat: 55.54, lon: 13.37, new: true, major: true },
  { code: 'GOT', city: 'Göteborg', c: 'SE', lat: 57.66, lon: 12.28 },
  { code: 'VXO', city: 'Växjö', c: 'SE', lat: 56.93, lon: 14.73 },
  { code: 'MXP', city: 'Milano Malpensa', c: 'IT', lat: 45.63, lon: 8.72 },
  { code: 'FCO', city: 'Romë Fiumicino', c: 'IT', lat: 41.80, lon: 12.25, new: true, major: true },
  { code: 'TRS', city: 'Trieste', c: 'IT', lat: 45.83, lon: 13.47, new: true },
  { code: 'BRU', city: 'Bruksel', c: 'BE', lat: 50.90, lon: 4.48, major: true },
  { code: 'CRL', city: 'Bruksel Charleroi', c: 'BE', lat: 50.46, lon: 4.45, new: true },
  { code: 'SZG', city: 'Salzburg', c: 'AT', lat: 47.79, lon: 13.00 },
  { code: 'OSL', city: 'Oslo', c: 'NO', lat: 60.19, lon: 11.10, major: true },
  { code: 'HEL', city: 'Helsinki', c: 'FI', lat: 60.32, lon: 24.96, major: true },
  { code: 'LTN', city: 'Londër Luton', c: 'GB', lat: 51.87, lon: -0.37, major: true },
  { code: 'LUX', city: 'Luksemburg', c: 'LU', lat: 49.63, lon: 6.21 },
  { code: 'LJU', city: 'Lubjanë', c: 'SI', lat: 46.22, lon: 14.46 },
  { code: 'BTS', city: 'Bratislavë', c: 'SK', lat: 48.17, lon: 17.21 },
  { code: 'OHD', city: 'Ohër', c: 'MK', lat: 41.18, lon: 20.74 }
];

/* Fotot e ofertave: [emri i fotos, cila pjesë e fotos duket (horizontal vertikal)].
   Fotot vetë shtohen te BCT.photoSrc gjatë ndërtimit të faqes. Për të ndryshuar foton e një oferte, ndryshoni emrin këtu. */
BCT.offerPhotos = {
  'maldive-vila': ['maldives', '50% 40%'],
  'maldive-smart': ['maldives', '28% 72%'],
  'zanzibar-safari': ['safari', '62% 55%'],
  'zanzibar-plazh': ['zanzibar', '50% 62%'],
  'dubai-viti-ri': ['dubai', '50% 22%'],
  'dubai-abudhabi': ['dubai', '50% 72%'],
  'antalya-uai': ['antalya', '50% 38%'],
  'bodrum-uai': ['bodrum', '72% 40%'],
  'bodrum-gulet': ['bodrum', '18% 88%'],
  'laponi-aurora': ['lapland', '50% 32%'],
  'jordani-petra': ['petra', '50% 55%'],
  'seychelles-ishujt': ['seychelles', '38% 50%'],
  'japoni-sakura': ['japan', '50% 22%']
};
BCT.destPhotos = { maldive: 'maldives', zanzibar: 'safari', dubai: 'dubai', antalya: 'antalya', bodrum: 'bodrum', laponi: 'lapland', jordani: 'petra', seychelles: 'seychelles', japoni: 'japan' };
