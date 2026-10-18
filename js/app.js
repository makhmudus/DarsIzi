// DarsIzi — asosiy ilova (hash-router, 4 ta panel)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $("#app");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- holat ----------
  const S = loadState() || {
    lesson: clone(DEMO.lesson), transcript: clone(DEMO.transcript),
    confusion: clone(DEMO.confusion), analysis: clone(DEMO.analysis), source: "demo"
  };
  function saveState() { try { localStorage.setItem("darsizi_state", JSON.stringify(S)); } catch {} }
  function loadState() { try { return JSON.parse(localStorage.getItem("darsizi_state")); } catch { return null; } }

  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel("darsizi") : null;

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2600);
  }

  // ---------- router ----------
  const routes = { "": home, teacher, student, parent, school };
  function route() {
    const r = location.hash.replace(/^#\/?/, "");
    stopAll();
    $$("#nav a").forEach(a => a.classList.toggle("on", a.dataset.r === r));
    (routes[r] || home)();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // =========================================================
  // BOSH SAHIFA
  // =========================================================
  function home() {
    app.innerHTML = `
    <section class="page">
      <div class="hero">
        <div>
          <span class="pill red">● Zamonaviy ta'lim · AI</span>
          <h1 style="margin-top:16px">Har bir dars <em>iz</em> qoldiradi.</h1>
          <p class="lead">DarsIzi sinfdagi jonli darsni eshitadi va dars tugashi bilan uni <b>o'quvchi, o'qituvchi, ota-ona va maktab</b> uchun to'rt xil foydaga aylantiradi.</p>
          <div class="row wrapf">
            <a class="btn btn-accent" href="#/teacher">▶ Jonli demoni boshlash</a>
            <a class="btn btn-ghost" href="#/student">O'quvchi ilovasi</a>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="orbit"></div><div class="orbit o2"></div><div class="pulse"></div>
          <div class="core"><div><div style="font-size:30px">🎙</div><b>Jonli dars</b><div style="font-size:12px;opacity:.7">AI eshitadi</div></div></div>
          <div class="sat s1"><span>👨‍🎓</span>Konspekt va test</div>
          <div class="sat s2"><span>👩‍🏫</span>Tayyor dars ishlanmasi</div>
          <div class="sat s3"><span>👨‍👩‍👦</span>Kechki xabar</div>
          <div class="sat s4"><span>🏫</span>Mavzular xaritasi</div>
        </div>
      </div>

      <div class="problem">
        <div class="card"><div class="big">«Hech narsa»</div><div class="muted">— «Bugun maktabda nima o'tdingiz?» savoliga eng ko'p beriladigan javob</div></div>
        <div class="card"><div class="big">0 ta iz</div><div class="muted">Dars tugagach, tushuntirishdan hech narsa saqlanmaydi</div></div>
        <div class="card"><div class="big">Jim sinf</div><div class="muted">O'quvchi tushunmasa ham savol berishga uyaladi</div></div>
        <div class="card"><div class="big">Qog'ozbozlik</div><div class="muted">O'qituvchi ishlanma, test va hisobotga soatlab vaqt sarflaydi</div></div>
      </div>

      <div class="sec-head"><h2>Bitta dars — to'rt xil foyda</h2><span class="muted">Panelni tanlang</span></div>
      <div class="grid g4 roles">
        ${roleCard("teacher", "👩‍🏫", "var(--violet-soft)", "O'qituvchi", ["Avto dars ishlanmasi", "«Tushunmadim» xaritasi", "Avto test va vazifa", "Dars sifati maslahati"])}
        ${roleCard("student", "👨‍🎓", "var(--accent-soft)", "O'quvchi", ["Anonim «Tushunmadim»", "Konspekt va podkast", "Dars bilan suhbat", "DTM/SAT bog'lanishi"])}
        ${roleCard("parent", "👨‍👩‍👦", "var(--teal-soft)", "Ota-ona", ["Kechki Telegram xabar", "Farzandga 1 ta savol", "Pasayish ogohlantirishi", "Haftalik progress"])}
        ${roleCard("school", "🏫", "var(--amber-soft)", "Maktab", ["Mavzular xaritasi", "O'qituvchi samaradorligi", "Xavf ostidagi o'quvchilar", "Tuman analitikasi"])}
      </div>
    </section>`;
    $$(".roles .card").forEach(c => c.onclick = () => location.hash = "#/" + c.dataset.go);
  }
  function roleCard(r, ic, bg, title, items) {
    return `<div class="card" data-go="${r}"><span class="go">→</span><div class="role-ic" style="background:${bg}">${ic}</div><h3>${title}</h3><ul>${items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
  }

  // =========================================================
  // O'QITUVCHI
  // =========================================================
  let rec = null, timerInt = null, demoInt = null, startTs = 0, curMin = 0;
  function stopAll() {
    clearInterval(timerInt); clearInterval(demoInt); timerInt = demoInt = null;
    if (rec) { try { rec.onend = null; rec.stop(); } catch {} rec = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  }
  const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  const toSec = (t) => { const [m, s] = t.split(":").map(Number); return m * 60 + s; };

  function teacher() {
    const L = S.lesson;
    app.innerHTML = `
    <section class="page">
      <div class="row between wrapf">
        <div><div class="eyebrow">O'qituvchi paneli</div><h2 style="margin-top:4px">${esc(L.subject)} · ${esc(L.className)}</h2><div class="muted">${esc(L.teacher)} · ${esc(L.date)}</div></div>
        <span class="pill ${AI.enabled() ? "teal" : "amber"}">${AI.enabled() ? "● AI ulangan (Gemini)" : "● Demo rejim — AI kaliti yo'q"}</span>
      </div>

      <div class="rec" style="margin-top:18px">
        <div class="rec-box">
          <div class="row between">
            <div><div class="eyebrow">Jonli dars</div><div class="rec-timer" id="timer">00:00</div></div>
            <div class="live" id="liveTag" style="visibility:hidden"><i></i> YOZILMOQDA</div>
          </div>
          <div class="transcript" id="transcript"><div class="muted" style="color:#7e84ab">Darsni boshlang — AI har bir gapni eshitib, matnga aylantiradi. Telefonni stolga qo'yish kifoya.</div></div>
          <div class="rec-actions" id="recActions">
            <button class="btn btn-accent" id="liveBtn">🎙 Jonli darsni boshlash</button>
            <button class="btn btn-ghost" id="demoBtn">▶ Demo darsni ishga tushirish</button>
          </div>
          <div class="processing" id="processing"><div class="spin"></div><span id="procText">AI tahlil qilmoqda…</span></div>
        </div>
        <div class="card conf-live">
          <div class="eyebrow">«Tushunmadim» signallari</div>
          <div class="conf-count" id="confCount">0</div>
          <div class="muted" style="margin-top:-8px">o'quvchi hozir tushunmadi</div>
          <div class="wave" id="wave">${Array.from({ length: 20 }, () => "<i></i>").join("")}</div>
          <button class="btn btn-ghost btn-sm" id="simBtn">⚡ Sinfdan signal (simulyatsiya)</button>
          <div class="muted" style="font-size:12.5px">O'quvchi ilovasini boshqa oynada oching — u yerdagi tugma shu yerga jonli keladi.</div>
        </div>
      </div>

      <div id="results"></div>
    </section>`;

    $("#liveBtn").onclick = startLive;
    $("#demoBtn").onclick = runDemo;
    $("#simBtn").onclick = () => addConfusion(Math.ceil(Math.random() * 3));
    renderWave();
    renderResults();
  }

  function liveConf() { return S._live || (S._live = Array.from({ length: 20 }, (_, i) => ({ min: i * 2 + 2, n: 0 }))); }
  function addConfusion(k = 1) {
    const arr = liveConf();
    const idx = Math.min(19, Math.floor(curMin / 2));
    arr[idx].n += k;
    const c = $("#confCount"); if (c) { c.textContent = arr[idx].n; c.animate([{ transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 300 }); }
    renderWave(arr);
  }
  function renderWave(arr = liveConf()) {
    const w = $("#wave"); if (!w) return;
    const max = Math.max(5, ...arr.map(a => a.n));
    $$("i", w).forEach((el, i) => { const n = arr[i]?.n || 0; el.style.height = (n / max * 100) + "%"; el.classList.toggle("hot", n >= max * 0.6 && n > 2); });
  }
  if (bc) bc.onmessage = (e) => { if (e.data?.type === "confused" && $("#confCount")) { addConfusion(1); toast("😕 O'quvchidan «Tushunmadim» signali"); } };

  function setRecording(on) {
    $("#liveTag").style.visibility = on ? "visible" : "hidden";
    $("#recActions").innerHTML = on
      ? `<button class="btn btn-accent" id="stopBtn">⏹ Darsni tugatish va tahlil qilish</button>`
      : `<button class="btn btn-accent" id="liveBtn">🎙 Jonli darsni boshlash</button><button class="btn btn-ghost" id="demoBtn">▶ Demo darsni ishga tushirish</button>`;
    if (on) $("#stopBtn").onclick = finishLesson; else { $("#liveBtn").onclick = startLive; $("#demoBtn").onclick = runDemo; }
  }
  function startTimer() {
    startTs = Date.now();
    timerInt = setInterval(() => { const s = (Date.now() - startTs) / 1000; curMin = s / 60; $("#timer").textContent = fmt(s); }, 250);
  }
  function addLine(t, who, text) {
    const box = $("#transcript");
    if (box.querySelector(".muted")) box.innerHTML = "";
    const d = document.createElement("div");
    d.className = "ln" + (who === "student" ? " st" : "");
    d.innerHTML = `<time>${t}</time><span>${who === "student" ? "🙋 " : ""}${esc(text)}</span>`;
    box.appendChild(d); box.scrollTop = box.scrollHeight;
  }

  let liveTranscript = [];
  function startLive() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Bu brauzer nutqni aniqlamaydi — Chrome'da oching yoki Demo'ni ishga tushiring"); return; }
    stopAll(); S._live = null; liveTranscript = [];
    $("#transcript").innerHTML = ""; renderWave(); $("#confCount").textContent = "0";
    rec = new SR();
    rec.lang = AI.store.get("darsizi_lang", "uz-UZ");
    rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) {
        const text = e.results[i][0].transcript.trim(); if (!text) continue;
        const t = fmt((Date.now() - startTs) / 1000);
        liveTranscript.push({ t, who: "teacher", text }); addLine(t, "teacher", text);
      }
    };
    rec.onerror = (e) => { if (e.error === "not-allowed") toast("Mikrofonga ruxsat bering"); };
    rec.onend = () => { if (rec) try { rec.start(); } catch {} };
    try { rec.start(); } catch {}
    setRecording(true); startTimer();
    toast("🎙 Dars yozilmoqda — gapiring");
  }

  function runDemo() {
    stopAll(); S._live = null; liveTranscript = null;
    $("#transcript").innerHTML = ""; $("#confCount").textContent = "0"; renderWave();
    setRecording(true); $("#stopBtn").textContent = "⏩ Tugatish";
    const lines = DEMO.transcript; let i = 0; const speed = 80; // 1 real soniya = 80 dars soniyasi (40 daqiqalik dars ~30 soniyada)
    startTs = Date.now();
    timerInt = setInterval(() => {
      const s = Math.min(2400, (Date.now() - startTs) / 1000 * speed); curMin = s / 60;
      $("#timer").textContent = fmt(s);
      const arr = liveConf(); const lim = Math.floor(curMin / 2);
      DEMO.confusion.forEach((c, k) => { if (k <= lim) arr[k].n = c.n; });
      const cur = arr[Math.min(19, lim)]; $("#confCount").textContent = cur ? cur.n : 0; renderWave(arr);
      while (i < lines.length && toSec(lines[i].t) <= s) { addLine(lines[i].t, lines[i].who, lines[i].text); i++; }
      if (s >= 2400) finishLesson();
    }, 120);
  }

  async function finishLesson() {
    const wasDemo = liveTranscript === null;
    stopAll(); setRecording(false);
    const proc = $("#processing"); proc.classList.add("on");
    const steps = ["Nutq matnga aylantirilmoqda…", "«Tushunmadim» daqiqalari dars matni bilan bog'lanmoqda…", "Konspekt, test va flashcard'lar tuzilmoqda…", "Dars ishlanmasi va uyga vazifa tayyorlanmoqda…", "Ota-onalarga xabar yozilmoqda…"];
    let k = 0; $("#procText").textContent = steps[0];
    const stepInt = setInterval(() => { k = Math.min(steps.length - 1, k + 1); $("#procText").textContent = steps[k]; }, 700);

    let transcript = wasDemo ? clone(DEMO.transcript) : liveTranscript;
    let confusion = wasDemo ? clone(DEMO.confusion) : clone(liveConf());
    let analysis = null, source = "demo";
    const useAI = AI.enabled() && transcript && transcript.length > 0;
    try {
      if (useAI) { analysis = await AI.analyze(S.lesson, transcript, confusion); source = "ai"; }
    } catch (err) { console.warn(err); toast("AI ishlamadi — demo natija ko'rsatildi"); }
    if (!analysis) {
      await new Promise(r => setTimeout(r, 3600));
      analysis = clone(DEMO.analysis);
      if (!wasDemo && !transcript.length) transcript = clone(DEMO.transcript);
      if (!wasDemo && !AI.enabled()) toast("AI kaliti yo'q — namunaviy tahlil ko'rsatildi");
    }
    clearInterval(stepInt); proc.classList.remove("on");
    if (analysis.topic) S.lesson.topic = analysis.topic;
    Object.assign(S, { transcript, confusion, analysis, source }); delete S._live; saveState();
    renderResults(true);
    toast("✅ Tayyor! Natijalar o'quvchi, ota-ona va maktabga yuborildi");
  }

  let tTab = "plan";
  function renderResults(scroll) {
    const A = S.analysis, box = $("#results"); if (!box || !A) return;
    box.innerHTML = `
      <div class="sec-head"><div><div class="eyebrow">Dars tugagach — 0 daqiqada tayyor</div><h2 style="margin-top:4px">${esc(S.lesson.topic)}</h2></div>
        <span class="pill ${S.source === "ai" ? "teal" : "violet"}">${S.source === "ai" ? "AI tahlili" : "Namunaviy tahlil"}</span></div>
      <div class="grid g4" style="margin-bottom:18px">
        <div class="stat"><span class="muted">Tejalgan vaqt</span><b>~2 soat</b></div>
        <div class="stat"><span class="muted">Eng og'ir daqiqa</span><b style="color:var(--accent)">${esc(A.confusionMoments?.[0]?.t || "—")}</b></div>
        <div class="stat"><span class="muted">Siz gapirdingiz</span><b>${A.teacherTalk ?? "—"}%</b></div>
        <div class="stat"><span class="muted">Xabar yuborildi</span><b>${S.lesson.students} ota-ona</b></div>
      </div>
      <div class="tabs" id="tTabs">
        ${[["plan", "📋 Dars ishlanmasi"], ["conf", "😕 Tushunmadim xaritasi"], ["hw", "📝 Vazifa va test"], ["tips", "💡 Maslahatlar"], ["parent", "📨 Ota-onalarga"]].map(([k, l]) => `<button data-t="${k}" class="${tTab === k ? "on" : ""}">${l}</button>`).join("")}
      </div>
      <div id="tBody"></div>`;
    $$("#tTabs button").forEach(b => b.onclick = () => { tTab = b.dataset.t; renderResults(); });
    const body = $("#tBody");
    if (tTab === "plan") body.innerHTML = `
      <div class="grid g2">
        <div class="card"><h3>Dars ishlanmasi (avtomatik)</h3>${(A.lessonPlan || []).map(p => `<div class="plan-step"><div class="m">${esc(p.min)}</div><div><b>${esc(p.step)}</b><div class="muted">${esc(p.note)}</div></div></div>`).join("")}</div>
        <div class="card"><h3>Konspekt</h3><p style="margin:10px 0 14px">${esc(A.summary)}</p><ul class="clean">${(A.keyPoints || []).map((k, i) => `<li><span class="num">${i + 1}</span>${esc(k)}</li>`).join("")}</ul></div>
      </div>`;
    if (tTab === "conf") {
      const conf = S.confusion || [], max = Math.max(5, ...conf.map(c => c.n));
      body.innerHTML = `
      <div class="grid g2">
        <div class="card"><div class="row between"><h3>Dars davomida «Tushunmadim»</h3><span class="pill red">${conf.reduce((s, c) => s + c.n, 0)} ta signal</span></div>
          <div class="chart-bars">${conf.map(c => `<div class="b ${c.n >= max * 0.6 && c.n > 2 ? "hot" : ""}" style="height:${Math.max(2, c.n / max * 100)}%" data-tip="${c.min}-daq: ${c.n} ta"></div>`).join("")}</div>
          <div class="axis"><span>0 daq</span><span>20 daq</span><span>40 daq</span></div></div>
        <div class="card"><h3>Sinf aynan qayerda adashdi</h3>${(A.confusionMoments || []).map(m => `
          <div class="moment"><div class="t">${esc(m.t)}</div><div><div class="pill red">${m.n} ta o'quvchi tushunmadi</div><div style="margin:6px 0;font-style:italic">«${esc(m.quote)}»</div><div class="muted">💡 ${esc(m.tip)}</div></div></div>`).join("")}</div>
      </div>`;
    }
    if (tTab === "hw") body.innerHTML = `
      <div class="grid g2">
        <div class="card"><h3>Uyga vazifa</h3><ul class="clean" style="margin-top:8px">${(A.homework || []).map((h, i) => `<li><span class="num">${i + 1}</span>${esc(h)}</li>`).join("")}</ul>
          <button class="btn btn-ink btn-sm" style="margin-top:12px" onclick="this.textContent='✓ O\\'quvchilarga yuborildi'">O'quvchilarga yuborish</button></div>
        <div class="card"><h3>Test (${(A.quiz || []).length} ta savol, avto-tekshiriladi)</h3><ul class="clean" style="margin-top:8px">${(A.quiz || []).map((q, i) => `<li><span class="num">${i + 1}</span><div><b>${esc(q.q)}</b><div class="muted">✓ ${esc(q.options[q.a])}</div></div></li>`).join("")}</ul></div>
      </div>`;
    if (tTab === "tips") {
      const tt = A.teacherTalk ?? 70;
      body.innerHTML = `
      <div class="grid g3">
        <div class="card" style="text-align:center"><h3>Kim ko'proq gapirdi</h3>
          <div class="gauge" style="background:conic-gradient(var(--violet) 0 ${tt}%, var(--teal) ${tt}% 100%)"><div><div><b>${tt}%</b><div class="muted" style="font-size:12px">o'qituvchi</div></div></div></div>
          <div class="legend" style="justify-content:center"><span><i style="background:var(--violet)"></i>O'qituvchi</span><span><i style="background:var(--teal)"></i>O'quvchilar</span></div></div>
        <div class="card span2"><h3>AI maslahatlari</h3><ul class="clean" style="margin-top:8px">${(A.tips || []).map(t => `<li>💡 ${esc(t)}</li>`).join("")}</ul>
          <h3 style="margin-top:16px">Imtihonlar bilan bog'liqlik</h3><div class="row wrapf" style="margin-top:8px">${(A.examLinks || []).map(e => `<span class="pill violet" title="${esc(e.note)}">${esc(e.exam)}</span>`).join("")}</div></div>
      </div>`;
    }
    if (tTab === "parent") body.innerHTML = `<div class="grid g2"><div>${tgCard(A.parentMessage)}</div>
      <div class="card"><h3>${S.lesson.students} ta ota-onaga avtomatik yuborildi</h3><p class="muted" style="margin-top:8px">Har bir ota-ona farzandining ismi bilan shaxsiy xabar oladi. Agar farzand «Tushunmadim»ni bosgan bo'lsa, xabarga «uyda shu mavzuni birga takrorlang» degan maslahat qo'shiladi.</p>
      <a class="btn btn-ghost btn-sm" style="margin-top:14px" href="#/parent">Ota-ona panelini ochish →</a></div></div>`;
    if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function tgCard(text) {
    return `<div class="tg"><div class="tg-head"><div class="tg-ava"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 18c3-1 4-4 6-8s4-6 10-6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><circle cx="5" cy="18" r="2.4" fill="#ff5a3c"/></svg></div>
      <div><b>DarsIzi bot</b><div class="muted" style="font-size:12px">bot · Telegram</div></div></div>
      <div class="tg-body"><div class="tg-msg">📚 <b>Bugungi dars hisoboti</b><br><br>${esc(text)}<time>19:00 ✓✓</time></div>
      <div class="tg-btns"><button>📖 Konspekt</button><button>📊 Progress</button><button>✅ So'radim</button><button>💬 Ustozga yozish</button></div></div></div>`;
  }

  // =========================================================
  // O'QUVCHI
  // =========================================================
  let qi = 0, qScore = 0, qAnswered = false, fIdx = 0, chatLog = [];
  function student() {
    const A = S.analysis, st = DEMO.student;
    qi = 0; qScore = 0; qAnswered = false; fIdx = 0;
    app.innerHTML = `
    <section class="page">
      <div class="row between wrapf">
        <div><div class="eyebrow">O'quvchi ilovasi</div><h2 style="margin-top:4px">Salom, ${esc(st.name.split(" ")[0])}! 👋</h2><div class="muted">${esc(S.lesson.subject)} · ${esc(S.lesson.topic)}</div></div>
        <div class="stat-row"><div class="stat"><span class="muted">Streak</span><b>🔥 ${st.streak} kun</b></div><div class="stat"><span class="muted">Ball</span><b>⭐ <span id="xp">${st.xp}</span></b></div></div>
      </div>

      <div class="grid g3" style="margin-top:18px">
        <div class="card span2">
          <div class="row between"><h3>Darsda tushunmadingizmi?</h3><span class="pill">🔒 Anonim</span></div>
          <p class="muted" style="margin:6px 0 14px">Tugmani bosing — ustoz kim bosganini ko'rmaydi, faqat sinfning necha foizi adashganini biladi.</p>
          <button class="confused-btn" id="confBtn">😕 Tushunmadim</button>
        </div>
        <div class="card"><h3>🎧 Dars podkasti</h3><p class="muted" style="margin:6px 0 14px">Darsning 1 daqiqalik ovozli xulosasi — yo'lda tinglang.</p>
          <button class="btn btn-ink" id="podBtn">▶ Tinglash</button></div>
      </div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card"><h3>📖 Konspekt</h3><p style="margin:10px 0 12px">${esc(A.summary)}</p>
          <ul class="clean">${(A.keyPoints || []).map((k, i) => `<li><span class="num">${i + 1}</span>${esc(k)}</li>`).join("")}</ul></div>
        <div class="card" id="quizCard"></div>
      </div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card">
          <div class="row between"><h3>💬 Dars bilan suhbat</h3><span class="pill ${AI.enabled() ? "teal" : ""}">${AI.enabled() ? "AI" : "Dars matnidan"}</span></div>
          <p class="muted" style="font-size:13.5px;margin-top:4px">Ustozning <b>o'z tushuntirishi</b> asosida javob oladi — internetdagi umumiy javob emas.</p>
          <div class="chat" style="margin-top:10px"><div class="chat-log" id="chatLog"></div>
            <div class="chips" id="chips"><button>Umumiy maxrajni qanday topaman?</button><button>Nega maxrajni qo'shmaymiz?</button><button>Qo'shimcha ko'paytuvchi nima?</button></div>
            <form class="chat-in" id="chatForm"><input id="chatIn" placeholder="Savolingizni yozing…" autocomplete="off"><button class="btn btn-ink">➤</button></form></div>
        </div>
        <div class="grid" style="gap:18px">
          <div class="card"><div class="row between"><h3>🃏 Flashcard</h3><span class="muted" id="fNum"></span></div>
            <div class="flash" id="flash" style="margin-top:12px"><div class="flash-in"><div class="flash-f" id="fF"></div><div class="flash-b" id="fB"></div></div></div>
            <div class="row between" style="margin-top:12px"><span class="muted" style="font-size:13px">Bosing — javobni ko'ring</span><button class="btn btn-ghost btn-sm" id="fNext">Keyingisi →</button></div></div>
          <div class="card"><h3>🎯 Zaif mavzular xaritasi</h3>
            ${st.weak.map(w => `<div class="bar-row"><div class="row between"><span>${esc(w.topic)}</span><span class="muted">${w.level}%</span></div><div class="bar"><i style="width:${w.level}%;background:${w.level < 50 ? "var(--accent)" : w.level < 70 ? "var(--amber)" : "var(--teal)"}"></i></div></div>`).join("")}
            <div class="row wrapf" style="margin-top:10px">${(A.examLinks || []).map(e => `<span class="pill violet" title="${esc(e.note)}">🎓 ${esc(e.exam)}</span>`).join("")}</div></div>
        </div>
      </div>
    </section>`;

    $("#confBtn").onclick = (e) => {
      const b = e.currentTarget; if (bc) bc.postMessage({ type: "confused", t: Date.now() });
      b.classList.add("sent"); b.textContent = "✓ Ustozga yuborildi (anonim)";
      setTimeout(() => { b.classList.remove("sent"); b.textContent = "😕 Tushunmadim"; }, 2200);
    };
    $("#podBtn").onclick = podcast;
    renderQuiz(); renderFlash();
    $("#flash").onclick = () => $("#flash").classList.toggle("flip");
    $("#fNext").onclick = () => { fIdx = (fIdx + 1) % A.flashcards.length; $("#flash").classList.remove("flip"); setTimeout(renderFlash, 200); };
    chatLog = chatLog.length ? chatLog : [{ who: "ai", text: `Salom! Men bugungi «${S.lesson.topic}» darsini to'liq eshitganman. Nimani tushunmadingiz?` }];
    renderChat();
    $("#chatForm").onsubmit = (e) => { e.preventDefault(); const v = $("#chatIn").value.trim(); if (v) { $("#chatIn").value = ""; ask(v); } };
    $$("#chips button").forEach(b => b.onclick = () => ask(b.textContent));
  }

  function podcast() {
    if (!window.speechSynthesis) { toast("Brauzer ovozli o'qishni qo'llamaydi"); return; }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); $("#podBtn").textContent = "▶ Tinglash"; return; }
    const A = S.analysis;
    const u = new SpeechSynthesisUtterance(`Bugungi dars: ${S.lesson.topic}. ${A.summary} Asosiy fikrlar: ${(A.keyPoints || []).join(". ")}`);
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v => /uz/i.test(v.lang)) || voices.find(v => /tr|ru/i.test(v.lang)) || null;
    u.rate = 0.95; u.onend = () => { const b = $("#podBtn"); if (b) b.textContent = "▶ Tinglash"; };
    speechSynthesis.speak(u); $("#podBtn").textContent = "⏸ To'xtatish";
  }

  function renderQuiz() {
    const Q = S.analysis.quiz || [], c = $("#quizCard"); if (!c) return;
    if (qi >= Q.length) {
      c.innerHTML = `<h3>📝 Test natijasi</h3><div style="text-align:center;padding:24px 0"><div style="font-size:56px;font-weight:800;letter-spacing:-.04em">${qScore}/${Q.length}</div>
        <p class="muted">${qScore === Q.length ? "Zo'r! Mavzu to'liq o'zlashtirildi 🎉" : "Xato qilingan savollar takrorlash ro'yxatiga qo'shildi."}</p>
        <button class="btn btn-ink" style="margin-top:14px" id="qAgain">Qaytadan</button></div>`;
      $("#qAgain").onclick = () => { qi = 0; qScore = 0; renderQuiz(); }; return;
    }
    const q = Q[qi]; qAnswered = false;
    c.innerHTML = `<div class="row between"><h3>📝 Darsdan test</h3><span class="muted">${qi + 1}/${Q.length}</span></div>
      <div class="progress" style="margin-top:10px"><i style="width:${qi / Q.length * 100}%"></i></div>
      <div class="quiz-q">${esc(q.q)}</div>
      ${q.options.map((o, i) => `<button class="opt" data-i="${i}">${String.fromCharCode(65 + i)}) ${esc(o)}</button>`).join("")}
      <div id="qWhy"></div>`;
    $$(".opt", c).forEach(b => b.onclick = () => {
      if (qAnswered) return; qAnswered = true;
      const i = +b.dataset.i, ok = i === q.a;
      b.classList.add(ok ? "ok" : "bad"); $$(".opt", c)[q.a].classList.add("ok");
      if (ok) { qScore++; const x = $("#xp"); if (x) x.textContent = +x.textContent + 10; }
      $("#qWhy").innerHTML = `<div class="why">${ok ? "✅ To'g'ri! " : "❌ "}${esc(q.why)}</div><button class="btn btn-ink btn-sm" style="margin-top:12px" id="qNext">Keyingi →</button>`;
      $("#qNext").onclick = () => { qi++; renderQuiz(); };
    });
  }
  function renderFlash() {
    const F = S.analysis.flashcards || []; if (!F.length || !$("#fF")) return;
    $("#fF").textContent = F[fIdx].f; $("#fB").textContent = F[fIdx].b; $("#fNum").textContent = `${fIdx + 1}/${F.length}`;
  }
  function renderChat() {
    const log = $("#chatLog"); if (!log) return;
    log.innerHTML = chatLog.map(m => `<div class="msg ${m.who}">${esc(m.text)}${m.src ? `<span class="src">${esc(m.src)}</span>` : ""}</div>`).join("");
    log.scrollTop = log.scrollHeight;
  }
  async function ask(q) {
    chatLog.push({ who: "me", text: q }); chatLog.push({ who: "ai", text: "…" }); renderChat();
    let ans;
    try {
      if (AI.enabled()) ans = { text: await AI.chat(q, S.lesson, S.transcript, S.analysis), src: "AI · dars matni asosida" };
    } catch (e) { console.warn(e); }
    if (!ans) { await new Promise(r => setTimeout(r, 600)); ans = AI.localChat(q, S.transcript); }
    chatLog[chatLog.length - 1] = { who: "ai", text: ans.text, src: ans.src }; renderChat();
  }

  // =========================================================
  // OTA-ONA
  // =========================================================
  function parent() {
    const P = DEMO.parentWeek, A = S.analysis;
    app.innerHTML = `
    <section class="page">
      <div class="row between wrapf">
        <div><div class="eyebrow">Ota-ona paneli</div><h2 style="margin-top:4px">${esc(P.child)}</h2><div class="muted">6-B sinf · Seven School</div></div>
        <div class="stat-row"><div class="stat"><span class="muted">Davomat</span><b>${P.attendance}</b></div><div class="stat"><span class="muted">Bu hafta testlar</span><b>4/5</b></div></div>
      </div>
      <div class="grid g2" style="margin-top:18px">
        <div>${tgCard(A.parentMessage)}</div>
        <div class="card"><h3>Ogohlantirishlar</h3>${P.alerts.map(a => `<div class="alert ${a.type}"><span>${a.type === "warn" ? "⚠️" : "🌟"}</span><span>${esc(a.text)}</span></div>`).join("")}
          <h3 style="margin-top:18px">Bugun farzandingizdan so'rang</h3>
          <div class="alert" style="background:var(--violet-soft)"><span>❓</span><span><b>${esc(A.quiz?.[1]?.q || "")}</b><br><span class="muted">Javob: ${esc(A.quiz?.[1]?.options?.[A.quiz[1].a] || "")}</span></span></div></div>
      </div>
      <div class="card" style="margin-top:18px">
        <div class="row between wrapf"><h3>Haftalik o'zlashtirish</h3><span class="pill">%</span></div>
        ${lineChart(P)}
        <div class="legend">${P.subjects.map((s, i) => `<span><i style="background:${["var(--accent)", "var(--teal)", "var(--violet)"][i]}"></i>${esc(s.name)}</span>`).join("")}</div>
      </div>
      <div class="card" style="margin-top:18px"><h3>📖 Bugungi dars konspekti — birga takrorlang</h3><p style="margin-top:8px">${esc(A.summary)}</p></div>
    </section>`;
  }
  function lineChart(P) {
    const W = 760, H = 230, pad = 34, cols = ["#ff5a3c", "#0f9d8a", "#5b4de0"];
    const x = i => pad + i * (W - pad * 2) / (P.days.length - 1), y = v => H - pad - (v - 40) / 60 * (H - pad * 2);
    const grid = [40, 60, 80, 100].map(v => `<line x1="${pad}" x2="${W - pad}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(--line)" stroke-dasharray="3 4"/><text x="4" y="${y(v) + 4}" font-size="11" style="fill:var(--muted)">${v}</text>`).join("");
    const lines = P.subjects.map((s, k) => `<polyline fill="none" stroke="${cols[k]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${s.vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")}"/>${s.vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" style="fill:var(--card)" stroke="${cols[k]}" stroke-width="2.5"><title>${s.name}: ${v}%</title></circle>`).join("")}`).join("");
    const labels = P.days.map((d, i) => `<text x="${x(i)}" y="${H - 8}" font-size="12" text-anchor="middle" style="fill:var(--muted)">${d}</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;margin-top:10px">${grid}${lines}${labels}</svg>`;
  }

  // =========================================================
  // MAKTAB
  // =========================================================
  function school() {
    const M = DEMO.school;
    const lvl = v => v < 50 ? "l1" : v < 65 ? "l2" : v < 78 ? "l3" : "l4";
    app.innerHTML = `
    <section class="page">
      <div><div class="eyebrow">Maktab va vazirlik paneli</div><h2 style="margin-top:4px">${esc(M.name)} · analitika</h2></div>
      <div class="grid g4" style="margin-top:18px">
        <div class="card kpi"><span class="muted">Tahlil qilingan darslar</span><b>${M.stats.lessons.toLocaleString("ru")}</b></div>
        <div class="card kpi"><span class="muted">O'qituvchilar tejagan vaqt</span><b>${M.stats.hoursSaved} soat</b></div>
        <div class="card kpi"><span class="muted">Hal qilingan «tushunmadim»</span><b>${M.stats.confusionResolved}%</b></div>
        <div class="card kpi"><span class="muted">Faol ota-onalar</span><b>${M.stats.parents.toLocaleString("ru")}</b></div>
      </div>
      <div class="grid g3" style="margin-top:18px">
        <div class="card span2"><div class="row between wrapf"><h3>Mavzular xaritasi — o'zlashtirish %</h3><span class="pill red">«Umumiy maxraj» — butun maktab bo'yicha muammo</span></div>
          <div class="heat" style="grid-template-columns:120px repeat(${M.classes.length},1fr);margin-top:14px">
            <div></div>${M.classes.map(c => `<div class="col">${c}</div>`).join("")}
            ${M.topics.map((t, r) => `<div class="lbl">${esc(t)}</div>${M.grid[r].map(v => `<div class="h ${lvl(v)}">${v}</div>`).join("")}`).join("")}
          </div></div>
        <div class="card"><h3>⚠️ Yordam kerak bo'lgan o'quvchilar</h3>
          ${M.atRisk.map(r => `<div class="risk"><div class="ava">${r.name[0]}</div><div><b>${esc(r.name)}</b> <span class="pill">${r.cls}</span><div class="muted" style="font-size:13.5px">${esc(r.reason)}</div></div></div>`).join("")}
          <button class="btn btn-ink btn-sm" style="margin-top:10px" onclick="this.textContent='✓ Sinf rahbarlariga yuborildi'">Sinf rahbarlariga yuborish</button></div>
      </div>
    </section>`;
  }

  // ---------- sozlamalar ----------
  function refreshDot() { $("#aiDot").classList.toggle("on", AI.enabled()); }
  $("#settingsBtn").onclick = () => {
    $("#apiKey").value = AI.store.get("darsizi_key", ""); $("#apiModel").value = AI.store.get("darsizi_model", "");
    $("#speechLang").value = AI.store.get("darsizi_lang", "uz-UZ"); $("#settings").classList.add("on");
  };
  $$("[data-close]").forEach(b => b.onclick = () => $("#settings").classList.remove("on"));
  $("#settings").onclick = (e) => { if (e.target.id === "settings") $("#settings").classList.remove("on"); };
  $("#saveSettings").onclick = () => {
    AI.store.set("darsizi_key", $("#apiKey").value.trim()); AI.store.set("darsizi_model", $("#apiModel").value.trim());
    AI.store.set("darsizi_lang", $("#speechLang").value); refreshDot(); $("#settings").classList.remove("on"); toast("Saqlandi"); route();
  };
  $("#testAI").onclick = async () => {
    AI.store.set("darsizi_key", $("#apiKey").value.trim()); AI.store.set("darsizi_model", $("#apiModel").value.trim());
    toast("Tekshirilmoqda…");
    try { const r = await AI.call("Bitta so'z bilan javob ber: Salom"); toast("✅ AI ishlayapti: " + r.trim().slice(0, 30)); refreshDot(); }
    catch (e) { toast("❌ " + e.message); }
  };

  // ---------- dark / light ----------
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t === "dark" || t === "light") return t;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paintThemeBtn() {
    const dark = currentTheme() === "dark";
    $("#themeBtn").textContent = dark ? "☀️" : "🌙";
    $("#themeBtn").title = dark ? "Yorug' rejim" : "Qorong'i rejim";
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#0e1022" : "#171a33";
  }
  $("#themeBtn").onclick = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("darsizi_theme", next); } catch {}
    paintThemeBtn();
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", paintThemeBtn);
  paintThemeBtn();

  refreshDot();
  route();
})();
