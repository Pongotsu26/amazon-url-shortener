"use strict";

importScripts("url-utils.js");

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) {
    return;
  }

  const canonicalUrl = AmazonUrl.toCanonicalAmazonUrl(changeInfo.url);
  if (!canonicalUrl || canonicalUrl === changeInfo.url) {
    return;
  }

  chrome.tabs.update(tabId, { url: canonicalUrl });
});
