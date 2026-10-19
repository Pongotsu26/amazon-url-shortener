"use strict";

importScripts("url-utils.js");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const sourceUrl = changeInfo.url ||
    (changeInfo.status === "complete" ? tab.url : null);
  if (!sourceUrl) {
    return;
  }

  const canonicalUrl = AmazonUrl.toCanonicalAmazonUrl(sourceUrl);
  if (!canonicalUrl) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId },
    func: (expectedUrl, replacementUrl) => {
      // 実行を待つ間に別のページへ移動していたら変更しない。
      if (location.href === expectedUrl) {
        location.replace(replacementUrl);
      }
    },
    args: [sourceUrl, canonicalUrl]
  }).catch((error) => {
    // タブの終了や移動でスクリプトを実行できない場合がある。
    console.warn("Amazon URL Shortener: URLを置き換えられませんでした。", error);
  });
});
