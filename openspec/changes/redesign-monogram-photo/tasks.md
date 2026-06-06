## 1. デザインシステム基盤

- [x] 1.1 `globals.css` をデザインシステム（CSS変数・トポバー・カード・モノグラム・詳細・フォーム）に刷新
- [x] 1.2 `layout.tsx` をクリームヘッダー（ブランド「たくみんレシピ」＋新規ボタン）＋ Google Fonts に変更

## 2. データモデル

- [x] 2.1 スキーマの `icon` を `tint`・`photo` に置換（`src/db/schema.ts`）
- [x] 2.2 既存 `recipes.db` をマイグレーション（`tint`/`photo` 追加・`icon` 削除・既存行へ `tint` 自動割り当て）
- [x] 2.3 API（POST/PUT）を `icon` → `tint`/`photo` に更新

## 3. 写真アップロード

- [x] 3.1 `POST /api/upload`（`uploads/` に保存、バリデーション）
- [x] 3.2 `GET /api/uploads/[name]`（パストラバーサル対策つき配信）
- [x] 3.3 `.gitignore` に `/uploads/` を追加

## 4. 画面

- [x] 4.1 共通UI（`Stars`/`Monogram`/`RecipeMedia`/`renderSteps`/`resolveTint`）を `recipe-ui.tsx` に実装
- [x] 4.2 一覧：検索＋並び替え（新しい順／評価順／名前順）＋件数チップ＋カードグリッド
- [x] 4.3 詳細：写真ヒーロー＋材料／手順の2カラム
- [x] 4.4 フォーム：モノグラム/写真タイル＋色スウォッチ＋評価ピッカー＋材料DnD＋手順タブ

## 5. 検証

- [x] 5.1 `npm run build` 通過、全ページ 200
- [x] 5.2 写真アップロード→配信ラウンドトリップ、トラバーサル拒否を確認
- [x] 5.3 `tint`/`photo` 付きの作成・取得・削除を確認
- [x] 5.4 README / openspec を更新
