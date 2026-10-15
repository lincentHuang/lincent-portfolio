# Progress

- 2026-10-08：重構為單一 CMS 內容模型，前台所有區塊改讀後台資料（`src/content/types.ts`、`src/content/default-site.ts`、`src/server/content-repo.ts`）
- 2026-10-08：儲存層改為本機 / Cloudflare R2 自動切換，移除 Prisma 執行期依賴（`src/server/storage.ts`）
- 2026-10-08：重做圖片流程：自動轉正、WebP 壓縮、縮圖、模糊預覽、媒體庫、使用中防誤刪（`src/server/media.ts`、`src/features/admin/shared/media.tsx`、`src/components/media/media-image.tsx`）
- 2026-10-08：後台改為伺服器端驗證並保護所有寫入 API；修正詢問資料外洩到前台（`src/lib/session.ts`、`src/middleware.ts`、`src/features/inquiries/server/actions.ts`）
- 2026-10-08：後台重寫為模組化分頁，導覽對應前台結構（`src/features/admin/admin-shell.tsx`、`src/features/admin/sections/*`）
- 2026-10-08：新增「關於我」頁面，內容依履歷 PDF（`src/app/about/page.tsx`、`src/features/about/components/*`）
- 2026-10-08：優化全站中文斷行（標題 text-wrap: balance、段落 pretty、line-break: strict），修正精選作品區按鈕被擠成兩行（globals.css、featured-projects.tsx）
- 2026-10-08：作品頁相簿改為參考 ooze.design 的等高列排版，後台相簿改成所見即所得編輯（拖曳對調、列間插入、列高比例）（gallery-row-view.tsx、gallery-rows-editor.tsx、project-showcase.tsx）
- 2026-10-09：作品集新增 15 個個人產品、12 個過往客戶網站與 1 個早期網站合集，另 5 個早期專案存為草稿；截圖取自 Wayback 存檔與線上網站，並經媒體庫流程處理（data/content/content.json、data/media/）
- 2026-10-09：作品頁封面圖移除深黑底外框與內距，改為圓角直接呈現圖片（src/features/projects/components/project-showcase.tsx）
- 2026-10-15：Logo 重新設計為幾何直角 L（斜切直條＋三角形），更新 SVG／favicon／apple PNG（public/images/lincent-logo.svg、public/favicon.svg、layout.tsx、global-sidebar.tsx、page-transition-provider.tsx）
- 2026-10-15：從 Notion「LINCENT 令成 Web Projects」匯入 37 張內頁截圖到 15 個客戶專案相簿（未獨立建檔的 9 個早期網站併入早期網站合集），缺封面者以首圖補上；長截圖改為寬度上限 1600 避免被縮窄（data/content/content.json、data/media/）
- 2026-10-15：實地檢查 24 個舊客戶網站，僅 3 站仍為原版；錄製 4 支操作 GIF 放到相簿最前（kryptoGO×91APP、心理測驗、惟峰工業首屏與整頁），並依線上實際技術重寫三案中英文案；修正 GIF 被 srcSet 換成靜態縮圖的問題（data/content/content.json、src/components/media/media-image.tsx）
- 2026-10-15：GIF 換成 MP4 介紹影片（片頭卡＋段落字卡，30fps），3 支放在相簿最前並刪除舊 GIF；相簿、燈箱、後台預覽支援影片，媒體路由支援 mp4 與 Range（src/components/media/media-image.tsx、src/app/media/[...key]/route.ts、project-showcase.tsx、data/content/content.json）
