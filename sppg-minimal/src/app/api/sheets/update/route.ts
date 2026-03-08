import { NextResponse } from 'next/server'

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxs9WTyBb0-yNAtcw_srfqXzooReBFPLkIqsi6Ii5YtQWEzQCgxhMdS49qoORaWojFBrg/exec'

interface UpdateData {
  rowIndex: number
  data: {
    tanggal: string
    alamat: string
    namaKlien: string
    noTelephone: string
    jenisPekerjaan: string
    teknisi: string
    statusBa: string
    statusPekerjaan: string
    statusPembayaran: string
    keterangan: string
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, data }: UpdateData = body
    
    console.log('=== UPDATE REQUEST DEBUG ===')
    console.log('rowIndex:', rowIndex)
    console.log('data:', data)

    if (rowIndex === undefined || rowIndex < 0) {
    return NextResponse.json({
      success: false,
      error: 'Index baris tidak valid'
      }, { status: 400 })
    }

    if (GOOGLE_SCRIPT_URL) {
    try {
      const payload = {
        action: 'update',
        rowIndex: rowIndex + 2,
        data: data
      }
      console.log('Sending to Google Script:', payload)
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      })

      const responseText = await response.text()
      console.log('Google Script raw response:', responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
      } catch {
        const encodedPayload = encodeURIComponent(JSON.stringify(payload))
        const getUrl = `${GOOGLE_SCRIPT_URL}?action=update&payload=${encodedPayload}`
        
        const getResponse = await fetch(getUrl, { redirect: 'follow' })
        const getText = await getResponse.text()
        
        try {
          result = JSON.parse(getText)
        } catch {
          return NextResponse.json({
            success: false,
            error: 'Gagal memproses response dari Google Script'
          }, { status: 500 })
        }
      }
      
      console.log('Result:', result)

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
    } catch (err) {
      console.error('Error calling Google Script:', err)
      return NextResponse.json({
        success: false,
        error: 'Gagal menghubungi Google Apps Script: ' + (err instanceof Error ? err.message : String(err))
      }, { status: 500 })
    }
  }

  return NextResponse.json({
    success: false,
    error: 'Google Apps Script URL belum dikonfigurasi',
    copyFormat: `${data.tanggal}\t${data.alamat}\t${data.namaKlien}\t${data.noTelephone}\t${data.jenisPekerjaan}\t${data.teknisi}\t${data.statusBa}\t${data.statusPekerjaan}\t${data.statusPembayaran}\t${data.keterangan}`
  })

  } catch (err) {
    console.error('Update error:', err)
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat memproses data'
    }, { status: 500 })
  }
}
