/* Teks antarmuka dua bahasa. Tambah kunci baru di kedua bahasa sekaligus. */
(function () {
  const DICT = {
    id: {
      appName: 'Purrfect Tense',
      menu: 'Menu utama',
      navHome: 'Observatorium',
      navLessons: 'Materi',
      navQuiz: 'Menara Kuis',
      navDetector: 'Detector · Segera',
      modeToDay: 'Ganti ke mode siang',
      modeToNight: 'Ganti ke mode malam',
      langGroup: 'Bahasa',
      eyebrow: 'Puncak Menara Istana',
      title: 'Jam Kosmik',
      hint: 'Drag untuk memutar, scroll untuk zoom, klik planet untuk mendarat.',
      canvasLabel: 'Orrery 3D yang bisa diputar. Gunakan tuas waktu di bawah untuk menjelajah tenses.',
      err3d: 'Mode 3D tidak bisa dimuat di browser ini. Coba Chrome, Edge, atau Safari terbaru.',
      lever: 'Tuas Waktu',
      past: 'Masa Lalu',
      now: 'Sekarang',
      future: 'Masa Depan',
      prev: 'Mundur ke masa lalu',
      next: 'Maju ke masa depan',
      gears: 'Roda Gigi',
      gearsHint: 'Setiap tense yang kamu kuasai memasang satu roda gigi.',
      planet: 'Planet',
      level: 'Level',
      enter: 'Masuki Planet',
      back: 'Kembali ke Orrery',
      lessonsTitle: 'Peta 16 Tenses',
      lessonsLede: 'Delapan planet, dua tense di tiap planet. Makin jauh dari matahari, makin menantang.',
      sheet: 'Lembar Cetak Biru',
      soon: 'Segera hadir',
      lessonSoon: 'Materi lengkap sedang dirakit di tahap berikutnya.',
      quizTitle: 'Menara Kuis',
      quizLede: 'Lima lantai, dari Gerbang sampai Observatorium. Jawab dengan tepat untuk membuka setiap pintu.',
      quizSoon: 'Menara sedang dibangun. Pintu pertama dibuka di tahap berikutnya.',
      floors: ['Gerbang', 'Tangga Spiral', 'Lorong Besar', 'Pintu Tersembunyi', 'Observatorium'],
      toHome: 'Kembali ke Observatorium',
      smallTitle: 'Jam Kosmik butuh layar lebar',
      smallBody: 'Observatorium ini dirancang untuk laptop atau komputer, supaya mesin waktunya bisa berputar penuh.',
      smallCopy: 'Salin link untuk laptop',
      smallCopied: 'Link tersalin!',
      smallNote: 'Paling nyaman di layar 1024 px ke atas.',
      backToLab: '← Starry Lab'
    },
    en: {
      appName: 'Purrfect Tense',
      menu: 'Main menu',
      navHome: 'Observatory',
      navLessons: 'Lessons',
      navQuiz: 'Quiz Tower',
      navDetector: 'Detector · Soon',
      modeToDay: 'Switch to day mode',
      modeToNight: 'Switch to night mode',
      langGroup: 'Language',
      eyebrow: 'Top of the Castle Tower',
      title: 'The Cosmic Clock',
      hint: 'Drag to rotate, scroll to zoom, click a planet to land.',
      canvasLabel: 'A 3D orrery you can rotate. Use the time lever below to explore the tenses.',
      err3d: '3D mode could not load in this browser. Try the latest Chrome, Edge or Safari.',
      lever: 'Time Lever',
      past: 'Past',
      now: 'Now',
      future: 'Future',
      prev: 'Back to the past',
      next: 'Forward to the future',
      gears: 'Gears',
      gearsHint: 'Every tense you master installs a new gear.',
      planet: 'Planet',
      level: 'Level',
      enter: 'Enter Planet',
      back: 'Back to the Orrery',
      lessonsTitle: 'Map of 16 Tenses',
      lessonsLede: 'Eight planets, two tenses on each. The farther from the sun, the bigger the challenge.',
      sheet: 'Blueprint Sheet',
      soon: 'Coming soon',
      lessonSoon: 'The full lesson is being assembled in the next stage.',
      quizTitle: 'Quiz Tower',
      quizLede: 'Five floors, from the Gate to the Observatory. Answer correctly to open every door.',
      quizSoon: 'The tower is under construction. The first door opens in the next stage.',
      floors: ['Gate', 'Spiral Stairs', 'Great Hall', 'Hidden Door', 'Observatory'],
      toHome: 'Back to the Observatory',
      smallTitle: 'The Cosmic Clock needs a wide screen',
      smallBody: 'This observatory is designed for laptops and computers, so its time machine can turn freely.',
      smallCopy: 'Copy link for your laptop',
      smallCopied: 'Link copied!',
      smallNote: 'Best on screens 1024 px and wider.',
      backToLab: '← Starry Lab'
    }
  };

  const I18N = {
    lang: 'id',
    t(key) {
      const d = DICT[this.lang] || DICT.id;
      return key in d ? d[key] : (DICT.id[key] !== undefined ? DICT.id[key] : key);
    },
    /* Isi semua elemen yang punya data-i18n / data-i18n-aria */
    apply(root) {
      (root || document).querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
      (root || document).querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', this.t(el.dataset.i18nAria)); });
      document.documentElement.lang = this.lang;
    }
  };

  window.JK = window.JK || {};
  window.JK.i18n = I18N;
})();
