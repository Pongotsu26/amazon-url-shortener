const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const AmazonUrl = require("../url-utils.js");

const source = fs.readFileSync(require.resolve("../background.js"), "utf8");
const productUrl = "https://www.amazon.co.jp/gp/product/B0ABC12345?ref=example";
const canonicalUrl = "https://www.amazon.co.jp/dp/B0ABC12345";

function setup(url, { rejectInjection = false } = {}) {
  const history = ["https://www.amazon.co.jp/s?k=keyboard", url];
  const injections = [];
  const warnings = [];
  let onUpdated;
  const context = vm.createContext({
    AmazonUrl,
    importScripts() {},
    location: {
      get href() { return history.at(-1); },
      replace(value) { history[history.length - 1] = value; }
    },
    console: { warn: (...args) => warnings.push(args) },
    chrome: {
      tabs: { onUpdated: { addListener(listener) { onUpdated = listener; } } },
      scripting: {
        executeScript(options) {
          injections.push(options);
          if (rejectInjection) {
            return Promise.reject(new Error("The tab was closed."));
          }
          // Chromeと同様に、渡された関数をページ側の文脈で実行する。
          context.scriptArgs = options.args;
          vm.runInContext(`(${options.func.toString()})(...scriptArgs)`, context);
          return Promise.resolve([]);
        }
      }
    }
  });
  vm.runInContext(source, context);
  return { history, injections, warnings, onUpdated };
}

test("短縮後も履歴を増やさず、戻る1回で検索結果へ戻れる", () => {
  const state = setup(productUrl);
  state.onUpdated(7, { url: productUrl }, { url: productUrl });
  assert.equal(state.injections[0].target.tabId, 7);
  assert.equal(state.history.length, 2);
  assert.equal(state.history.at(-1), canonicalUrl);
  state.history.pop();
  assert.equal(state.history.at(-1), "https://www.amazon.co.jp/s?k=keyboard");
});

test("スクリプト実行前に別ページへ移動した場合は書き換えない", () => {
  const nextUrl = "https://www.amazon.co.jp/gp/product/0123456789";
  const state = setup(nextUrl);
  state.onUpdated(7, { url: productUrl }, { url: productUrl });
  assert.equal(state.history.at(-1), nextUrl);
});

test("読み込み完了時にも短縮を試行する", () => {
  const state = setup(productUrl);
  state.onUpdated(7, { status: "complete" }, { url: productUrl });
  assert.equal(state.history.at(-1), canonicalUrl);
});

test("正規URLや検索結果などの対象外URLは変更しない", () => {
  for (const url of [canonicalUrl, canonicalUrl + "?th=1", "https://www.amazon.co.jp/s?k=keyboard", "https://www.amazon.com/gp/product/B0ABC12345"]) {
    const state = setup(url);
    state.onUpdated(7, { url }, { url });
    assert.equal(state.injections.length, 0);
    assert.equal(state.history.at(-1), url);
  }
});

test("URL変更を伴わないタブ更新では短縮しない", () => {
  const state = setup(productUrl);
  state.onUpdated(7, { title: "Amazon" }, { url: productUrl });
  assert.equal(state.injections.length, 0);
});

test("タブが閉じてスクリプトを実行できなくても拒否を処理する", async () => {
  const state = setup(productUrl, { rejectInjection: true });
  state.onUpdated(7, { url: productUrl }, { url: productUrl });
  await Promise.resolve();
  assert.equal(state.warnings.length, 1);
  assert.equal(state.history.at(-1), productUrl);
});
