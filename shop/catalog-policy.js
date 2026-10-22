/* Shared commerce validation. Canonical source: yolo-official/shop/catalog-policy.js. */
(function (root) {
  "use strict";
  function allocation(data) {
    const plan = data && data.inventoryPlan;
    const used = { towel: 0, tote: 0, badge: 0 };
    if (!plan || !Array.isArray(data.products) || !data.products.length) return { valid: false, used };
    for (const p of data.products) {
      if (!p || !p.id) return { valid: false, used };
      const count = plan.allocations && plan.allocations[p.id];
      if (!Number.isSafeInteger(count) || count < 0 || !p.components || !Object.keys(p.components).length) return { valid: false, used };
      for (const [part, units] of Object.entries(p.components)) {
        if (!(part in used) || !Number.isSafeInteger(units) || units < 1) return { valid: false, used };
        used[part] += count * units;
      }
    }
    const valid = Object.entries(used).every(([part, count]) => Number.isSafeInteger(plan.components && plan.components[part]) && count <= plan.components[part]);
    return { valid, used };
  }
  function purchaseUrl(data, product) {
    const release = data && data.release;
    if (!release || release.storeVerified !== true || release.checkoutVerified !== true || release.salesTermsVerified !== true || data.inventoryPlan?.status !== "confirmed" || !allocation(data).valid || !product || product.status !== "available") return null;
    try {
      const shop = new URL(data.storeOrigin), item = new URL(product.productUrl);
      const safe = u => u.protocol === "https:" && !u.username && !u.password && !u.port;
      if (!safe(shop) || !safe(item) || shop.pathname !== "/" || shop.search || shop.hash || item.origin !== shop.origin || item.search || item.hash || !/^\/items\/[a-zA-Z0-9_-]+\/?$/.test(item.pathname)) return null;
      return item.href;
    } catch { return null; }
  }
  const api = { allocation, purchaseUrl };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LastCallCommerce = api;
})(typeof window === "object" ? window : globalThis);
