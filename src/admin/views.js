'use strict';

/**
 * Server-rendered admin views — modern dashboard UI.
 *
 * Pure functions returning HTML. All dynamic values pass through escapeHtml().
 * Charts use Chart.js (CDN, admin-only). Counters animate via a small inline
 * script. Layout is a responsive sidebar shell.
 */

const { escapeHtml, ORDER_STATUSES } = require('../util');

const STATUS_COLORS = {
  Pending: '#e0992f',
  Confirmed: '#3b82f6',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

function statusBadge(status) {
  const c = STATUS_COLORS[status] || '#888';
  return `<span class="badge" style="--c:${c}">${escapeHtml(status || 'Pending')}</span>`;
}

const STYLES = `
:root{
  --bg:#0a0d13;--bg2:#0e1219;--panel:#141a25;--panel2:#1a2130;--line:#242c3a;
  --txt:#eef1f6;--muted:#8b95a7;--muted2:#5d6678;
  --gold:#c9a861;--gold2:#b8954e;--green:#22c55e;--blue:#3b82f6;--orange:#e0992f;--red:#ef4444;
  --shadow:0 10px 30px rgba(0,0,0,.35);--radius:16px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  background:radial-gradient(1200px 600px at 80% -10%,#16203044,transparent),var(--bg);color:var(--txt);font-size:15px;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.app{display:flex;min-height:100vh}
/* Sidebar */
.side{position:sticky;top:0;align-self:flex-start;height:100vh;width:236px;flex-shrink:0;
  background:linear-gradient(180deg,#10151f,#0c1018);border-right:1px solid var(--line);
  display:flex;flex-direction:column;padding:22px 16px;gap:6px}
.side__brand{font-weight:800;letter-spacing:.18em;color:var(--gold);font-size:18px;padding:4px 10px 18px}
.side__brand small{display:block;font-size:10px;color:var(--muted2);letter-spacing:.12em;font-weight:600;margin-top:3px}
.side a.nav{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:11px;color:var(--muted);font-weight:600;font-size:14.5px;transition:.18s}
.side a.nav:hover{background:var(--panel2);color:var(--txt)}
.side a.nav.active{background:linear-gradient(90deg,#1d2738,#161d2a);color:#fff;box-shadow:inset 0 0 0 1px var(--line)}
.side a.nav svg{width:18px;height:18px;stroke:currentColor;flex-shrink:0}
.side__foot{margin-top:auto;font-size:11px;color:var(--muted2);padding:10px}
/* Main */
.main{flex:1;min-width:0;padding:26px 30px 60px}
.head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;animation:fade .5s ease}
.head h1{margin:0;font-size:22px;font-weight:700;letter-spacing:-.01em}
.head .sub{color:var(--muted);font-size:13.5px;margin-top:3px}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:10px;border:1px solid var(--line);
  background:var(--panel2);color:var(--txt);cursor:pointer;font-weight:600;font-size:13.5px;transition:.18s}
.btn:hover{transform:translateY(-1px);border-color:#33405a}
.btn--gold{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold);color:#16130a}
.btn--danger{background:#2a1414;border-color:#52262a;color:#f3b4b4}
.btn--sm{padding:6px 11px;font-size:12.5px}
/* Cards grid */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin-bottom:24px}
.stat{background:linear-gradient(160deg,var(--panel),var(--bg2));border:1px solid var(--line);border-radius:var(--radius);
  padding:18px;position:relative;overflow:hidden;opacity:0;transform:translateY(14px);animation:fade .6s ease forwards}
.stat:hover{border-color:#2f3a4f}
.stat__ic{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;background:#1c2433}
.stat__ic svg{width:19px;height:19px}
.stat__label{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:600}
.stat__num{font-size:30px;font-weight:800;margin-top:5px;letter-spacing:-.02em;line-height:1}
.stat__sub{font-size:12px;color:var(--muted2);margin-top:6px}
.stat--accent{background:linear-gradient(160deg,#1c3a30,#13261f);border-color:#2a5142}
/* Panels */
.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);
  overflow:hidden;margin-bottom:22px;opacity:0;transform:translateY(14px);animation:fade .6s ease forwards}
.panel__head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--line)}
.panel__head h2{margin:0;font-size:15.5px;font-weight:700}
.panel__body{padding:18px}
.grid2{display:grid;grid-template-columns:1.6fr 1fr;gap:22px}
.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}
@media(max-width:900px){.grid2{grid-template-columns:1fr}}
canvas{max-width:100%}
.chart-wrap{position:relative;height:300px}
.chart-wrap--sm{height:230px}
/* Tables */
table{width:100%;border-collapse:collapse}
th,td{padding:12px 14px;text-align:left;font-size:13.8px;border-bottom:1px solid var(--line);white-space:nowrap}
th{color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.05em}
tbody tr{transition:background .15s}
tbody tr:hover td{background:#171f2c}
.badge{display:inline-block;padding:3px 11px;border-radius:999px;font-size:12px;font-weight:700;color:#0a0d13;background:var(--c)}
.muted{color:var(--muted)} .right{text-align:right}
.actions{display:flex;gap:6px}
.pagination{display:flex;gap:10px;align-items:center;justify-content:center;padding:16px}
.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.filters input,.filters select{background:var(--bg2);border:1px solid var(--line);color:var(--txt);border-radius:9px;padding:8px 11px;font-size:13.5px}
.filters input:focus,.filters select:focus{outline:none;border-color:var(--gold)}
select.status-select{background:var(--bg2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:5px 8px;font-size:12.5px}
form.inline{display:inline}
/* detail */
.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.dcard{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:18px;opacity:0;transform:translateY(12px);animation:fade .5s ease forwards}
.dcard h3{margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--gold)}
.kv{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.8px}
.kv:last-child{border-bottom:0}.kv span:first-child{color:var(--muted)}
.kv span:last-child{text-align:right;word-break:break-all;max-width:62%}
.bars{display:flex;flex-direction:column;gap:11px}
.bar__row{display:flex;align-items:center;gap:10px;font-size:13px}
.bar__label{width:90px;flex-shrink:0;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar__track{flex:1;height:9px;background:#1b2330;border-radius:6px;overflow:hidden}
.bar__fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:6px;width:0;transition:width 1s cubic-bezier(.2,.8,.2,1)}
.bar__val{width:48px;text-align:right;font-weight:700}
.empty{padding:46px;text-align:center;color:var(--muted)}
/* login */
.login{max-width:380px;margin:9vh auto;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:30px;box-shadow:var(--shadow);animation:fade .5s ease}
.login h1{margin:0 0 4px;font-size:21px;color:var(--gold);letter-spacing:.04em}
.login p{color:var(--muted);margin:0 0 22px;font-size:14px}
.field{margin-bottom:15px}.field label{display:block;font-size:13px;color:var(--muted);margin-bottom:7px}
.field input{width:100%;padding:12px 13px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--txt);font-size:15px}
.field input:focus{outline:none;border-color:var(--gold)}
.error{background:#2a1414;border:1px solid #52262a;color:#f3b4b4;padding:11px 13px;border-radius:10px;margin-bottom:15px;font-size:13.5px}
.mobnav{display:none}
@keyframes fade{to{opacity:1;transform:translateY(0)}}
@media(max-width:760px){
  .app{flex-direction:column}
  .side{width:100%;height:auto;position:static;flex-direction:row;flex-wrap:wrap;align-items:center;padding:12px}
  .side__brand{padding:4px 8px;font-size:15px}.side__brand small{display:none}
  .side a.nav{padding:8px 11px}.side__foot{display:none}
  .main{padding:18px 16px 50px}
  th:nth-child(4),td:nth-child(4),th:nth-child(7),td:nth-child(7){display:none}
}
`;

const ICON = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 2h6l1 4H8z"/><path d="M3 7h18l-1.5 13.5A2 2 0 0117.5 22h-11A2 2 0 014.5 20.5z"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="#c9a861" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4A2 2 0 009.6 16h9.7a2 2 0 002-1.6L23 6H6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="#c9a861" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>',
  pct: '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
};

