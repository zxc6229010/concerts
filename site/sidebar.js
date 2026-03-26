/**
 * sidebar.js — 後台側邊欄（只接管 #app，不碰 gate）
 */
(function () {
  "use strict";

  const NAV = [
    { e:"🏠", t:"總覽",           d:"系統狀態與提醒",         h:"dashboard.html" },
    { e:"🎟️", t:"活動管理",       d:"建立活動 / 票種",        h:"admin-events.html" },
    { e:"🧾", t:"訂單 / 報名資料", d:"報名清單、匯出、核銷",   h:"admin-event-orders.html" },
    { e:"🏫", t:"特約校園管理",     d:"校園設定 / 停用",        h:"partner-schools.html" },
    { e:"📥", t:"名單匯入 / 驗證", d:"匯入名單、驗證設定",     h:"admin-studentslist-import.html" },
    { e:"🔎", t:"會員查詢",         d:"查詢帳號與驗證狀態",     h:"admin-member-lookup.html" },
    { e:"🧑‍💼", t:"後台帳號管理",   d:"建立、審核、派發",       h:"admin-staff-users.html" },
    { e:"🏢", t:"全組織管理",      d:"各校管理人員一覽",       h:"admin-org-overview.html" },
    { e:"👥", t:"組織團隊",        d:"管理員 / 服務員 / 組別", h:"org-team.html" },
    { e:"✅", t:"核銷掃碼",        d:"掃碼核銷指定活動",       h:"staff-checkin.html" },
    { e:"🛠️", t:"服務中心核銷",    d:"條碼槍查詢與核銷",       h:"admin-checkin-assist.html" },
    { e:"⚙️", t:"Dashboard 設定", d:"各角色顯示 / 置頂",      h:"admin-dashboard-settings.html" },
    { e:"🧪", t:"身分測試切換",    d:"模擬其他帳號",            h:"admin-impersonate.html" },
    { e:"📝", t:"後台帳號申請",    d:"填寫申請",                h:"request-access.html" },
  ];

  const esc = s => String(s ?? "").replace(/[&<>"']/g,
    m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])
  );

  const cur = location.pathname.split("/").pop() || "";

  function buildSidebar(role, email) {
    const nav = NAV.map(n => `
      <a class="sb-item${cur === n.h ? " sb-active" : ""}" href="${esc(n.h)}">
        <div class="sb-item-icon">${n.e}</div>
        <div class="sb-item-text">
          <div class="sb-item-label">${esc(n.t)}</div>
          <div class="sb-item-desc">${esc(n.d)}</div>
        </div>
      </a>
    `).join("");

    const wrapper = document.createElement("aside");
    wrapper.id = "adminSidebar";
    wrapper.className = "sb-visible";
    wrapper.innerHTML = `
      <a class="sb-brand" href="dashboard.html">
        <div class="sb-brand-icon">🎤</div>
        <div>
          <div class="sb-brand-name">演唱會購票系統</div>
          <div class="sb-brand-sub">Admin Panel</div>
        </div>
      </a>

      <div class="sb-nav">
        ${nav}
      </div>

      <div class="sb-footer-info" id="sbFooterInfo">
        <div>${esc(email || "-")}</div>
        <div>角色：${esc(role || "-")}</div>
      </div>

      <button class="sb-logout" id="sbLogoutBtn" type="button">登出</button>
    `;
    return wrapper;
  }

  function buildHamburger() {
    const btn = document.createElement("button");
    btn.id = "sbToggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "開啟選單");
    btn.innerHTML = "☰";
    return btn;
  }

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "sbOverlay";
    return overlay;
  }

  function ensureLayout(role, email) {
    const app = document.getElementById("app");
    if (!app) return;
    if (document.getElementById("adminSidebar")) return;

    const appWrap = document.getElementById("appWrap");
    if (!appWrap) return;

    const sidebar = buildSidebar(role, email);
    const overlay = buildOverlay();
    const toggle = buildHamburger();

    const main = document.createElement("div");
    main.id = "adminMain";

    // 把 app 內現有內容移進 main
    while (app.firstChild) {
      main.appendChild(app.firstChild);
    }

    app.appendChild(toggle);
    app.appendChild(overlay);
    app.appendChild(sidebar);
    app.appendChild(main);

    document.body.classList.add("sidebar-layout");

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("sb-open");
      overlay.classList.toggle("sb-open");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sb-open");
      overlay.classList.remove("sb-open");
    });

    const logoutBtn = document.getElementById("sbLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          if (typeof firebase !== "undefined") {
            await firebase.auth().signOut();
          }
        } catch (e) {
          console.error(e);
          alert("登出失敗");
        }
      });
    }
  }

  window.SidebarShow = function(email, role) {
    ensureLayout(role, email);
    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) {
      sidebar.classList.add("sb-visible");
    }

    const footer = document.getElementById("sbFooterInfo");
    if (footer) {
      footer.innerHTML = `
        <div>${esc(email || "-")}</div>
        <div>角色：${esc(role || "-")}</div>
      `;
    }
  };

  window.SidebarHide = function() {
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sbOverlay");
    if (sidebar) {
      sidebar.classList.remove("sb-open");
    }
    if (overlay) {
      overlay.classList.remove("sb-open");
    }
  };
})();