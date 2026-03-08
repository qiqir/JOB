import { NextResponse } from 'next/server'

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxs9WTyBb0-yNAtcw_srfqXzooReBFPLkIqsi6Ii5YtQWEzQCgxhMdS49qoORaWojFBrg/exec'

interface FormData {
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

export async function POST(request: Request) {
  try {
    const formData: FormData = await request.json()

    if (!formData.tanggal || !formData.alamat || !formData.namaKlien || 
        !formData.noTelephone || !formData.teknisi) {
      return NextResponse.json({
        success: false,
        error: 'Mohon lengkapi semua field yang wajib diisi'
      }, { status: 400 })
    }

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

    return NextResponse.json({
      success: false,
      error: 'Google Apps Script URL belum dikonfigurasi',
      data: formData,
      copyFormat: `${formData.tanggal}\t${formData.alamat}\t${formData.namaKlien}\t${formData.noTelephone}\t${formData.jenisPekerjaan}\t${formData.teknisi}\t${formData.statusBa}\t${formData.statusPekerjaan}\t${formData.statusPembayaran}\t${formData.keterangan}`
    })

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat memproses data'
    }, { status: 500 })
  }
}
