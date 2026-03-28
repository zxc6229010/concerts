(function () {
  "use strict";

  function buildSidebar(email, role) {
    const el = document.createElement("aside");
    el.id = "adminSidebar";
    el.innerHTML = `
      <div style="font-weight:900;">後台系統</div>
      <div style="margin-top:20px;">
        <div>${email}</div>
        <div>${role}</div>
      </div>
      <button id="sbLogoutBtn">登出</button>
    `;
    return el;
  }

  function ensureLayout(email, role) {
    const app = document.getElementById("app");
    if (!app) return;

    if (document.getElementById("adminSidebar")) return;

    const sidebar = buildSidebar(email, role);

    // ❗❗❗ 重點修正：不要再包 main !!!
    app.prepend(sidebar);

    const logoutBtn = sidebar.querySelector("#sbLogoutBtn");
    logoutBtn.onclick = async ()=>{
      await firebase.auth().signOut();
    };
  }

  window.SidebarShow = function(email, role){
    ensureLayout(email, role);
  };

})();