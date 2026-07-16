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
自動化 CV 履歷生成系統
