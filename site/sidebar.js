/**
 * sidebar.js — 後台側邊欄（登入前隱藏，登入後顯示）
 */
(function () {
  "use strict";

  const NAV = [
    { g:"活動", e:"🎟️", t:"活動管理",       d:"建立活動 / 票種",        h:"admin-events.html" },
    { g:"活動", e:"🧾", t:"訂單 / 報名資料", d:"報名清單、匯出、核銷",  h:"admin-event-orders.html" },
    { g:"校園", e:"🏫", t:"特約校園管理",     d:"校園設定 / 停用",        h:"partner-schools.html" },
    { g:"校園", e:"📥", t:"名單匯入 / 驗證", d:"匯入名單、驗證設定",     h:"admin-studentslist-import.html" },
    { g:"校園", e:"🔎", t:"會員查詢",         d:"查詢帳號與驗證狀態",     h:"admin-member-lookup.html" },
    { g:"人事", e:"🧑‍💼", t:"後台帳號管理",     d:"建立、審核、派發",       h:"admin-staff-users.html" },
    { g:"人事", e:"🏢", t:"全組織管理",        d:"各校管理人員一覽",       h:"admin-org-overview.html" },
    { g:"人事", e:"👥", t:"組織團隊",          d:"管理員 / 服務員 / 組別", h:"org-team.html" },
    { g:"入場", e:"✅", t:"核銷掃碼",          d:"掃碼核銷指定活動",       h:"staff-checkin.html" },
    { g:"入場", e:"🛠️", t:"服務中心核銷",      d:"條碼槍查詢與核銷",       h:"admin-checkin-assist.html" },
    { g:"系統", e:"⚙️", t:"Dashboard 設定",   d:"各角色顯示 / 置頂",     h:"admin-dashboard-settings.html" },
    { g:"系統", e:"🧪", t:"身分測試切換",      d:"模擬其他帳號",            h:"admin-impersonate.html" },
    { g:"系統", e:"📝", t:"後台帳號申請",      d:"填寫申請",                h:"request-access.html" },
  ];

  const esc = s => String(s ?? "").replace(/[&<>"']/g,
    m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])
  );
  const cur = location.pathname.split("/").pop() || "";

  function pageTitle() {
    return document.title.replace(/^後台[｜|]/, "").trim()
      || document.querySelector("h1")?.textContent?.trim() || "後台管理";
  }

  /* ── 建構側邊欄 HTML ── */
  function buildSidebar() {
    const nav = NAV.map(n => `
      <a class="sb-item${cur === n.h ? " sb-active" : ""}" href="${esc(n.h)}">
        <div class="sb-item-icon">${n.e}</div>
        <div>
          <div class="sb-item-label">${esc(n.t)}</div>
          <div class="sb-item-desc">${esc(n.d)}</div>
        </div>
      </a>`).join("");

    const el = document.createElement("nav");
    el.id = "adminSidebar";   // 預設 display:none，登入後加 .sb-visible
    el.innerHTML = `
      <a class="sb-brand" href="dashboard.html">
        <div class="sb-brand-icon">🎤</div>
        <div>
          <div class="sb-brand-name">演唱會購票系統</div>
          <div class="sb-brand-sub">Admin Panel</div>
        </div>
      </a>
      <nav class="sb-nav">${nav}</nav>
      <div class="sb-footer-info" id="sbFooterInfo"></div>
      <button class="sb-logout" id="sbLogoutBtn">登出</button>`;
    return el;
  }

  /* ── 建構 Topbar ── */
  function buildTopbar() {
    const el = document.createElement("div");
    el.id = "adminTopbar";
    el.innerHTML = `
      <div class="tb-page-title">${esc(pageTitle())}</div>
      <div class="tb-user">
        <div class="tb-online"></div>
        <div class="tb-info">
          <div class="tb-name" id="sbName">-</div>
          <div class="tb-sub"  id="sbRole">-</div>
        </div>
        <div class="tb-avatar" id="sbAvatar">?</div>
      </div>`;
    return el;
  }

  /* ── 注入框架（只建結構，不顯示側欄） ── */
  function inject() {
    if (document.getElementById("adminSidebar")) return;

    // 1. 把現有 body 內容包進 #adminContent
    const content = document.createElement("div");
    content.id = "adminContent";
    while (document.body.firstChild) content.appendChild(document.body.firstChild);

    // 2. Mobile helpers
    const toggle  = document.createElement("button");
    toggle.id = "sbToggle"; toggle.innerHTML = "☰";
    toggle.setAttribute("aria-label", "選單");

    const overlay = document.createElement("div");
    overlay.id = "sbOverlay";

    // 3. Main 區域
    const main = document.createElement("div");
    main.id = "adminMain";
    main.appendChild(buildTopbar());
    main.appendChild(content);

    // 4. 組裝（側邊欄先隱藏）
    document.body.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(buildSidebar());
    document.body.appendChild(main);

    // 5. 一開始進入「gate mode」— body 加 class
    document.body.classList.add("gate-mode");

    // 6. 事件
    const sidebar = document.getElementById("adminSidebar");
    toggle.onclick  = () => { sidebar.classList.toggle("sb-open"); overlay.classList.toggle("sb-open"); };
    overlay.onclick = () => { sidebar.classList.remove("sb-open"); overlay.classList.remove("sb-open"); };
    document.getElementById("sbLogoutBtn").onclick = () => {
      if (typeof AppAuth !== "undefined") AppAuth.logout();
      else if (typeof firebase !== "undefined") firebase.auth().signOut();
    };

    if (typeof AppUI !== "undefined") AppUI.initPageLinks(document.body);
  }

  /* ── 登入成功後「解鎖」佈局 ── */
  window.SidebarShow = function(email, role) {
    document.body.classList.remove("gate-mode");

    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) sidebar.classList.add("sb-visible");  // display:flex

    const toggle = document.getElementById("sbToggle");
    if (toggle) toggle.classList.add("sb-show");       // mobile 才顯示

    // 更新 topbar
    const name  = document.getElementById("sbName");
    const roleEl= document.getElementById("sbRole");
    const avatar= document.getElementById("sbAvatar");
    const footer= document.getElementById("sbFooterInfo");

    if (name)   name.textContent   = email || "-";
    if (roleEl) roleEl.textContent = role  || "-";
    if (avatar) avatar.textContent = (email||"?")[0].toUpperCase();
    if (footer) footer.textContent = `角色：${role}`;
  };

  /* ── 登出後「鎖回」gate mode ── */
  window.SidebarHide = function() {
    document.body.classList.add("gate-mode");
    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) {
      sidebar.classList.remove("sb-visible");
      sidebar.classList.remove("sb-open");
    }
    const overlay = document.getElementById("sbOverlay");
    if (overlay) overlay.classList.remove("sb-open");
    const toggle = document.getElementById("sbToggle");
    if (toggle) toggle.classList.remove("sb-show");
  };

  /* ── Auth 監聽（只更新 topbar，不控制顯示邏輯） ── */
  function watchAuth() {
    if (typeof firebase === "undefined") return;
    firebase.auth().onAuthStateChanged(async user => {
      if (!user) { window.SidebarHide && SidebarHide(); return; }
      try {
        const db  = window.db || firebase.firestore();
        const uid = (typeof AppAuth !== "undefined")
          ? AppAuth.impersonate.getActingUid(user) : user.uid;
        const snap = await db.collection("users").doc(uid).get();
        const u    = snap.exists ? (snap.data() || {}) : {};
        const email= u.email || user.email || "";
        const role = u.role  || "";
        // 顯示控制交由各頁面的 dashboard.js / 主 JS 呼叫 SidebarShow()
        // 這裡只更新 topbar（非 gate-mode 才有意義）
        if (!document.body.classList.contains("gate-mode")) {
          window.SidebarShow && SidebarShow(email, role);
        }
      } catch (_) {}
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { inject(); watchAuth(); });
  } else {
    inject(); watchAuth();
  }

})();