function shell({ title, active, body, withCharts }) {
  const nav = (href, key, label, icon) =>
    `<a class="nav ${active === key ? 'active' : ''}" href="${href}">${icon}<span>${label}</span></a>`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)} · SELVERINE Admin</title>
<style>${STYLES}</style>
${withCharts ? '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>' : ''}
</head><body>
<div class="app">
  <aside class="side">
    <div class="side__brand">SELVERINE<small>ADMIN</small></div>
    ${nav('/admin', 'dashboard', 'Dashboard', ICON.dash)}
    ${nav('/admin/orders', 'orders', 'Orders', ICON.orders)}
    ${nav('/admin/analytics', 'analytics', 'Analytics', ICON.analytics)}
    ${nav('/admin/logout', 'logout', 'Logout', ICON.logout)}
    <div class="side__foot">SELVERINE · v2</div>
  </aside>
  <main class="main">${body}</main>
</div>
<script>
// Animated count-up for [data-count]
(function(){
  function animate(el){
    var target=parseFloat(el.getAttribute('data-count'))||0,dec=(el.getAttribute('data-dec')==='1'),
        suf=el.getAttribute('data-suffix')||'',pre=el.getAttribute('data-prefix')||'',dur=900,t0=null;
    function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3), v=target*e;
      el.textContent=pre+(dec?v.toFixed(1):Math.round(v).toLocaleString('en-US'))+suf;
      if(p<1)requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){animate(e.target);io.unobserve(e.target);}})});
  document.querySelectorAll('[data-count]').forEach(function(el){io.observe(el);});
  // bar fills
  setTimeout(function(){document.querySelectorAll('.bar__fill').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},120);
})();
</script>
</body></html>`;
}

function loginPage({ error, csrfNote } = {}) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Admin Login · SELVERINE</title>
<style>${STYLES}</style></head><body>
<div class="login">
  <h1>SELVERINE</h1><p>Admin dashboard — please sign in.</p>
  ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
  <form method="POST" action="/admin/login">
    <div class="field"><label>Username</label><input name="username" autocomplete="username" required autofocus></div>
    <div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn btn--gold" style="width:100%;justify-content:center" type="submit">Sign in</button>
  </form>
  ${csrfNote ? `<p class="muted" style="margin-top:14px;font-size:13px">${escapeHtml(csrfNote)}</p>` : ''}
</div></body></html>`;
}

