'use strict';

/**
 * Analytics: page-visit tracking + dashboard metrics.
 *
 * Visits are recorded server-side on every HTML page load (can't be blocked).
 * The owner's own traffic is excluded from every metric: any IP that has
 * successfully logged into /admin is auto-learned into `owner_ips`, plus any
 * IP listed in the OWNER_IPS env var. Those visits are stored with is_owner=1
 * and filtered out of all analytics queries.
 */

const { db } = require('../db');
const { config } = require('../config');

// ── User-agent parsing (dependency-free, good-enough heuristics) ─────────────
function parseDevice(ua = '') {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
  if (/Mobi|Android.*Mobile|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
}
function parseBrowser(ua = '') {
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook App';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\/|Opera/i.test(ua)) return 'Opera';
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
  if (/CriOS/i.test(ua)) return 'Chrome';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/FxiOS|Firefox/i.test(ua)) return 'Firefox';
  if (/Version\/.*Safari/i.test(ua) || /Safari/i.test(ua)) return 'Safari';
  if (/bot|crawl|spider|slurp|bing/i.test(ua)) return 'Bot';
  return 'Other';
}
function parseOs(ua = '') {
  if (/Windows/i.test(ua)) return 'Windows';
  if (/iPhone|iPad|iPod|iOS/i.test(ua)) return 'iOS';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}
function pageOf(path = '') {
  if (path === '/' || path === '/index.html') return 'fr';
  if (path === '/arabic' || path === '/arabic.html') return 'ar';
  return 'other';
}

// ── Owner IPs ────────────────────────────────────────────────────────────────
const envOwnerIps = new Set(config.ownerIps);

function isOwnerIp(ip) {
  if (!ip) return false;
  if (envOwnerIps.has(ip)) return true;
  const row = db.prepare(`SELECT 1 FROM owner_ips WHERE ip = ?`).get(ip);
  return Boolean(row);
}

function rememberOwnerIp(ip, source = 'admin-login') {
  if (!ip) return;
  db.prepare(`INSERT OR IGNORE INTO owner_ips (ip, source) VALUES (?, ?)`).run(ip, source);
  // Retroactively flag any of this IP's past visits as owner traffic.
  db.prepare(`UPDATE visits SET is_owner = 1 WHERE ip = ?`).run(ip);
}

// ── Recording ─────────────────────────────────────────────────────────────────
const insertVisit = db.prepare(`
  INSERT INTO visits (path, page, visitor_id, ip, ua, device, browser, os, country, referrer, fbclid, is_owner)
  VALUES (@path, @page, @visitor_id, @ip, @ua, @device, @browser, @os, @country, @referrer, @fbclid, @is_owner)
`);

// De-dup guard: browsers can fire a page load twice (prefetch, bf-cache, rapid
// reloads) — collapse identical loads from the same client+path inside a short
// window so a single visit is counted once.
const recentDup = db.prepare(`
  SELECT 1 FROM visits
  WHERE path = @path
    AND (visitor_id = @visitor_id OR ip = @ip)
    AND created_at >= datetime('now', '-8 seconds')
  LIMIT 1
`);

function recordVisit({ path, ip, ua, country, referrer, visitorId, fbclid }) {
  try {
    const p = (path || '').slice(0, 200);
    if (recentDup.get({ path: p, visitor_id: visitorId || null, ip: ip || null })) {
      return; // duplicate of a visit recorded moments ago — skip
    }
    insertVisit.run({
      path: (path || '').slice(0, 200),
      page: pageOf(path),
      visitor_id: visitorId || null,
      ip: ip || null,
      ua: (ua || '').slice(0, 400),
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      os: parseOs(ua),
      country: (country || '').slice(0, 4) || null,
      referrer: (referrer || '').slice(0, 300) || null,
      fbclid: fbclid || null,
      is_owner: isOwnerIp(ip) ? 1 : 0,
    });
  } catch (err) {
    console.error('[analytics] recordVisit failed:', err.message);
  }
}

// ── Queries (all exclude owner traffic) ──────────────────────────────────────
const NOT_OWNER = `is_owner = 0`;

