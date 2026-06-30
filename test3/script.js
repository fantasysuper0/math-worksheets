/**
 * 混合运算练习纸生成器
 * ----------------------------------------------------------------
 * 题目范围：10 ~ 100 以内 加 / 减 / 乘 混合
 *   - 口算 40 题：三种运算均匀分布（约 13 加 + 13 减 + 14 乘）
 *   - 竖式 8 题 ：两数运算，三种运算混合
 * ----------------------------------------------------------------
 * 约束：加法结果 ≤100，减法结果 ≥10，乘法乘数 ∈ [2,9]
 */
(function () {
  "use strict";

  /* ---------- 常量配置 ---------- */
  const ORAL_COUNT = 40;   // 口算题数
  const WRITTEN_COUNT = 8; // 竖式题数
  const MIN = 10;          // 加减法数值下限
  const MAX = 100;         // 加减法数值上限
  const MAX_FACTOR = 9;    // 乘法因子上限

  /* ---------- 通用工具函数 ---------- */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ---------- 各题型生成器 ---------- */

  /**
   * 加法：a + b = c，a,b ≥ 10 且 c ≤ 100
   */
  function genAdd() {
    const a = randInt(MIN, MAX - MIN);
    const b = randInt(MIN, MAX - a);
    return { a, b, op: "+", result: a + b };
  }

  /**
   * 减法：a - b = c，a,b ≥ 10 且 c ≥ 10
   */
  function genSub() {
    const a = randInt(MIN + MIN, MAX);
    const b = randInt(MIN, a - MIN);
    return { a, b, op: "−", result: a - b };
  }

  /**
   * 乘法：a × b，a ∈ [10, 99]，b ∈ [2, 9]
   * 结果自然在乘法表范围，不强制约束
   */
  function genMul() {
    const a = randInt(MIN, 99);
    const b = randInt(2, MAX_FACTOR);
    return { a, b, op: "×", result: a * b };
  }

  /* ---------- 批量生成口算题（加减乘均衡） ---------- */

  /**
   * 生成 40 道口算题：按 13 加 / 13 减 / 14 乘 配比，
   * 不足部分用乘法补足，保证三题型均衡分布
   * @returns {Array}
   */
  function generateOralSet() {
    const set = [];
    const addCount = Math.floor(ORAL_COUNT / 3);       // 13
    const subCount = Math.floor(ORAL_COUNT / 3);        // 13
    const mulCount = ORAL_COUNT - addCount - subCount;  // 14

    for (let i = 0; i < addCount; i++) set.push(genAdd());
    for (let i = 0; i < subCount; i++) set.push(genSub());
    for (let i = 0; i < mulCount; i++) set.push(genMul());

    // 简单洗牌，避免三种题型连续聚集
    for (let i = set.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [set[i], set[j]] = [set[j], set[i]];
    }
    return set;
  }

  /* ---------- 竖式题生成（三运算随机） ---------- */

  /**
   * 生成一道竖式题：随机选 加/减/乘
   */
  function generateWritten() {
    const r = Math.random();
    if (r < 1 / 3) return genAdd();
    if (r < 2 / 3) return genSub();
    return genMul();
  }

  /* ---------- 渲染层 ---------- */

  /**
   * 创建口算题 li 元素
   */
  function renderOralItem(p) {
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="num">${p.a}</span>` +
      `<span class="op">${p.op}</span>` +
      `<span class="num">${p.b}</span>` +
      `<span class="eq">=</span>` +
      `<span class="blank-line"></span>` +
      `<span class="answer">${p.result}</span>`;
    return li;
  }

  /**
   * 创建竖式题 li 元素：横式题目 + 下方手写区
   */
  function renderWrittenItem(p) {
    const li = document.createElement("li");
    li.innerHTML =
      `<div class="q-line">` +
        `<span class="num">${p.a}</span>` +
        `<span class="op">${p.op}</span>` +
        `<span class="num">${p.b}</span>` +
        `<span class="eq">=</span>` +
        `<span class="blank-line"></span>` +
        `<span class="answer">${p.result}</span>` +
      `</div>` +
      `<div class="work-area"></div>`;
    return li;
  }

  /**
   * 渲染整张练习纸
   */
  function render() {
    const oralList = document.getElementById("oralList");
    const writtenList = document.getElementById("writtenList");
    oralList.innerHTML = "";
    writtenList.innerHTML = "";

    generateOralSet().forEach((p) => oralList.appendChild(renderOralItem(p)));
    for (let i = 0; i < WRITTEN_COUNT; i++) {
      writtenList.appendChild(renderWrittenItem(generateWritten()));
    }
  }

  /* ---------- 受限浏览器检测（与 test1 一致） ---------- */
  function isRestrictedBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    const keywords = [
      "micromessenger", "qqbrowser", "ucbrowser", "quark",
      "qihoo", "360se", "baidubrowser", "huawei", "honor",
      "mqqbrowser", "tbs", "sogou", "liebao", "maxthon"
    ];
    return keywords.some((k) => ua.indexOf(k) !== -1);
  }

  function showPrintTip() {
    if (document.getElementById("printTipMask")) return;
    const mask = document.createElement("div");
    mask.id = "printTipMask";
    Object.assign(mask.style, {
      position: "fixed", inset: "0", background: "rgba(0,0,0,0.45)",
      zIndex: "9999", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px"
    });
    const card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fffdf7", borderRadius: "12px", padding: "28px 24px 20px",
      maxWidth: "380px", width: "100%", fontFamily: '"Noto Serif SC", serif',
      color: "#1a2233", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.5)"
    });
    card.innerHTML =
      '<div style="font-size:1.15rem;font-weight:600;margin-bottom:12px;">该浏览器不支持直接打印</div>' +
      '<div style="font-size:0.9rem;line-height:1.7;color:#4a5466;margin-bottom:16px;">' +
        '当前浏览器（如荣耀/华为/UC/夸克/QQ 等）禁用了打印功能，请用以下任一方式：' +
      '</div>' +
      '<ol style="font-size:0.88rem;line-height:1.75;color:#1a2233;padding-left:1.2em;margin-bottom:18px;">' +
        '<li>换用 <b>Chrome</b> 或 <b>Safari</b> 浏览器打开本页，再点打印；</li>' +
        '<li>浏览器菜单里找 <b>"网页转 PDF"</b> 或 <b>"另存为 PDF"</b>；</li>' +
        '<li>长按页面 → <b>分享 → 存为 PDF</b>。</li>' +
      '</ol>' +
      '<button id="printTipClose" style="width:100%;padding:11px;border:none;border-radius:8px;' +
        'background:#1a2233;color:#fffdf7;font-size:0.95rem;font-weight:600;cursor:pointer;">知道了</button>';
    mask.appendChild(card);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    card.querySelector("#printTipClose").addEventListener("click", close);
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
  }

  /* ---------- 交互绑定 ---------- */
  function bindToggleAnswer() {
    const btn = document.getElementById("toggleAnswer");
    btn.addEventListener("click", () => {
      const showing = document.body.classList.toggle("show-answer");
      btn.setAttribute("aria-pressed", String(showing));
      btn.textContent = showing ? "隐藏答案" : "显示答案";
    });
  }

  function bindRegenerate() {
    document.getElementById("regenerate").addEventListener("click", render);
  }

  function bindPrint() {
    document.getElementById("printBtn").addEventListener("click", () => {
      if (isRestrictedBrowser()) { showPrintTip(); return; }
      try { window.print(); } catch (e) { showPrintTip(); }
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    render();
    bindToggleAnswer();
    bindRegenerate();
    bindPrint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