function statCard({ icon, label, num, sub, dec, prefix, suffix, accent, delay = 0 }) {
  return `<div class="stat ${accent ? 'stat--accent' : ''}" style="animation-delay:${delay}ms">
    <div class="stat__ic">${icon}</div>
    <div class="stat__label">${escapeHtml(label)}</div>
    <div class="stat__num" data-count="${num}" ${dec ? 'data-dec="1"' : ''} ${prefix ? `data-prefix="${escapeHtml(prefix)}"` : ''} ${suffix ? `data-suffix="${escapeHtml(suffix)}"` : ''}>0</div>
    ${sub ? `<div class="stat__sub">${escapeHtml(sub)}</div>` : ''}
  </div>`;
}

function dashboardPage({ stats, analytics, trend }) {
  const body = `
  <div class="head"><div><h1>Dashboard</h1><div class="sub">Overview of orders & traffic</div></div>
    <a class="btn btn--gold" href="/admin/orders">View orders →</a></div>
  <div class="cards">
    ${statCard({ icon: ICON.cart, label: 'Total Orders', num: stats.total, accent: true, delay: 0 })}
    ${statCard({ icon: ICON.clock, label: 'Today', num: stats.today, delay: 60 })}
    ${statCard({ icon: ICON.orders, label: 'Pending', num: stats.pending, delay: 120 })}
    ${statCard({ icon: ICON.cash, label: 'Revenue', num: stats.revenue, prefix: '', suffix: ' ' + stats.currency, accent: true, delay: 180 })}
    ${statCard({ icon: ICON.eye, label: 'Visits', num: analytics.totalVisits, delay: 240 })}
    ${statCard({ icon: ICON.users, label: 'Unique Visitors', num: analytics.uniqueVisitors, delay: 300 })}
    ${statCard({ icon: ICON.pct, label: 'Conversion', num: analytics.conversionRate, dec: true, suffix: '%', delay: 360 })}
  </div>
  <div class="grid2">
    <div class="panel"><div class="panel__head"><h2>Orders & visits — last 14 days</h2></div>
      <div class="panel__body"><div class="chart-wrap"><canvas id="trendChart"></canvas></div></div></div>
    <div class="panel"><div class="panel__head"><h2>Order status</h2></div>
      <div class="panel__body"><div class="chart-wrap chart-wrap--sm"><canvas id="statusChart"></canvas></div></div></div>
  </div>
  <script>
  (function(){
    var t=${JSON.stringify(trend)};
    var grid='#222b3a',tick='#8b95a7';
    new Chart(document.getElementById('trendChart'),{type:'line',
      data:{labels:t.labels,datasets:[
        {label:'Visits',data:t.visits,borderColor:'#c9a861',backgroundColor:'rgba(201,168,97,.12)',fill:true,tension:.35,borderWidth:2,pointRadius:0},
        {label:'Unique',data:t.unique,borderColor:'#3b82f6',backgroundColor:'transparent',tension:.35,borderWidth:2,pointRadius:0},
        {label:'Orders',data:t.orders,borderColor:'#22c55e',backgroundColor:'transparent',tension:.35,borderWidth:2,pointRadius:0}]},
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:900},
        plugins:{legend:{labels:{color:tick,boxWidth:12}}},
        scales:{x:{grid:{color:grid},ticks:{color:tick}},y:{grid:{color:grid},ticks:{color:tick},beginAtZero:true}}}});
    new Chart(document.getElementById('statusChart'),{type:'doughnut',
      data:{labels:['Pending','Confirmed','Delivered','Cancelled'],
        datasets:[{data:[${stats.pending},${stats.confirmed},${stats.delivered},${stats.cancelled}],
        backgroundColor:['#e0992f','#3b82f6','#22c55e','#ef4444'],borderColor:'#141a25',borderWidth:3}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'62%',animation:{animateRotate:true,duration:900},
        plugins:{legend:{position:'bottom',labels:{color:tick,boxWidth:12,padding:14}}}}});
  })();
  </script>`;
  return shell({ title: 'Dashboard', active: 'dashboard', body, withCharts: true });
}

