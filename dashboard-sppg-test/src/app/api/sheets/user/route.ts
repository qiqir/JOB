import { NextResponse } from 'next/server'

const SHEET_ID = '1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg'

// GID untuk SHEET_USER - diperlukan untuk mengakses sheet tertentu
// GID ini didapat dari URL Google Sheet saat tab SHEET_USER dipilih
// URL format: https://docs.google.com/spreadsheets/d/.../edit#gid=761571836
const SHEET_USER_GID = process.env.SHEET_USER_GID || '761571836'

function parseCSV(text: string): string[][] {
  const lines = text.split('\n')
  const data: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values: string[] = []
    let currentValue = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          currentValue += '"'
          j++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim())
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())
    data.push(values)
  }

  return data
}

export async function GET() {
  // Cek apakah GID sudah dikonfigurasi
  if (!SHEET_USER_GID) {
    return NextResponse.json({
      success: false,
      error: 'GID untuk SHEET_USER belum dikonfigurasi. Silakan set environment variable SHEET_USER_GID.',
      hint: 'Buka Google Sheet, klik tab SHEET_USER, copy GID dari URL (contoh: #gid=123456789), lalu set SHEET_USER_GID=123456789',
      data: [],
      headers: [],
    })
  }

  try {
    // Fetch dari SHEET_USER menggunakan GID
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_USER_GID}`
    
    const response = await fetch(SHEET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`)
    }

    const text = await response.text()
    const parsedData = parseCSV(text)
    
    // Ambil header dari baris pertama
    const headers = parsedData[0] || []
    
    // Ambil data (skip header)
    const data = parsedData.slice(1).map((values, index) => {
      const row: Record<string, string> = {}
      headers.forEach((header, i) => {
        const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        row[key] = values[i] || ''
      })
      row._index = index.toString()
      return row
    }).filter(row => {
      // Filter baris kosong
      return Object.values(row).some(val => val && val !== '')
    })

    return NextResponse.json({
      success: true,
      data,
      headers,
      total: data.length,
      gid: SHEET_USER_GID,
    })
  } catch (error) {
    console.error('Error fetching SHEET_USER:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data dari SHEET_USER. Pastikan GID sudah benar.',
        hint: 'Pastikan SHEET_USER_GID sesuai dengan GID di URL Google Sheet',
        data: [],
        headers: [],
      },
      { status: 500 }
    )
  }
}
