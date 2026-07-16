// ====================================================================
// 🛠️ 雲端硬碟 ID 專區（全域常數設定）
// ====================================================================
// 說明：常數（const）是以大寫命名，作為程式運行的「導航地標」。
// 只要這三個身分證字號正確，程式碼在任何 Google 帳號或環境下皆能精準定位。

const SPREADSHEET_ID = '1VY5BzFBhDyVqHNdX5bjST-8s50taoyBBzao4yuBf10M'; // 來源：記錄表單回覆的 Google 試算表
const TEMPLATE_ID = '1aZ5EIkJ0BNGgBRvGG3ijVg1N13wdMcWqNZpE1PK9p24';     // 來源：設計好 {{標籤}} 的 Google 簡報模版
const OUTPUT_FOLDER_ID = '19YoKwzaqYiQ-T3i926g2zbQeQy3Bf-jf';            // 目的地：存放最終 PDF 的 Google 雲端資料夾
// ====================================================================


/**
 * 🚀 主程式：自動化 CV 生成核心引擎
 * 觸發時機：
 * 1. 當使用者「提交表單時」自動觸發執行。
 * 2. 開發者在編輯器中手動點擊「▶ 執行」時手動執行。
 */
function runAutoCV() {
  try {
    Logger.log('【系統初始化】正在開啟試算表並讀取資料...');

    // ────────────────────────────────────────────────────────────────
    // ─── 步驟一：精準讀取「最新一筆」表單回覆資料 ───
    // ────────────────────────────────────────────────────────────────
    
    // 1. 強制透過指定的 ID 打開試算表，避免因為執行環境混亂而定位失敗
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 2. 鎖定名稱為「表單回覆 1」的工作表（頁籤）
    const sheet = ss.getSheetByName('表單回覆 1');
    
    // 【防錯機制】如果頁籤名稱不小心被改名，立即發出警報並終止程式
    if (!sheet) {
      Logger.log("❌ 找不到名為 '表單回覆 1' 的工作表，請確認試算表下方頁籤名稱是否正確！");
      return;
    }
    
    // 3. 獲取試算表中「最後一列」（也就是最新提交的那一筆資料）的列號
    const lastRow = sheet.getLastRow();
    
    // 【安全檢查】如果 lastRow 小於 2，代表表格只有第 1 列的標題列，沒有任何人填寫過資料，直接結束
    if (lastRow < 2) {
      Logger.log("❌ 目前表格中除了標頭（第 1 列）外，沒有其他測試資料可以執行！");
      return; 
    }

    // 4. 定位並抓取最新一列中，各直欄（Columns）的具體內容
    // 💡 運作原理：getRange(第幾列, 第幾欄).getValue()
    // A 欄為 1、B 欄為 2、C 欄為 3...以此類推（依據表單欄位順序絕對定位）
    
    const emailToDeliver = sheet.getRange(lastRow, 2).getValue();  // Column 2 (B): 使用者輸入的常用郵件（作為寄送信件的收件人）
    const name = sheet.getRange(lastRow, 3).getValue();            // Column 3 (C): 姓名
    const summary = sheet.getRange(lastRow, 4).getValue();         // Column 4 (D): 簡歷自傳
    const service = sheet.getRange(lastRow, 5).getValue();         // Column 5 (E): 主要服務名稱
    const serviceItems = sheet.getRange(lastRow, 6).getValue();    // Column 6 (F): 細項服務項目
    const phone = sheet.getRange(lastRow, 7).getValue();           // Column 7 (G): 電話號碼
    const contactEmail = sheet.getRange(lastRow, 8).getValue();    // Column 8 (H): 簡報上「聯絡我」要呈現的信箱
    const lineId = sheet.getRange(lastRow, 9).getValue();          // Column 9 (I): LINE ID
    const photoUrl = sheet.getRange(lastRow, 10).getValue();       // Column 10 (J): 表單上傳的照片雲端硬碟網址

    Logger.log(`👉 成功抓取最新資料！第 ${lastRow} 列：姓名=${name}, 寄信郵件=${emailToDeliver}`);


    // ────────────────────────────────────────────────────────────────
    // ─── 步驟二：複製簡報模板至指定的雲端資料夾 ───
    // ────────────────────────────────────────────────────────────────
    
    // 1. 指定目的地資料夾物件
    const outputFolder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
    
    // 2. 取得簡報範本檔案物件
    const templateFile = DriveApp.getFileById(TEMPLATE_ID);
    
    // 3. 將簡報模版複製一份到目的地資料夾，並重新命名為「姓名_個人履歷_臨時檔」
    // 💡 為什麼要叫臨時檔？因為套完標籤、轉成 PDF 後，這個簡報就會被刪除，以節省硬碟空間！
    const newFile = templateFile.makeCopy(`${name}_個人履歷_臨時檔`, outputFolder);
    Logger.log(`📂 已在雲端硬碟中複製臨時簡報：${name}_個人履歷_臨時檔`);


    // ────────────────────────────────────────────────────────────────
    // ─── 步驟三：打卡新簡報，全面替換文字標籤與照片 ───
    // ────────────────────────────────────────────────────────────────
    
    // 1. 打開剛剛複製出來的那份新簡報
    const slidesApp = SlidesApp.openById(newFile.getId());
    
    // 2. 取得簡報的第一張投影片（Slides 索引從 0 開始代表第 1 張投影片）
    const slide = slidesApp.getSlides()[0];

    // 3. 【多重相容與防呆機制】開始將簡報中的文字 {{標籤}} 替換成真實資料
    // 💡 設計巧思：即使簡報上打 {{姓名}} 或 {{名字}}，程式都準備了取代方案，降低因簡報微調導致失效的機率
    slide.replaceAllText('{{名字}}', name);
    slide.replaceAllText('{{姓名}}', name);
    slide.replaceAllText('{{簡介}}', summary);
    slide.replaceAllText('{{簡歷}}', summary);
    slide.replaceAllText('{{服務}}', service);
    slide.replaceAllText('{{服務項目}}', serviceItems);
    slide.replaceAllText('{{主要提供什麼服務}}', serviceItems);
    slide.replaceAllText('{{電話號碼}}', phone);
    slide.replaceAllText('{{電話}}', phone);
    slide.replaceAllText('{{郵件}}', contactEmail);
    slide.replaceAllText('{{聯絡郵件}}', contactEmail);
    slide.replaceAllText('{{line_ID}}', lineId);
    slide.replaceAllText('{{LINE}}', lineId);
    Logger.log(`✨ 文字標籤替換完成！`);

    // 4. 照片取代邏輯
    // 如果使用者在表單有上傳圖片（photoUrl 不為空值）
    if (photoUrl) {
      Logger.log(`🖼️ 偵測到有照片網址，正在處理照片替換...`);
      // 調用本程式最下方的 replaceImgWithShape 函數，將指定的佔位符替換成實體照片
      replaceImgWithShape(slide, '{{照片}}', photoUrl);
      replaceImgWithShape(slide, '{{個人形象照片}}', photoUrl);
    } else {
      Logger.log(`⚠️ 此筆資料沒有上傳照片，跳過照片替換。`);
    }

    // 5. 儲存並關閉簡報，強制寫入硬碟
    slidesApp.saveAndClose();


    // ────────────────────────────────────────────────────────────────
    // ─── 步驟四：轉存成 PDF 檔並進行雲端垃圾清理 ───
    // ────────────────────────────────────────────────────────────────
    
    Logger.log(`📄 正在將簡報檔案轉換為 PDF 格式（這需要花費大約 5 到 10 秒）...`);
    
    // 1. 將剛剛替換完畢的臨時簡報轉存成 PDF Blob (二進位大物件)
    const pdfBlob = newFile.getAs('application/pdf').setName(`${name}_個人履歷.pdf`);
    
    // 2. 在使用者的雲端硬碟資料夾中正式建立這份 PDF 檔案
    const finalPdfFile = outputFolder.createFile(pdfBlob);
    
    // 3. 【環保省空間機制】將臨時產生的簡報檔案移到垃圾桶中，保持雲端空間整潔，只留下最終的 PDF
    newFile.setTrashed(true);
    Logger.log(`✅ PDF 生成成功：${name}_個人履歷.pdf，且已自動刪除臨時簡報！`);


    // ────────────────────────────────────────────────────────────────
    // ─── 步驟五：自動發送 E-mail 通知並附加 PDF 檔案 ───
    // ────────────────────────────────────────────────────────────────
    
    if (emailToDeliver) {
      Logger.log(`✉️ 正在發送自動履歷信件至：${emailToDeliver}...`);
      
      // 呼叫 Google 官方郵件服務寄信
      MailApp.sendEmail({
        to: emailToDeliver, // 收件人（試算表 B 欄所留下的信箱）
        subject: `【自動發送】${name} 您的個人 CV 履歷已生成`, // 信件標題
        body: `您好 ${name}：\n\n感謝您的填寫！您的個人履歷 PDF 已經自動生成完畢，請查看此信件的附件。\n\n祝 順心！`, // 信件本文
        attachments: [finalPdfFile] // 重點：直接將剛生成的 PDF 檔案物件當作附件寄出
      });
      Logger.log(`✅ PDF 履歷信件發送成功！`);
    } else {
      Logger.log(`⚠️ 偵測到 B 欄的郵件欄位為空，跳過發信步驟。`);
    }

    Logger.log(`🎉 【大功告成】整個自動化 CV 生成流程圓滿執行成功！`);

  } catch (err) {
    // ────────────────────────────────────────────────────────────────
    // ─── 錯誤異常捕獲區 (Exception Handling) ───
    // ────────────────────────────────────────────────────────────────
    // 💡 運作原理：只要 try 區塊內任何一行程式出錯（例如雲端硬碟容量滿了、ID 填錯、網路斷線）
    // 程式不會直接死機，而是會優雅地跳到這裡，並列印出詳細引導，方便管理者除錯。
    Logger.log('❌ 執行發生重大錯誤，請檢查以下訊息：');
    Logger.log('👉 錯誤原因：' + err.toString());
    Logger.log('💡 排除建議：請檢查最上方的 SPREADSHEET_ID, TEMPLATE_ID, OUTPUT_FOLDER_ID 是否填寫正確，或是試算表工作表名稱不叫 "表單回覆 1"。');
  }
}


