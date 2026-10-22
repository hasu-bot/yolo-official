/* Product data and checkout are handled by Shopify's public storefront components. */
(function () {
  var productList = document.getElementById("shop-products");
  var emptyState = document.querySelector("[data-shop-empty]");
  var cartButton = document.querySelector("[data-open-cart]");
  var cart = document.getElementById("yolo-cart");

  if (cartButton && cart) {
    cartButton.addEventListener("click", function () {
      if (typeof cart.showModal === "function") cart.showModal();
    });
  }

  if (!productList || !emptyState) return;
  function refreshEmptyState() {
    emptyState.hidden = !!productList.querySelector("[data-shop-product]");
  }
  new MutationObserver(refreshEmptyState).observe(productList, { childList: true, subtree: true });
  refreshEmptyState();
})();
