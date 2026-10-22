(() => {
  "use strict";

  const grid = document.querySelector("#goodsGrid");
  if (!grid) return;
  const data = window.LAST_CALL_GOODS;
  if (!data || !Array.isArray(data.products)) {
    const note = document.createElement("p");
    note.className = "goods-no-script";
    note.textContent = "商品情報は準備中です。準備が整い次第お知らせします。";
    grid.replaceChildren(note);
    return;
  }

  const text = (value) => typeof value === "string" ? value.trim() : "";
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  function purchaseUrl(product) {
    return window.LastCallCommerce?.purchaseUrl(data, product) || null;
  }

  function photoUrl(photo) {
    // Product photographs are local assets; no external tracking or mockups.
    if (!photo || !text(photo.alt) || !/^\/img\/goods\/[a-zA-Z0-9/_-]+\.(webp|avif|png|jpe?g)$/i.test(text(photo.src))) return null;
    return photo.src;
  }

  function placeholder(product, index) {
    const frame = element("div", "goods-photo-placeholder");
    frame.setAttribute("aria-label", `${product.name}の商品写真は準備中`);
    frame.append(element("span", "goods-frame-number", String(index + 1).padStart(2, "0")));
    const mark = element("div", "goods-frame-mark");
    mark.setAttribute("aria-hidden", "true");
    mark.append(element("span", "goods-frame-wordmark", "LAST CALL"));
    mark.append(element("span", "goods-frame-type", product.label));
    frame.append(mark);
    frame.append(element("span", "goods-photo-caption", "商品写真準備中"));
    return frame;
  }

  let availableCount = 0;
  grid.replaceChildren(...data.products.map((product, index) => {
    const card = element("article", "goods-card");
    card.dataset.product = product.id;
    card.id = product.id;
    const titleId = `goods-${product.id}-title`;
    card.setAttribute("aria-labelledby", titleId);

    const media = element("div", "goods-media");
    const photo = photoUrl(product.photo);
    if (photo) {
      const image = element("img", "goods-photo");
      image.alt = product.photo.alt;
      image.width = 800;
      image.height = 1000;
      image.loading = "lazy";
      image.addEventListener("error", () => media.replaceChildren(placeholder(product, index)), { once: true });
      image.src = photo;
      media.append(image);
    } else {
      media.append(placeholder(product, index));
    }
    card.append(media);

    const body = element("div", "goods-card-body");
    const label = element("p", "goods-product-label", product.label);
    const heading = element("h3", "goods-product-title", product.name);
    heading.id = titleId;
    body.append(label, heading, element("p", "goods-product-description", product.description));
    if (text(product.priceText)) body.append(element("p", "goods-product-price", product.priceText));
    const specifications = Array.isArray(product.specifications) ? product.specifications.filter((item) => text(item)) : [];
    if (specifications.length) {
      const list = element("ul", "goods-specifications");
      specifications.forEach((item) => list.append(element("li", "", item)));
      body.append(list);
    }

    const footer = element("div", "goods-card-footer");
    const url = purchaseUrl(product);
    const note = element("p", "goods-product-status");
    note.id = `goods-${product.id}-status`;
    if (url) {
      availableCount += 1;
      note.textContent = text(product.priceText) || "価格はSTORESでご確認ください";
      const link = element("a", "goods-purchase", "STORESで商品を見る");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${product.name}をSTORESで見る（新しいタブで開きます）`);
      link.setAttribute("aria-describedby", note.id);
      const arrow = element("span", "goods-purchase-arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      link.append(arrow);
      footer.append(note, link);
    } else {
      const soldOut = product.status === "sold-out";
      note.textContent = soldOut ? "次回の販売は、決まり次第お知らせします" : "販売情報は、準備が整い次第お知らせします";
      const button = element("button", "goods-purchase", soldOut ? "現在販売していません" : "オンライン販売 準備中");
      button.type = "button";
      button.disabled = true;
      button.setAttribute("aria-describedby", note.id);
      footer.append(note, button);
    }
    body.append(footer);
    card.append(body);
    return card;
  }));

  if (availableCount) {
    document.querySelector("#goodsAnnouncement").textContent = "ONLINE STORE · STORES";
    document.querySelector(".goods-intro > p").textContent = "映画『ラストコール』のグッズ。販売中の商品は、STORESからご購入いただけます。";
    document.querySelector("#goodsShoppingNote > p:last-child").textContent = "ご購入はSTORESの商品ページへ。最終的な価格・在庫・送料・お支払い方法は、各商品ページでご確認ください。";
  }
})();
