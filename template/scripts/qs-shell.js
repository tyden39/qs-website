// QS Technology — shared layout partials
window.QS = window.QS || {};

QS.icons = {
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>`,
  arrow: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
  arrowSm: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
  play: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
  pdf: `<svg width="20" height="24" viewBox="0 0 24 28" fill="none"><path d="M3 0h13l5 5v21a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#fff" stroke="#d8d6cf"/><path d="M16 0v5h5" fill="#f5f3ee" stroke="#d8d6cf"/><rect x="2" y="14" width="14" height="8" rx="1" fill="#c8553d"/><text x="9" y="20" font-family="JetBrains Mono,monospace" font-size="6" font-weight="700" fill="#fff" text-anchor="middle">PDF</text></svg>`,
  chevDown: `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>`,
  chevR: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>`,
  chevL: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg>`,
  fb:`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>`,
  yt:`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C16.5 3.5 12 3.5 12 3.5s-4.5 0-7.8.3c-.5 0-1.4 0-2.3 1C1.2 5.4 1 7 1 7S.8 9 .8 11v1.9c0 2 .2 3.9.2 3.9s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .2 8 .2s4.5 0 7.8-.3c.5 0 1.4 0 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.9V11c0-2-.2-3.9-.2-3.9zM9.7 15V8.5l5.8 3.3L9.7 15z"/></svg>`,
  ig:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>`,
};

QS.topstrip = () => `
<div class="qs-topstrip">
  <div class="wrap">
    <div><span class="dot"></span> QS Technology Co., Ltd · Vietnam Made CNC Systems · Est. 2014</div>
    <div>Hotline +84 28 3636 1234 · sales@qstechnology.vn</div>
  </div>
</div>`;

QS.nav = (active="home") => `
<nav class="qs-nav">
  <div class="wrap">
    <div class="qs-nav-left">
      <a class="qs-logo" href="home.html">
        <div class="mark">
          <img src="assets/logo-st.png" alt="ST" />
        </div>
        <div class="word">
          <b>QS TECHNOLOGY</b>
          <small>CNC · Automation · Vietnam</small>
        </div>
      </a>
      <div class="qs-menu">
        <a href="products.html" class="${active==='products'?'active':''}">Sản phẩm</a>
        <a href="applications.html" class="${active==='apps'?'active':''}">Ứng dụng</a>
        <a href="service.html" class="${active==='service'?'active':''}">Dịch vụ</a>
        <a href="downloads.html" class="${active==='downloads'?'active':''}">Tải về</a>
      </div>
    </div>
    <div class="qs-nav-right">
      <div class="qs-menu">
        <a href="about.html" class="${active==='about'?'active':''}">Giới thiệu</a>
        <a href="news.html" class="${active==='news'?'active':''}">Tin tức</a>
        <a href="contact.html" class="${active==='contact'?'active':''}">Liên hệ</a>
      </div>
      <div class="qs-tools">
        <button class="qs-icon-btn" aria-label="Tìm kiếm" onclick="QS.openSearch()">${QS.icons.search}</button>
        <button class="qs-icon-btn lang" aria-label="Ngôn ngữ"><span class="flag"></span></button>
      </div>
    </div>
  </div>
</nav>

<div class="qs-search-panel" id="qs-search-panel">
  <div class="qs-search-panel-inner">
    <div class="qs-search-input">
      ${QS.icons.search}
      <input id="qs-search-field" placeholder="Tìm sản phẩm, model — F54, Astro 6AH…" autocomplete="off">
      <button class="qs-search-close" aria-label="Đóng" onclick="QS.closeSearch()">✕</button>
    </div>
    <div class="qs-search-products">
      <div class="lbl">Sản phẩm nổi bật</div>
      <div class="qs-search-grid">
        <a href="product-detail.html" class="qs-spcard">
          <div class="thumb"><svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet"><rect x="10" y="10" width="80" height="40" fill="#1a1a1a" stroke="#3a3a3a"/><rect x="18" y="16" width="64" height="22" fill="#0a0a0a"/><circle cx="22" cy="44" r="2" fill="#e8c878"/><circle cx="30" cy="44" r="2" fill="#3a3a3a"/></svg></div>
          <div class="info"><b>F54</b><span class="m">3-axis · 5" display</span><span class="p">Phay & router</span></div>
        </a>
        <a href="product-detail.html" class="qs-spcard">
          <div class="thumb"><svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet"><rect x="6" y="8" width="88" height="44" fill="#1a1a1a" stroke="#3a3a3a"/><rect x="14" y="14" width="72" height="26" fill="#0a0a0a"/><rect x="14" y="42" width="14" height="6" fill="#e8c878"/></svg></div>
          <div class="info"><b>F86</b><span class="m">6-axis · 8" display</span><span class="p">CNC đa trục</span></div>
        </a>
        <a href="product-detail.html" class="qs-spcard">
          <div class="thumb"><svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet"><rect x="8" y="6" width="84" height="48" rx="2" fill="#1a1a1a" stroke="#3a3a3a"/><rect x="14" y="12" width="72" height="36" fill="#102030"/><rect x="20" y="18" width="20" height="3" fill="#e8c878"/></svg></div>
          <div class="info"><b>F10T</b><span class="m">Touch 10.4"</span><span class="p">Tiện CNC</span></div>
        </a>
        <a href="product-detail.html" class="qs-spcard">
          <div class="thumb"><svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet"><rect x="20" y="14" width="60" height="32" fill="#2a2a2a" stroke="#3a3a3a"/><circle cx="50" cy="30" r="9" fill="#0a0a0a" stroke="#e8c878"/><rect x="14" y="22" width="6" height="16" fill="#1a1a1a"/><rect x="80" y="22" width="6" height="16" fill="#1a1a1a"/></svg></div>
          <div class="info"><b>Astro 6AH</b><span class="m">Closed-loop servo</span><span class="p">Servo & drive</span></div>
        </a>
        <a href="product-detail.html" class="qs-spcard">
          <div class="thumb"><svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet"><rect x="16" y="10" width="68" height="40" fill="#1a1a1a" stroke="#e8c878"/><rect x="22" y="16" width="56" height="22" fill="#0a0a0a"/><rect x="22" y="42" width="56" height="3" fill="#e8c878"/></svg></div>
          <div class="info"><b>Astro 10i</b><span class="m">Flagship · EtherCAT</span><span class="p">Servo cao cấp</span></div>
        </a>
        <a href="products.html" class="qs-spcard view-all">
          <div class="thumb arrow"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>
          <div class="info"><b>Xem tất cả</b><span class="m">26 sản phẩm</span><span class="p">Catalog đầy đủ</span></div>
        </a>
      </div>
    </div>
  </div>
</div>
<div class="qs-search-backdrop" id="qs-search-backdrop" onclick="QS.closeSearch()"></div>`;

QS.openSearch = () => {
  const p = document.getElementById('qs-search-panel');
  const b = document.getElementById('qs-search-backdrop');
  if(!p) return;
  p.classList.add('open');
  b && b.classList.add('open');
  setTimeout(()=>{const f=document.getElementById('qs-search-field');f&&f.focus();},50);
};
QS.closeSearch = () => {
  const p = document.getElementById('qs-search-panel');
  const b = document.getElementById('qs-search-backdrop');
  if(p) p.classList.remove('open');
  if(b) b.classList.remove('open');
};
document.addEventListener('keydown',e=>{if(e.key==='Escape')QS.closeSearch&&QS.closeSearch();});

QS.foot = () => `
<footer class="qs-foot">
  <div class="top">
    <div class="brand">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="height:48px;display:grid;place-items:center">
          <img src="assets/logo-st.png" alt="ST" style="height:48px;width:auto;display:block;filter:brightness(1.05)"/>
        </div>
        <div class="word">
          <b>QS TECHNOLOGY CO., LTD</b>
          <div class="underline"></div>
        </div>
      </div>
      <p>Nhà sản xuất bộ điều khiển CNC, servo và board mở rộng — thiết kế tại Việt Nam, phục vụ cơ khí chính xác trong nước và xuất khẩu.</p>
      <div style="display:flex;gap:10px;margin-top:24px">
        <a href="#" style="width:34px;height:34px;border:1px solid #2a2a2a;display:grid;place-items:center;color:#a8a499">${QS.icons.fb}</a>
        <a href="#" style="width:34px;height:34px;border:1px solid #2a2a2a;display:grid;place-items:center;color:#a8a499">${QS.icons.yt}</a>
        <a href="#" style="width:34px;height:34px;border:1px solid #2a2a2a;display:grid;place-items:center;color:#a8a499">${QS.icons.ig}</a>
      </div>
    </div>
    <div>
      <h5>Sản phẩm</h5>
      <ul>
        <li><a href="products.html">Bộ điều khiển CNC</a></li>
        <li><a href="products.html">Bộ điều khiển robot</a></li>
        <li><a href="products.html">Thiết bị DNC</a></li>
        <li><a href="products.html">Servo motor & drive</a></li>
        <li><a href="products.html">Phụ kiện CNC</a></li>
      </ul>
    </div>
    <div>
      <h5>Công ty</h5>
      <ul>
        <li><a href="about.html">Giới thiệu</a></li>
        <li><a href="applications.html">Ứng dụng</a></li>
        <li><a href="services.html">Dịch vụ</a></li>
        <li><a href="case-studies.html">Khách hàng</a></li>
        <li><a href="careers.html">Tuyển dụng</a></li>
        <li><a href="news.html">Tin tức</a></li>
      </ul>
    </div>
    <div>
      <h5>Hỗ trợ</h5>
      <ul>
        <li><a href="support.html">Hỗ trợ kỹ thuật</a></li>
        <li><a href="faq.html">Câu hỏi thường gặp</a></li>
        <li><a href="downloads.html">Tài liệu kỹ thuật</a></li>
        <li><a href="contact.html">Liên hệ</a></li>
        <li>+84 28 3636 1234</li>
      </ul>
    </div>
  </div>
  <div class="bottom">
    <div>© 2026 QS Technology Co., Ltd · All rights reserved</div>
    <div><a href="privacy.html" style="color:inherit">Privacy</a> · <a href="terms.html" style="color:inherit">Terms</a> · <a href="cookies.html" style="color:inherit">Cookies</a></div>
  </div>
</footer>`;

QS.mount = (active) => {
  const slot = document.getElementById('qs-shell');
  if(!slot) return;
  document.body.insertAdjacentHTML('afterbegin', QS.topstrip() + QS.nav(active));
  document.body.insertAdjacentHTML('beforeend', QS.foot());
};
