(() => {
  const pvEl = document.querySelector(".pv");
  if (!pvEl) return;

  const cfg = window.__UMAMI_CONFIG__ || {};
  if (!cfg.url || !cfg.shareId) return;

  const baseUrl = cfg.url.replace(/\/$/, "");
  const pageUrl = pvEl.dataset.url || window.location.pathname;
  const endpoint = cfg.endpoint || "stats";
  const params = new URLSearchParams({
    startAt: "0",
    endAt: Date.now().toString(),
    url: pageUrl,
  });

  fetch(`${baseUrl}/api/share/${cfg.shareId}/${endpoint}?${params.toString()}`, {
    credentials: "omit",
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const count = extractCount(data);
      if (typeof count === "number") {
        pvEl.textContent = String(count);
      }
    })
    .catch(() => {});

  function extractCount(data) {
    if (!data) return null;
    if (typeof data.pageviews === "number") return data.pageviews;
    if (data.pageviews && typeof data.pageviews.value === "number") return data.pageviews.value;
    if (typeof data.views === "number") return data.views;
    if (typeof data.count === "number") return data.count;
    if (Array.isArray(data)) return sumArray(data);
    if (Array.isArray(data.data)) return sumArray(data.data);
    if (data.data && typeof data.data.pageviews === "number") return data.data.pageviews;
    if (data.data && typeof data.data.value === "number") return data.data.value;
    return null;
  }

  function sumArray(arr) {
    let sum = 0;
    for (const item of arr) {
      const val =
        item.y ??
        item.value ??
        item.pageviews ??
        item.count ??
        item.views ??
        0;
      sum += Number(val) || 0;
    }
    return sum;
  }
})();
