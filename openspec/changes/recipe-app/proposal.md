## Why

日々の自炊で作ったレシピを記録・参照できる手段がなく、同じ料理を作るたびに手順を思い出す必要がある。個人用のローカルWebアプリとして手軽に記録・検索できる仕組みを作る。

## What Changes

- レシピ一覧画面を新規作成（作った日の新しい順、料理名検索付き）
- レシピ追加フォームを新規作成
- レシピ詳細画面を新規作成
- レシピ編集・削除機能を新規作成
- SQLiteによる永続ストレージをローカルに構築
- Next.js (App Router) + Drizzle ORM + SQLite のプロジェクトを初期セットアップ

## Capabilities

### New Capabilities

- `recipe-management`: レシピのCRUD操作（追加・一覧・詳細・編集・削除）
- `recipe-search`: 料理名による検索と作った日によるソート

### Modified Capabilities

（なし）

## Impact

- 新規プロジェクトのため既存コードへの影響なし
- 依存パッケージ: `next`, `react`, `drizzle-orm`, `better-sqlite3`, `drizzle-kit`
- データはローカルの SQLite ファイル（`recipes.db`）に永続保存
