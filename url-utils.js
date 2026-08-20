(function (global) {
  "use strict";

  const asinPattern = /(?:^|\/)dp\/([a-z0-9]{10})(?=\/|$)/i;
  const productPattern = /(?:^|\/)gp\/(?:product|aw\/d)\/([a-z0-9]{10})(?=\/|$)/i;
  const shortProductPattern = /(?:^|\/)d\/([a-z0-9]{10})(?=\/|$)/i;

  function getAsin(pathname) {
    const path = pathname || "/";
    const match = path.match(asinPattern) ||
      path.match(productPattern) ||
      path.match(shortProductPattern);

    return match ? match[1].toUpperCase() : null;
  }

  function toCanonicalAmazonUrl(value) {
    let url;

    try {
      url = new URL(value);
    } catch {
      return null;
    }

    if (!/^https?:$/.test(url.protocol)) {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname !== "amazon.co.jp" && !hostname.endsWith(".amazon.co.jp")) {
      return null;
    }

    const asin = getAsin(url.pathname);
    if (!asin) {
      return null;
    }

    // Amazonが自動的にクエリや参照パスを付け直しても、
    // /dp/ASIN形式なら再リダイレクトしない。
    const hasCanonicalPath =
      hostname === "www.amazon.co.jp" &&
      new RegExp(`^/dp/${asin}(?:/|$)`, "i").test(url.pathname);

    return hasCanonicalPath ? null : `https://www.amazon.co.jp/dp/${asin}`;
  }

  const api = { getAsin, toCanonicalAmazonUrl };
  global.AmazonUrl = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(globalThis);