/**
 * 🛠️ 輔助自訂函式：replaceImgWithShape
 * * 💡 為什麼要寫這個？
 * 因為 Google 簡報如果單純插入圖片，圖片會「隨機亂飄」在投影片上，無法控制大小。
 * 此函數的精妙之處在於：它會先在簡報上尋找一個寫著「{{照片}}」的文字方塊（Shape），
 * 然後將照片插入在「跟該文字方塊完全一樣的座標與長寬高」位置，接著將文字方塊刪除。
 * 藉此達到「完美框限、比例對齊、照片不變形、不位移」的極致排版效果！
 * * @param {Slide} slide - 作用中的投影片物件
 * @param {string} placeholder - 要尋找的圖片佔位符標籤（如：'{{照片}}'）
 * @param {string} url - Google 表單收集到的圖片 URL
 */
function replaceImgWithShape(slide, placeholder, url) {
  try {
    if (!url) return;

    // 1. 【網址精純化】從 Google 表單產生的上傳圖片網址中，利用「正規表示式（Regex）」過濾出檔案 ID
    // 網址格式範例：https://drive.google.com/open?id=12345abcdef...
    const fileId = url.match(/id=([^&]+)/) ? url.match(/id=([^&]+)/)[1] : null;
    
    if (!fileId) {
      Logger.log(`⚠️ 無法從網址解析出照片 ID：${url}`);
      return;
    }
    
    // 2. 透過剛抓取到的 fileId，取得該檔案在 Drive 中的二進位 Blob 檔案資料
    const blob = DriveApp.getFileById(fileId).getBlob();
    
    // 3. 取得目前投影片中，所有的「形狀（包括文字方塊、圓角矩形等）」
    const shapes = slide.getShapes();
    
    // 4. 使用迴圈（for loop）逐個檢查簡報上的每一個形狀
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      
      // 5. 判斷這個形狀內是否有包含我們指定的標籤字串（例如 '{{個人形象照片}}'）
      if (shape.getText().asString().indexOf(placeholder) !== -1) {
        
        // 6. 【核心排版魔法】在簡報中置入這張圖片
        // 參數說明：insertImage(圖片二進位檔, X軸左邊界座標, Y軸上邊界座標, 寬度, 高度)
        // 這裡直接讀取原文字框（shape）的座標與大小，完美貼合！
        slide.insertImage(blob, shape.getLeft(), shape.getTop(), shape.getWidth(), shape.getHeight());
        
        // 7. 將原本那個寫著「{{照片}}」的暫存文字框移除，避免文字重疊，畫面才會乾淨
        shape.remove(); 
        Logger.log(`📸 成功將標籤 [${placeholder}] 替換為上傳的形象照片！`);
        break; // 已經找到並處理完畢，直接跳出迴圈，節省效能
      }
    }
  } catch(e) {
    // 局部錯誤捕獲：若照片格式不對（如非圖片檔），只會在日誌警告，不會導致整封信寄不出去
    Logger.log(`❌ 替換照片 [${placeholder}] 時發生錯誤：` + e.toString());
  }
}