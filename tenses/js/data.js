/* Data planet dan tenses. Nama tense selalu bahasa Inggris (itu yang dipelajari);
   penjelasan punya versi id dan en. */
(function () {
  const PLANETS = [
    { id: 'mercury', name: { id: 'Merkurius', en: 'Mercury' }, lv: 'A1', r: 1.1, h: 0.95, s: 0.12, T: 12, a0: 0.3, tex: ['solid', '#A8917E', '#7E6858'],
      tenses: ['simple-present', 'present-continuous'],
      desc: { id: 'Kebiasaan dan hal yang sedang terjadi sekarang. Pintu masuk semua tenses.', en: 'Habits and things happening right now. The gateway to every tense.' } },
    { id: 'venus', name: { id: 'Venus', en: 'Venus' }, lv: 'A2', r: 1.55, h: 0.84, s: 0.17, T: 18, a0: 2.0, tex: ['bands', ['#F3DDB0', '#E2BF7E', '#F7E7C4', '#D9B26E']],
      tenses: ['present-perfect', 'present-perfect-continuous'],
      desc: { id: 'Pengalaman dan aksi yang masih nyambung sampai sekarang.', en: 'Experiences and actions still connected to now.' } },
    { id: 'earth', name: { id: 'Bumi', en: 'Earth' }, lv: 'A2', r: 2.0, h: 0.73, s: 0.18, T: 24, a0: 4.1, tex: ['earth'],
      tenses: ['simple-past', 'past-continuous'],
      desc: { id: 'Rumah semua cerita tentang yang sudah terjadi.', en: 'Home of every story about what already happened.' } },
    { id: 'mars', name: { id: 'Mars', en: 'Mars' }, lv: 'B1', r: 2.45, h: 0.62, s: 0.14, T: 32, a0: 5.5, tex: ['mars'],
      tenses: ['past-perfect', 'past-perfect-continuous'],
      desc: { id: 'Masa lalu di dalam masa lalu.', en: 'The past inside the past.' } },
    { id: 'jupiter', name: { id: 'Jupiter', en: 'Jupiter' }, lv: 'B1', r: 3.1, h: 0.51, s: 0.42, T: 48, a0: 1.0, tex: ['bands', ['#EBD2AE', '#B9845A', '#F3E1C6', '#C99A6E', '#E8C9A0', '#A9704A']],
      tenses: ['simple-future', 'future-continuous'],
      desc: { id: 'Planet raksasa untuk rencana dan prediksi besar.', en: 'A giant planet for big plans and predictions.' } },
    { id: 'saturn', name: { id: 'Saturnus', en: 'Saturn' }, lv: 'B2', r: 3.75, h: 0.40, s: 0.34, T: 62, a0: 3.4, ring: true, tex: ['bands', ['#FBEFCF', '#E3C88E', '#F2DFB0', '#D6B677']],
      tenses: ['future-perfect', 'future-perfect-continuous'],
      desc: { id: 'Melihat ke belakang dari masa depan.', en: 'Looking back from the future.' } },
    { id: 'uranus', name: { id: 'Uranus', en: 'Uranus' }, lv: 'B2', r: 4.35, h: 0.29, s: 0.24, T: 78, a0: 5.0, tex: ['solid', '#A6E0DA', '#6FB8B2'],
      tenses: ['past-future', 'past-future-continuous'],
      desc: { id: 'Masa depan dilihat dari masa lalu: "would".', en: 'The future seen from the past: "would".' } },
    { id: 'neptune', name: { id: 'Neptunus', en: 'Neptune' }, lv: 'C1', r: 4.9, h: 0.18, s: 0.23, T: 95, a0: 0.4, tex: ['solid', '#6A86E0', '#3F58B5'],
      tenses: ['past-future-perfect', 'past-future-perfect-continuous'],
      desc: { id: 'Tense paling langka, bos terakhir galaksi.', en: 'The rarest tenses, the final boss of the galaxy.' } }
  ];

  const TENSES = {
    'simple-present': { name: 'Simple Present', f: 'S + V1 (s/es)' },
    'present-continuous': { name: 'Present Continuous', f: 'S + am/is/are + V-ing' },
    'present-perfect': { name: 'Present Perfect', f: 'S + have/has + V3' },
    'present-perfect-continuous': { name: 'Present Perfect Continuous', f: 'S + have/has been + V-ing' },
    'simple-past': { name: 'Simple Past', f: 'S + V2' },
    'past-continuous': { name: 'Past Continuous', f: 'S + was/were + V-ing' },
    'past-perfect': { name: 'Past Perfect', f: 'S + had + V3' },
    'past-perfect-continuous': { name: 'Past Perfect Continuous', f: 'S + had been + V-ing' },
    'simple-future': { name: 'Simple Future', f: 'S + will + V1' },
    'future-continuous': { name: 'Future Continuous', f: 'S + will be + V-ing' },
    'future-perfect': { name: 'Future Perfect', f: 'S + will have + V3' },
    'future-perfect-continuous': { name: 'Future Perfect Continuous', f: 'S + will have been + V-ing' },
    'past-future': { name: 'Past Future', f: 'S + would + V1' },
    'past-future-continuous': { name: 'Past Future Continuous', f: 'S + would be + V-ing' },
    'past-future-perfect': { name: 'Past Future Perfect', f: 'S + would have + V3' },
    'past-future-perfect-continuous': { name: 'Past Future Perfect Continuous', f: 'S + would have been + V-ing' }
  };

  /* 9 posisi Tuas Waktu, urut dari masa lalu ke masa depan */
  const LEVER = [
    { tense: 'past-perfect', pre: 'I ', verb: 'had visited', post: ' Bali before 2020.', exp: { id: 'Selesai sebelum kejadian lain di masa lalu', en: 'Finished before another past moment' }, planet: 'mars' },
    { tense: 'simple-past', pre: 'I ', verb: 'visited', post: ' Bali last year.', exp: { id: 'Selesai di waktu tertentu di masa lalu', en: 'Completed at a specific past time' }, planet: 'earth' },
    { tense: 'past-continuous', pre: 'I ', verb: 'was visiting', post: ' Bali when it rained.', exp: { id: 'Sedang berlangsung di satu titik masa lalu', en: 'In progress at a past moment' }, planet: 'earth' },
    { tense: 'present-perfect', pre: 'I ', verb: 'have visited', post: ' Bali twice.', exp: { id: 'Pengalaman yang masih terasa sekarang', en: 'An experience that still matters now' }, planet: 'venus' },
    { tense: 'simple-present', pre: 'I ', verb: 'visit', post: ' Bali every year.', exp: { id: 'Kebiasaan atau fakta', en: 'A habit or a fact' }, planet: 'mercury' },
    { tense: 'present-continuous', pre: 'I ', verb: 'am visiting', post: ' Bali this week.', exp: { id: 'Sedang terjadi, atau rencana pasti', en: 'Happening now, or a fixed plan' }, planet: 'mercury' },
    { tense: 'simple-future', pre: 'I ', verb: 'will visit', post: ' Bali next year.', exp: { id: 'Prediksi atau keputusan spontan', en: 'A prediction or a quick decision' }, planet: 'jupiter' },
    { tense: 'future-continuous', pre: 'I ', verb: 'will be visiting', post: ' Bali this time tomorrow.', exp: { id: 'Akan sedang berlangsung di masa depan', en: 'In progress at a future moment' }, planet: 'jupiter' },
    { tense: 'future-perfect', pre: 'I ', verb: 'will have visited', post: ' Bali by 2030.', exp: { id: 'Sudah selesai sebelum titik masa depan', en: 'Completed before a future point' }, planet: 'saturn' }
  ];

  /* warna titik planet (peta materi & detector) */
  const DOT = { mercury: '#A8917E', venus: '#E2BF7E', earth: '#3A7BD0', mars: '#C2583A', jupiter: '#C99A6E', saturn: '#E3C88E', uranus: '#7CC4BE', neptune: '#4F6AD0' };

  window.JK = window.JK || {};
  window.JK.data = { PLANETS, TENSES, LEVER, DOT };
})();
