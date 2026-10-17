(() => {
  const form = document.querySelector("#casting-form");
  if (!form) return;
  const status = document.querySelector("#casting-status");
  const button = form.querySelector("button[type=submit]");
  let key = crypto.randomUUID();
  let submitted = false;
  let busy = false;
  if (form.dataset.demo === "true") {
    status.textContent =
      "開発用プレビューです。このフォームから実際の依頼は送信されません。";
    return;
  }
  button.disabled = false;
  const selected = new URLSearchParams(location.search).get("model") || "";
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected) && selected.length <= 70) {
    form.elements.modelSlug.value = selected;
    fetch(`/api/talent-selection?slug=${encodeURIComponent(selected)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.status === 404) {
          button.disabled = true;
          status.textContent =
            "選択したモデルは現在公開されていません。モデル一覧からご確認ください。";
          return;
        }
        if (!response.ok) return;
        const data = await response.json();
        if (typeof data.name === "string")
          document.querySelector("#selected-model").textContent =
            `希望モデル：${data.name}`;
      })
      .catch(() => {});
    document.querySelector("#selected-model").textContent =
      "希望モデル：プロフィールで選択したモデル";
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || submitted || !form.reportValidity()) return;
    busy = true;
    button.disabled = true;
    status.textContent = "送信しています…";
    status.removeAttribute("data-error");
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    const data = Object.fromEntries(new FormData(form));
    data.privacyConsent = form.elements.privacyConsent.checked;
    try {
      const response = await fetch(
        form.dataset.endpoint || "https://yolo-members.vercel.app/api/casting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": key,
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(18000),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        for (const [name, message] of Object.entries(result.errors || {})) {
          const field = form.elements[name];
          if (field) {
            field.setAttribute("aria-invalid", "true");
            field.setCustomValidity(message);
            field.addEventListener("input", () => field.setCustomValidity(""), {
              once: true,
            });
          }
        }
        form.reportValidity();
        throw new Error(result.message || "送信できませんでした。");
      }
      submitted = true;
      status.textContent = `ご相談を受け付けました。受付番号：${result.receipt}。YOLOが内容を確認します。出演の確定ではありません。`;
      form.querySelector("fieldset").disabled = true;
      button.textContent = "送信済み";
      status.focus();
    } catch (error) {
      status.textContent =
        error.name === "TimeoutError"
          ? "受付状況を確認できませんでした。同じ内容で再送すると重複せず受付を確認できます。"
          : error.message;
      status.setAttribute("data-error", "true");
      status.focus();
      if (form.dataset.demo === "true") {
        status.textContent =
          "開発用プレビューです。このフォームから実際の依頼は送信されません。";
        return;
      }
      button.disabled = false;
    } finally {
      busy = false;
    }
  });
  form.addEventListener("input", () => {
    if (!busy && !submitted) status.textContent = "";
  });
})();
