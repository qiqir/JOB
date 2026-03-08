import { NextResponse } from 'next/server'

// Google Apps Script Web App URL - anda perlu mendeploy Google Apps Script sebagai Web App
// dan mengganti URL ini dengan URL dari Web App anda
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxACdP2xC_zdvPLjXF4v0aCdo2gPMSJWKb5x0ldJC7bKl7L6HdTF_wP1ofJyG_YfX0Q0w/exec'

interface FormData {
  tanggal: string
  namaSppg: string
  kepalaSppg: string
  noTelephone: string
  teknisi: string
  statusBa: string
  statusPekerjaan: string
  statusPembayaran: string
  keterangan: string
}

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json()

    // Validasi data
    if (!formData.tanggal || !formData.namaSppg || !formData.kepalaSppg || 
        !formData.noTelephone || !formData.teknisi) {
      return NextResponse.json({
        success: false,
        error: 'Mohon lengkapi semua field yang wajib diisi'
      }, { status: 400 })
    }

    // Jika Google Script URL tersedia, kirim ke Google Apps Script
    if (GOOGLE_SCRIPT_URL) {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'append',
            data: formData
          })
        })

        const result = await response.json()

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Data berhasil disimpan ke Google Sheets'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Gagal menyimpan ke Google Sheets'
          }, { status: 500 })
        }
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Gagal menghubungi Google Apps Script'
        }, { status: 500 })
      }
    }

    // Jika tidak ada Google Script URL, kembalikan data untuk dicopy manual
    return NextResponse.json({
      success: false,
      error: 'Google Apps Script URL belum dikonfigurasi. Silakan gunakan fitur "Salin ke Clipboard" dan paste manual ke Google Sheet.',
      data: formData,
      copyFormat: `${formData.tanggal}\t${formData.namaSppg}\t${formData.kepalaSppg}\t${formData.noTelephone}\t${formData.teknisi}\t${formData.statusBa}\t${formData.statusPekerjaan}\t${formData.statusPembayaran}\t${formData.keterangan}`
    })

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat memproses data'
    }, { status: 500 })
  }
}

// GET endpoint untuk menampilkan instruksi setup
export async function GET() {
  return NextResponse.json({
    message: 'API untuk submit dan update data ke Google Sheets',
    setup: {
      step1: 'Buka Google Apps Script (script.google.com)',
      step2: 'Buat project baru',
      step3: 'Copy kode berikut ke editor:',
      code: `
// Google Apps Script Code
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg').getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'append') {
      var rowData = data.data;
      sheet.appendRow([
        '', // NO (auto)
        rowData.tanggal,
        rowData.namaSppg,
        rowData.kepalaSppg,
        rowData.noTelephone,
        rowData.teknisi,
        rowData.statusBa,
        rowData.statusPekerjaan,
        rowData.statusPembayaran,
        rowData.keterangan
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data berhasil ditambahkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'update') {
      var rowIndex = data.rowIndex; // row number (1-based, including header)
      var rowData = data.data;
      
      // Update cells in the row
      sheet.getRange(rowIndex, 2).setValue(rowData.tanggal);
      sheet.getRange(rowIndex, 3).setValue(rowData.namaSppg);
      sheet.getRange(rowIndex, 4).setValue(rowData.kepalaSppg);
      sheet.getRange(rowIndex, 5).setValue(rowData.noTelephone);
      sheet.getRange(rowIndex, 6).setValue(rowData.teknisi);
      sheet.getRange(rowIndex, 7).setValue(rowData.statusBa);
      sheet.getRange(rowIndex, 8).setValue(rowData.statusPekerjaan);
      sheet.getRange(rowIndex, 9).setValue(rowData.statusPembayaran);
      sheet.getRange(rowIndex, 10).setValue(rowData.keterangan);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data berhasil diupdate'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Action tidak dikenali'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    message: 'Google Apps Script is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
      `,
      step4: 'Deploy sebagai Web App (Deploy > New deployment > Web app)',
      step5: 'Set "Who has access" ke "Anyone"',
      step6: 'Copy Web App URL dan tambahkan ke environment variable GOOGLE_SCRIPT_URL'
    }
  })
}
