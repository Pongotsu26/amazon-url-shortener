const test = require("node:test");
const assert = require("node:assert/strict");
const { getAsin, toCanonicalAmazonUrl } = require("../url-utils.js");

test("商品URLからASINを取り出す", () => {
  assert.equal(getAsin("/dp/B0ABC12345/ref=abc"), "B0ABC12345");
  assert.equal(getAsin("/gp/product/0123456789"), "0123456789");
  assert.equal(getAsin("/gp/aw/d/b0abc12345"), "B0ABC12345");
  assert.equal(getAsin("/商品タイトル/dp/B0ABC12345"), "B0ABC12345");
});

test("商品URLを正規URLへ変換する", () => {
  assert.equal(
    toCanonicalAmazonUrl(
      "https://www.amazon.co.jp/gp/product/b0abc12345/ref=ox_sc_act_title_1?smid=example&th=1"
    ),
    "https://www.amazon.co.jp/dp/B0ABC12345"
  );
  assert.equal(
    toCanonicalAmazonUrl("https://amazon.co.jp/d/0123456789?psc=1"),
    "https://www.amazon.co.jp/dp/0123456789"
  );
});

test("正規パスに付いたパラメーターはそのまま許可する", () => {
  assert.equal(
    toCanonicalAmazonUrl("https://www.amazon.co.jp/dp/B0ABC12345?tag=example&psc=1"),
    null
  );
  assert.equal(
    toCanonicalAmazonUrl("https://www.amazon.co.jp/dp/B0ABC12345/ref=abc?th=1"),
    null
  );
});

test("対象外のURLは変換しない", () => {
  assert.equal(toCanonicalAmazonUrl("https://www.amazon.co.jp/"), null);
  assert.equal(toCanonicalAmazonUrl("https://www.amazon.co.jp/s?k=keyboard"), null);
  assert.equal(toCanonicalAmazonUrl("https://www.amazon.com/dp/B0ABC12345"), null);
  assert.equal(toCanonicalAmazonUrl("not a url"), null);
});
