// DarsIzi — AI moduli (Google Gemini). Kalit bo'lmasa yoki xato bo'lsa, demo ma'lumotga qaytadi.
window.AI = (function () {
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  const cfg = () => ({
    key: store.get("darsizi_key", ""),
    model: store.get("darsizi_model", "") || "gemini-2.5-flash"
  });

  const enabled = () => !!cfg().key;

  async function call(prompt, json = false) {
    const { key, model } = cfg();
    if (!key) throw new Error("API kaliti yo'q");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, ...(json ? { responseMimeType: "application/json" } : {}) }
    };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
      if (!res.ok) throw new Error("AI xatosi: " + res.status);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
      if (!text) throw new Error("AI bo'sh javob qaytardi");
      return text;
    } finally { clearTimeout(timer); }
  }

  const transcriptText = (tr) => tr.map(l => `[${l.t}] ${l.who === "student" ? "O'quvchi" : "O'qituvchi"}: ${l.text}`).join("\n");

  async function analyze(lesson, transcript, confusion) {
    const conf = confusion.filter(c => c.n > 0).map(c => `${c.min}-daqiqa: ${c.n} ta o'quvchi`).join(", ");
    const prompt = `Sen DarsIzi platformasining AI'sisan. Quyida O'zbekistondagi maktab darsining matni va o'quvchilar "Tushunmadim" tugmasini bosgan daqiqalar berilgan.
Fan: ${lesson.subject}. Sinf: ${lesson.className}. Mavzu: ${lesson.topic || "matndan aniqla"}.
"Tushunmadim" bosilgan daqiqalar: ${conf || "yo'q"}.

DARS MATNI:
${transcriptText(transcript)}

Faqat o'zbek tilida (lotin yozuvida) va FAQAT quyidagi JSON tuzilmasida javob ber:
{
 "topic": "mavzu nomi",
 "summary": "3-4 gapli sodda konspekt",
 "keyPoints": ["5 ta asosiy fikr"],
 "quiz": [{"q":"savol","options":["4 ta variant"],"a":0,"why":"qisqa izoh"}],  // 5 ta savol, a — to'g'ri variant indeksi
 "flashcards": [{"f":"savol","b":"javob"}],  // 4 ta
 "homework": ["3 ta uyga vazifa"],
 "lessonPlan": [{"step":"bosqich","min":"0–5","note":"izoh"}],  // 5-6 ta bosqich
 "confusionMoments": [{"t":"mm:ss","n":0,"quote":"o'qituvchining o'sha paytdagi gapi","tip":"qanday qayta tushuntirish bo'yicha maslahat"}],  // 2-3 ta, eng ko'p bosilgan joylar
 "teacherTalk": 75,  // darsning necha foizida o'qituvchi gapirgani (taxminan)
 "questionsAsked": 2,
 "tips": ["o'qituvchiga 3 ta aniq maslahat"],
 "parentMessage": "ota-onaga Telegram xabari: bugun nima o'tildi + farzanddan so'raladigan 1 ta savol va javobi + uyga vazifa",
 "examLinks": [{"exam":"DTM","note":"bog'liqlik"}]  // 2-3 ta
}`;
    const text = await call(prompt, true);
    const clean = text.replace(/^```json\s*|```$/g, "").trim();
    const obj = JSON.parse(clean);
    if (!obj.summary || !Array.isArray(obj.quiz)) throw new Error("AI javobi to'liq emas");
    return obj;
  }

  async function chat(question, lesson, transcript, analysis) {
    const prompt = `Sen DarsIzi'dagi "Dars bilan suhbat" yordamchisisan. O'quvchi uyda shu dars bo'yicha savol beryapti.
Qoidalar: faqat o'zbek tilida, sodda va qisqa (3-5 gap) javob ber. Imkon qadar O'QITUVCHINING O'Z TUSHUNTIRISHIGA tayan va qaysi daqiqada aytilganini [mm:ss] ko'rinishida ko'rsat. Javobni to'g'ridan-to'g'ri berib qo'ymay, o'quvchini o'ylashga undovchi bitta savol bilan tugat.

Mavzu: ${lesson.topic}
Konspekt: ${analysis?.summary || ""}
DARS MATNI:
${transcriptText(transcript)}

O'quvchining savoli: ${question}`;
    return call(prompt, false);
  }

  // AI'siz javob: dars matnidan kalit so'zlar bo'yicha qidirish
  function localChat(question, transcript) {
    const stop = new Set(["va", "bu", "nima", "qanday", "nega", "uchun", "edi", "ustoz", "qilib", "bilan", "ham", "yana", "bir", "men", "siz", "mi", "ni", "ga", "da"]);
    const words = question.toLowerCase().replace(/[^a-zа-яё0-9'ʻʼ\s/]/gi, " ").split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
    const scored = transcript.map(l => {
      const t = l.text.toLowerCase();
      let s = 0; words.forEach(w => { if (t.includes(w.slice(0, Math.max(4, w.length - 2)))) s += 1; });
      if (l.who === "teacher") s += 0.2;
      return { l, s };
    }).filter(x => x.s >= 1).sort((a, b) => b.s - a.s).slice(0, 2);
    if (!scored.length) return { text: "Bu savol bo'yicha darsda aniq tushuntirish topilmadi. Savolni boshqacha yozib ko'ring yoki «Tushunmadim» orqali ustozga yuboring — ertangi darsda qayta tushuntiriladi.", src: "" };
    const text = scored.map(x => `Ustoz shunday tushuntirgan edi:\n«${x.l.text}»`).join("\n\n") + "\n\n🤔 Endi o'zingiz sinab ko'ring: 1/4 + 1/6 nechaga teng?";
    return { text, src: "Manba: " + scored.map(x => `[${x.l.t}]`).join(", ") };
  }

  return { enabled, analyze, chat, localChat, call, store, cfg };
})();
