# 🚀 Google Forms to PDF CV Auto-Generator (自動化個人 CV 履歷生成系統)

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=googlecolab&logoColor=white)](https://developers.google.com/apps-script)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一個基於 **Google Workspace (Apps Script)** 開發的輕量級、免付費「全自動 CV 履歷生成與寄送系統」。

使用者只需填寫 **Google 表單 (Google Forms)**，系統便會在後台自動抓取資料、完美套入 **Google 簡報 (Google Slides)** 設計模版，自動完成「精準照片座標貼合排版」，最終轉換為 **PDF 格式** 並自動透過 **Gmail** 附加檔案發送給填表人。

---

## 🎯 專案解決的痛點 (Why this project?)

在許多社群、道場、學校或中小型組織中，經常需要為成員製作統一規格的個人 CV、名牌或履歷。
* **傳統做法**：行政人員必須手動從表單複製文字，在簡報中一張張貼上、手動拖曳並對齊照片。這不僅極度耗時、枯燥，而且非常容易在圖片縮放時造成排版跑版。
* **此專案解法**：實現 **0 手動干預**。成員填表後，**15 秒內**自動生成專屬 PDF 履歷並寄出。並研發了**「形狀座標貼合演算法」**，解決了 Google API 插入圖片時位置漂移、比例失控的排版通病。

---

## 🧱 系統架構圖 (System Architecture)# Automated-CV

[ 1. Google 表單 ] ──(填寫基本資料)──> [ 2. Google 試算表 ] ──(自動觸發觸發器)──> [ 3. Apps Script 引擎 ]
│
[ 5. 寄送 PDF 附件 ] <──(Gmail寄信通知)── [ 4. Google 簡報/PDF ] <──(套用模板/貼合照片)┘

自動化 CV 履歷生成系統
---

## ✨ 核心技術亮點與防止出錯機制 (Key Features & Error Handling)

1. **形狀座標貼合演算法 (Precise Shape-to-Image Alignment)**
   * 在 Google Slides 中，直接用程式插入的圖片通常無法控制大小與定位。本專案透過在模板中放置 `{{照片}}` 的「暫存文字框 (Shape)」，程式執行時會先記錄該框的 $X$ 軸、$Y$ 軸、寬高，再精準置入圖片並銷毀暫存框。達到 **100% 不跑版、不變形** 的完美對齊。
2. **自動垃圾清理機制 (Temporary File Auto-Cleanup)**
   * 為了避免每次生成 PDF 時都在雲端硬碟留下多餘的簡報副本導致空間爆滿，程式會在成功導出 PDF 後，自動於背景刪除臨時簡報，**節省儲存空間**。
3. **多重語意標籤相容 (Token Semantic Tolerance)**
   * 代碼中對常見標籤（例如 `{{姓名}}` 與 `{{名字}}`）進行多重替換映射，降低因非技術背景人員微調簡報模版而導致程式出錯的機率。
4. **絕對定位與防呆機制 (Absolute Resource Binding)**
   * 放棄容易受執行環境干擾的相對定位，改用硬編碼全域常數（試算表、簡報、資料夾 ID），確保代碼在任何 Google 帳號下執行皆具有 100% 穩定度。

---

## 🛠️ 安裝與部署教學 (Setup Guide)

### 步驟一：準備 Google 雲端檔案
1. **Google 簡報範本**：設計一張你的 CV 簡報，在需要填入資料的地方打上 `{{姓名}}`、`{{簡介}}`、`{{電話}}`、`{{LINE}}`，並在要放照片的地方建立一個文字方塊，裡面輸入 `{{個人形象照片}}`。
2. **Google 表單**：建立表單收集相關資料，並確保開啟「上傳檔案」功能供上傳個人照片。
3. **Google 試算表**：由表單自動建立，確認工作表名稱為 `表單回覆 1`。

### 步驟二：部署 Google Apps Script
1. 開啟試算表，點選選單的 **「擴充功能」 -> 「Apps Script」**。
2. 複製本專案 `src/code.js` 中的完整代碼並貼入編輯器中。
3. 替換程式碼最上方常數區的三個 `ID`：
   ```javascript
   const SPREADSHEET_ID = '你的_GOOGLE_試算表_ID'; 
   const TEMPLATE_ID     = '你的_GOOGLE_簡報範本_ID';     
   const OUTPUT_FOLDER_ID = '你的_PDF_儲存資料夾_ID';
