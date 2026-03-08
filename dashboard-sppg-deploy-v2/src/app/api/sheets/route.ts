import { NextResponse } from 'next/server'

const SHEET_ID = '1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

export interface SheetRow {
  no: string
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

function parseCSV(text: string): SheetRow[] {
  const lines = text.split('\n')
  const data: SheetRow[] = []

  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse CSV with proper quote handling
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

    if (values.length >= 10) {
      data.push({
        no: values[0] || '',
        tanggal: values[1] || '',
        namaSppg: values[2] || '',
        kepalaSppg: values[3] || '',
        noTelephone: values[4] || '',
        teknisi: values[5] || '',
        statusBa: values[6] || '',
        statusPekerjaan: values[7] || '',
        statusPembayaran: values[8] || '',
        keterangan: values[9] || '',
      })
    }
  }

  return data
}

export async function GET() {
  try {
    const response = await fetch(SHEET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`)
    }

    const text = await response.text()
    const data = parseCSV(text)

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    })
  } catch (error) {
    console.error('Error fetching Google Sheet:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data dari Google Sheet',
        data: [],
      },
      { status: 500 }
    )
  }
}
