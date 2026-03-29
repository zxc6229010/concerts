/**
 * topnav.js — 前台頂部導覽列
 * 自動注入，不改變頁面結構
 */
(function() {
  const LINKS = [
    { t: "首頁",     h: "index.html" },
    { t: "活動報名", h: "event-register.html" },
    { t: "我的票券", h: "member.html" },
    { t: "邀請碼",   h: "guest.html" },
  ];
  const cur = location.pathname.split("/").pop() || "index.html";
  const esc = s => String(s??"").replace(/[&<>"']/g,
    m=>({  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  function inject() {
    if (document.getElementById("frontNav")) return;

    const nav = document.createElement("nav");
    nav.id = "frontNav";
    nav.innerHTML = `
      <a class="fn-brand" href="index.html">
        <div class="fn-brand-icon">🎤</div>
        校園演唱會
      </a>
      <div class="fn-links">
        ${LINKS.map(l=>`
          <a class="fn-link${cur===l.h?" fn-active":""}" href="${esc(l.h)}">${esc(l.t)}</a>
        `).join("")}
      </div>
      <div class="fn-user" id="fnUser">
        <button class="fn-logout" id="fnLogin">登入</button>
      </div>`;

    document.body.insertBefore(nav, document.body.firstChild);

    // Auth 監聽
    if (typeof firebase !== "undefined") {
      firebase.auth().onAuthStateChanged(user => {
        const userEl = document.getElementById("fnUser");
        if (!userEl) return;
        if (user) {
          userEl.innerHTML = `
            <div class="fn-avatar">${(user.email||"?")[0].toUpperCase()}</div>
            <span class="fn-email">${esc(user.email||"")}</span>
            <button class="fn-logout" onclick="firebase.auth().signOut()">登出</button>`;
        } else {
          userEl.innerHTML = `<button class="fn-logout" id="fnLogin" onclick="location.href='member.html'">登入</button>`;
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
