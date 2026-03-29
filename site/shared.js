(function () {
  "use strict";

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDtF2pHo84vy2n_dJAkCisopllaLAWjaj0",
    authDomain: "concert-1ff7e.firebaseapp.com",
    projectId: "concert-1ff7e",
    storageBucket: "concert-1ff7e.firebasestorage.app",
    messagingSenderId: "704757384914",
    appId: "1:704757384914:web:9f58e4085dd71180c5cf0b"
  };

  if (typeof firebase === "undefined") {
    console.error("shared.js 需要先載入 Firebase compat SDK");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  window.db = firebase.firestore();

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function norm(s) {
    return String(s ?? "").trim();
  }

  function tsToText(ts) {
    try {
      if (!ts) return "-";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString("zh-Hant", { hour12: false });
    } catch (e) {
      return "-";
    }
  }

  function pageIn(el) {
    if (!el) return;
    requestAnimationFrame(() => el.classList.add("on"));
  }

  function go(href, pageEl) {
    const root = pageEl || document.getElementById("pageRoot");
    if (root) root.classList.add("leaving");
    setTimeout(() => {
      location.href = href;
    }, 140);
  }

  function initPageLinks(pageEl) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.getAttribute("aria-disabled") === "true") return;
      e.preventDefault();
      go(href, pageEl);
    });
  }

  function toast(msg, type = "ok", duration = 3000) {
    let el = document.getElementById("_appToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "_appToast";
      el.style.cssText = [
        "position:fixed",
        "left:50%",
        "bottom:24px",
        "transform:translateX(-50%) translateY(10px)",
        "min-width:220px",
        "max-width:360px",
        "padding:12px 20px",
        "border-radius:999px",
        "box-shadow:0 10px 30px rgba(0,0,0,.15)",
        "font-size:14px",
        "font-weight:900",
        "text-align:center",
        "z-index:99999",
        "opacity:0",
        "pointer-events:none",
        "transition:opacity .2s ease, transform .2s ease"
      ].join(";");
      document.body.appendChild(el);
    }

    const theme = {
      ok: { bg: "#166534", color: "#fff" },
      warn: { bg: "#b91c1c", color: "#fff" },
      info: { bg: "#1d4ed8", color: "#fff" },
      neutral: { bg: "#111", color: "#fff" }
    }[type] || { bg: "#111", color: "#fff" };

    el.style.background = theme.bg;
    el.style.color = theme.color;
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

  function showGate(gateEl, appEl, { title = "請先登入", msg = "", showEmailLogin = false, extraBtns = "" } = {}) {
    if (!gateEl) return;
    if (appEl) appEl.style.display = "none";
    gateEl.style.display = "block";

    gateEl.innerHTML = `
      <h1 style="margin:0 0 6px; font-size:22px;">${esc(title)}</h1>
      <div class="sub">${msg}</div>

      ${showEmailLogin ? `
        <div style="margin-top:16px; max-width:380px; display:grid; gap:10px;">
          <input id="_loginEmail" type="text" placeholder="帳號（Email）"
            style="width:100%; padding:12px; border-radius:14px; border:1px solid rgba(17,17,17,.1); font-size:16px; background:#fff; outline:none;" />
          <input id="_loginPassword" type="password" placeholder="密碼"
            style="width:100%; padding:12px; border-radius:14px; border:1px solid rgba(17,17,17,.1); font-size:16px; background:#fff; outline:none;" />
          <button class="btn btn-primary" id="_loginBtn" type="button">登入</button>
          <div id="_loginMsg" style="display:none; color:#b91c1c; font-size:13px;"></div>
        </div>
      ` : ""}

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
        ${extraBtns || ""}
        ${!showEmailLogin && !extraBtns ? `<button class="btn" id="_logoutBtn" type="button">登出</button>` : ""}
      </div>
    `;

    const loginBtn = document.getElementById("_loginBtn");
    if (loginBtn) {
      const doLogin = async () => {
        const email = norm(document.getElementById("_loginEmail")?.value);
        const password = document.getElementById("_loginPassword")?.value || "";
        const msgEl = document.getElementById("_loginMsg");

        if (!email || !password) {
          if (msgEl) {
            msgEl.textContent = "請輸入帳號與密碼";
            msgEl.style.display = "block";
          }
          return;
        }

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
          loginBtn.disabled = false;
          loginBtn.textContent = oldText;
          return;
        }
      };

      loginBtn.onclick = doLogin;
      ["_loginEmail", "_loginPassword"].forEach((id) => {
        document.getElementById(id)?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") doLogin();
        });
      });
    }

    const logoutBtn = document.getElementById("_logoutBtn");
    if (logoutBtn) logoutBtn.onclick = () => AppAuth.logout();
  }

  window.AppUI = {
    esc,
    norm,
    tsToText,
    pageIn,
    go,
    initPageLinks,
    toast,
    showGate
  };

  const impersonate = {
    get uid() { return sessionStorage.getItem("impersonateUid") || ""; },
    get email() { return sessionStorage.getItem("impersonateEmail") || ""; },
    get role() { return sessionStorage.getItem("impersonateRole") || ""; },
    get orgId() { return sessionStorage.getItem("impersonateOrgId") || ""; },
    get schoolId() { return sessionStorage.getItem("impersonateSchoolId") || ""; },
    get active() { return !!sessionStorage.getItem("impersonateUid"); },
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
      ].forEach((k) => sessionStorage.removeItem(k));
    },
    getActingUid(realUser) {
      return sessionStorage.getItem("impersonateUid") || realUser?.uid || "";
    }
  };

  async function logout() {
    try {
      impersonate.stop();
      await firebase.auth().signOut();
      if (typeof window.SidebarHide === "function") window.SidebarHide();
    } catch (e) {
      console.error(e);
      alert("登出失敗（請看 Console）");
    }
  }

  async function loadUser(uid) {
    const snap = await window.db.collection("users").doc(uid).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  function isPlatform(role) { return role === "platform_super" || role === "platform_admin"; }
  function isPlatformSuper(role) { return role === "platform_super"; }
  function isOrgRole(role) { return ["org_super", "org_admin", "org_staff"].includes(norm(role)); }
  function isProtectedSuper(u) { return norm(u?.role) === "platform_super"; }

  function renderImpersonateBanner(onStop) {
    const banner = document.getElementById("impersonateBanner");
    if (!banner) return;
    if (!impersonate.active) {
      banner.style.display = "none";
      return;
    }
    banner.style.display = "flex";
    banner.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:900;">⚠ 目前正在模擬帳號</div>
        <div class="sub" style="margin-top:6px;">
          模擬：<span class="mono">${esc(impersonate.email || impersonate.uid)}</span><br>
          role：<span class="mono">${esc(impersonate.role || "-")}</span>｜
          orgId：<span class="mono">${esc(impersonate.orgId || "-")}</span>｜
          schoolId：<span class="mono">${esc(impersonate.schoolId || "-")}</span>
        </div>
      </div>
      <div><button class="btn btn-danger btn-sm" id="_stopImpersonateBtn" type="button">結束模擬</button></div>
    `;
    document.getElementById("_stopImpersonateBtn")?.addEventListener("click", () => {
      impersonate.stop();
      if (typeof onStop === "function") onStop();
      else location.reload();
    });
  }

  window.AppAuth = {
    logout,
    loadUser,
    isPlatform,
    isPlatformSuper,
    isOrgRole,
    isProtectedSuper,
    impersonate,
    renderImpersonateBanner
  };
})();
