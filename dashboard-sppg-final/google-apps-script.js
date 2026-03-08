// ============================================
// GOOGLE APPS SCRIPT - DASHBOARD SPPG v8.0
// ============================================
// Kolom: NO, TANGGAL, ALAMAT, NAMA KLIEN, NO TELEPHONE, JENIS PEKERJAAN, TEKNISI, STATUS BA, STATUS PEKERJAAN, STATUS PEMBAYARAN, KETERANGAN
// Copy kode ini ke Google Apps Script (script.google.com)
// Lalu deploy sebagai Web App

var SPREADSHEET_ID = '1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg';
var SHEET_SPPG_NAME = 'Sheet1';
var SHEET_USER_NAME = 'USER';

function doGet(e) {
  try {
    var action = e.parameter.action;
    var payloadStr = e.parameter.payload;
    
    if (!action) {
      return json({
        status: 'OK',
        message: 'Dashboard SPPG Script Aktif',
        version: '8.0',
        columns: ['NO', 'TANGGAL', 'ALAMAT', 'NAMA KLIEN', 'NO TELEPHONE', 'JENIS PEKERJAAN', 'TEKNISI', 'STATUS BA', 'STATUS PEKERJAAN', 'STATUS PEMBAYARAN', 'KETERANGAN'],
        timestamp: new Date().toISOString()
      });
    }
    
    var data = payloadStr ? JSON.parse(payloadStr) : {};
    
    if (action === 'update') return handleUpdate(data);
    if (action === 'append') return handleAppend(data);
    
    return json({ success: false, error: 'Unknown action: ' + action });
    
  } catch (error) {
    return json({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    var data;
    
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      return json({ success: false, error: 'No data received' });
    }
    
    var action = data.action;
    
    if (action === 'append') return handleAppend(data);
    if (action === 'update') return handleUpdate(data);
    if (action === 'appendUser') return handleAppendUser(data);
    if (action === 'updateUser') return handleUpdateUser(data);
    if (action === 'uploadPhoto') return handleUploadPhoto(data);
    
    return json({ success: false, error: 'Unknown action: ' + action });
    
  } catch (error) {
    return json({ success: false, error: error.toString() });
  }
}

function handleAppend(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SPPG_NAME) || ss.getActiveSheet();
  var rd = data.data || data;
  
  // Kolom: NO, TANGGAL, ALAMAT, NAMA KLIEN, NO TELEPHONE, JENIS PEKERJAAN, TEKNISI, STATUS BA, STATUS PEKERJAAN, STATUS PEMBAYARAN, KETERANGAN
  sheet.appendRow([
    sheet.getLastRow(),
    rd.tanggal || '',
    rd.alamat || '',
    rd.namaKlien || '',
    rd.noTelephone || '',
    rd.jenisPekerjaan || '',
    rd.teknisi || '',
    rd.statusBa || '',
    rd.statusPekerjaan || '',
    rd.statusPembayaran || '',
    rd.keterangan || ''
  ]);
  
  return json({ success: true, message: 'Data berhasil ditambahkan' });
}

function handleUpdate(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SPPG_NAME) || ss.getActiveSheet();
  
  var rd = data.data || {};
  var rowIdx = parseInt(data.rowIndex);
  
  if (!rowIdx || rowIdx < 2) {
    return json({ success: false, error: 'Invalid row index: ' + rowIdx });
  }
  
  // 10 columns from B to K (TANGGAL, ALAMAT, NAMA KLIEN, NO TELEPHONE, JENIS PEKERJAAN, TEKNISI, STATUS BA, STATUS PEKERJAAN, STATUS PEMBAYARAN, KETERANGAN)
  var rowData = [
    rd.tanggal || '',
    rd.alamat || '',
    rd.namaKlien || '',
    rd.noTelephone || '',
    rd.jenisPekerjaan || '',
    rd.teknisi || '',
    rd.statusBa || '',
    rd.statusPekerjaan || '',
    rd.statusPembayaran || '',
    rd.keterangan || ''
  ];
  
  sheet.getRange(rowIdx, 2, 1, 10).setValues([rowData]);
  
  return json({ success: true, message: 'Data berhasil diupdate', rowIndex: rowIdx, dataWritten: rowData });
}

function handleAppendUser(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = findUserSheet(ss);
  if (!sheet) return json({ success: false, error: 'Sheet USER tidak ditemukan' });
  sheet.appendRow(data.data || []);
  return json({ success: true, message: 'Data USER berhasil ditambahkan' });
}

function handleUpdateUser(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = findUserSheet(ss);
  if (!sheet) return json({ success: false, error: 'Sheet USER tidak ditemukan' });
  var arr = data.data || [];
  for (var c = 0; c < arr.length; c++) {
    sheet.getRange(data.rowIndex, c + 1).setValue(arr[c]);
  }
  return json({ success: true, message: 'Data USER berhasil diupdate' });
}

function handleUploadPhoto(data) {
  var folderId = data.folderId || '1_iyCrgekFmflt1h2wkXHCYrOGgvjHJBu';
  var fileName = data.fileName || 'MBG_photo.jpg';
  var mimeType = data.mimeType || 'image/jpeg';
  var base64Data = data.fileData;
  var userIndex = data.userIndex;
  
  var decoded = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decoded, mimeType, fileName);
  
  var folder;
  try { folder = DriveApp.getFolderById(folderId); } catch (err) { folder = DriveApp.getRootFolder(); }
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  var photoUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
  
  if (userIndex && userIndex > 0) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var photoSheet = findUserSheet(ss);
    if (photoSheet) {
      var lastCol = photoSheet.getLastColumn();
      var headers = lastCol > 0 ? photoSheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
      var photoCol = -1;
      for (var h = 0; h < headers.length; h++) {
        var hl = headers[h].toString().toLowerCase();
        if (hl.indexOf('photo') >= 0 || hl.indexOf('foto') >= 0) { photoCol = h + 1; break; }
      }
      if (photoCol === -1) { photoCol = headers.length + 1; photoSheet.getRange(1, photoCol).setValue('PHOTO'); }
      photoSheet.getRange(parseInt(userIndex) + 1, photoCol).setValue(photoUrl);
    }
  }
  
  return json({ success: true, photoUrl: photoUrl, fileId: fileId });
}

function findUserSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_USER_NAME);
  if (sheet) return sheet;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === 761571836) return sheets[i];
  }
  return null;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
