/* Isi materi 16 tenses.
   Format tiap tense:
   tag      : tagline {id, en}
   uses     : [[penjelasan id, penjelasan en, contoh], ...]
   forms    : rumus (+), (−), (?) sebagai potongan; fx = contoh tiap rumus
   tl       : timeline { ref: now|past|future|pastfut, asp: simple|cont|perf|perfcont }, tlNote {id, en}
   markers  : penanda waktu
   mistake  : { w: salah, r: benar, why: {id, en} }
   twin     : tense kembaran { to, a, b, na {id,en}, nb {id,en} }
   ex       : contoh easy/medium/hard: [kalimat, catatan id, catatan en]
   quiz     : { verbs: [5 kata kerja dari bank di checker.js] } */
(function () {
  const L = {
    'simple-present': {
      tag: { id: 'Kebiasaan, fakta, dan jadwal: hal yang berulang seperti putaran jam.', en: 'Habits, facts and timetables: things that repeat like the turn of a clock.' },
      uses: [
        ['Kebiasaan atau rutinitas', 'Habits and routines', 'I drink coffee every morning.'],
        ['Fakta umum', 'General facts', 'Water boils at 100°C.'],
        ['Jadwal tetap', 'Fixed timetables', 'The train leaves at seven.'],
        ['Perasaan dan keadaan', 'Feelings and states', 'She loves jazz.']
      ],
      forms: { pos: ['S', 'V1 / V1 + s/es'], neg: ['S', 'do/does + not', 'V1'], q: ['Do/Does', 'S', 'V1?'] },
      fx: ['She works in Jakarta.', "He doesn't eat meat.", 'Do you speak French?'],
      tl: { ref: 'now', asp: 'simple' }, tlNote: { id: 'Berulang: dulu, sekarang, dan nanti', en: 'Repeated: before, now and after' },
      markers: ['always', 'usually', 'often', 'every day', 'sometimes', 'never'],
      mistake: { w: 'She go to school by bus.', r: 'She goes to school by bus.', why: { id: 'He/she/it: kata kerjanya ditambah -s/-es.', en: 'He/she/it: add -s/-es to the verb.' } },
      twin: { to: 'present-continuous', a: 'I work from home.', b: "I'm working from home this week.", na: { id: 'rutin', en: 'routine' }, nb: { id: 'sementara', en: 'temporary' } },
      ex: {
        easy: [['I wake up at six every day.', 'Rutinitas', 'Routine'], ['The sun rises in the east.', 'Fakta', 'Fact'], ['My brother plays the guitar.', 'He/she/it + -s', 'He/she/it + -s']],
        medium: [['The museum opens at nine on weekdays.', 'Jadwal tetap', 'Fixed timetable'], ["She doesn't drink coffee after lunch.", 'Negatif dengan doesn’t', 'Negative with doesn’t'], ['How often do you check your email?', 'Pertanyaan frekuensi', 'Frequency question']],
        hard: [['Most experts agree that regular exercise reduces the risk of heart disease.', 'Fakta umum, gaya IELTS Writing', 'General truth, IELTS Writing style'], ['The chart illustrates how household spending varies across five countries.', 'Mendeskripsikan grafik, IELTS Task 1', 'Describing a chart, IELTS Task 1'], ['In many cities, young people who live alone spend a large share of their income on rent.', 'Kalimat kompleks dengan relative clause', 'Complex sentence with a relative clause']]
      },
      quiz: { verbs: ['work', 'play', 'read', 'cook', 'watch'] }
    },

    'present-continuous': {
      tag: { id: 'Aksi yang sedang berjalan, seperti roda gigi yang sedang berputar.', en: 'An action in motion, like a gear that is still turning.' },
      uses: [
        ['Sedang terjadi sekarang', 'Happening right now', 'She is reading.'],
        ['Situasi sementara', 'A temporary situation', "I'm living in Johor this month."],
        ['Rencana yang sudah pasti', 'A fixed future plan', "We're flying tomorrow."],
        ['Kebiasaan yang mengganggu', 'An annoying habit', "He's always complaining."]
      ],
      forms: { pos: ['S', 'am/is/are', 'V-ing'], neg: ['S', 'am/is/are + not', 'V-ing'], q: ['Am/Is/Are', 'S', 'V-ing?'] },
      fx: ['They are cooking.', "He isn't sleeping.", 'Are you coming?'],
      tl: { ref: 'now', asp: 'cont' }, tlNote: { id: 'Sudah mulai, sedang berjalan, belum selesai', en: 'Started, still going, not finished yet' },
      markers: ['now', 'right now', 'at the moment', 'currently', 'this week', 'these days'],
      mistake: { w: 'I am agree with you.', r: 'I agree with you.', why: { id: 'Stative verb (agree, know, like) tidak pakai -ing.', en: 'Stative verbs (agree, know, like) do not take -ing.' } },
      twin: { to: 'simple-present', a: "I'm working from home this week.", b: 'I work from home.', na: { id: 'sementara', en: 'temporary' }, nb: { id: 'rutin', en: 'routine' } },
      ex: {
        easy: [['She is reading a book.', 'Sedang terjadi sekarang', 'Happening now'], ['They are playing football now.', 'Penanda waktu: now', 'Time marker: now'], ['I am cooking dinner.', 'Subjek I → am', 'Subject I → am']],
        medium: [['We are visiting our grandparents this weekend.', 'Rencana pasti', 'A fixed plan'], ['He is always complaining about the weather.', 'Kebiasaan yang mengganggu', 'An annoying habit'], ['Prices are rising quickly these days.', 'Situasi yang sedang berubah', 'A changing situation']],
        hard: [['Increasingly, students are turning to online platforms to prepare for IELTS.', 'Tren, gaya IELTS Writing Task 2', 'A trend, IELTS Writing Task 2 style'], ['While the economy is recovering, unemployment is still rising in rural areas.', 'Dua klausa continuous', 'Two continuous clauses'], ["I'm not saying the plan is flawed; I'm suggesting we're underestimating the cost.", 'Continuous untuk melunakkan pendapat', 'Continuous to soften an opinion']]
      },
      quiz: { verbs: ['visit', 'study', 'cook', 'travel', 'watch'] }
    },

    'present-perfect': {
      tag: { id: 'Masa lalu yang jejaknya masih terasa sekarang.', en: 'The past that still leaves a mark on the present.' },
      uses: [
        ['Pengalaman, tanpa waktu spesifik', 'Experience, no specific time', "I've visited Tokyo twice."],
        ['Hasilnya terlihat sekarang', 'A result you can see now', 'She has lost her keys.'],
        ['Baru saja terjadi', 'Something that just happened', "They've just arrived."],
        ['Mulai dulu, masih berlanjut', 'Started before, still true', "We've known each other since 2015."]
      ],
      forms: { pos: ['S', 'have/has', 'V3'], neg: ['S', 'have/has + not', 'V3'], q: ['Have/Has', 'S', 'V3?'] },
      fx: ['She has finished.', "I haven't seen it.", 'Have you eaten?'],
      tl: { ref: 'now', asp: 'perf' }, tlNote: { id: 'Terjadi sebelum sekarang, hasilnya masih terasa', en: 'Happened before now, the result still matters' },
      markers: ['ever', 'never', 'just', 'already', 'yet', 'since', 'for', 'so far'],
      mistake: { w: 'I have seen that film last week.', r: 'I saw that film last week.', why: { id: 'Waktu yang sudah lewat (last week, yesterday) pakai Simple Past.', en: 'A finished time (last week, yesterday) needs Simple Past.' } },
      twin: { to: 'simple-past', a: "I've lost my wallet.", b: 'I lost my wallet yesterday.', na: { id: 'masih hilang sekarang', en: 'still missing now' }, nb: { id: 'waktunya jelas, sudah lewat', en: 'a finished time' } },
      ex: {
        easy: [['I have finished my homework.', 'Hasilnya terasa sekarang', 'Result now'], ['She has never eaten durian.', 'Pengalaman', 'Experience'], ['Have you seen my phone?', 'Pertanyaan', 'Question']],
        medium: [['We have lived in Singapore since 2021.', 'since + titik waktu', 'since + a point in time'], ["They haven't replied to my email yet.", 'yet di kalimat negatif', 'yet in negatives'], ['He has just started a new job.', 'just = baru saja', 'just = a moment ago']],
        hard: [['The number of international students has risen sharply over the past decade.', 'Tren sampai sekarang, IELTS Task 1', 'Trend up to now, IELTS Task 1'], ['Remote work has transformed the way companies recruit talent.', 'Perubahan yang dampaknya terasa sekarang', 'A change with present impact'], ['Never before have so many people had access to free online education.', 'Inversi untuk penekanan', 'Inversion for emphasis']]
      },
      quiz: { verbs: ['finish', 'visit', 'eat', 'write', 'see'] }
    },

    'present-perfect-continuous': {
      tag: { id: 'Aksi yang sudah berjalan lama dan masih terus berlangsung.', en: 'An action that has been going on for a while and is still going.' },
      uses: [
        ['Mulai dulu, masih berlangsung', 'Started before, still going', "I've been studying for two hours."],
        ['Menekankan durasi', 'Stressing how long', "She's been working here since May."],
        ['Baru selesai, jejaknya terlihat', 'Just stopped, the effect is visible', "You're wet! Have you been running?"],
        ['Tren yang sedang berjalan', 'An ongoing trend', 'Prices have been rising all year.']
      ],
      forms: { pos: ['S', 'have/has been', 'V-ing'], neg: ['S', 'have/has not been', 'V-ing'], q: ['Have/Has', 'S', 'been V-ing?'] },
      fx: ["They've been waiting.", "He hasn't been sleeping well.", 'Have you been crying?'],
      tl: { ref: 'now', asp: 'perfcont' }, tlNote: { id: 'Mulai dulu, masih berjalan sampai sekarang', en: 'Started earlier, still running up to now' },
      markers: ['for', 'since', 'all day', 'lately', 'recently', 'how long'],
      mistake: { w: "I am waiting here since nine o'clock.", r: "I have been waiting here since nine o'clock.", why: { id: 'since/for + aksi yang masih berjalan → Present Perfect Continuous.', en: 'since/for + an ongoing action → Present Perfect Continuous.' } },
      twin: { to: 'present-perfect', a: "I've been reading your book.", b: "I've read your book.", na: { id: 'fokus proses, belum tentu selesai', en: 'focus on the activity, maybe unfinished' }, nb: { id: 'sudah selesai, fokus hasil', en: 'finished, focus on the result' } },
      ex: {
        easy: [['I have been learning English for three years.', 'for + durasi', 'for + duration'], ['It has been raining since this morning.', 'since + titik waktu', 'since + a point in time'], ['She has been cooking all afternoon.', 'all + waktu', 'all + time']],
        medium: [['How long have you been living in this city?', 'Bertanya durasi', 'Asking about duration'], ["My eyes hurt because I've been staring at the screen.", 'Jejak aktivitas terlihat sekarang', 'A visible effect of an activity'], ["We haven't been sleeping well lately.", 'Negatif + lately', 'Negative + lately']],
        hard: [['Researchers have been investigating the long-term effects of social media on teenagers.', 'Penelitian yang terus berjalan', 'Ongoing research'], ['Urban populations have been growing steadily, putting pressure on housing.', 'Tren + participle clause', 'Trend + participle clause'], ["I've been meaning to tell you that the deadline has moved.", 'Ungkapan sopan sehari-hari', 'Polite everyday expression']]
      },
      quiz: { verbs: ['study', 'work', 'learn', 'travel', 'read'] }
    },

    'simple-past': {
      tag: { id: 'Cerita yang sudah selesai di waktu yang jelas.', en: 'Stories that finished at a clear time.' },
      uses: [
        ['Selesai di waktu tertentu', 'Finished at a specific time', 'I visited Bali last year.'],
        ['Rangkaian kejadian', 'A sequence of events', 'She opened the door, smiled and sat down.'],
        ['Kebiasaan di masa lalu', 'A past habit', 'We walked to school every day.'],
        ['Keadaan di masa lalu', 'A past state', 'He lived in Bandung as a child.']
      ],
      forms: { pos: ['S', 'V2'], neg: ['S', 'did + not', 'V1'], q: ['Did', 'S', 'V1?'] },
      fx: ['They played football.', "I didn't go.", 'Did you call her?'],
      tl: { ref: 'past', asp: 'simple' }, tlNote: { id: 'Satu titik di masa lalu, sudah selesai', en: 'One finished point in the past' },
      markers: ['yesterday', 'last week', 'ago', 'in 2019', 'when I was a child'],
      mistake: { w: "I didn't went to the party.", r: "I didn't go to the party.", why: { id: 'Setelah did/didn’t, kata kerja kembali ke V1.', en: 'After did/didn’t, the verb goes back to its base form.' } },
      twin: { to: 'present-perfect', a: 'I lost my wallet yesterday.', b: "I've lost my wallet.", na: { id: 'waktunya jelas', en: 'a finished time' }, nb: { id: 'masih hilang sekarang', en: 'still missing now' } },
      ex: {
        easy: [['I watched a movie last night.', 'Regular verb + -ed', 'Regular verb + -ed'], ['She went to the market yesterday.', 'Irregular verb: go → went', 'Irregular verb: go → went'], ["We didn't eat breakfast.", 'Negatif: didn’t + V1', 'Negative: didn’t + base verb']],
        medium: [['When did you start working here?', 'Pertanyaan dengan did', 'Question with did'], ['He bought a new laptop two weeks ago.', 'ago = yang lalu', 'ago'], ['They lived in Surabaya before they moved to Singapore.', 'Keadaan di masa lalu', 'A past state']],
        hard: [['In 1990, only a small fraction of households owned a computer.', 'Data masa lalu, IELTS Task 1', 'Past data, IELTS Task 1'], ['The company launched the campaign, but sales fell short of expectations.', 'Dua kejadian yang dikontraskan', 'Two contrasted events'], ['It was not until she moved abroad that she realised how much she valued her family.', 'Struktur "It was not until…"', 'The "It was not until…" structure']]
      },
      quiz: { verbs: ['visit', 'go', 'eat', 'buy', 'watch'] }
    },

    'past-continuous': {
      tag: { id: 'Adegan yang sedang berjalan di satu titik masa lalu.', en: 'A scene in progress at one moment in the past.' },
      uses: [
        ['Sedang berlangsung di waktu tertentu', 'In progress at a past time', 'At 8 pm I was having dinner.'],
        ['Latar yang dipotong kejadian lain', 'Background interrupted by an event', 'I was cooking when the phone rang.'],
        ['Dua aksi bersamaan', 'Two actions at the same time', 'She was reading while he was watching TV.'],
        ['Suasana cerita', 'Setting the scene', 'The sun was shining and birds were singing.']
      ],
      forms: { pos: ['S', 'was/were', 'V-ing'], neg: ['S', 'was/were + not', 'V-ing'], q: ['Was/Were', 'S', 'V-ing?'] },
      fx: ['They were sleeping.', "I wasn't listening.", 'Were you driving?'],
      tl: { ref: 'past', asp: 'cont' }, tlNote: { id: 'Sedang berjalan saat sesuatu terjadi di masa lalu', en: 'In progress when something happened in the past' },
      markers: ['while', 'when', 'at 7 pm yesterday', 'all evening', 'at that moment'],
      mistake: { w: 'They was playing outside.', r: 'They were playing outside.', why: { id: 'I/he/she/it → was; you/we/they → were.', en: 'I/he/she/it → was; you/we/they → were.' } },
      twin: { to: 'simple-past', a: 'I was cooking when you called.', b: 'I cooked when you called.', na: { id: 'sudah di tengah memasak', en: 'already in the middle of cooking' }, nb: { id: 'mulai memasak setelah ditelepon', en: 'started cooking after the call' } },
      ex: {
        easy: [['I was sleeping at 11 pm.', 'Titik waktu masa lalu', 'A past point in time'], ['They were playing football in the rain.', 'They → were', 'They → were'], ['She was singing in the shower.', 'She → was', 'She → was']],
        medium: [['I was walking home when it started to rain.', 'Dipotong kejadian lain', 'Interrupted action'], ['What were you doing at this time yesterday?', 'Pertanyaan', 'Question'], ['While my mother was cooking, my father was setting the table.', 'Dua aksi bersamaan', 'Two actions at once']],
        hard: [['While the economy was recovering, unemployment remained stubbornly high.', 'Latar + kontras', 'Background + contrast'], ['She was constantly interrupting her colleagues, which annoyed the manager.', 'Kebiasaan mengganggu di masa lalu', 'An annoying past habit'], ['I was wondering if you could review my essay.', 'Permintaan sopan', 'Polite request']]
      },
      quiz: { verbs: ['cook', 'watch', 'read', 'play', 'study'] }
    },

    'past-perfect': {
      tag: { id: 'Masa lalu di dalam masa lalu.', en: 'The past inside the past.' },
      uses: [
        ['Selesai sebelum kejadian lain di masa lalu', 'Finished before another past event', 'The film had started when we arrived.'],
        ['Alasan di masa lalu', 'A reason in the past', 'She was tired because she had worked all night.'],
        ['Pengalaman sampai titik masa lalu', 'Experience up to a past point', 'I had never seen snow before 2019.'],
        ['Reported speech', 'Reported speech', 'He said he had finished the report.']
      ],
      forms: { pos: ['S', 'had', 'V3'], neg: ['S', 'had + not', 'V3'], q: ['Had', 'S', 'V3?'] },
      fx: ['She had left.', "We hadn't met before.", 'Had you eaten?'],
      tl: { ref: 'past', asp: 'perf' }, tlNote: { id: 'Selesai sebelum titik lain di masa lalu', en: 'Finished before another past point' },
      markers: ['before', 'after', 'by the time', 'already', 'never … before', 'when'],
      mistake: { w: 'When I arrived, the train already left.', r: 'When I arrived, the train had already left.', why: { id: 'Kejadian yang lebih dulu pakai had + V3.', en: 'The earlier event takes had + V3.' } },
      twin: { to: 'simple-past', a: 'When I arrived, the film had started.', b: 'When I arrived, the film started.', na: { id: 'film mulai sebelum aku datang', en: 'it started before I came' }, nb: { id: 'film mulai saat aku datang', en: 'it started as I came' } },
      ex: {
        easy: [['I had finished my homework before dinner.', 'before', 'before'], ['She had never flown before that trip.', 'Pengalaman sampai titik masa lalu', 'Experience up to a past point'], ['They had left when I called.', 'Sudah pergi duluan', 'They left earlier']],
        medium: [['By the time we got to the cinema, the movie had already started.', 'by the time', 'by the time'], ["He failed the test because he hadn't studied.", 'Alasan di masa lalu', 'A past reason'], ['Had you ever met her before the wedding?', 'Pertanyaan', 'Question']],
        hard: [['By 2010, the city had doubled its public transport network.', 'Capaian sampai tahun tertentu, IELTS Task 1', 'Achievement by a past year, IELTS Task 1'], ['No sooner had the meeting begun than the power went out.', 'Inversi "No sooner… than"', 'Inversion: "No sooner… than"'], ['She told us that she had already submitted the application.', 'Reported speech', 'Reported speech']]
      },
      quiz: { verbs: ['finish', 'leave', 'eat', 'see', 'write'] }
    },

    'past-perfect-continuous': {
      tag: { id: 'Aksi panjang yang berlangsung sampai titik tertentu di masa lalu.', en: 'A long action running up to a point in the past.' },
      uses: [
        ['Durasi sampai titik masa lalu', 'Duration up to a past point', 'I had been waiting for an hour when she arrived.'],
        ['Penyebab keadaan di masa lalu', 'The cause of a past situation', 'His eyes were red because he had been crying.'],
        ['Aktivitas sebelum perubahan', 'An activity before a change', 'They had been living in Medan before they moved.'],
        ['Reported speech', 'Reported speech', 'She said she had been feeling unwell.']
      ],
      forms: { pos: ['S', 'had been', 'V-ing'], neg: ['S', 'had not been', 'V-ing'], q: ['Had', 'S', 'been V-ing?'] },
      fx: ['We had been driving.', "He hadn't been sleeping.", 'Had you been running?'],
      tl: { ref: 'past', asp: 'perfcont' }, tlNote: { id: 'Berjalan lama sampai titik di masa lalu', en: 'Running for a while up to a past point' },
      markers: ['for', 'since', 'before', 'when', 'how long', 'all day'],
      mistake: { w: 'I had been knowing him for years.', r: 'I had known him for years.', why: { id: 'Stative verb (know, like, own) tidak pakai -ing.', en: 'Stative verbs (know, like, own) do not take -ing.' } },
      twin: { to: 'past-perfect', a: 'She had been painting the room.', b: 'She had painted the room.', na: { id: 'fokus proses, mungkin belum selesai', en: 'focus on the process' }, nb: { id: 'fokus hasil, sudah selesai', en: 'focus on the result, done' } },
      ex: {
        easy: [['I had been studying for hours before the exam.', 'Durasi sebelum titik masa lalu', 'Duration before a past point'], ['It had been raining, so the road was wet.', 'Penyebab keadaan', 'Cause of a situation'], ['They had been playing all morning.', 'all morning', 'all morning']],
        medium: [['How long had you been working there before you quit?', 'Bertanya durasi', 'Asking about duration'], ['She was exhausted because she had been running.', 'Alasan', 'Reason'], ['We had been talking for an hour when the bell rang.', 'Dipotong kejadian lain', 'Interrupted']],
        hard: [['The company had been losing money for years before it finally restructured.', 'Tren sebelum perubahan', 'Trend before a change'], ['Scientists had been warning about the risks long before the crisis began.', 'Peringatan yang berulang', 'Repeated warnings'], ['He admitted that he had been considering resigning for months.', 'Reported speech', 'Reported speech']]
      },
      quiz: { verbs: ['work', 'study', 'play', 'travel', 'cook'] }
    },

    'simple-future': {
      tag: { id: 'Prediksi, janji, dan keputusan tentang masa depan.', en: 'Predictions, promises and decisions about the future.' },
      uses: [
        ['Prediksi', 'Predictions', 'It will rain tomorrow.'],
        ['Keputusan spontan', 'Quick decisions', "I'll get the door."],
        ['Janji atau tawaran', 'Promises and offers', "I'll help you with that."],
        ['Rencana dengan going to', 'Plans with going to', "We're going to move next year."]
      ],
      forms: { pos: ['S', 'will', 'V1'], neg: ['S', 'will + not', 'V1'], q: ['Will', 'S', 'V1?'] },
      fx: ['She will call.', "I won't forget.", 'Will you come?'],
      tl: { ref: 'future', asp: 'simple' }, tlNote: { id: 'Satu titik di masa depan', en: 'One point in the future' },
      markers: ['tomorrow', 'next week', 'soon', 'in 2030', 'probably', 'I think'],
      mistake: { w: 'She will goes to Paris.', r: 'She will go to Paris.', why: { id: 'Setelah will, selalu V1 tanpa -s.', en: 'After will, always the base verb, no -s.' } },
      twin: { to: 'future-continuous', a: 'I will call you at eight.', b: 'I will be working at eight.', na: { id: 'aksinya terjadi jam 8', en: 'the action happens at 8' }, nb: { id: 'sedang berlangsung jam 8', en: 'already in progress at 8' } },
      ex: {
        easy: [['I will call you tomorrow.', 'Janji', 'Promise'], ['It will be sunny this weekend.', 'Prediksi', 'Prediction'], ["I won't tell anyone.", 'Negatif: won’t', 'Negative: won’t']],
        medium: [['Will you help me move on Saturday?', 'Permintaan', 'Request'], ['I think prices will go up next year.', 'Prediksi dengan I think', 'Prediction with I think'], ["We're going to visit Lombok in June.", 'Rencana: going to', 'Plan with going to']],
        hard: [['If governments fail to act, global temperatures will continue to rise.', 'Kalimat kondisional, IELTS Task 2', 'Conditional sentence, IELTS Task 2'], ['Automation will undoubtedly reshape the job market in the coming decades.', 'Prediksi dengan adverb', 'Prediction with an adverb'], ['It is projected that the number of electric cars will triple by 2035.', 'Proyeksi grafik, IELTS Task 1', 'Chart projection, IELTS Task 1']]
      },
      quiz: { verbs: ['visit', 'buy', 'travel', 'call', 'finish'] }
    },

    'future-continuous': {
      tag: { id: 'Aksi yang akan sedang berlangsung di satu titik masa depan.', en: 'An action that will be in progress at a point in the future.' },
      uses: [
        ['Sedang berlangsung di titik masa depan', 'In progress at a future point', 'At nine tomorrow, I will be flying to Tokyo.'],
        ['Hal yang memang akan terjadi', 'Something that will happen anyway', "I'll be passing the shop anyway."],
        ['Menanyakan rencana dengan sopan', 'Asking about plans politely', 'Will you be using the car tonight?'],
        ['Membayangkan situasi masa depan', 'Picturing a future situation', "This time next year, we'll be living in Bali."]
      ],
      forms: { pos: ['S', 'will be', 'V-ing'], neg: ['S', 'will not be', 'V-ing'], q: ['Will', 'S', 'be V-ing?'] },
      fx: ["They'll be waiting.", "I won't be working.", 'Will you be coming?'],
      tl: { ref: 'future', asp: 'cont' }, tlNote: { id: 'Sedang berjalan di satu titik masa depan', en: 'In progress at a future point' },
      markers: ['this time tomorrow', 'at 8 pm tonight', 'next week', 'all day tomorrow', 'soon'],
      mistake: { w: 'This time tomorrow I will lying on the beach.', r: 'This time tomorrow I will be lying on the beach.', why: { id: 'Jangan lupa "be" setelah will.', en: 'Don’t forget "be" after will.' } },
      twin: { to: 'simple-future', a: 'I will be working at eight.', b: 'I will work at eight.', na: { id: 'sedang berlangsung jam 8', en: 'in progress at 8' }, nb: { id: 'mulai bekerja jam 8', en: 'start working at 8' } },
      ex: {
        easy: [['I will be sleeping at midnight.', 'Titik waktu masa depan', 'A future point in time'], ['They will be watching the match tonight.', 'tonight', 'tonight'], ['She will be studying all day tomorrow.', 'all day', 'all day']],
        medium: [['Will you be using the meeting room this afternoon?', 'Bertanya rencana dengan sopan', 'Polite question about plans'], ["Don't call at seven; we'll be having dinner.", 'Peringatan', 'Warning'], ["This time next month, I'll be travelling around Japan.", 'this time next month', 'this time next month']],
        hard: [['In twenty years, most people will be working in jobs that do not exist yet.', 'Prediksi jangka panjang', 'Long-term prediction'], ['The minister will be meeting regional leaders throughout the week.', 'Agenda resmi', 'Official schedule'], ['By then, scientists will be monitoring the climate with far more accurate satellites.', 'Situasi masa depan', 'Future scenario']]
      },
      quiz: { verbs: ['travel', 'work', 'study', 'watch', 'cook'] }
    },

    'future-perfect': {
      tag: { id: 'Melihat ke belakang dari masa depan: sudah selesai sebelum titik itu.', en: 'Looking back from the future: done before that point.' },
      uses: [
        ['Selesai sebelum titik masa depan', 'Done before a future point', 'By 6 pm, I will have finished the report.'],
        ['Durasi sampai titik masa depan', 'Duration up to a future point', 'By June, we will have lived here for ten years.'],
        ['Target yang tercapai', 'A target reached', 'By 2030, the city will have planted a million trees.']
      ],
      forms: { pos: ['S', 'will have', 'V3'], neg: ['S', 'will not have', 'V3'], q: ['Will', 'S', 'have V3?'] },
      fx: ["She'll have left.", "They won't have arrived.", 'Will you have finished?'],
      tl: { ref: 'future', asp: 'perf' }, tlNote: { id: 'Selesai sebelum titik masa depan', en: 'Finished before a future point' },
      markers: ['by tomorrow', 'by then', 'by the time', 'by 2030', 'before'],
      mistake: { w: 'By next year I will finish my degree.', r: 'By next year I will have finished my degree.', why: { id: '"By + waktu masa depan" biasanya pakai will have + V3.', en: '"By + a future time" usually takes will have + V3.' } },
      twin: { to: 'simple-future', a: 'By six, I will have finished.', b: 'At six, I will finish.', na: { id: 'sudah selesai sebelum jam 6', en: 'done before 6' }, nb: { id: 'selesai tepat jam 6', en: 'finish at 6' } },
      ex: {
        easy: [['I will have finished my homework by eight.', 'by + jam', 'by + a time'], ['She will have left by the time you arrive.', 'by the time', 'by the time'], ['They will have eaten before the show.', 'before', 'before']],
        medium: [['By next month, we will have saved enough for the trip.', 'Target tabungan', 'Savings goal'], ['Will you have finished the report by Friday?', 'Pertanyaan tenggat', 'Deadline question'], ['By December, I will have worked here for five years.', 'Durasi sampai titik masa depan', 'Duration up to a future point']],
        hard: [["By 2050, the world's population will have reached nearly ten billion.", 'Proyeksi data, IELTS Task 1', 'Data projection, IELTS Task 1'], ['By the time the policy takes effect, many small businesses will have closed.', 'by the time + Simple Present', 'by the time + Simple Present'], ['Experts estimate that renewable energy will have overtaken coal within a decade.', 'Perkiraan ahli', 'Expert estimate']]
      },
      quiz: { verbs: ['finish', 'write', 'eat', 'visit', 'buy'] }
    },

    'future-perfect-continuous': {
      tag: { id: 'Berapa lama sesuatu sudah berjalan saat titik masa depan tiba.', en: 'How long something will have been going on by a future point.' },
      uses: [
        ['Durasi sampai titik masa depan', 'Duration up to a future point', 'By May, I will have been working here for two years.'],
        ['Menjelaskan keadaan di masa depan', 'Explaining a future situation', 'She will be tired because she will have been driving all day.'],
        ['Menekankan proses panjang', 'Stressing a long process', 'By 2030, they will have been building the stadium for a decade.']
      ],
      forms: { pos: ['S', 'will have been', 'V-ing'], neg: ['S', 'will not have been', 'V-ing'], q: ['Will', 'S', 'have been V-ing?'] },
      fx: ["We'll have been waiting.", "He won't have been sleeping.", 'Will you have been working?'],
      tl: { ref: 'future', asp: 'perfcont' }, tlNote: { id: 'Berjalan lama sampai titik masa depan', en: 'Running for a while up to a future point' },
      markers: ['for', 'by', 'by the time', 'by next year', 'how long'],
      mistake: { w: 'By June I will have been knowing her for a year.', r: 'By June I will have known her for a year.', why: { id: 'Stative verb (know, like, own) tidak pakai -ing.', en: 'Stative verbs (know, like, own) do not take -ing.' } },
      twin: { to: 'future-perfect', a: 'By noon, I will have been writing for three hours.', b: 'By noon, I will have written three pages.', na: { id: 'fokus durasi', en: 'focus on duration' }, nb: { id: 'fokus hasil', en: 'focus on the result' } },
      ex: {
        easy: [['By 5 pm, I will have been studying for four hours.', 'for + durasi', 'for + duration'], ['Next month, she will have been teaching for ten years.', 'Tonggak karier', 'Career milestone'], ['They will have been travelling all day.', 'all day', 'all day']],
        medium: [['How long will you have been living here by next year?', 'Bertanya durasi', 'Asking about duration'], ['When he arrives, he will have been driving for twelve hours.', 'Keadaan saat tiba', 'Situation on arrival'], ['By the end of the semester, we will have been working on this project for months.', 'Proyek panjang', 'A long project']],
        hard: [['By 2030, the organisation will have been campaigning for clean water for half a century.', 'Tonggak sejarah', 'Historical milestone'], ['By the time the reforms are complete, citizens will have been waiting for over a decade.', 'Kritik kebijakan, IELTS Task 2', 'Policy critique, IELTS Task 2'], ['Next year, astronauts will have been living on the station continuously for 25 years.', 'Fakta durasi', 'Duration fact']]
      },
      quiz: { verbs: ['work', 'study', 'learn', 'travel', 'play'] }
    },

    'past-future': {
      tag: { id: 'Masa depan yang dilihat dari masa lalu.', en: 'The future, seen from the past.' },
      uses: [
        ['Rencana atau prediksi di masa lalu', 'A plan or prediction in the past', 'I knew you would like it.'],
        ['Reported speech dari "will"', 'Reported speech of "will"', 'He promised he would help.'],
        ['Pengandaian (conditional 2)', 'Hypothetical (second conditional)', 'If I had more time, I would learn Japanese.'],
        ['Kebiasaan di masa lalu', 'A past habit', 'Every summer we would swim in the river.']
      ],
      forms: { pos: ['S', 'would', 'V1'], neg: ['S', 'would + not', 'V1'], q: ['Would', 'S', 'V1?'] },
      fx: ['She would come.', "He wouldn't agree.", 'Would you help?'],
      tl: { ref: 'pastfut', asp: 'simple' }, tlNote: { id: 'Dari titik di masa lalu, melihat ke depan', en: 'From a past point, looking ahead' },
      markers: ['said', 'promised', 'thought', 'knew', 'if', 'every summer'],
      mistake: { w: 'She said she will come.', r: 'She said she would come.', why: { id: 'Dalam reported speech masa lalu, will berubah jadi would.', en: 'In past reported speech, will becomes would.' } },
      twin: { to: 'simple-future', a: 'She said she would come.', b: 'She says she will come.', na: { id: 'dilaporkan dari masa lalu', en: 'reported from the past' }, nb: { id: 'dilaporkan sekarang', en: 'reported now' } },
      ex: {
        easy: [['He said he would call me.', 'Reported speech', 'Reported speech'], ['I knew you would like it.', 'Prediksi di masa lalu', 'A past prediction'], ['If I were rich, I would travel the world.', 'Pengandaian', 'Hypothetical']],
        medium: [['She promised she would never be late again.', 'Janji di masa lalu', 'A past promise'], ['When we were kids, we would play outside until dark.', 'Kebiasaan masa lalu', 'A past habit'], ['Would you mind opening the window?', 'Permintaan sopan', 'Polite request']],
        hard: [['Few economists predicted that inflation would rise so quickly.', 'Prediksi yang meleset', 'A missed prediction'], ['Many believed that the internet would bring people closer together.', 'Keyakinan di masa lalu, IELTS Task 2', 'A past belief, IELTS Task 2'], ['If public transport were cheaper, fewer people would drive to work.', 'Conditional 2 untuk argumen', 'Second conditional in an argument']]
      },
      quiz: { verbs: ['visit', 'call', 'buy', 'travel', 'help'] }
    },

    'past-future-continuous': {
      tag: { id: 'Aksi yang, dari sudut masa lalu, dibayangkan sedang berlangsung.', en: 'An action pictured, from a past viewpoint, as being in progress.' },
      uses: [
        ['Reported speech dari future continuous', 'Reported future continuous', 'She said she would be working late.'],
        ['Bayangan dari masa lalu', 'An expectation from the past', 'I thought we would be living in Bali by now.'],
        ['Pengandaian yang sedang berlangsung', 'A hypothetical in progress', 'If I were rich, I would be relaxing on a yacht right now.']
      ],
      forms: { pos: ['S', 'would be', 'V-ing'], neg: ['S', 'would not be', 'V-ing'], q: ['Would', 'S', 'be V-ing?'] },
      fx: ['They would be waiting.', "I wouldn't be sitting here.", 'Would you be staying?'],
      tl: { ref: 'pastfut', asp: 'cont' }, tlNote: { id: 'Dari masa lalu, membayangkan aksi yang sedang berjalan', en: 'From the past, picturing an action in progress' },
      markers: ['said', 'thought', 'by now', 'at that time', 'if', 'right now'],
      mistake: { w: 'He said he would working late.', r: 'He said he would be working late.', why: { id: 'Jangan lupa "be" setelah would.', en: 'Don’t forget "be" after would.' } },
      twin: { to: 'past-future', a: 'She said she would be cooking at seven.', b: 'She said she would cook at seven.', na: { id: 'sedang memasak jam 7', en: 'in the middle of cooking at 7' }, nb: { id: 'mulai memasak jam 7', en: 'start cooking at 7' } },
      ex: {
        easy: [['He said he would be waiting outside.', 'Reported speech', 'Reported speech'], ['I thought you would be sleeping.', 'Dugaan', 'An assumption'], ['She knew they would be watching.', 'Perkiraan di masa lalu', 'A past expectation']],
        medium: [['If I were on holiday, I would be swimming right now.', 'Pengandaian saat ini', 'A present hypothetical'], ['We hoped we would be living in our own house by 2025.', 'Harapan di masa lalu', 'A past hope'], ['He told me he would be travelling all week.', 'Reported speech', 'Reported speech']],
        hard: [['Ten years ago, few predicted that we would be working from our kitchens.', 'Prediksi masa lalu tentang sekarang', 'A past prediction about now'], ['Had she accepted the offer, she would be living in London now.', 'Mixed conditional', 'Mixed conditional'], ['The report warned that thousands would be living below the poverty line by 2020.', 'Peringatan laporan, gaya akademik', 'Report warning, academic style']]
      },
      quiz: { verbs: ['work', 'travel', 'study', 'watch', 'cook'] }
    },

    'past-future-perfect': {
      tag: { id: 'Sesuatu yang akan sudah terjadi, tapi nyatanya tidak.', en: 'Something that would have happened, but did not.' },
      uses: [
        ['Pengandaian masa lalu (conditional 3)', 'Past hypothetical (third conditional)', 'If I had studied, I would have passed.'],
        ['Reported speech dari future perfect', 'Reported future perfect', 'She said she would have finished by noon.'],
        ['Rencana yang tidak terjadi', 'A plan that did not happen', 'I would have called, but my phone died.']
      ],
      forms: { pos: ['S', 'would have', 'V3'], neg: ['S', 'would not have', 'V3'], q: ['Would', 'S', 'have V3?'] },
      fx: ['She would have won.', "I wouldn't have known.", 'Would you have gone?'],
      tl: { ref: 'pastfut', asp: 'perf' }, tlNote: { id: 'Kemungkinan di masa lalu yang tidak terjadi', en: 'A past possibility that did not happen' },
      markers: ['if … had', 'but', 'otherwise', 'without', 'said'],
      mistake: { w: 'If I had known, I would told you.', r: 'If I had known, I would have told you.', why: { id: 'Conditional 3: would have + V3.', en: 'Third conditional: would have + past participle.' } },
      twin: { to: 'past-future', a: 'If I had had time, I would have helped.', b: 'If I had time, I would help.', na: { id: 'pengandaian masa lalu', en: 'a past hypothetical' }, nb: { id: 'pengandaian sekarang', en: 'a present hypothetical' } },
      ex: {
        easy: [['I would have come, but I was sick.', 'Alasan tidak terjadi', 'Why it didn’t happen'], ['If you had asked, I would have helped.', 'Conditional 3', 'Third conditional'], ['She would have loved this place.', 'Pengandaian masa lalu', 'A past hypothetical']],
        medium: [['He said he would have finished the design by Monday.', 'Reported speech', 'Reported speech'], ['Without your advice, I would have made a big mistake.', 'without + would have', 'without + would have'], ['Would you have accepted the job if they had offered more money?', 'Pertanyaan conditional 3', 'Third conditional question']],
        hard: [['Had the warning been issued earlier, many lives would have been saved.', 'Inversi + pasif', 'Inversion + passive'], ['Without government subsidies, the industry would have collapsed during the pandemic.', 'Argumen kontrafaktual', 'Counterfactual argument'], ['Critics argue that stricter regulations would have prevented the crisis.', 'Argumen kritis, IELTS Task 2', 'Critical argument, IELTS Task 2']]
      },
      quiz: { verbs: ['visit', 'finish', 'buy', 'see', 'eat'] }
    },

    'past-future-perfect-continuous': {
      tag: { id: 'Proses panjang di dalam pengandaian masa lalu.', en: 'A long process inside a past hypothetical.' },
      uses: [
        ['Conditional 3 dengan proses', 'Third conditional with a process', "If you hadn't called, I would have been sleeping."],
        ['Reported speech dengan durasi', 'Reported speech with duration', 'She said that by June she would have been working there for a year.'],
        ['Proses yang tidak jadi terjadi', 'A process that never happened', 'Without the strike, the trains would have been running all night.']
      ],
      forms: { pos: ['S', 'would have been', 'V-ing'], neg: ['S', 'would not have been', 'V-ing'], q: ['Would', 'S', 'have been V-ing?'] },
      fx: ['They would have been waiting.', "He wouldn't have been driving.", 'Would you have been working?'],
      tl: { ref: 'pastfut', asp: 'perfcont' }, tlNote: { id: 'Proses panjang dalam kemungkinan masa lalu', en: 'A long process in a past possibility' },
      markers: ['if … had', 'by then', 'for', 'said', 'otherwise'],
      mistake: { w: "If it hadn't rained, we would have been play outside.", r: "If it hadn't rained, we would have been playing outside.", why: { id: 'Setelah would have been, pakai V-ing.', en: 'After would have been, use V-ing.' } },
      twin: { to: 'past-future-perfect', a: 'I would have been studying all night.', b: 'I would have studied all night.', na: { id: 'fokus proses panjang', en: 'focus on the long process' }, nb: { id: 'fokus hasil', en: 'focus on the result' } },
      ex: {
        easy: [["If you hadn't called, I would have been sleeping.", 'Conditional 3 + proses', 'Third conditional with a process'], ['She would have been working all day.', 'Durasi dalam pengandaian', 'Hypothetical duration'], ['They would have been waiting for hours.', 'for + durasi', 'for + duration']],
        medium: [['He said that by June he would have been living there for a year.', 'Reported speech', 'Reported speech'], ["If the train hadn't broken down, we would have been travelling to Penang by now.", 'Rencana yang batal', 'A cancelled plan'], ['Would you have been driving if it had snowed?', 'Pertanyaan', 'Question']],
        hard: [['Had the factory not closed, many residents would have been working there for decades.', 'Inversi + durasi', 'Inversion with duration'], ['Without the ceasefire, aid workers would have been operating under constant threat.', 'Kontrafaktual gaya berita', 'News-style counterfactual'], ['Without early investment, researchers would still have been searching for a vaccine years later.', 'Argumen akademik', 'Academic argument']]
      },
      quiz: { verbs: ['work', 'study', 'travel', 'play', 'cook'] }
    }
  };

  window.JK = window.JK || {};
  window.JK.lessons = L;
})();