function analyticsPage(a) {
  const maxC = Math.max(1, ...a.topCountries.map((c) => c.value));
  const countryBars = a.topCountries.map((c) =>
    `<div class="bar__row"><span class="bar__label">${escapeHtml(c.label)}</span>
      <span class="bar__track"><span class="bar__fill" data-w="${Math.round((c.value / maxC) * 100)}"></span></span>
      <span class="bar__val">${c.value}</span></div>`).join('') || '<div class="empty">No data yet</div>';

  const lpRows = a.landing.map((l) =>
    `<tr><td>${escapeHtml(l.page)}</td><td class="right">${l.visits}</td><td class="right">${l.unique}</td>
     <td class="right">${l.orders}</td><td class="right"><strong>${l.conversionRate}%</strong></td></tr>`).join('');

  const pathRows = a.behavior.topPaths.map((p) =>
    `<div class="kv"><span>${escapeHtml(p.label)}</span><span>${p.value}</span></div>`).join('') || '<div class="empty">No data</div>';

  const body = `
  <div class="head"><div><h1>Analytics</h1><div class="sub">Traffic & conversion — your own visits are excluded</div></div></div>
  <div class="cards">
    ${statCard({ icon: ICON.eye, label: 'Total Visits', num: a.summary.totalVisits, accent: true })}
    ${statCard({ icon: ICON.users, label: 'Unique Visitors', num: a.summary.uniqueVisitors, delay: 60 })}
    ${statCard({ icon: ICON.clock, label: 'Visits Today', num: a.summary.todayVisits, delay: 120 })}
    ${statCard({ icon: ICON.cart, label: 'Orders', num: a.summary.totalOrders, delay: 180 })}
    ${statCard({ icon: ICON.pct, label: 'Conversion Rate', num: a.summary.conversionRate, dec: true, suffix: '%', accent: true, delay: 240 })}
    ${statCard({ icon: ICON.users, label: 'Returning', num: a.behavior.returningVisitors, sub: a.behavior.avgPagesPerVisitor + ' pages / visitor', delay: 300 })}
  </div>

  <div class="panel"><div class="panel__head"><h2>Traffic trends — last 14 days</h2></div>
    <div class="panel__body"><div class="chart-wrap"><canvas id="trafficChart"></canvas></div></div></div>

  <div class="grid2">
    <div class="panel"><div class="panel__head"><h2>Landing page performance</h2></div>
      <div class="panel__body" style="padding:0">
        <table><thead><tr><th>Page</th><th class="right">Visits</th><th class="right">Unique</th><th class="right">Orders</th><th class="right">Conv.</th></tr></thead>
        <tbody>${lpRows}</tbody></table></div></div>
    <div class="panel"><div class="panel__head"><h2>Top countries</h2></div>
      <div class="panel__body"><div class="bars">${countryBars}</div></div></div>
  </div>

  <div class="grid3">
    <div class="panel"><div class="panel__head"><h2>Devices</h2></div>
      <div class="panel__body"><div class="chart-wrap chart-wrap--sm"><canvas id="deviceChart"></canvas></div></div></div>
    <div class="panel"><div class="panel__head"><h2>Browsers</h2></div>
      <div class="panel__body"><div class="chart-wrap chart-wrap--sm"><canvas id="browserChart"></canvas></div></div></div>
    <div class="panel"><div class="panel__head"><h2>Visitor behavior</h2></div>
      <div class="panel__body">
        <div class="chart-wrap chart-wrap--sm" style="height:150px"><canvas id="behaviorChart"></canvas></div>
        <div style="margin-top:10px">${pathRows}</div>
      </div></div>
  </div>

  <script>
  (function(){
    var grid='#222b3a',tick='#8b95a7',palette=['#c9a861','#3b82f6','#22c55e','#e0992f','#ef4444','#8b5cf6','#14b8a6','#ec4899'];
    var tr=${JSON.stringify(a.trends)};
    new Chart(document.getElementById('trafficChart'),{type:'line',
      data:{labels:tr.labels,datasets:[
        {label:'Visits',data:tr.visits,borderColor:'#c9a861',backgroundColor:'rgba(201,168,97,.12)',fill:true,tension:.35,borderWidth:2,pointRadius:0},
        {label:'Unique',data:tr.unique,borderColor:'#3b82f6',tension:.35,borderWidth:2,pointRadius:0},
        {label:'Orders',data:tr.orders,borderColor:'#22c55e',tension:.35,borderWidth:2,pointRadius:0}]},
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:900},
        plugins:{legend:{labels:{color:tick,boxWidth:12}}},
        scales:{x:{grid:{color:grid},ticks:{color:tick}},y:{grid:{color:grid},ticks:{color:tick},beginAtZero:true}}}});
    var dev=${JSON.stringify(a.devices)};
    new Chart(document.getElementById('deviceChart'),{type:'doughnut',
      data:{labels:dev.map(x=>x.label),datasets:[{data:dev.map(x=>x.value),backgroundColor:palette,borderColor:'#141a25',borderWidth:3}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'60%',animation:{animateRotate:true,duration:900},plugins:{legend:{position:'bottom',labels:{color:tick,boxWidth:12,padding:12}}}}});
    var br=${JSON.stringify(a.browsers)};
    new Chart(document.getElementById('browserChart'),{type:'doughnut',
      data:{labels:br.map(x=>x.label),datasets:[{data:br.map(x=>x.value),backgroundColor:palette,borderColor:'#141a25',borderWidth:3}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'60%',animation:{animateRotate:true,duration:900},plugins:{legend:{position:'bottom',labels:{color:tick,boxWidth:12,padding:12}}}}});
    new Chart(document.getElementById('behaviorChart'),{type:'doughnut',
      data:{labels:['New','Returning'],datasets:[{data:[${a.behavior.newVisitors},${a.behavior.returningVisitors}],backgroundColor:['#3b82f6','#c9a861'],borderColor:'#141a25',borderWidth:3}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'62%',animation:{animateRotate:true,duration:900},plugins:{legend:{position:'bottom',labels:{color:tick,boxWidth:12,padding:12}}}}});
  })();
  </script>`;
  return shell({ title: 'Analytics', active: 'analytics', body, withCharts: true });
}

