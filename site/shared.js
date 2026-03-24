/**
 * shared.js — 校園演唱會購票系統 共用 JS 模組
 *
 * 使用方式：在 HTML <head> 載入 Firebase SDK 後，
 * 再載入此檔案。此檔案會自動初始化 Firebase 並掛載全域工具。
 *
 * 暴露的全域物件：
 *   window.db        — Firestore 實例
 *   window.AppAuth   — 認證輔助工具
 *   window.AppUI     — UI 工具（esc, norm, tsToText, page transition…）
 *   window.AppNav    — 頂部導覽列
 */

(function () {
  "use strict";

  /* ── Firebase 初始化 ── */
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDtF2pHo84vy2n_dJAkCisopllaLAWjaj0",
    authDomain: "concert-1ff7e.firebaseapp.com",
    projectId: "concert-1ff7e",
    storageBucket: "concert-1ff7e.firebasestorage.app",
    messagingSenderId: "704757384914",
    appId: "1:704757384914:web:9f58e4085dd71180c5cf0b"
  };

  // 避免重複初始化（多頁面同時引入時安全）
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  window.db = firebase.firestore();

  /* ══════════════════════════════════════════
     AppUI — 共用 UI 工具
  ══════════════════════════════════════════ */
  window.AppUI = {

    /** HTML 跳脫（防 XSS） */
    esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[m]));
    },

    /** 去頭尾空白 */
    norm(s) {
      return String(s ?? "").trim();
    },

    /** Firestore Timestamp → 本地時間字串 */
    tsToText(ts) {
      try {
        if (!ts) return "-";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString("zh-Hant", { hour12: false });
      } catch { return "-"; }
    },

    /** 頁面淡入 */
    pageIn(el) {
      if (!el) return;
      requestAnimationFrame(() => el.classList.add("on"));
    },

    /** 頁面淡出後跳轉 */
    go(href, pageEl) {
      const root = pageEl || document.getElementById("pageRoot");
      if (root) root.classList.add("leaving");
      setTimeout(() => { location.href = href; }, 140);
    },

    /** 攔截所有 <a> 的頁面跳轉並套用轉場動畫 */
    initPageLinks(pageEl) {
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("http")) return;
        if (a.getAttribute("aria-disabled") === "true") return;
        e.preventDefault();
        AppUI.go(href, pageEl);
      });
    },

    /**
     * 渲染「Gate」錯誤/登入卡片
     * @param {HTMLElement} gateEl
     * @param {HTMLElement} appEl
     * @param {{ title, msg, showEmailLogin, extraBtns }} opts
     */
    showGate(gateEl, appEl, { title = "請先登入", msg = "", showEmailLogin = false, extraBtns = "" } = {}) {
      if (appEl) appEl.style.display = "none";
      gateEl.style.display = "block";

      // 若是 gate-mode（全頁登入），用新版樣式
      const isGateMode = document.body?.classList?.contains("gate-mode");

      if (isGateMode) {
        // 新版：仿圖片，背景灰，白卡片
        let loginFields = "";
        if (showEmailLogin) {
          loginFields = `
            <div style="margin-bottom:15px;">
              <label style="display:block;font-size:13px;font-weight:700;color:#444;margin-bottom:6px;">帳號</label>
              <input id="_loginEmail" type="text" placeholder="輸入 Email"
                style="width:100%;padding:12px 14px;border:1.5px solid #dde1e7;border-radius:10px;
                       font-size:14px;outline:none;background:#fff;transition:border-color .15s;"
                onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#dde1e7'" />
            </div>
            <div style="margin-bottom:18px;">
              <label style="display:block;font-size:13px;font-weight:700;color:#444;margin-bottom:6px;">密碼</label>
              <input id="_loginPassword" type="password" placeholder="輸入密碼"
                style="width:100%;padding:12px 14px;border:1.5px solid #dde1e7;border-radius:10px;
                       font-size:14px;outline:none;background:#fff;transition:border-color .15s;"
                onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#dde1e7'" />
            </div>
            <button id="_loginBtn"
              style="width:100%;padding:13px;background:#2563eb;color:#fff;border:none;
                     border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;
                     transition:background .15s;"
              onmouseover="this.style.background='#1d4ed8'"
              onmouseout="if(!this.disabled)this.style.background='#2563eb'">
              登入
            </button>
            <div id="_loginMsg" style="font-size:13px;color:#dc2626;margin-top:10px;text-align:center;display:none;"></div>
          `;
        }

        let extraHtml = extraBtns
          ? `<div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">${extraBtns}</div>`
          : "";
        if (!showEmailLogin && !extraBtns) {
          extraHtml = `<button onclick="if(typeof AppAuth!=='undefined')AppAuth.logout()"
            style="width:100%;margin-top:6px;padding:12px;border-radius:10px;border:1.5px solid #dde1e7;
                   background:#fff;font-size:13px;font-weight:700;cursor:pointer;color:#555;">
            返回 / 登出
          </button>`;
        }

        gateEl.innerHTML = `
          <div style="text-align:center;margin-bottom:26px;">
            <div style="font-size:38px;margin-bottom:10px;">🎤</div>
            <div style="font-size:19px;font-weight:900;color:#1e2a45;letter-spacing:.3px;">校園演唱會購票系統</div>
            <div style="font-size:9px;letter-spacing:2.5px;color:#bbb;margin-top:5px;text-transform:uppercase;">Concert Ticketing System</div>
          </div>
          <div style="background:#fff;border-radius:16px;padding:26px 26px 22px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            ${showEmailLogin
              ? `<div style="font-size:17px;font-weight:900;color:#111;margin-bottom:18px;">登入</div>`
              : `<div style="font-size:15px;font-weight:900;color:#111;margin-bottom:8px;">${AppUI.esc(title)}</div>
                 ${msg ? `<div style="font-size:13px;color:#888;margin-bottom:16px;line-height:1.6;">${msg}</div>` : ""}`
            }
            ${loginFields}
            ${extraHtml}
          </div>
          <div style="font-size:12px;color:#bbb;margin-top:22px;text-align:center;">© Concert Ticketing System</div>
        `;

      } else {
        // 舊版：行內 gate 卡片（用於非 dashboard 的頁面）
        gateEl.innerHTML = `
          <h1 style="margin:0 0 6px;font-size:20px;font-weight:900;">${AppUI.esc(title)}</h1>
          <div class="sub" style="margin-bottom:${showEmailLogin||extraBtns?"16px":"0"}">${msg}</div>
          ${showEmailLogin ? `
            <div style="max-width:360px;display:grid;gap:10px;margin-top:8px;">
              <input id="_loginEmail" type="text" placeholder="帳號（Email）"
                style="width:100%;padding:12px;border-radius:12px;border:1.5px solid #dde1e7;font-size:15px;outline:none;"/>
              <input id="_loginPassword" type="password" placeholder="密碼"
                style="width:100%;padding:12px;border-radius:12px;border:1.5px solid #dde1e7;font-size:15px;outline:none;"/>
              <button id="_loginBtn" style="padding:12px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">登入</button>
              <div id="_loginMsg" style="font-size:13px;color:#dc2626;display:none;"></div>
            </div>
          ` : ""}
          ${extraBtns ? `<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">${extraBtns}</div>` : ""}
          ${!showEmailLogin && !extraBtns ? `<button class="btn" id="_logoutBtn" style="margin-top:12px;">登出</button>` : ""}
        `;
      }

      // 登入按鈕共用邏輯
      const loginBtn = document.getElementById("_loginBtn");
      if (loginBtn) {
        const doLogin = async () => {
          const emailVal = (document.getElementById("_loginEmail")?.value || "").trim();
          const pwVal    = document.getElementById("_loginPassword")?.value || "";
          const msgEl    = document.getElementById("_loginMsg");
          if (!emailVal || !pwVal) {
            if (msgEl) { msgEl.textContent = "請輸入帳號與密碼"; msgEl.style.display = "block"; }
            return;
          }
          loginBtn.disabled = true;
          loginBtn.textContent = "登入中…";
          if (msgEl) msgEl.style.display = "none";
          try {
            await firebase.auth().signInWithEmailAndPassword(emailVal, pwVal);
          } catch (e) {
            if (msgEl) { msgEl.textContent = "帳號或密碼錯誤，請再試一次。"; msgEl.style.display = "block"; }
            loginBtn.disabled = false;
            loginBtn.textContent = "登入";
            if (loginBtn.style) loginBtn.style.background = "#2563eb";
          }
        };
        loginBtn.onclick = doLogin;
        ["_loginEmail","_loginPassword"].forEach(id => {
          document.getElementById(id)?.addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
        });
      }
      const logoutBtn = document.getElementById("_logoutBtn");
      if (logoutBtn) logoutBtn.onclick = AppAuth.logout;
    } = {}) {
      if (appEl) appEl.style.display = "none";
      gateEl.style.display = "block";

      gateEl.innerHTML = `
        <h1 style="margin:0 0 6px; font-size:22px;">${AppUI.esc(title)}</h1>
        <div class="sub">${msg}</div>

        ${showEmailLogin ? `
          <div style="margin-top:16px; max-width:360px; display:grid; gap:10px;">
            <input
              id="_loginEmail"
              type="text"
              placeholder="帳號（Email）"
              style="width:100%; padding:12px; border-radius:14px; border:1px solid rgba(17,17,17,.1); font-size:16px; background:#fff; outline:none;"
            />
            <input
              id="_loginPassword"
              type="password"
              placeholder="密碼"
              style="width:100%; padding:12px; border-radius:14px; border:1px solid rgba(17,17,17,.1); font-size:16px; background:#fff; outline:none;"
            />
            <button class="btn btn-primary" id="_loginBtn">登入</button>
            <div id="_loginMsg" style="font-size:13px; color:#b91c1c; display:none;"></div>
          </div>
        ` : ""}

        <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
          ${extraBtns}
          ${!showEmailLogin ? `<button class="btn" id="_logoutBtn">登出</button>` : ""}
        </div>
      `;

      const loginBtn = document.getElementById("_loginBtn");
      if (loginBtn) {
        const doLogin = async () => {
          const email = (document.getElementById("_loginEmail")?.value || "").trim();
          const password = document.getElementById("_loginPassword")?.value || "";
          const msgEl = document.getElementById("_loginMsg");

          if (!email || !password) { alert("請輸入帳號與密碼"); return; }

          loginBtn.disabled = true;
          const oldText = loginBtn.textContent;
          loginBtn.textContent = "登入中…";
          if (msgEl) msgEl.style.display = "none";

          try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
          } catch (e) {
            console.error(e);
            if (msgEl) {
              msgEl.textContent = "登入失敗，請確認帳號密碼是否正確";
              msgEl.style.display = "block";
            } else {
              alert("登入失敗，請確認帳號密碼是否正確");
            }
          } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = oldText;
          }
        };

        loginBtn.onclick = doLogin;

        ["_loginEmail", "_loginPassword"].forEach(id => {
          document.getElementById(id)?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") doLogin();
          });
        });
      }

      const logoutBtn = document.getElementById("_logoutBtn");
      if (logoutBtn) logoutBtn.onclick = AppAuth.logout;
    },

    /** 顯示 Toast 提示（輕量版，自動消失） */
    toast(msg, type = "ok", duration = 3000) {
      let el = document.getElementById("_appToast");
      if (!el) {
        el = document.createElement("div");
        el.id = "_appToast";
        el.style.cssText = `
          position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(10px);
          min-width:200px; max-width:360px; padding:12px 20px;
          border-radius:999px; font-size:14px; font-weight:900;
          box-shadow:0 10px 30px rgba(0,0,0,.15); z-index:99999;
          opacity:0; transition:opacity .2s ease, transform .2s ease;
          text-align:center; pointer-events:none;
        `;
        document.body.appendChild(el);
      }

      const colors = {
        ok:   { bg: "#166534", color: "#fff" },
        warn: { bg: "#b91c1c", color: "#fff" },
        info: { bg: "#1d4ed8", color: "#fff" },
        neutral: { bg: "#111", color: "#fff" }
      };
      const c = colors[type] || colors.neutral;
      el.style.background = c.bg;
      el.style.color = c.color;
      el.textContent = msg;

      clearTimeout(el._timer);
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateX(-50%) translateY(0)";
      });

      el._timer = setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateX(-50%) translateY(10px)";
      }, duration);
    }
  };

  // 短別名
  const { esc, norm } = window.AppUI;

  /* ══════════════════════════════════════════
     AppAuth — 認證 & 角色輔助
  ══════════════════════════════════════════ */
  window.AppAuth = {

    /** 登出 */
    async logout() {
      try {
        await firebase.auth().signOut();
      } catch (e) {
        console.error(e);
        alert("登出失敗（請看 Console）");
      }
    },

    /** 從 Firestore users/{uid} 讀取用戶資料 */
    async loadUser(uid) {
      const snap = await window.db.collection("users").doc(uid).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    },

    /** 角色判斷 */
    isPlatform(role)      { return role === "platform_super" || role === "platform_admin"; },
    isPlatformSuper(role) { return role === "platform_super"; },
    isOrgRole(role)       { return ["org_super","org_admin","org_staff"].includes(role); },
    isProtectedSuper(u)   { return norm(u?.role) === "platform_super"; },

    /**
     * 模擬帳號（impersonate）工具
     */
    impersonate: {
      get uid()      { return sessionStorage.getItem("impersonateUid") || ""; },
      get email()    { return sessionStorage.getItem("impersonateEmail") || ""; },
      get role()     { return sessionStorage.getItem("impersonateRole") || ""; },
      get orgId()    { return sessionStorage.getItem("impersonateOrgId") || ""; },
      get schoolId() { return sessionStorage.getItem("impersonateSchoolId") || ""; },
      get active()   { return !!sessionStorage.getItem("impersonateUid"); },

      start({ uid, email, role, orgId, schoolId, team }) {
        sessionStorage.setItem("impersonateUid", uid || "");
        sessionStorage.setItem("impersonateEmail", email || "");
        sessionStorage.setItem("impersonateRole", role || "");
        sessionStorage.setItem("impersonateOrgId", orgId || "");
        sessionStorage.setItem("impersonateSchoolId", schoolId || "");
        sessionStorage.setItem("impersonateTeam", team || "");
        sessionStorage.setItem("impersonateStartedAt", new Date().toISOString());
      },

      stop() {
        [
          "impersonateUid", "impersonateEmail", "impersonateRole",
          "impersonateOrgId", "impersonateSchoolId", "impersonateTeam",
          "impersonateStartedAt"
        ].forEach(k => sessionStorage.removeItem(k));
      },

      /** 取得目前「有效」的 uid（模擬中用模擬 uid，否則用真實 uid） */
      getActingUid(realUser) {
        return sessionStorage.getItem("impersonateUid") || realUser?.uid || "";
      }
    },

    /**
     * 渲染模擬帳號 Banner（需要有 class="impersonate-banner" 的元素，id="impersonateBanner"）
     * @param {Function} onStop — 點「結束模擬」後的回呼
     */
    renderImpersonateBanner(onStop) {
      const banner = document.getElementById("impersonateBanner");
      if (!banner) return;

      const imp = AppAuth.impersonate;

      if (!imp.active) {
        banner.style.display = "none";
        return;
      }

      banner.style.display = "flex";
      banner.innerHTML = `
        <div style="flex:1;">
          <div class="impersonate-title">⚠ 目前正在模擬帳號</div>
          <div class="sub" style="margin-top:6px;">
            模擬：<span class="mono">${esc(imp.email || imp.uid)}</span><br/>
            role：<span class="mono">${esc(imp.role || "-")}</span>｜
            orgId：<span class="mono">${esc(imp.orgId || "-")}</span>｜
            schoolId：<span class="mono">${esc(imp.schoolId || "-")}</span>
          </div>
        </div>
        <div>
          <button class="btn btn-danger-fill btn-sm" id="_stopImpersonateBtn">結束模擬</button>
        </div>
      `;

      document.getElementById("_stopImpersonateBtn").onclick = () => {
        imp.stop();
        if (typeof onStop === "function") onStop();
        else location.reload();
      };
    }
  };

  /* ══════════════════════════════════════════
     AppNav — 頂部導覽列
  ══════════════════════════════════════════ */
  window.AppNav = {
    /**
     * 在 body 最頂端插入導覽列
     * @param {{ crumb, role, email, showBack }} opts
     */
    init({ crumb = "", role = "", email = "", showBack = true } = {}) {
      // 確認尚未插入
      if (document.getElementById("_appNavbar")) return;

      const nav = document.createElement("nav");
      nav.id = "_appNavbar";
      nav.className = "navbar";
      nav.innerHTML = `
        <a class="navbar-brand" href="dashboard.html">後台</a>
        ${crumb ? `<span class="navbar-crumb">${esc(crumb)}</span>` : ""}
        <div class="navbar-actions">
          ${role ? `<span class="navbar-role mono">${esc(role)}</span>` : ""}
          ${showBack ? `<a class="btn btn-sm" href="dashboard.html">回主選單</a>` : ""}
          <button class="btn btn-sm" id="_navLogoutBtn">登出</button>
        </div>
      `;

      document.body.insertBefore(nav, document.body.firstChild);

      document.getElementById("_navLogoutBtn").onclick = AppAuth.logout;
    },

    /** 在導覽列更新 role / email 顯示（auth 回呼完成後呼叫） */
    update({ role = "", email = "" } = {}) {
      const roleEl = document.querySelector(".navbar-role");
      if (roleEl && role) roleEl.textContent = role;
    }
  };

  /* ══════════════════════════════════════════
     AppData — 共用資料載入
  ══════════════════════════════════════════ */
  window.AppData = {
    /** 載入全部 partnerSchools 回傳 { id: name } map */
    async loadSchoolMap() {
      const map = {};
      try {
        const snap = await window.db.collection("partnerSchools").get();
        snap.forEach(doc => {
          map[doc.id] = doc.data()?.name || doc.id;
        });
      } catch (e) { console.error("loadSchoolMap 失敗", e); }
      return map;
    },

    /** 載入全部 organizations 回傳 { id: name } map */
    async loadOrgMap() {
      const map = {};
      try {
        const snap = await window.db.collection("organizations").get();
        snap.forEach(doc => {
          map[doc.id] = doc.data()?.name || doc.id;
        });
      } catch (e) { console.error("loadOrgMap 失敗", e); }
      return map;
    },

    /**
     * 產生 <select> 的 <option> HTML（school）
     * @param {Object} schoolMap
     * @param {string} selectedId
     */
    buildSchoolOptions(schoolMap, selectedId = "") {
      const sel = norm(selectedId);
      const keys = Object.keys(schoolMap).sort((a, b) =>
        (schoolMap[a] || a).localeCompare(schoolMap[b] || b, "zh-Hant")
      );
      return `
        <option value="">（未設定）</option>
        ${keys.map(id => `
          <option value="${esc(id)}" ${sel === id ? "selected" : ""}>
            ${esc(schoolMap[id] ? `${schoolMap[id]}（${id}）` : id)}
          </option>
        `).join("")}
      `;
    },

    /**
     * 產生 <select> 的 <option> HTML（org）
     */
    buildOrgOptions(orgMap, selectedId = "") {
      const sel = norm(selectedId);
      const keys = Object.keys(orgMap).sort((a, b) =>
        (orgMap[a] || a).localeCompare(orgMap[b] || b, "zh-Hant")
      );
      return `
        <option value="">（未設定）</option>
        ${keys.map(id => `
          <option value="${esc(id)}" ${sel === id ? "selected" : ""}>
            ${esc(orgMap[id] ? `${orgMap[id]}（${id}）` : id)}
          </option>
        `).join("")}
      `;
    }
  };

})();
