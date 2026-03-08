import { NextResponse } from 'next/server'

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxACdP2xC_zdvPLjXF4v0aCdo2gPMSJWKb5x0ldJC7bKl7L6HdTF_wP1ofJyG_YfX0Q0w/exec'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, data } = body

    if (rowIndex === undefined || !data || !Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Data tidak valid'
      })
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
            action: 'updateUser',
            rowIndex: rowIndex + 2, // +2 karena header di baris 1, dan index dimulai dari 0
            data: data
          })
        })

        const result = await response.json()

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Data berhasil diupdate di Google Sheets'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Gagal mengupdate di Google Sheets'
          })
        }
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Gagal menghubungi Google Apps Script'
        })
      }
    }

    // Jika tidak ada Google Script URL, berikan instruksi setup
    const rowText = data.join('\t')
    return NextResponse.json({
      success: false,
      error: 'Google Apps Script URL belum dikonfigurasi.',
      setupRequired: true,
      rowText: rowText,
      rowIndex: rowIndex
    })

  } catch (error) {
    console.error('Error processing user data update:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal memproses data'
    })
  }
}
