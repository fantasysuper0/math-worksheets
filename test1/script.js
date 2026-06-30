/**
 * 算术练习纸生成器
 * ----------------------------------------------------------------
 * 题目范围：10 ~ 100 以内加减法
 *   - 口算 30 题：单步两运算数，结果与运算数均落在 [10, 100]
 *   - 计算 8 题 ：两数竖式（加法/减法），运算数与结果均落在 [10, 100]
 * ----------------------------------------------------------------
 * 设计要点：
 *   - 纯函数 + 随机生成，无外部依赖
 *   - 渲染与逻辑分离，便于复用与测试
 *   - 支持答案显隐切换与重新生成
 */
(function () {
  "use strict";

  /* ---------- 常量配置 ---------- */
  const ORAL_COUNT = 40;   // 口算题数
  const WRITTEN_COUNT = 8; // 计算题数
  const MIN = 10;          // 数值下限（含）
  const MAX = 100;         // 数值上限（含）
  const MAX_CARRY = 2;     // 口算中涉及进位的题数上限
  const MAX_BORROW = 2;    // 口算中涉及退位的题数上限

  /* ---------- 通用工具函数 ---------- */

  /**
   * 生成 [min, max] 闭区间内的随机整数
   * @param {number} min - 下限（含）
   * @param {number} max - 上限（含）
   * @returns {number}
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 判断加法是否涉及进位：个位相加 ≥ 10 则需进位
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  function isCarry(a, b) {
    return (a % 10) + (b % 10) >= 10;
  }

  /**
   * 判断减法是否涉及退位：被减数个位 < 减数个位 则需退位
   * @param {number} a - 被减数
   * @param {number} b - 减数
   * @returns {boolean}
   */
  function isBorrow(a, b) {
    return (a % 10) < (b % 10);
  }

  /* ---------- 口算题生成（两运算数） ---------- */

  /**
   * 生成一道口算题：加法或减法，运算数与结果均在 [10, 100]
   * @returns {{a:number,b:number,op:string,result:number}}
   */
  function generateOral() {
    const isAdd = Math.random() < 0.5; // 加减各半

    if (isAdd) {
      // a + b = c，需保证 a,b ≥ 10 且 c ≤ 100
      const a = randInt(MIN, MAX - MIN);          // a ∈ [10, 90]
      const b = randInt(MIN, MAX - a);            // b ∈ [10, 100-a]，c = a+b ≤ 100
      return { a, b, op: "+", result: a + b };
    }
    // a - b = c，需保证 a,b ≥ 10 且 c ≥ 10
    const a = randInt(MIN + MIN, MAX);            // a ∈ [20, 100]
    const b = randInt(MIN, a - MIN);              // b ∈ [10, a-10]，c = a-b ≥ 10
    return { a, b, op: "−", result: a - b };      // 使用排版减号 − (U+2212)
  }

  /**
   * 批量生成口算题集，控制进位/退位题数不超上限
   * 进位题 ≤ MAX_CARRY，退位题 ≤ MAX_BORROW，其余为不进位不退位
   * @returns {Array<{a:number,b:number,op:string,result:number}>}
   */
  function generateOralSet() {
    const set = [];
    let carry = 0;
    let borrow = 0;
    // 防御性最大尝试次数，避免极端情况下死循环
    let attempts = 0;
    const maxAttempts = ORAL_COUNT * 50;

    while (set.length < ORAL_COUNT && attempts < maxAttempts) {
      attempts++;
      const p = generateOral();
      let needCarry = false;
      let needBorrow = false;
      if (p.op === "+" && isCarry(p.a, p.b)) needCarry = true;
      if (p.op === "−" && isBorrow(p.a, p.b)) needBorrow = true;

      // 超配额则丢弃该题，重新生成
      if (needCarry && carry >= MAX_CARRY) continue;
      if (needBorrow && borrow >= MAX_BORROW) continue;

      if (needCarry) carry++;
      if (needBorrow) borrow++;
      set.push(p);
    }
    return set;
  }

  /* ---------- 计算题生成（两数竖式） ---------- */

  /**
   * 生成一道竖式计算题：两数加减法
   * 复用口算生成逻辑，运算数与结果均落在 [10, 100]
   * @returns {{a:number,b:number,op:string,result:number}}
   */
  function generateWritten() {
    return generateOral();
  }

  /* ---------- 渲染层 ---------- */

  /**
   * 创建口算题 li 元素
   * @param {{a:number,b:number,op:string,result:number}} p
   * @returns {HTMLLIElement}
   */
  function renderOralItem(p) {
    const li = document.createElement("li");
    // 结构：a op b = [空格/答案]
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
   * 创建竖式计算题 li 元素
   * 题目以横式呈现："a op b = ___"，下方留出空白区供手写竖式
   * @param {{a:number,b:number,op:string,result:number}} p
   * @returns {HTMLLIElement}
   */
  function renderWrittenItem(p) {
    const li = document.createElement("li");
    // 题目行：横式表达 + 答案空格；下方 work-area 留白手写竖式
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
   * 渲染整张练习纸：清空并填入新题目
   */
  function render() {
    const oralList = document.getElementById("oralList");
    const writtenList = document.getElementById("writtenList");
    oralList.innerHTML = "";
    writtenList.innerHTML = "";

    // 生成 30 道口算题（限制进位/退位题数）
    const oralSet = generateOralSet();
    oralSet.forEach((p) => oralList.appendChild(renderOralItem(p)));

    // 生成 8 道竖式计算题
    for (let i = 0; i < WRITTEN_COUNT; i++) {
      writtenList.appendChild(renderWrittenItem(generateWritten()));
    }
  }

  /* ---------- 交互绑定 ---------- */

  /**
   * 切换答案显隐：通过 body.show-answer 类控制
   */
  function bindToggleAnswer() {
    const btn = document.getElementById("toggleAnswer");
    btn.addEventListener("click", () => {
      const showing = document.body.classList.toggle("show-answer");
      btn.setAttribute("aria-pressed", String(showing));
      btn.textContent = showing ? "隐藏答案" : "显示答案";
    });
  }

  /**
   * 重新生成题目
   */
  function bindRegenerate() {
    document.getElementById("regenerate").addEventListener("click", render);
  }

  /**
   * 检测当前浏览器是否为受限浏览器
   * 国产移动浏览器（UC/夸克/QQ/360/百度/华为/荣耀自带等）普遍
   * 静默拦截 window.print()，需给出替代提示
   * @returns {boolean}
   */
  function isRestrictedBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    // 关键词命中即视为受限浏览器
    const keywords = [
      "micromessenger", // 微信内置
      "qqbrowser", "qq/", // QQ 浏览器
      "ucbrowser", "ucweb", // UC 浏览器
      "quark", // 夸克
      "qihoo", "360se", "360browser", // 360
      "baidubrowser", "baidu", // 百度
      "huawei", "honor", "hbpc", // 华为 / 荣耀自带
      "mqqbrowser", "tbs", // X5 / TBS 内核
      "sogou", // 搜狗
      "liebao", // 猎豹
      "maxthon", // 遨游
      "micromessenger" // 兜底
    ];
    return keywords.some((k) => ua.indexOf(k) !== -1);
  }

  /**
   * 显示打印提示弹窗：引导用户在受限浏览器中完成打印
   * 弹窗样式全部内联，避免依赖外部 CSS
   */
  function showPrintTip() {
    // 避免重复创建
    if (document.getElementById("printTipMask")) return;

    const mask = document.createElement("div");
    mask.id = "printTipMask";
    Object.assign(mask.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      zIndex: "9999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    });

    // 弹窗卡片
    const card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fffdf7",
      borderRadius: "12px",
      padding: "28px 24px 20px",
      maxWidth: "380px",
      width: "100%",
      fontFamily: '"Noto Serif SC", serif',
      color: "#1a2233",
      boxShadow: "0 20px 50px -20px rgba(0,0,0,0.5)"
    });

    card.innerHTML =
      '<div style="font-size:1.15rem;font-weight:600;margin-bottom:12px;">该浏览器不支持直接打印</div>' +
      '<div style="font-size:0.9rem;line-height:1.7;color:#4a5466;margin-bottom:16px;">' +
        '当前浏览器（如荣耀/华为/UC/夸克/QQ 等自带浏览器）禁用了打印功能，请用以下任一方式：' +
      '</div>' +
      '<ol style="font-size:0.88rem;line-height:1.75;color:#1a2233;padding-left:1.2em;margin-bottom:18px;">' +
        '<li>换用 <b>Chrome</b> 或 <b>Safari</b> 浏览器打开本页，再点打印；</li>' +
        '<li>浏览器菜单里找 <b>"网页转 PDF"</b> 或 <b>"另存为 PDF"</b>；</li>' +
        '<li>长按页面 → <b>分享 → 存为 PDF</b>。</li>' +
      '</ol>' +
      '<button id="printTipClose" style="' +
        'width:100%;padding:11px;border:none;border-radius:8px;' +
        'background:#1a2233;color:#fffdf7;font-size:0.95rem;font-weight:600;cursor:pointer;">' +
        '知道了</button>';

    mask.appendChild(card);
    document.body.appendChild(mask);

    // 点击遮罩或按钮关闭
    const close = () => mask.remove();
    card.querySelector("#printTipClose").addEventListener("click", close);
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
  }

  /**
   * 打印：调用浏览器原生打印对话框（亦可另存为 PDF）
   * 受限浏览器静默拦截 print()，需先检测并给出替代提示
   */
  function bindPrint() {
    document.getElementById("printBtn").addEventListener("click", () => {
      // 受限浏览器：直接弹提示，避免无效调用
      if (isRestrictedBrowser()) {
        showPrintTip();
        return;
      }
      // 标准浏览器：尝试调用打印，失败则降级提示
      try {
        window.print();
      } catch (e) {
        showPrintTip();
      }
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    render();
    bindToggleAnswer();
    bindRegenerate();
    bindPrint();
  }

  // DOM 就绪后启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
