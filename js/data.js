// DarsIzi — demo ma'lumotlar (internet yoki AI bo'lmasa ham demo ishlashi uchun)
window.DEMO = {
  lesson: {
    id: "mat-6b-kasrlar",
    subject: "Matematika",
    className: "6-B sinf",
    teacher: "Dilnoza Karimova",
    topic: "Kasrlarni qo'shish va ayirish",
    date: "18-oktabr, 2026",
    duration: "40 daqiqa",
    students: 28
  },

  // Darsning matnga aylantirilgan qismi (vaqt belgisi bilan)
  transcript: [
    { t: "00:15", who: "teacher", text: "Assalomu alaykum, bolalar. Bugun kasrlarni qo'shish va ayirishni o'rganamiz." },
    { t: "01:40", who: "teacher", text: "Eslaylik: kasr ikki qismdan iborat. Yuqoridagisi surat, pastdagisi maxraj. Maxraj butun nechta teng bo'lakka bo'linganini bildiradi." },
    { t: "04:05", who: "teacher", text: "Agar maxrajlar bir xil bo'lsa, oson: suratlarni qo'shamiz, maxraj o'zgarmaydi. Masalan, 2/7 plyus 3/7 teng 5/7." },
    { t: "07:30", who: "student", text: "Ustoz, maxrajni ham qo'shmaymizmi? 2/7 plyus 3/7 teng 5/14 emasmi?" },
    { t: "07:50", who: "teacher", text: "Yaxshi savol! Yo'q. Pitsani 7 bo'lakka bo'ldik. 2 bo'lak va 3 bo'lak — jami 5 bo'lak. Bo'laklar hajmi o'zgarmadi, ya'ni maxraj 7 bo'lib qoladi." },
    { t: "11:20", who: "teacher", text: "Endi maxrajlar har xil bo'lsa-chi? Masalan, 1/2 plyus 1/3. Bu yerda kasrlarni umumiy maxrajga keltiramiz." },
    { t: "14:32", who: "teacher", text: "Umumiy maxraj — ikkala maxrajga bo'linadigan eng kichik son. 2 va 3 uchun bu 6. Keyin har bir kasrni qo'shimcha ko'paytuvchiga ko'paytiramiz: 1/2 = 3/6, 1/3 = 2/6." },
    { t: "17:10", who: "teacher", text: "Demak 3/6 plyus 2/6 teng 5/6. Qo'shimcha ko'paytuvchi — umumiy maxrajni o'z maxrajimizga bo'lganda chiqadigan son." },
    { t: "21:45", who: "student", text: "Qo'shimcha ko'paytuvchini qanday topamiz, yana bir marta tushuntiring." },
    { t: "22:05", who: "teacher", text: "6 ni 2 ga bo'lamiz — 3 chiqadi. Demak birinchi kasrni 3 ga ko'paytiramiz. 6 ni 3 ga bo'lamiz — 2. Ikkinchi kasrni 2 ga." },
    { t: "26:40", who: "teacher", text: "Ayirish ham xuddi shunday: 3/4 minus 1/6. Umumiy maxraj 12. 9/12 minus 2/12 teng 7/12." },
    { t: "31:15", who: "teacher", text: "Hayotiy misol: onangiz tortning 1/4 qismini, dadangiz 1/3 qismini yedi. Jami qancha yeyildi? 3/12 plyus 4/12 teng 7/12." },
    { t: "36:00", who: "teacher", text: "Uyga vazifa: darslikning 47-betidagi 5 ta misol. Ertaga kichik test yozamiz." }
  ],

  // "Tushunmadim" bosilgan daqiqalar (daqiqa: necha o'quvchi)
  confusion: [
    { min: 2, n: 0 }, { min: 4, n: 1 }, { min: 6, n: 0 }, { min: 8, n: 7 }, { min: 10, n: 2 },
    { min: 12, n: 1 }, { min: 14, n: 4 }, { min: 15, n: 12 }, { min: 17, n: 9 }, { min: 19, n: 3 },
    { min: 21, n: 6 }, { min: 23, n: 2 }, { min: 25, n: 1 }, { min: 27, n: 3 }, { min: 29, n: 1 },
    { min: 31, n: 0 }, { min: 33, n: 1 }, { min: 35, n: 0 }, { min: 37, n: 0 }, { min: 39, n: 0 }
  ],

  analysis: {
    summary: "Bugun kasrlarni qo'shish va ayirish o'rganildi. Maxrajlar bir xil bo'lsa, faqat suratlar qo'shiladi, maxraj o'zgarmaydi. Maxrajlar har xil bo'lsa, avval umumiy maxraj topiladi (ikkala maxrajga bo'linadigan eng kichik son), har bir kasr qo'shimcha ko'paytuvchiga ko'paytiriladi, so'ng suratlar qo'shiladi yoki ayiriladi.",
    keyPoints: [
      "Kasr = surat / maxraj. Maxraj — butun nechta teng bo'lakka bo'lingani.",
      "Bir xil maxraj: suratlar qo'shiladi, maxraj o'zgarmaydi (2/7 + 3/7 = 5/7).",
      "Har xil maxraj: umumiy maxrajga keltiriladi (1/2 + 1/3 = 3/6 + 2/6 = 5/6).",
      "Qo'shimcha ko'paytuvchi = umumiy maxraj ÷ kasrning maxraji.",
      "Ayirish ham xuddi shunday: 3/4 − 1/6 = 9/12 − 2/12 = 7/12."
    ],
    quiz: [
      { q: "2/9 + 5/9 = ?", options: ["7/18", "7/9", "10/9", "3/9"], a: 1, why: "Maxrajlar bir xil — faqat suratlar qo'shiladi: 2 + 5 = 7. Maxraj 9 bo'lib qoladi." },
      { q: "1/2 va 1/3 uchun umumiy maxraj nechaga teng?", options: ["5", "6", "3", "2"], a: 1, why: "6 — ham 2 ga, ham 3 ga bo'linadigan eng kichik son." },
      { q: "1/4 + 1/2 = ?", options: ["2/6", "1/6", "3/4", "2/4"], a: 2, why: "1/2 = 2/4. Demak 1/4 + 2/4 = 3/4." },
      { q: "3/4 − 1/6 = ?", options: ["2/10", "7/12", "1/2", "5/12"], a: 1, why: "Umumiy maxraj 12: 9/12 − 2/12 = 7/12." },
      { q: "1/3 ni maxraji 12 bo'lgan kasrga keltirsak, surat nechaga teng bo'ladi?", options: ["3", "4", "1", "12"], a: 1, why: "Qo'shimcha ko'paytuvchi 12 ÷ 3 = 4. Surat 1 × 4 = 4 → 4/12." }
    ],
    flashcards: [
      { f: "Maxraj nimani bildiradi?", b: "Butun nechta teng bo'lakka bo'linganini." },
      { f: "Bir xil maxrajli kasrlar qanday qo'shiladi?", b: "Suratlar qo'shiladi, maxraj o'zgarmaydi." },
      { f: "Umumiy maxraj nima?", b: "Ikkala maxrajga bo'linadigan eng kichik son." },
      { f: "Qo'shimcha ko'paytuvchi qanday topiladi?", b: "Umumiy maxraj ÷ kasrning o'z maxraji." }
    ],
    homework: [
      "Darslik, 47-bet: 5 ta misol (№ 212–216).",
      "Hayotiy masala tuzing: oilangizda biror narsa kasrlarga bo'linadigan vaziyatni yozing va yeching.",
      "DarsIzi ilovasida 5 ta savollik testni ishlang (10 daqiqa)."
    ],
    lessonPlan: [
      { step: "Kirish va takrorlash", min: "0–5", note: "Kasr tushunchasi, surat va maxraj." },
      { step: "Bir xil maxrajli kasrlar", min: "5–11", note: "Pitsa misoli; keng tarqalgan xato: maxrajni ham qo'shish." },
      { step: "Umumiy maxraj", min: "11–22", note: "Qo'shimcha ko'paytuvchi. ⚠ Sinf eng ko'p adashgan joy." },
      { step: "Ayirish", min: "22–31", note: "3/4 − 1/6 misoli." },
      { step: "Hayotiy misol va mustahkamlash", min: "31–36", note: "Tort misoli." },
      { step: "Uyga vazifa", min: "36–40", note: "47-bet, ertaga kichik test." }
    ],
    confusionMoments: [
      { t: "14:32", n: 12, quote: "Umumiy maxraj — ikkala maxrajga bo'linadigan eng kichik son…", tip: "Sonlar o'qida yoki pitsa rasmida ko'rsating: 1/2 va 1/3 ni 6 bo'lakka bo'lib chizing." },
      { t: "07:30", n: 7, quote: "2/7 plyus 3/7 teng 5/7.", tip: "Ko'p o'quvchi maxrajni ham qo'shmoqchi. Ertangi darsni shu xato bilan boshlang." },
      { t: "21:45", n: 6, quote: "Qo'shimcha ko'paytuvchini qanday topamiz…", tip: "3 ta qisqa misolni sinf bilan birga og'zaki yeching." }
    ],
    teacherTalk: 78,
    questionsAsked: 2,
    tips: [
      "Darsning 78% qismida siz gapirdingiz. 60% dan pastga tushirish uchun o'quvchilarga 2–3 ta savol bering.",
      "14:32 dagi tushuntirishni ertaga rasm bilan qayta bering — 12 ta o'quvchi tushunmadi.",
      "Tort misoli juda yaxshi ishladi: undan keyin 'tushunmadim' bosilmadi."
    ],
    parentMessage: "Assalomu alaykum! Bugun Ali matematikada «Kasrlarni qo'shish va ayirish» mavzusini o'tdi. Kechqurun undan so'rang: «1/2 + 1/3 nechaga teng?» (to'g'ri javob: 5/6). Uyga vazifa: 47-bet, 5 ta misol. Ertaga kichik test bor.",
    examLinks: [
      { exam: "DTM", note: "Matematika blokidagi kasrlar bo'yicha savollar shu mavzuga asoslanadi." },
      { exam: "SAT Math", note: "«Problem Solving & Data Analysis» bo'limida kasrlar va nisbatlar." },
      { exam: "Prezident maktablari", note: "Kirish imtihonidagi mantiqiy masalalar." }
    ]
  },

  // O'quvchi profili
  student: {
    name: "Ali Valiyev",
    streak: 6,
    xp: 1240,
    weak: [
      { topic: "Umumiy maxraj", level: 42 },
      { topic: "Kasrlarni ayirish", level: 58 },
      { topic: "Aralash sonlar", level: 64 },
      { topic: "Kasrlarni qo'shish", level: 81 },
      { topic: "Natural sonlar", level: 93 }
    ]
  },

  // Ota-ona uchun haftalik progress (%)
  parentWeek: {
    child: "Ali Valiyev",
    days: ["Du", "Se", "Ch", "Pa", "Ju", "Sh"],
    subjects: [
      { name: "Matematika", vals: [72, 70, 66, 61, 58, 64] },
      { name: "Ingliz tili", vals: [80, 82, 85, 84, 88, 90] },
      { name: "Fizika", vals: [75, 74, 78, 77, 79, 81] }
    ],
    attendance: "6/6",
    alerts: [
      { type: "warn", text: "Matematikada 2 haftadan beri pasayish bor (72% → 58%). Asosiy sabab: «Umumiy maxraj»." },
      { type: "good", text: "Ingliz tilida 5 kun ketma-ket o'sish. Maqtab qo'ying! 🎉" }
    ]
  },

  // Maktab analitikasi: mavzu × sinf, o'zlashtirish %
  school: {
    name: "Seven School",
    classes: ["5-A", "5-B", "6-A", "6-B", "7-A", "7-B"],
    topics: ["Kasrlar", "Umumiy maxraj", "Foizlar", "Tenglamalar", "Geometriya"],
    grid: [
      [82, 78, 74, 69, 88, 85],
      [61, 55, 48, 42, 70, 66],
      [77, 80, 72, 75, 68, 71],
      [70, 66, 63, 58, 81, 79],
      [85, 83, 80, 77, 74, 76]
    ],
    stats: { lessons: 1284, hoursSaved: 412, confusionResolved: 87, parents: 1930 },
    atRisk: [
      { name: "Sardor T.", cls: "6-B", reason: "3 ta fandan pasayish, 4 ta dars qoldirgan" },
      { name: "Madina R.", cls: "7-A", reason: "Matematika 45%, test topshirmagan" },
      { name: "Jasur K.", cls: "5-B", reason: "«Tushunmadim»ni eng ko'p bosgan, yordam kerak" }
    ]
  }
};
