import { NextResponse } from 'next/server'

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxACdP2xC_zdvPLjXF4v0aCdo2gPMSJWKb5x0ldJC7bKl7L6HdTF_wP1ofJyG_YfX0Q0w/exec'

interface UpdateData {
  rowIndex: number
  data: {
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
}

export async function POST(request: Request) {
  try {
    const { rowIndex, data }: UpdateData = await request.json()

    // Validasi
    if (rowIndex === undefined || rowIndex < 0) {
      return NextResponse.json({
        success: false,
        error: 'Index baris tidak valid'
      }, { status: 400 })
    }

    // Jika Google Script URL tersedia
    if (GOOGLE_SCRIPT_URL) {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update',
            rowIndex: rowIndex + 2, // +2 karena row 1 adalah header, dan index mulai dari 0
            data: data
          })
        })

        const result = await response.json()

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Data berhasil diupdate'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Gagal mengupdate data'
          }, { status: 500 })
        }
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Gagal menghubungi Google Apps Script'
        }, { status: 500 })
      }
    }

    // Jika tidak ada Google Script URL
    return NextResponse.json({
      success: false,
      error: 'Google Apps Script URL belum dikonfigurasi. Silakan gunakan fitur "Salin" dan paste manual ke Google Sheet.',
      data: data,
      rowIndex: rowIndex,
      copyFormat: `${data.tanggal}\t${data.namaSppg}\t${data.kepalaSppg}\t${data.noTelephone}\t${data.teknisi}\t${data.statusBa}\t${data.statusPekerjaan}\t${data.statusPembayaran}\t${data.keterangan}`
    })

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat memproses data'
    }, { status: 500 })
  }
}
