import { NextResponse } from 'next/server'

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxACdP2xC_zdvPLjXF4v0aCdo2gPMSJWKb5x0ldJC7bKl7L6HdTF_wP1ofJyG_YfX0Q0w/exec'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, headers } = body

    if (!data || !Array.isArray(data)) {
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
            action: 'appendUser',
            data: data,
            headers: headers
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
    return NextResponse.json({
      success: false,
      error: 'Google Apps Script URL belum dikonfigurasi.',
      setupRequired: true,
      setupInstructions: [
        '1. Buka https://script.google.com',
        '2. Buat project baru',
        '3. Copy kode dari file google-apps-script.js',
        '4. Deploy sebagai Web App dengan akses "Anyone"',
        '5. Copy URL hasil deploy',
        '6. Tambahkan ke file .env.local sebagai GOOGLE_SCRIPT_URL'
      ],
      data: data,
      copyFormat: data.join('\t')
    })

  } catch (error) {
    console.error('Error processing user data:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal memproses data'
    })
  }
}
