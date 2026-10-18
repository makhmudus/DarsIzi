# DarsIzi — har bir dars iz qoldiradi

**Mavzu:** Zamonaviy ta'lim · CoddyCamp Hackathon 2026 · X7 jamoasi

DarsIzi sinfdagi jonli darsni AI yordamida eshitadi va dars tugashi bilan uni
to'rt tomon uchun foydaga aylantiradi:

| Panel | Nima beradi |
|---|---|
| 👩‍🏫 O'qituvchi | Jonli yozish, «Tushunmadim» xaritasi, avto dars ishlanmasi, test, uyga vazifa, dars sifati maslahati |
| 👨‍🎓 O'quvchi | Anonim «Tushunmadim» tugmasi, konspekt, podkast, test, flashcard, «Dars bilan suhbat», zaif mavzular |
| 👨‍👩‍👦 Ota-ona | Kechki Telegram xabar, farzandga 1 ta savol, ogohlantirishlar, haftalik grafik |
| 🏫 Maktab | Mavzular xaritasi (heatmap), KPI, yordam kerak bo'lgan o'quvchilar |

## Ishga tushirish

Hech qanday o'rnatish shart emas — oddiy HTML/CSS/JS.

```bash
# papkaga kiring va lokal server yoqing
python3 -m http.server 8000
# brauzerda oching:  http://localhost:8000
```

`index.html` ni to'g'ridan-to'g'ri ochsa ham ishlaydi (lekin PWA/oflayn rejim server orqali ishlaydi).

**GitHub Pages:** repo → Settings → Pages → Branch: main → Save. Bir daqiqada sayt tayyor.

## AI ulash (ixtiyoriy)

1. https://aistudio.google.com → **Get API key** (bepul).
2. Saytda o'ng yuqoridagi doiracha tugma → kalitni kiriting → **AI'ni tekshirish**.
3. Endi «Jonli darsni boshlash» haqiqiy nutqni matnga aylantiradi (Chrome, mikrofon) va Gemini haqiqiy tahlil qiladi; «Dars bilan suhbat» ham AI bilan javob beradi.

Kalit bo'lmasa yoki internet uzilsa — sayt tayyor demo ma'lumot bilan to'liq ishlaydi.

## Demo uchun maslahat (2 daqiqa)

1. **O'qituvchi** → «▶ Demo darsni ishga tushirish» (~30 soniya, «Tushunmadim» grafigi jonli o'sadi).
2. Ikkinchi oynada **O'quvchi** panelini oching → «😕 Tushunmadim» bosing → o'qituvchi oynasida signal paydo bo'ladi.
3. «Tushunmadim xaritasi» tabi → **14:32 — 12 ta o'quvchi tushunmadi**.
4. **O'quvchi** → «Dars bilan suhbat» → «Umumiy maxrajni qanday topaman?».
5. **Ota-ona** → Telegram xabar. **Maktab** → heatmap.

## Tuzilma

```
index.html        — sahifa skeleti
css/style.css     — dizayn
js/data.js        — demo dars, tahlil, o'quvchi/ota-ona/maktab ma'lumotlari
js/ai.js          — Gemini integratsiyasi + AI'siz qidiruv
js/app.js         — router va 4 ta panel
manifest.json, sw.js, icons/ — PWA (telefonga ilova sifatida o'rnatish, oflayn)
```

## Texnologiyalar
HTML5, CSS3, Vanilla JS, Web Speech API (nutqni aniqlash va ovozli o'qish),
BroadcastChannel (jonli signal), Google Gemini API, PWA (Service Worker).
