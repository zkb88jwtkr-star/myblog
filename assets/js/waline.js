(() => {
  const mountEl = document.getElementById("waline");
  if (!mountEl) return;

  const cfg = window.__WALINE_CONFIG__ || {};
  if (!cfg.serverURL) return;

  const serverURL = cfg.serverURL.replace(/\/$/, "");
  const path = mountEl.dataset.path || window.location.pathname;

  const initWaline = () => {
    const Waline = window.Waline;
    const init = Waline && (Waline.init || Waline);
    if (typeof init !== "function") return false;

    init({
      el: "#waline",
      serverURL,
      path,
      reaction: cfg.reaction,
      locale: cfg.locale || "zh-CN",
      comment: false,
      pageview: false,
    });

    updateLikeCount();
    mountEl.addEventListener("click", () => {
      setTimeout(updateLikeCount, 800);
    });
    return true;
  };

  const updateLikeCount = () => {
    const likeEl = document.getElementById("waline-like");
    if (!likeEl) return;
    fetch(`${serverURL}/api/reaction?path=${encodeURIComponent(path)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const count = extractCount(data);
        if (typeof count === "number") {
          likeEl.textContent = String(count);
        }
      })
      .catch(() => {});
  };

  const extractCount = (data) => {
    if (!data) return null;
    if (typeof data.count === "number") return data.count;
    if (data.data && typeof data.data.count === "number") return data.data.count;
    const list = data.data || data;
    if (Array.isArray(list)) {
      return list.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    }
    return null;
  };

  if (!initWaline()) {
    window.addEventListener("load", initWaline, { once: true });
  }
})();
