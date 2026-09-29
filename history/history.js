/* HISTORY ページ：活動の種類で絞り込む（JS無効時は全件表示のまま） */
(function () {
  var chips = document.querySelectorAll("[data-filter]");
  var years = document.querySelectorAll("[data-year]");
  if (!chips.length) return;

  function apply(key) {
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.filter === key)); });
    years.forEach(function (year) {
      var n = 0;
      year.querySelectorAll(".history-item").forEach(function (item) {
        var on = key === "ALL" || item.dataset.tags.split(" ").indexOf(key) !== -1;
        item.hidden = !on;
        if (on) n++;
      });
      year.querySelector("[data-count]").textContent = n + (n === 1 ? " ACTIVITY" : " ACTIVITIES");
      year.querySelector(".year-empty").hidden = n > 0;
    });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { apply(c.dataset.filter); });
  });
})();
