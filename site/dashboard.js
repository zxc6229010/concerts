/**
 * dashboard.js — 總覽摘要頁面邏輯
 */
(function () {
  "use strict";
  const { esc, norm, tsToText } = AppUI;

  /* ── DOM ── */
  const gateWrap       = document.getElementById("gateWrap");
  const gateCard       = document.getElementById("gateCard");
  const appEl          = document.getElementById("app");
  const impersonateBar = document.getElementById("impersonateBar");
  const dashUserName   = document.getElementById("dashUserName");
  const dashUserEmail  = document.getElementById("dashUserEmail");
  const dashSub        = document.getElementById("dashSub");

  /* ── 系統時間顯示 ── */
  function timeStr() {
    return new Date().toLocaleString("zh-Hant", {
      year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false
    });
  }

  /* ── Gate（登入畫面） ── */
  function showGate({ title="後台管理系統", msg="", showLogin=false, extraBtns="" }) {
    gateWrap.style.display = "flex";
    appEl.style.display    = "none";

    // 登入卡片 HTML（仿圖片風格）
    let loginFields = "";
    if (showLogin) {
      loginFields = `
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:700;color:#444;margin-bottom:6px;">帳號</label>
          <input id="_ge" type="text" placeholder="輸入 Email"
            style="width:100%;padding:13px 14px;border:1.5px solid #dde1e7;border-radius:10px;
                   font-size:14px;outline:none;background:#fff;transition:border-color .15s;color:#111;"
            onfocus="this.style.borderColor='#2563eb'"
            onblur="this.style.borderColor='#dde1e7'" />
        </div>
        <div style="margin-bottom:20px;">
          <label style="display:block;font-size:13px;font-weight:700;color:#444;margin-bottom:6px;">密碼</label>
          <input id="_gp" type="password" placeholder="輸入密碼"
            style="width:100%;padding:13px 14px;border:1.5px solid #dde1e7;border-radius:10px;
                   font-size:14px;outline:none;background:#fff;transition:border-color .15s;color:#111;"
            onfocus="this.style.borderColor='#2563eb'"
            onblur="this.style.borderColor='#dde1e7'" />
        </div>
        <button id="_gb"
          style="width:100%;padding:14px;background:#2563eb;color:#fff;border:none;
                 border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;
                 transition:background .15s;letter-spacing:.3px;">
          登入
        </button>
        <div id="_gerr" style="font-size:13px;color:#dc2626;margin-top:10px;
                                text-align:center;display:none;"></div>
      `;
    }

    let extraHtml = "";
    if (extraBtns) {
      extraHtml = `<div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">${extraBtns}</div>`;
    }
    if (!showLogin && !extraBtns) {
      extraHtml = `
        <button onclick="AppAuth.logout()"
          style="margin-top:8px;padding:11px 24px;border-radius:10px;border:1.5px solid #dde1e7;
                 background:#fff;font-size:13px;font-weight:700;cursor:pointer;color:#555;
                 width:100%;transition:border-color .15s;">
          返回 / 登出
        </button>`;
    }

    gateCard.innerHTML = `
      <!-- Logo 區 -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:40px;margin-bottom:10px;">🎤</div>
        <div style="font-size:20px;font-weight:900;color:#1e2a45;letter-spacing:.3px;">
          校園演唱會購票系統
        </div>
        <div style="font-size:10px;letter-spacing:2.5px;color:#aaa;margin-top:5px;text-transform:uppercase;">
          Concert Ticketing System
        </div>
      </div>

      <!-- 登入卡片 -->
      <div style="background:#fff;border-radius:16px;padding:28px 28px 24px;
                  width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        ${showLogin ? `<div style="font-size:17px;font-weight:900;color:#111;margin-bottom:20px;">登入</div>` :
          `<div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:13px;font-weight:700;color:#111;">${title}</div>
            ${msg ? `<div style="font-size:13px;color:#888;margin-top:6px;line-height:1.6;">${msg}</div>` : ""}
           </div>`}
        ${loginFields}
        ${extraHtml}
      </div>

      <!-- 底部版權 -->
      <div style="font-size:12px;color:#bbb;margin-top:24px;text-align:center;">
        © Concert Ticketing System
      </div>
    `;

    // 登入按鈕事件
    const btn = document.getElementById("_gb");
    if (btn) {
      const doLogin = async () => {
        const e = document.getElementById("_ge").value.trim();
        const p = document.getElementById("_gp").value;
        const errEl = document.getElementById("_gerr");
        if (!e || !p) {
          errEl.textContent = "請輸入帳號與密碼";
          errEl.style.display = "block";
          return;
        }
        btn.disabled = true;
        btn.textContent = "登入中…";
        btn.style.background = "#93c5fd";
        errEl.style.display = "none";
        try {
          await firebase.auth().signInWithEmailAndPassword(e, p);
        } catch (_) {
          errEl.textContent = "帳號或密碼錯誤，請再試一次。";
          errEl.style.display = "block";
          btn.disabled = false;
          btn.textContent = "登入";
          btn.style.background = "#2563eb";
        }
      };
      btn.onclick = doLogin;
      btn.onmouseover = () => { if (!btn.disabled) btn.style.background = "#1d4ed8"; };
      btn.onmouseout  = () => { if (!btn.disabled) btn.style.background = "#2563eb"; };
      ["_ge","_gp"].forEach(id =>
        document.getElementById(id)?.addEventListener("keydown", ev => {
          if (ev.key === "Enter") doLogin();
        })
      );
    }
  }) {
    gateWrap.style.display = "flex";
    appEl.style.display    = "none";
    gateCard.innerHTML = `
      <div style="font-size:44px;margin-bottom:12px;">${icon}</div>
      <div style="font-size:19px;font-weight:900;margin-bottom:8px;">${esc(title)}</div>
      <div style="font-size:13px;color:#666;line-height:1.7;margin-bottom:${showLogin||extraBtns?"22px":"0"};">${msg}</div>
      ${showLogin ? `
        <input id="_ge" type="text"     placeholder="Email"
               style="width:100%;padding:11px 13px;border:1.5px solid #e8eaed;border-radius:10px;font-size:14px;margin-bottom:8px;outline:none;"/>
        <input id="_gp" type="password" placeholder="密碼"
               style="width:100%;padding:11px 13px;border:1.5px solid #e8eaed;border-radius:10px;font-size:14px;margin-bottom:10px;outline:none;"/>
        <button id="_gb"
                style="width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
          登入
        </button>
        <div id="_gerr" style="font-size:12px;color:#b91c1c;margin-top:8px;display:none;"></div>
      ` : ""}
      ${extraBtns ? `<div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">${extraBtns}</div>` : ""}
      ${!showLogin && !extraBtns ? `
        <div style="margin-top:14px;">
          <button onclick="AppAuth.logout()"
                  style="padding:9px 20px;border-radius:10px;border:1.5px solid #e8eaed;background:#fff;font-size:13px;font-weight:700;cursor:pointer;">
            登出
          </button>
        </div>` : ""}
    `;
    const btn = document.getElementById("_gb");
    if (btn) {
      const doLogin = async () => {
        const e = document.getElementById("_ge").value.trim();
        const p = document.getElementById("_gp").value;
        const errEl = document.getElementById("_gerr");
        if (!e||!p) { errEl.textContent="請輸入帳號與密碼"; errEl.style.display="block"; return; }
        btn.disabled=true; btn.textContent="登入中…"; errEl.style.display="none";
        try { await firebase.auth().signInWithEmailAndPassword(e, p); }
        catch(_) {
          errEl.textContent="帳號或密碼錯誤，請再試一次。";
          errEl.style.display="block";
          btn.disabled=false; btn.textContent="登入";
        }
      };
      btn.onclick = doLogin;
      ["_ge","_gp"].forEach(id =>
        document.getElementById(id)?.addEventListener("keydown", ev => { if(ev.key==="Enter") doLogin(); })
      );
    }
  }

  /* ── 模擬帳號 Banner ── */
  function refreshBanner() {
    const imp = AppAuth.impersonate;
    if (!imp.active) { impersonateBar.style.display="none"; return; }
    impersonateBar.style.display="flex";
    impersonateBar.innerHTML=`
      <span class="imp-label">⚠ 模擬中</span>
      <span class="imp-detail">${esc(imp.email||imp.uid)} ｜ ${esc(imp.role)}</span>
      <button class="imp-stop" onclick="AppAuth.impersonate.stop();location.reload();">結束模擬</button>`;
  }

  /* ── 載入活動摘要 ── */
  async function loadEvents(schoolId, isPlatform) {
    const card = document.getElementById("cardEvents");
    try {
      let q = db.collection("events").orderBy("createdAt","desc").limit(10);
      if (!isPlatform && schoolId) {
        q = db.collection("events").where("ownerSchoolId","==",schoolId)
              .orderBy("createdAt","desc").limit(10);
      }
      const snap = await q.get();
      const events = snap.docs.map(d => ({ id:d.id, ...d.data() }));

      const published = events.filter(e => e.published===true || e.status==="published");
      const drafts    = events.filter(e => e.published!==true && e.status!=="published");

      let html = `<div class="dash-card-title">活動狀況</div>`;

      if (!events.length) {
        html += `<div class="dash-row">
          <div class="dash-row-label">目前沒有活動</div>
          <a class="dash-view-link" href="admin-events.html">建立 →</a>
        </div>`;
      } else {
        html += `
          <div class="dash-row">
            <div>
              <div class="dash-row-label">已發布活動</div>
            </div>
            <div style="text-align:right;">
              <div class="big-stat">
                <span class="big-stat-num">${published.length}</span>
                <span class="big-stat-unit">場</span>
              </div>
            </div>
          </div>`;

        // 列出最近 3 筆已發布活動
        published.slice(0,3).forEach(e => {
          const title = esc(norm(e.title || e.id));
          html += `
            <div class="dash-row">
              <div>
                <div class="dash-row-label">${title}</div>
                <div class="dash-row-sub">${esc(norm(e.ownerSchoolId==="__global__"?"平台活動":e.ownerSchoolId||""))}</div>
              </div>
              <div style="text-align:right;">
                <span class="status-badge ${e.published===true?"status-open":"status-draft"}">
                  ${e.published===true?"已發布":"草稿"}
                </span>
                <a class="dash-view-link" href="admin-events.html">查看</a>
              </div>
            </div>`;
        });

        if (drafts.length) {
          html += `
            <div class="dash-row" style="padding-top:10px;border-top:1px solid #f5f5f5;margin-top:4px;">
              <div class="dash-row-label" style="color:#aaa;">草稿</div>
              <div class="dash-row-value" style="color:#aaa;">${drafts.length} 場</div>
            </div>`;
        }
      }

      html += `<div style="margin-top:12px;">
        <a href="admin-events.html" style="font-size:12px;font-weight:700;color:#2563eb;text-decoration:none;">
          前往活動管理 →
        </a>
      </div>`;
      card.innerHTML = html;
    } catch(e) {
      card.innerHTML = `<div class="dash-card-title">活動狀況</div>
        <div class="dash-row-sub">載入失敗：${esc(e.message)}</div>`;
    }
  }

  /* ── 載入待審核申請（快速提醒） ── */
  async function loadReminders(isPlatform) {
    const card = document.getElementById("cardReminders");
    try {
      const rows = [];

      if (isPlatform) {
        // 待審核帳號申請
        const reqSnap = await db.collection("accessRequests")
          .where("status","==","pending").limit(99).get();
        rows.push({
          label: "待審核帳號申請",
          sub:   "後台帳號申請等待審核",
          count: reqSnap.size,
          href:  "admin-user-assign.html"
        });
      }

      // 目前報名中訂單總數（隨機取 5 場統計）
      const evtSnap = await db.collection("events")
        .where("published","==",true).limit(5).get();
      let totalOrders = 0;
      let checkedIn   = 0;
      for (const doc of evtSnap.docs) {
        const ordSnap = await db.collection("events").doc(doc.id)
          .collection("orders").limit(500).get();
        totalOrders += ordSnap.size;
        ordSnap.forEach(d => { if((d.data()||{}).checkedIn===true) checkedIn++; });
      }
      rows.push({
        label: "報名訂單總數",
        sub:   `已入場 ${checkedIn} 筆`,
        count: totalOrders,
        href:  "admin-event-orders.html"
      });

      let html = `<div class="dash-card-title">快速提醒</div>`;
      if (!rows.length) {
        html += `<div class="dash-row-sub">目前沒有提醒事項</div>`;
      } else {
        rows.forEach(r => {
          html += `
            <div class="notice-item">
              <div>
                <div class="notice-label">${esc(r.label)}</div>
                <div class="notice-sub">${esc(r.sub)}</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="notice-count">${r.count}</span>
                <a class="dash-view-link" href="${esc(r.href)}">查看</a>
              </div>
            </div>`;
        });
      }
      card.innerHTML = html;
    } catch(e) {
      card.innerHTML = `<div class="dash-card-title">快速提醒</div>
        <div class="dash-row-sub">載入失敗：${esc(e.message)}</div>`;
    }
  }

  /* ── 通知中心（驗證人數 / 待核銷） ── */
  async function loadNotices(schoolId) {
    const card = document.getElementById("cardNotices");
    try {
      const rows = [];

      // 已驗證學生人數（若有 schoolId）
      if (schoolId) {
        const vSnap = await db.collection("partnerSchools").doc(schoolId)
          .collection("records").where("usedByUid","!=","").limit(500).get();
        rows.push({
          label: "已完成校園驗證",
          sub:   schoolId,
          count: vSnap.size
        });
      }

      // 活動未入場訂單
      const evtSnap = await db.collection("events")
        .where("published","==",true).limit(3).get();
      let pending = 0;
      for (const doc of evtSnap.docs) {
        const oSnap = await db.collection("events").doc(doc.id)
          .collection("orders").where("checkedIn","==",false).limit(200).get();
        pending += oSnap.size;
      }
      rows.push({
        label: "未入場訂單",
        sub:   "仍待核銷入場",
        count: pending,
        href:  "admin-event-orders.html"
      });

      let html = `<div class="dash-card-title">通知中心</div>`;
      rows.forEach(r => {
        html += `
          <div class="notice-item">
            <div>
              <div class="notice-label">${esc(r.label)}</div>
              <div class="notice-sub">${esc(r.sub)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="notice-count">${r.count}</span>
              ${r.href ? `<a class="dash-view-link" href="${esc(r.href)}">查看</a>` : ""}
            </div>
          </div>`;
      });
      html += `<div style="margin-top:10px;font-size:12px;color:#ccc;">
        已載入 · ${timeStr()}
      </div>`;
      card.innerHTML = html;
    } catch(e) {
      card.innerHTML = `<div class="dash-card-title">通知中心</div>
        <div class="dash-row-sub">載入失敗：${esc(e.message)}</div>`;
    }
  }

  /* ── 帳號資訊卡 ── */
  function renderAccount(u, user) {
    const card = document.getElementById("cardAccount");
    const email = u.email || user.email || "-";
    const role  = norm(u.role || "");
    const ROLE_LABEL = {
      platform_super: "平台超級管理員",
      platform_admin: "平台管理員",
      org_super:      "組織超管",
      org_admin:      "組織管理員",
      org_staff:      "組織人員",
    };
    card.innerHTML = `
      <div class="dash-card-title">帳號資訊</div>
      <div class="dash-row">
        <div class="dash-row-label">Email</div>
        <div class="dash-row-value mono" style="font-size:12px;">${esc(email)}</div>
      </div>
      <div class="dash-row">
        <div class="dash-row-label">角色</div>
        <div class="dash-row-value">
          <span class="status-badge status-open">${esc(ROLE_LABEL[role]||role||"-")}</span>
        </div>
      </div>
      ${u.schoolId ? `
      <div class="dash-row">
        <div class="dash-row-label">所屬校園</div>
        <div class="dash-row-value mono" style="font-size:12px;">${esc(u.schoolId)}</div>
      </div>` : ""}
      ${u.orgId ? `
      <div class="dash-row">
        <div class="dash-row-label">所屬組織</div>
        <div class="dash-row-value mono" style="font-size:12px;">${esc(u.orgId)}</div>
      </div>` : ""}
      <div class="dash-row" style="margin-top:4px;padding-top:12px;border-top:1px solid #f5f5f5;">
        <div class="dash-row-label" style="color:#aaa;">系統時間</div>
        <div class="dash-row-value" style="color:#aaa;font-size:12px;" id="sysTimeTxt">${timeStr()}</div>
      </div>`;

    // 每分鐘更新系統時間
    setInterval(() => {
      const el = document.getElementById("sysTimeTxt");
      if (el) el.textContent = timeStr();
    }, 60000);
  }

  /* ── 狀態 ── */
  let unsubSys=null, unsubOrg=null;

  function clearSubs() {
    if(unsubSys){unsubSys();unsubSys=null;}
    if(unsubOrg){unsubOrg();unsubOrg=null;}
  }

  window.addEventListener("pageshow", refreshBanner);
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) refreshBanner(); });

  /* ── Auth ── */
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      clearSubs();
      if (window.SidebarHide) SidebarHide();
      showGate({ icon:"🔐", title:"後台管理系統", msg:"請登入你的管理帳號。", showLogin:true });
      return;
    }
    try {
      const uid = AppAuth.impersonate.getActingUid(user);
      const u   = await AppAuth.loadUser(uid);

      if (!u) {
        clearSubs();
        showGate({ icon:"🚫", title:"尚未擁有後台權限",
          msg:`帳號 <strong>${esc(user.email||"-")}</strong> 尚未被授權。`,
          extraBtns:`<button onclick="location.href='request-access.html'"
            style="padding:9px 18px;border-radius:10px;background:#2563eb;color:#fff;border:none;font-size:13px;font-weight:700;cursor:pointer;">
            申請後台帳號
          </button>` });
        return;
      }
      if (u.enabled!==true) {
        clearSubs();
        showGate({ icon:"⛔", title:"後台權限未啟用",
          msg:`帳號 <strong>${esc(u.email||user.email)}</strong> 目前已停用。` });
        return;
      }
      const role = norm(u.role);
      if (!role) {
        clearSubs();
        showGate({ icon:"⏳", title:"尚未完成角色指派",
          msg:"你的帳號已登錄，等候管理員審核。" });
        return;
      }

      // 顯示 App + 側邊欄
      gateWrap.style.display = "none";
      appEl.style.display    = "block";
      if (window.SidebarShow) SidebarShow(email, role);
      refreshBanner();

      // 更新右上角用戶資訊
      const email = u.email || user.email || "-";
      const dispName = u.displayName || u.name || email.split("@")[0];
      const ROLE_LABEL = {
        platform_super:"超級管理員",platform_admin:"平台管理員",
        org_super:"組織超管",org_admin:"組織管理員",org_staff:"組織人員"
      };
      dashUserName.innerHTML = `${esc(ROLE_LABEL[role]||role)} ｜ ${esc(dispName)}`;
      dashUserEmail.textContent = email;
      dashSub.textContent = `系統時間：${timeStr()}`;

      const isPlatform = role==="platform_super"||role==="platform_admin";
      const schoolId   = norm(u.schoolId||u.orgSchoolId||"");

      // 載入所有摘要
      renderAccount(u, user);
      loadEvents(schoolId, isPlatform);
      loadReminders(isPlatform);
      loadNotices(schoolId);

    } catch(err) {
      console.error(err);
      clearSubs();
      showGate({ icon:"💥", title:"發生錯誤", msg:"無法讀取權限資料，請稍後再試。" });
    }
  });

})();
