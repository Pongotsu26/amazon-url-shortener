# Amazon URL Shortener

Amazon.co.jpの商品ページへ移動したとき、URLからASINを取り出し、次の形式へ自動的にリダイレクトするChrome拡張機能です。

```text
https://www.amazon.co.jp/dp/ASIN
```

## 対応するURL

- `https://www.amazon.co.jp/dp/ASIN/...`
- `https://www.amazon.co.jp/gp/product/ASIN/...`
- `https://www.amazon.co.jp/gp/aw/d/ASIN/...`
- `https://www.amazon.co.jp/d/ASIN/...`
- 上記形式のAmazon.co.jpサブドメイン

商品ページではないURL、検索結果、Amazon.co.jp以外のAmazonドメインは変更しません。
短縮URLへの移動では現在の履歴を置き換えるため、ブラウザの「戻る」1回で直前のページへ戻れます。

## Chromeへの追加

1. Chromeで `chrome://extensions` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリックする
4. この `AmazonShortener` フォルダを選択する

変更を反映する場合は `chrome://extensions` でこの拡張機能の再読み込みボタンを押してください。

## テスト

Node.jsがあれば、URL変換と履歴を増やさないリダイレクト処理を次のコマンドで確認できます。

```bash
node --test tests/*.test.js
```
