# My Recipes

日々の自炊レシピを記録・参照するための個人用ローカルWebアプリ。

## 機能

- レシピの追加・編集・削除
- 料理名での検索
- 作った日の新しい順に表示
- 材料ごとに名前と量を管理（ドラッグ&ドロップで並び替え可）
- 作った日は任意入力
- 作り方のMarkdown記述対応
- 評価・参考URL・メモの記録

## 技術スタック

- [Next.js](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team) + SQLite
- [Tailwind CSS](https://tailwindcss.com)

## 初回セットアップ

```bash
npm install
npx drizzle-kit push   # recipes.db を生成
```

## 起動方法

### 開発時（ホットリロードあり）

```bash
npm run dev
```

`http://localhost:3939` にアクセス。

### 常駐起動（PM2）

PM2 を使ってバックグラウンドで常駐させる。Mac ログイン時に自動起動される。

```bash
# 初回のみ: PM2 のインストールと自動起動設定
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 表示されたコマンドを sudo で実行

# 以降の起動・停止
pm2 start my-recipes
pm2 stop my-recipes
pm2 status
```

## よく使うコマンド（Makefile）

```bash
make dev        # 開発サーバー起動
make deploy     # ビルド → PM2 再起動（本番反映）
make restart    # ビルドなしで PM2 再起動
make stop       # サーバー停止
make logs       # PM2 ログ表示
make db-push    # スキーマ変更を DB に反映
```

## スキーマ変更後の手順

`src/db/schema.ts` を変更した場合：

```bash
make db-push
make deploy
```

## データ

レシピデータは `recipes.db`（SQLiteファイル）にローカル保存される。
バックアップは手動でファイルをコピーすること。

```bash
cp recipes.db recipes.db.bak
```