function summary() {
  const totalVisits = db.prepare(`SELECT COUNT(*) n FROM visits WHERE ${NOT_OWNER}`).get().n;
  const uniqueVisitors = db.prepare(
    `SELECT COUNT(DISTINCT COALESCE(visitor_id, ip)) n FROM visits WHERE ${NOT_OWNER}`
  ).get().n;
  const { localToday } = require('../util');
  const todayVisits = db.prepare(
    `SELECT COUNT(*) n FROM visits WHERE ${NOT_OWNER} AND date(created_at, '+1 hour') = @d`
  ).get({ d: localToday() }).n;
  const totalOrders = db.prepare(`SELECT COUNT(*) n FROM orders`).get().n;
  const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;
  return {
    totalVisits,
    uniqueVisitors,
    todayVisits,
    totalOrders,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

/** Visits + unique + orders per landing page (fr/ar) with conversion rate. */
function landingPerformance() {
  const pages = ['fr', 'ar'];
  return pages.map((p) => {
    const visits = db.prepare(`SELECT COUNT(*) n FROM visits WHERE ${NOT_OWNER} AND page = ?`).get(p).n;
    const unique = db.prepare(
      `SELECT COUNT(DISTINCT COALESCE(visitor_id, ip)) n FROM visits WHERE ${NOT_OWNER} AND page = ?`
    ).get(p).n;
    const orders = db.prepare(`SELECT COUNT(*) n FROM orders WHERE source = ?`).get(p).n;
    const cr = unique > 0 ? Math.round((orders / unique) * 1000) / 10 : 0;
    return {
      page: p === 'fr' ? 'French (/)' : 'Arabic (/arabic)',
      visits, unique, orders, conversionRate: cr,
    };
  });
}

/** Daily series for the last N days: visits, unique visitors and orders. */
function trends(days = 14) {
  const visitRows = db.prepare(`
    SELECT date(created_at) d, COUNT(*) visits, COUNT(DISTINCT COALESCE(visitor_id, ip)) unique_v
    FROM visits WHERE ${NOT_OWNER} AND created_at >= date('now', ?)
    GROUP BY d
  `).all(`-${days} days`);
  const orderRows = db.prepare(`
    SELECT date(created_at) d, COUNT(*) orders
    FROM orders WHERE created_at >= date('now', ?)
    GROUP BY d
  `).all(`-${days} days`);

  const vMap = new Map(visitRows.map((r) => [r.d, r]));
  const oMap = new Map(orderRows.map((r) => [r.d, r.orders]));
  const labels = [];
  const visits = [];
  const unique = [];
  const orders = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    labels.push(d.slice(5)); // MM-DD
    visits.push(vMap.get(d)?.visits || 0);
    unique.push(vMap.get(d)?.unique_v || 0);
    orders.push(oMap.get(d) || 0);
  }
  return { labels, visits, unique, orders };
}

function topCountries(limit = 8) {
  return db.prepare(`
    SELECT COALESCE(NULLIF(country,''),'??') label, COUNT(*) value
    FROM visits WHERE ${NOT_OWNER}
    GROUP BY label ORDER BY value DESC LIMIT ?
  `).all(limit);
}

function breakdownBy(column, limit = 8) {
  const allowed = ['device', 'browser', 'os'];
  if (!allowed.includes(column)) throw new Error('Invalid column');
  return db.prepare(`
    SELECT COALESCE(NULLIF(${column},''),'Unknown') label, COUNT(*) value
    FROM visits WHERE ${NOT_OWNER}
    GROUP BY label ORDER BY value DESC LIMIT ?
  `).all(limit);
}

/** New vs returning visitors + top paths. */
function behavior() {
  const visitorCounts = db.prepare(`
    SELECT COALESCE(visitor_id, ip) v, COUNT(*) c
    FROM visits WHERE ${NOT_OWNER} AND COALESCE(visitor_id, ip) IS NOT NULL
    GROUP BY v
  `).all();
  const returning = visitorCounts.filter((r) => r.c > 1).length;
  const total = visitorCounts.length;
  const newV = total - returning;
  const avgPages = total > 0
    ? Math.round((visitorCounts.reduce((s, r) => s + r.c, 0) / total) * 10) / 10
    : 0;
  const topPaths = db.prepare(`
    SELECT path label, COUNT(*) value FROM visits WHERE ${NOT_OWNER}
    GROUP BY path ORDER BY value DESC LIMIT 6
  `).all();
  return { newVisitors: newV, returningVisitors: returning, avgPagesPerVisitor: avgPages, topPaths };
}

module.exports = {
  recordVisit, rememberOwnerIp, isOwnerIp,
  summary, landingPerformance, trends, topCountries, breakdownBy, behavior,
  parseDevice, parseBrowser, parseOs, pageOf,
};