function ordersPage({ result, filters, countries, csrf }) {
  const qs = (overrides) => {
    const p = new URLSearchParams();
    const merged = { ...filters, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `?${p.toString()}`;
  };
  const rows = result.rows.map((o) => {
    const name = escapeHtml(o.customer_name || o.name || '');
    const phone = escapeHtml(o.customer_phone || o.phone || '');
    const price = `${Number(o.price || o.total || 0).toLocaleString('en-US')}`;
    const opts = ORDER_STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('');
    return `<tr>
      <td><a href="/admin/orders/${o.id}" style="color:var(--gold);font-weight:700">#${o.id}</a><div class="muted" style="font-size:11.5px">${escapeHtml(o.ref || '')}</div></td>
      <td>${name}</td><td>${phone}</td><td>${escapeHtml(o.country || '')}</td><td>${escapeHtml(o.city || '')}</td>
      <td>${escapeHtml(o.product_name || '')}</td><td class="right">${escapeHtml(String(o.quantity || 1))}</td>
      <td class="right">${price} ${escapeHtml(o.currency || '')}</td>
      <td><form class="inline" method="POST" action="/admin/orders/${o.id}/status"><input type="hidden" name="_csrf" value="${escapeHtml(csrf)}"><input type="hidden" name="redirect" value="${escapeHtml(qs({}))}">
        <select class="status-select" name="status" onchange="this.form.submit()">${opts}</select></form></td>
      <td class="muted">${escapeHtml((o.created_at || '').slice(0, 16))}</td>
      <td><div class="actions"><a class="btn btn--sm" href="/admin/orders/${o.id}">View</a>
        <form class="inline" method="POST" action="/admin/orders/${o.id}/delete" onsubmit="return confirm('Delete order #${o.id}?')">
          <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}"><input type="hidden" name="redirect" value="${escapeHtml(qs({}))}">
          <button class="btn btn--sm btn--danger" type="submit">Delete</button></form></div></td>
    </tr>`;
  }).join('');

  const countryOpts = countries.map((c) => `<option value="${escapeHtml(c)}" ${filters.country === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
  const statusOpts = ORDER_STATUSES.map((s) => `<option value="${s}" ${filters.status === s ? 'selected' : ''}>${s}</option>`).join('');
  const prevDis = result.page <= 1 ? 'style="opacity:.4;pointer-events:none"' : '';
  const nextDis = result.page >= result.pages ? 'style="opacity:.4;pointer-events:none"' : '';

  const body = `
  <div class="head"><div><h1>Orders</h1><div class="sub">${result.total} total</div></div>
    <div class="actions">
      <a class="btn btn--sm" href="/admin/orders/export.csv${qs({})}">⬇ CSV</a>
      <a class="btn btn--sm" href="/admin/orders/export.xls${qs({})}">⬇ Excel</a>
    </div></div>
  <div class="panel">
    <div class="panel__head">
      <form class="filters" method="GET" action="/admin/orders">
        <input name="search" placeholder="Search name, phone, ref…" value="${escapeHtml(filters.search || '')}">
        <select name="status"><option value="">All statuses</option>${statusOpts}</select>
        <select name="country"><option value="">All countries</option>${countryOpts}</select>
        <input name="product" placeholder="Product" value="${escapeHtml(filters.product || '')}">
        <input type="date" name="dateFrom" value="${escapeHtml(filters.dateFrom || '')}">
        <input type="date" name="dateTo" value="${escapeHtml(filters.dateTo || '')}">
        <select name="sort"><option value="newest" ${filters.sort !== 'oldest' ? 'selected' : ''}>Newest</option><option value="oldest" ${filters.sort === 'oldest' ? 'selected' : ''}>Oldest</option></select>
        <button class="btn btn--sm btn--gold" type="submit">Filter</button>
        <a class="btn btn--sm" href="/admin/orders">Reset</a>
      </form>
    </div>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Country</th><th>City</th><th>Product</th><th class="right">Qty</th><th class="right">Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="11"><div class="empty">No orders match your filters.</div></td></tr>`}</tbody>
    </table></div>
    <div class="pagination">
      <a class="btn btn--sm" ${prevDis} href="${qs({ page: result.page - 1 })}">‹ Prev</a>
      <span class="muted">Page ${result.page} / ${result.pages}</span>
      <a class="btn btn--sm" ${nextDis} href="${qs({ page: result.page + 1 })}">Next ›</a>
    </div>
  </div>`;
  return shell({ title: 'Orders', active: 'orders', body });
}

function orderDetailPage({ order, csrf }) {
  const kv = (l, v) => `<div class="kv"><span>${escapeHtml(l)}</span><span>${escapeHtml(v ?? '') || '—'}</span></div>`;
  const opts = ORDER_STATUSES.map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('');
  const body = `
  <div class="head"><div><h1>Order #${order.id} ${statusBadge(order.status)}</h1><div class="sub">${escapeHtml(order.ref || '')}</div></div>
    <div class="actions"><a class="btn btn--sm" href="/admin/orders">← Back</a>
      <form class="inline" method="POST" action="/admin/orders/${order.id}/delete" onsubmit="return confirm('Delete this order?')">
        <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}"><input type="hidden" name="redirect" value="/admin/orders">
        <button class="btn btn--sm btn--danger" type="submit">Delete</button></form></div></div>

  <form method="POST" action="/admin/orders/${order.id}/status" style="margin-bottom:18px;display:flex;gap:8px;align-items:center">
    <input type="hidden" name="_csrf" value="${escapeHtml(csrf)}"><input type="hidden" name="redirect" value="/admin/orders/${order.id}">
    <span class="muted">Status:</span><select class="status-select" name="status">${opts}</select>
    <button class="btn btn--sm btn--gold" type="submit">Update</button>
  </form>

  <div class="detail-grid">
    <div class="dcard" style="animation-delay:0ms"><h3>Customer</h3>${kv('Name', order.customer_name || order.name)}${kv('Phone', order.customer_phone || order.phone)}${kv('Email', order.customer_email)}</div>
    <div class="dcard" style="animation-delay:60ms"><h3>Shipping</h3>${kv('Country', order.country)}${kv('City', order.city)}${kv('Address', order.address)}</div>
    <div class="dcard" style="animation-delay:120ms"><h3>Product</h3>${kv('Product', order.product_name)}${kv('SKU', order.product_id)}${kv('Quantity', order.quantity)}${kv('Price', `${order.price} ${order.currency || ''}`)}</div>
    <div class="dcard" style="animation-delay:180ms"><h3>Tracking</h3>${kv('Reference', order.ref)}${kv('Status', order.status)}${kv('Landing page', order.source === 'ar' ? 'Arabic' : order.source === 'fr' ? 'French' : '—')}${kv('Created', order.created_at)}${kv('Updated', order.updated_at)}</div>
    <div class="dcard" style="animation-delay:240ms"><h3>Facebook</h3>${kv('Event ID', order.event_id)}${kv('fbclid', order.fbclid)}${kv('fbc', order.fbc)}${kv('fbp', order.fbp)}${kv('CAPI status', order.capi_status)}</div>
    <div class="dcard" style="animation-delay:300ms"><h3>Browser</h3>${kv('IP address', order.ip_address)}${kv('User agent', order.user_agent)}</div>
    <div class="dcard" style="animation-delay:360ms"><h3>Notes</h3><div class="muted" style="white-space:pre-wrap">${escapeHtml(order.notes || '') || '—'}</div></div>
  </div>`;
  return shell({ title: `Order #${order.id}`, active: 'orders', body });
}

module.exports = { loginPage, dashboardPage, analyticsPage, ordersPage, orderDetailPage, statusBadge, shell };
