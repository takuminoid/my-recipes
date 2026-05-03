# My Recipes

日々の自炊レシピを記録・参照するための個人用ローカルWebアプリ。

## 機能

- レシピの追加・編集・削除
- 料理名での検索
- 作った日の新しい順に表示
- 材料ごとに名前と量を管理
- 作り方のMarkdown記述対応
- 評価・参考URL・メモの記録

## 技術スタック

- [Next.js](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team) + SQLite
- [Tailwind CSS](https://tailwindcss.com)

## セットアップ

```bash
npm install
npx drizzle-kit push
npm run dev
```

`http://localhost:3000` にアクセスして使用する。

レシピデータは `recipes.db`（SQLiteファイル）にローカル保存される。
