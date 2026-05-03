## Context

新規プロジェクト。既存コードなし。個人用ローカルWebアプリとして、`npm run dev` で起動し `localhost:3000` からアクセスする。データはマシン上の SQLite ファイルに永続保存する。

## Goals / Non-Goals

**Goals:**
- Next.js (App Router) + Drizzle ORM + SQLite でレシピCRUDアプリを構築する
- `npm run dev` 1コマンドで起動できる
- データがローカルに永続保存される

**Non-Goals:**
- 認証・マルチユーザー対応
- クラウド同期・ホスティング
- スマホ対応（レスポンシブ）
- 写真アップロード
- タグ・カテゴリ機能

## Decisions

### 1. Next.js App Router + API Routes
React Server Components と API Routes を組み合わせる。フロントエンドとバックエンドを1プロジェクトで管理できるため、個人アプリのシンプルさに適している。

**代替案**: Express + React SPA → 2プロジェクト構成になり複雑になるため不採用。

### 2. SQLite + Drizzle ORM
ローカルの単一ファイル（`recipes.db`）に保存。サーバー不要でシンプル。Drizzle ORM でタイプセーフなスキーマ管理とマイグレーションを実現。

**代替案**: PostgreSQL → ローカル開発にデーモン起動が必要で個人アプリには過剰。

### 3. データモデル

材料は名前と量をセットで持つため、`recipe_ingredients` テーブルに正規化する。将来「この材料を使ったレシピ」検索にも対応できる。

**代替案**: `ingredients TEXT` に JSON 文字列として格納 → 材料名での検索が困難になるため不採用。

```
recipes テーブル
─────────────────────────────────────────
id          INTEGER  PRIMARY KEY AUTOINCREMENT
name        TEXT     NOT NULL        (料理名)
steps       TEXT     NOT NULL        (作り方)
cooked_at   TEXT     NOT NULL        (作った日 YYYY-MM-DD)
ref_url     TEXT                     (参考URL)
rating      INTEGER  NOT NULL DEFAULT 3  (評価 1〜5)
memo        TEXT                     (メモ)
created_at  TEXT     NOT NULL        (登録日時)
updated_at  TEXT     NOT NULL        (更新日時)

recipe_ingredients テーブル
─────────────────────────────────────────
id          INTEGER  PRIMARY KEY AUTOINCREMENT
recipe_id   INTEGER  NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
name        TEXT     NOT NULL        (材料名)
amount      TEXT     NOT NULL        (量 例: "300g", "大さじ2", "1個")
sort_order  INTEGER  NOT NULL        (表示順)
```

レシピ削除時は `ON DELETE CASCADE` で材料も自動削除される。

### 4. ページ構成

```
/                → レシピ一覧（検索・ソート付き）
/recipes/new     → 追加フォーム
/recipes/[id]    → 詳細表示
/recipes/[id]/edit → 編集フォーム
```

### 5. APIルート構成

```
GET    /api/recipes          → 一覧取得（?q=検索ワード）
POST   /api/recipes          → 新規作成
GET    /api/recipes/[id]     → 1件取得
PUT    /api/recipes/[id]     → 更新
DELETE /api/recipes/[id]     → 削除
```

## Risks / Trade-offs

- **SQLite の並行書き込み制限** → 個人用途（シングルユーザー）のため問題なし
- **DBファイルのバックアップ** → 自動バックアップ機能はスコープ外。ユーザーが手動でファイルをコピーする。
- **マイグレーション管理** → Drizzle Kit の `drizzle-kit push` でスキーマ変更を適用する。
