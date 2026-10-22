/* Shopify remains the source of truth for prices, component stock and checkout.
   Change sales-status only after docs/shop-release.md has been completed. */
(function () {
  var catalog = document.getElementById("shop-products");
  var cartButton = document.querySelector("[data-open-cart]");
  var cart = document.getElementById("yolo-cart");
  var feedback = document.querySelector("[data-shop-feedback]");
  var salesReady = document.body.dataset.salesStatus === "ready";

  if (salesReady && catalog) {
    catalog.querySelectorAll("[data-product-context]").forEach(function (template) {
      template.after(template.content.cloneNode(true));
    });
  }

  function cartReady() {
    return salesReady && cart && typeof cart.addLine === "function" && typeof cart.showModal === "function";
  }
  function refreshCatalog() {
    if (!catalog) return;
    catalog.querySelectorAll("[data-bundle]").forEach(function (bundle) {
      var live = bundle.querySelector("[data-shop-product]");
      var preview = bundle.querySelector("[data-bundle-preview]");
      var title = live && live.querySelector("shopify-data");
      var price = live && live.querySelector("shopify-money");
      var loaded = !!(title && title.textContent.trim() && price && price.textContent.trim());
      var context = bundle.querySelector("shopify-context");
      if (context) context.hidden = !loaded;
      if (preview) preview.hidden = loaded;
      if (!live) return;
      live.hidden = !loaded;
      var button = live.querySelector("[data-add-to-cart]");
      if (!button) return;
      var available = button.dataset.available === "true";
      button.disabled = !loaded || !available || !cartReady();
      var label = !salesReady ? "販売準備中" : (!loaded || !cartReady() ? "読み込み中" : (available ? "カートに追加 ↗" : "現在ご購入いただけません"));
      if (button.textContent !== label) button.textContent = label;
    });
    if (cartButton) cartButton.disabled = !cartReady();
  }
  if (catalog) {
    // Listen only to data bindings and inserted content, not our own hidden/disabled changes.
    new MutationObserver(refreshCatalog).observe(catalog, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ["data-available"]
    });
    catalog.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add-to-cart]");
      if (!button || button.disabled || !cartReady()) return;
      try {
        feedback.textContent = "";
        cart.addLine(event).showModal();
      } catch (error) {
        feedback.textContent = "カートに追加できませんでした。時間をおいて、もう一度お試しください。";
      }
    });
  }
  if (cartButton) {
    cartButton.addEventListener("click", function () {
      if (cartReady()) cart.showModal();
    });
  }
  refreshCatalog();
  if (window.customElements) {
    customElements.whenDefined("shopify-cart").then(refreshCatalog);
  }
})();
