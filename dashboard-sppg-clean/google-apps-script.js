// ============================================
// GOOGLE APPS SCRIPT CODE
// ============================================
// Copy kode ini ke Google Apps Script (script.google.com)
// Lalu deploy sebagai Web App

const SPREADSHEET_ID = '1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg';
const SHEET_SPPG_NAME = 'Sheet1';  // Ganti dengan nama sheet SPPG
const SHEET_USER_NAME = 'USER';     // Ganti dengan nama sheet USER

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Handle action: append (tambah data SPPG)
    if (data.action === 'append') {
      var sheet = ss.getSheetByName(SHEET_SPPG_NAME);
      if (!sheet) {
        sheet = ss.getActiveSheet();
      }
      
      var rowData = data.data;
      var lastRow = sheet.getLastRow();
      var nextNo = lastRow; // Auto number
      
      sheet.appendRow([
        nextNo,  // NO
        rowData.tanggal || '',
        rowData.namaSppg || '',
        rowData.kepalaSppg || '',
        rowData.noTelephone || '',
        rowData.teknisi || '',
        rowData.statusBa || '',
        rowData.statusPekerjaan || '',
        rowData.statusPembayaran || '',
        rowData.keterangan || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data SPPG berhasil ditambahkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle action: update (edit data SPPG)
    if (data.action === 'update') {
      var sheet = ss.getSheetByName(SHEET_SPPG_NAME);
      if (!sheet) {
        sheet = ss.getActiveSheet();
      }
      
      var rowIndex = data.rowIndex;
      var rowData = data.data;
      
      // Update cells (column B to J, skip column A which is NO)
      sheet.getRange(rowIndex, 2).setValue(rowData.tanggal || '');
      sheet.getRange(rowIndex, 3).setValue(rowData.namaSppg || '');
      sheet.getRange(rowIndex, 4).setValue(rowData.kepalaSppg || '');
      sheet.getRange(rowIndex, 5).setValue(rowData.noTelephone || '');
      sheet.getRange(rowIndex, 6).setValue(rowData.teknisi || '');
      sheet.getRange(rowIndex, 7).setValue(rowData.statusBa || '');
      sheet.getRange(rowIndex, 8).setValue(rowData.statusPekerjaan || '');
      sheet.getRange(rowIndex, 9).setValue(rowData.statusPembayaran || '');
      sheet.getRange(rowIndex, 10).setValue(rowData.keterangan || '');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data SPPG berhasil diupdate'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle action: appendUser (tambah data USER)
    if (data.action === 'appendUser') {
      var sheet = ss.getSheetByName(SHEET_USER_NAME);
      if (!sheet) {
        // Coba cari sheet dengan gid 761571836
        var sheets = ss.getSheets();
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() === 761571836) {
            sheet = sheets[i];
            break;
          }
        }
      }
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Sheet USER tidak ditemukan'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var dataArray = data.data || [];
      sheet.appendRow(dataArray);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data USER berhasil ditambahkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle action: updateUser (edit data USER)
    if (data.action === 'updateUser') {
      var sheet = ss.getSheetByName(SHEET_USER_NAME);
      if (!sheet) {
        var sheets = ss.getSheets();
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() === 761571836) {
            sheet = sheets[i];
            break;
          }
        }
      }
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Sheet USER tidak ditemukan'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var rowIndex = data.rowIndex;
      var dataArray = data.data || [];
      
      // Update row (rowIndex adalah index baris, 1-based)
      for (var col = 0; col < dataArray.length; col++) {
        sheet.getRange(rowIndex, col + 1).setValue(dataArray[col]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data USER berhasil diupdate'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Action tidak dikenali: ' + data.action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    message: 'Google Apps Script untuk Dashboard SPPG aktif',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// CARA DEPLOY:
// ============================================
// 1. Buka https://script.google.com
// 2. Klik "New Project"
// 3. Copy semua kode di atas ke editor
// 4. Klik "Save" (Ctrl+S)
// 5. Klik "Deploy" > "New deployment"
// 6. Pilih type: "Web app"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone"
// 9. Klik "Deploy"
// 10. Copy URL yang muncul (contoh: https://script.google.com/macros/s/AKfycb.../exec)
// 11. Buka file .env.local di project
// 12. Tambahkan URL tersebut ke GOOGLE_SCRIPT_URL=...
//    Contoh: GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
