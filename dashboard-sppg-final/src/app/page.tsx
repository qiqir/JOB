'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  TrendingUp,
  BarChart3,
  ExternalLink,
  PlusCircle,
  LayoutDashboard,
  ClipboardCopy,
  Check,
  Send,
  AlertCircle,
  Calendar,
  Pencil,
  MessageCircle
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SheetRow {
  no: string
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
  rowIndex?: number
}

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

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']

const getStatusColor = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('selesai') || s.includes('sudah') || s.includes('lunas') || s.includes('ok')) {
    return 'bg-green-500/10 text-green-600 border-green-200'
  }
  if (s.includes('belum') || s.includes('pending') || s.includes('proses') || s.includes('progress')) {
    return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
  }
  if (s.includes('batal') || s.includes('gagal') || s.includes('tolak')) {
    return 'bg-red-500/10 text-red-600 border-red-200'
  }
  return 'bg-gray-500/10 text-gray-600 border-gray-200'
}

const STATUS_BA_OPTIONS = ['Sudah', 'Belum', 'Proses']
const STATUS_PEKERJAAN_OPTIONS = ['Selesai', 'Belum Selesai', 'Dalam Proses', 'Pending']
const STATUS_PEMBAYARAN_OPTIONS = ['Lunas', 'Belum Lunas', 'Proses', 'Pending']

// Helper function untuk format nomor WhatsApp
const formatWhatsAppNumber = (phone: string): string => {
  if (!phone) return ''
  // Hapus karakter non-digit
  let cleaned = phone.replace(/\D/g, '')
  
  // Jika dimulai dengan 08, ganti dengan 628
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1)
  }
  // Jika dimulai dengan +62 atau 62, biarkan
  else if (cleaned.startsWith('62')) {
    // sudah benar
  }
  // Jika tidak ada prefix, tambahkan 62
  else if (cleaned.length > 0) {
    cleaned = '62' + cleaned
  }
  
  return cleaned
}

// Helper function untuk mendapatkan WhatsApp link
const getWhatsAppLink = (phone: string): string => {
  const formatted = formatWhatsAppNumber(phone)
  return `https://wa.me/${formatted}`
}

export default function Dashboard() {
  const [data, setData] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatusBa, setFilterStatusBa] = useState<string>('all')
  const [filterStatusPekerjaan, setFilterStatusPekerjaan] = useState<string>('all')
  const [filterStatusPembayaran, setFilterStatusPembayaran] = useState<string>('all')
  const [filterTanggalDari, setFilterTanggalDari] = useState<string>('')
  const [filterTanggalKe, setFilterTanggalKe] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<FormData>({
    tanggal: new Date().toISOString().split('T')[0],
    alamat: '',
    namaKlien: '',
    noTelephone: '',
    teknisi: '',
    statusBa: '',
    statusPekerjaan: '',
    statusPembayaran: '',
    keterangan: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Add Dialog state for SPPG
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null)
  const [editFormData, setEditFormData] = useState<FormData>({
    tanggal: '',
    alamat: '',
    namaKlien: '',
    noTelephone: '',
    teknisi: '',
    statusBa: '',
    statusPekerjaan: '',
    statusPembayaran: '',
    keterangan: ''
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // User state
  const [userData, setUserData] = useState<Record<string, string>[]>([])
  const [userHeaders, setUserHeaders] = useState<string[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState<string | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // User Add Dialog state
  const [userAddDialogOpen, setUserAddDialogOpen] = useState(false)
  const [userAddFormData, setUserAddFormData] = useState<Record<string, string>>({})
  const [userAddSubmitting, setUserAddSubmitting] = useState(false)
  const [userAddSuccess, setUserAddSuccess] = useState(false)
  const [userAddError, setUserAddError] = useState<string | null>(null)

  // User Edit Dialog state
  const [userEditDialogOpen, setUserEditDialogOpen] = useState(false)
  const [userEditRowIndex, setUserEditRowIndex] = useState<number>(0)
  const [userEditFormData, setUserEditFormData] = useState<Record<string, string>>({})
  const [userEditSubmitting, setUserEditSubmitting] = useState(false)
  const [userEditSuccess, setUserEditSuccess] = useState(false)
  const [userEditError, setUserEditError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/sheets')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Gagal mengambil data')
      }
    } catch {
      setError('Gagal mengambil data dari server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch USER data
  const fetchUserData = async () => {
    setUserLoading(true)
    setUserError(null)
    try {
      const response = await fetch('/api/sheets/user')
      const result = await response.json()
      if (result.success) {
        setUserData(result.data)
        setUserHeaders(result.headers)
      } else {
        setUserError(result.error || 'Gagal mengambil data USER')
      }
    } catch {
      setUserError('Gagal mengambil data USER dari server')
    } finally {
      setUserLoading(false)
    }
  }

  // Fetch user data when user tab is selected
  useEffect(() => {
    if (activeTab === 'user' && userData.length === 0) {
      fetchUserData()
    }
  }, [activeTab, userData.length])

  // Get unique values for filters
  const uniqueStatusBa = useMemo(() => {
    const values = new Set(data.map(row => row.statusBa).filter(Boolean))
    return Array.from(values)
  }, [data])

  const uniqueStatusPekerjaan = useMemo(() => {
    const values = new Set(data.map(row => row.statusPekerjaan).filter(Boolean))
    return Array.from(values)
  }, [data])

  const uniqueStatusPembayaran = useMemo(() => {
    const values = new Set(data.map(row => row.statusPembayaran).filter(Boolean))
    return Array.from(values)
  }, [data])

  // Helper function to parse date from various formats
  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0
    const parts = dateStr.split(/[\/\-\s]/)
    if (parts.length === 3) {
      if (parts[0].length <= 2 && parts[2].length === 4) {
        const day = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const year = parseInt(parts[2])
        return new Date(year, month, day).getTime()
      }
      if (parts[0].length === 4) {
        return new Date(dateStr).getTime()
      }
    }
    return new Date(dateStr).getTime() || 0
  }

  // Filter and sort data - urutkan berdasarkan nomor
  const filteredData = useMemo(() => {
    const filtered = data.filter(row => {
      const matchesSearch = 
        row.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.namaKlien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.teknisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.noTelephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.keterangan.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatusBa = filterStatusBa === 'all' || row.statusBa === filterStatusBa
      const matchesStatusPekerjaan = filterStatusPekerjaan === 'all' || row.statusPekerjaan === filterStatusPekerjaan
      const matchesStatusPembayaran = filterStatusPembayaran === 'all' || row.statusPembayaran === filterStatusPembayaran

      let matchesTanggal = true
      const rowDate = parseDate(row.tanggal)
      if (filterTanggalDari) {
        const dariDate = new Date(filterTanggalDari).getTime()
        matchesTanggal = matchesTanggal && rowDate >= dariDate
      }
      if (filterTanggalKe) {
        const keDate = new Date(filterTanggalKe).setHours(23, 59, 59, 999)
        matchesTanggal = matchesTanggal && rowDate <= keDate
      }

      return matchesSearch && matchesStatusBa && matchesStatusPekerjaan && matchesStatusPembayaran && matchesTanggal
    })

    return filtered.sort((a, b) => {
      const numA = parseInt(a.no) || 0
      const numB = parseInt(b.no) || 0
      return numA - numB
    })
  }, [data, searchTerm, filterStatusBa, filterStatusPekerjaan, filterStatusPembayaran, filterTanggalDari, filterTanggalKe])

  // Statistics
  const stats = useMemo(() => {
    const total = data.length
    const statusBaStats = new Map<string, number>()
    const statusPekerjaanStats = new Map<string, number>()
    const statusPembayaranStats = new Map<string, number>()
    const teknisiStats = new Map<string, number>()

    data.forEach(row => {
      if (row.statusBa) {
        statusBaStats.set(row.statusBa, (statusBaStats.get(row.statusBa) || 0) + 1)
      }
      if (row.statusPekerjaan) {
        statusPekerjaanStats.set(row.statusPekerjaan, (statusPekerjaanStats.get(row.statusPekerjaan) || 0) + 1)
      }
      if (row.statusPembayaran) {
        statusPembayaranStats.set(row.statusPembayaran, (statusPembayaranStats.get(row.statusPembayaran) || 0) + 1)
      }
      if (row.teknisi) {
        teknisiStats.set(row.teknisi, (teknisiStats.get(row.teknisi) || 0) + 1)
      }
    })

    const selesai = Array.from(statusPekerjaanStats.entries())
      .filter(([key]) => key.toLowerCase().includes('selesai'))
      .reduce((sum, [, val]) => sum + val, 0)
    
    const lunas = Array.from(statusPembayaranStats.entries())
      .filter(([key]) => key.toLowerCase().includes('lunas') || key.toLowerCase().includes('sudah'))
      .reduce((sum, [, val]) => sum + val, 0)

    return {
      total,
      statusBaStats: Array.from(statusBaStats.entries()).map(([name, value]) => ({ name, value })),
      statusPekerjaanStats: Array.from(statusPekerjaanStats.entries()).map(([name, value]) => ({ name, value })),
      statusPembayaranStats: Array.from(statusPembayaranStats.entries()).map(([name, value]) => ({ name, value })),
      teknisiStats: Array.from(teknisiStats.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6),
      selesai,
      lunas,
    }
  }, [data])

  // Form handlers
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      alamat: '',
      namaKlien: '',
      noTelephone: '',
      teknisi: '',
      statusBa: '',
      statusPekerjaan: '',
      statusPembayaran: '',
      keterangan: ''
    })
    setSubmitSuccess(false)
    setSubmitError(null)
  }

  const generateRowText = () => {
    return `${formData.tanggal}\t${formData.alamat}\t${formData.namaKlien}\t${formData.noTelephone}\t${formData.teknisi}\t${formData.statusBa}\t${formData.statusPekerjaan}\t${formData.statusPembayaran}\t${formData.keterangan}`
  }

  const copyToClipboard = async () => {
    const rowText = generateRowText()
    await navigator.clipboard.writeText(rowText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const response = await fetch('/api/sheets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()

      if (result.success) {
        setSubmitSuccess(true)
        fetchData()
        setTimeout(() => {
          setSubmitSuccess(false)
          setAddDialogOpen(false)
          resetForm()
        }, 2000)
      } else {
        setSubmitError(result.error || 'Gagal menyimpan data')
      }
    } catch {
      setSubmitError('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  // Edit functions
  const openEditDialog = (row: SheetRow, index: number) => {
    setEditingRow({ ...row, rowIndex: index })
    setEditFormData({
      tanggal: row.tanggal,
      alamat: row.alamat,
      namaKlien: row.namaKlien,
      noTelephone: row.noTelephone,
      teknisi: row.teknisi,
      statusBa: row.statusBa,
      statusPekerjaan: row.statusPekerjaan,
      statusPembayaran: row.statusPembayaran,
      keterangan: row.keterangan
    })
    setEditError(null)
    setEditSuccess(false)
    setEditDialogOpen(true)
  }

  const handleEditInputChange = (field: keyof FormData, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditSave = async () => {
    if (!editingRow) return
    
    setEditSubmitting(true)
    setEditError(null)

    try {
      const response = await fetch('/api/sheets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: editingRow.rowIndex,
          data: editFormData
        })
      })
      const result = await response.json()

      if (result.success) {
        setEditSuccess(true)
        setTimeout(() => {
          setEditDialogOpen(false)
          fetchData()
        }, 1500)
      } else {
        setEditError(result.error || 'Gagal mengupdate data')
      }
    } catch {
      setEditError('Gagal menghubungi server')
    } finally {
      setEditSubmitting(false)
    }
  }

  const copyEditToClipboard = async () => {
    const rowText = `${editFormData.tanggal}\t${editFormData.alamat}\t${editFormData.namaKlien}\t${editFormData.noTelephone}\t${editFormData.teknisi}\t${editFormData.statusBa}\t${editFormData.statusPekerjaan}\t${editFormData.statusPembayaran}\t${editFormData.keterangan}`
    await navigator.clipboard.writeText(rowText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // User Add functions
  const openUserAddDialog = () => {
    const initialData: Record<string, string> = {}
    userHeaders.forEach(header => {
      initialData[header] = ''
    })
    setUserAddFormData(initialData)
    setUserAddError(null)
    setUserAddSuccess(false)
    setUserAddDialogOpen(true)
  }

  const handleUserAddInputChange = (header: string, value: string) => {
    setUserAddFormData(prev => ({ ...prev, [header]: value }))
  }

  const handleUserAddSubmit = async () => {
    setUserAddSubmitting(true)
    setUserAddError(null)

    try {
      const dataArray = userHeaders.map(header => userAddFormData[header] || '')
      
      const response = await fetch('/api/sheets/user/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: dataArray,
          headers: userHeaders
        })
      })
      const result = await response.json()

      if (result.success) {
        setUserAddSuccess(true)
        fetchUserData()
        setTimeout(() => {
          setUserAddDialogOpen(false)
          setUserAddSuccess(false)
        }, 2000)
      } else {
        setUserAddError(result.error || 'Gagal menyimpan data. Pastikan Google Script URL belum dikonfigurasi.')
      }
    } catch {
      setUserAddError('Gagal menghubungi server')
    } finally {
      setUserAddSubmitting(false)
    }
  }

  // User Edit functions
  const openUserEditDialog = (row: Record<string, string>, index: number) => {
    setUserEditRowIndex(index)
    const editData: Record<string, string> = {}
    userHeaders.forEach(header => {
      const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      editData[header] = row[key] || ''
    })
    setUserEditFormData(editData)
    setUserEditError(null)
    setUserEditSuccess(false)
    setUserEditDialogOpen(true)
  }

  const handleUserEditInputChange = (header: string, value: string) => {
    setUserEditFormData(prev => ({ ...prev, [header]: value }))
  }

  const handleUserEditSubmit = async () => {
    setUserEditSubmitting(true)
    setUserEditError(null)

    try {
      const dataArray = userHeaders.map(header => userEditFormData[header] || '')
      const response = await fetch('/api/sheets/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: userEditRowIndex, data: dataArray })
      })
      const result = await response.json()

      if (result.success) {
        setUserEditSuccess(true)
        fetchUserData()
        setTimeout(() => {
          setUserEditDialogOpen(false)
          setUserEditSuccess(false)
        }, 2000)
      } else {
        setUserEditError(result.error || 'Gagal menyimpan data')
      }
    } catch {
      setUserEditError('Gagal menghubungi server')
    } finally {
      setUserEditSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard SPPG</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Monitoring Data SPPG</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1Ntfc9QLJs6Al2nEHtydMiVurGTpwJLILUFjOQ1QyGXg/edit', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Sheet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="user" className="gap-2">
              <Users className="w-4 h-4" />
              User
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Data Table - Paling Atas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data SPPG</CardTitle>
                    <CardDescription>
                      Menampilkan {filteredData.length} dari {data.length} data
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Tambah Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Cari nama, teknisi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatusBa} onValueChange={setFilterStatusBa}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status BA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status BA</SelectItem>
                        {uniqueStatusBa.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatusPekerjaan} onValueChange={setFilterStatusPekerjaan}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status Pekerjaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status Pekerjaan</SelectItem>
                        {uniqueStatusPekerjaan.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatusPembayaran} onValueChange={setFilterStatusPembayaran}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status Pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status Pembayaran</SelectItem>
                        {uniqueStatusPembayaran.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Dari Tanggal
                      </Label>
                      <Input
                        type="date"
                        value={filterTanggalDari}
                        onChange={(e) => setFilterTanggalDari(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ke Tanggal
                      </Label>
                      <Input
                        type="date"
                        value={filterTanggalKe}
                        onChange={(e) => setFilterTanggalKe(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterTanggalDari('')
                        setFilterTanggalKe('')
                      }}
                      className="w-full md:w-auto"
                    >
                      Reset Tanggal
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <XCircle className="w-12 h-12 mb-4 text-slate-300" />
                    <p>Tidak ada data yang ditemukan</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                          <TableRow>
                            <TableHead className="w-12 text-center">No</TableHead>
                            <TableHead className="min-w-[100px]">Tanggal</TableHead>
                            <TableHead className="min-w-[150px]">Alamat</TableHead>
                            <TableHead className="min-w-[130px]">Nama Klien</TableHead>
                            <TableHead className="min-w-[120px]">No. Telepon</TableHead>
                            <TableHead className="min-w-[100px]">Teknisi</TableHead>
                            <TableHead className="min-w-[90px]">Status BA</TableHead>
                            <TableHead className="min-w-[120px]">Status Pekerjaan</TableHead>
                            <TableHead className="min-w-[120px]">Status Pembayaran</TableHead>
                            <TableHead className="min-w-[150px]">Keterangan</TableHead>
                            <TableHead className="w-16 text-center sticky right-0 bg-white dark:bg-slate-900">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.map((row, index) => {
                            const originalIndex = data.findIndex(d => 
                              d.no === row.no && 
                              d.tanggal === row.tanggal && 
                              d.alamat === row.alamat
                            )
                            return (
                              <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium text-center">{row.no || index + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">{row.tanggal}</TableCell>
                                <TableCell className="font-medium whitespace-nowrap">{row.alamat}</TableCell>
                                <TableCell className="whitespace-nowrap">{row.namaKlien}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={`tel:${row.noTelephone}`} 
                                      className="text-blue-600 hover:underline"
                                    >
                                      {row.noTelephone}
                                    </a>
                                    {row.noTelephone && (
                                      <a
                                        href={getWhatsAppLink(row.noTelephone)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-700"
                                        title="Hubungi via WhatsApp"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">{row.teknisi}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(row.statusBa)}>
                                    {row.statusBa || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(row.statusPekerjaan)}>
                                    {row.statusPekerjaan || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusColor(row.statusPembayaran)}>
                                    {row.statusPembayaran || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <span className="line-clamp-2" title={row.keterangan}>
                                    {row.keterangan || '-'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center sticky right-0 bg-white dark:bg-slate-900">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(row, originalIndex)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardDescription className="text-blue-100">Total Data</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Semua SPPG</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardDescription className="text-emerald-100">Pekerjaan Selesai</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.selesai}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-emerald-100 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{stats.total > 0 ? ((stats.selesai / stats.total) * 100).toFixed(1) : 0}% selesai</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
                <CardHeader className="pb-2">
                  <CardDescription className="text-violet-100">Pembayaran Lunas</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.lunas}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-violet-100 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stats.total > 0 ? ((stats.lunas / stats.total) * 100).toFixed(1) : 0}% lunas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                <CardHeader className="pb-2">
                  <CardDescription className="text-amber-100">Dalam Proses</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stats.total - stats.selesai}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-amber-100 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Sedang berjalan</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Status Pekerjaan
                  </CardTitle>
                  <CardDescription>Distribusi status pekerjaan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.statusPekerjaanStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Status Pembayaran
                  </CardTitle>
                  <CardDescription>Distribusi status pembayaran</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.statusPembayaranStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {stats.statusPembayaranStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teknisi Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performa Teknisi</CardTitle>
                <CardDescription>Jumlah pekerjaan per teknisi (Top 6)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.teknisiStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Tab */}
          <TabsContent value="user" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Data SHEET_USER
                    </CardTitle>
                    <CardDescription>
                      Data dari Google Sheet - SHEET_USER
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openUserAddDialog}
                      className="gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Tambah Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchUserData}
                      disabled={userLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${userLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Cari data USER..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {userError && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Konfigurasi Diperlukan</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{userError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading */}
                {userLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : !userError && userData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Users className="w-12 h-12 mb-4 text-slate-300" />
                    <p>Tidak ada data ditemukan</p>
                  </div>
                ) : !userError && userData.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                          <TableRow>
                            <TableHead className="w-12 text-center">No</TableHead>
                            {userHeaders.map((header, idx) => (
                              <TableHead key={idx} className="min-w-[120px]">{header}</TableHead>
                            ))}
                            <TableHead className="w-16 text-center sticky right-0 bg-white dark:bg-slate-900">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userData
                            .filter(row => {
                              if (!userSearchTerm) return true
                              return Object.values(row).some(val => 
                                val.toLowerCase().includes(userSearchTerm.toLowerCase())
                              )
                            })
                            .map((row, index) => (
                              <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                {userHeaders.map((header, idx) => {
                                  const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                                  const value = row[key] || '-'
                                  // Deteksi apakah ini kolom nomor telepon
                                  const isPhoneColumn = header.toLowerCase().includes('telepon') || 
                                                        header.toLowerCase().includes('telp') ||
                                                        header.toLowerCase().includes('phone') ||
                                                        header.toLowerCase().includes('hp') ||
                                                        header.toLowerCase().includes('no ')
                                  
                                  return (
                                    <TableCell key={idx} className="whitespace-nowrap">
                                      {isPhoneColumn && value !== '-' ? (
                                        <div className="flex items-center gap-2">
                                          <a 
                                            href={`tel:${value}`}
                                            className="text-blue-600 hover:underline"
                                          >
                                            {value}
                                          </a>
                                          <a
                                            href={getWhatsAppLink(value)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-700"
                                            title="Hubungi via WhatsApp"
                                          >
                                            <MessageCircle className="w-4 h-4" />
                                          </a>
                                        </div>
                                      ) : value}
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="text-center sticky right-0 bg-white dark:bg-slate-900">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openUserEditDialog(row, index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 border-t">
                      Total: {userData.filter(row => {
                        if (!userSearchTerm) return true
                        return Object.values(row).some(val => 
                          val.toLowerCase().includes(userSearchTerm.toLowerCase())
                        )
                      }).length} data
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Dialog for SPPG */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Tambah Data SPPG
              </DialogTitle>
              <DialogDescription>
                Masukkan data SPPG baru untuk disimpan ke database.
              </DialogDescription>
            </DialogHeader>

            {submitSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Data berhasil disimpan!</span>
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-tanggal" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Tanggal
                  </Label>
                  <Input
                    id="add-tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-alamat">Alamat</Label>
                  <Input
                    id="add-alamat"
                    placeholder="Alamat"
                    value={formData.alamat}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-namaKlien">Nama Klien</Label>
                  <Input
                    id="add-namaKlien"
                    placeholder="Nama Nama Klien"
                    value={formData.namaKlien}
                    onChange={(e) => handleInputChange('namaKlien', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-noTelephone">No. Telepon</Label>
                  <Input
                    id="add-noTelephone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.noTelephone}
                    onChange={(e) => handleInputChange('noTelephone', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-teknisi">Teknisi</Label>
                  <Input
                    id="add-teknisi"
                    placeholder="Nama Teknisi"
                    value={formData.teknisi}
                    onChange={(e) => handleInputChange('teknisi', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-statusBa">Status BA</Label>
                  <Select 
                    value={formData.statusBa} 
                    onValueChange={(value) => handleInputChange('statusBa', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status BA" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_BA_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-statusPekerjaan">Status Pekerjaan</Label>
                  <Select 
                    value={formData.statusPekerjaan} 
                    onValueChange={(value) => handleInputChange('statusPekerjaan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_PEKERJAAN_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-statusPembayaran">Status Pembayaran</Label>
                  <Select 
                    value={formData.statusPembayaran} 
                    onValueChange={(value) => handleInputChange('statusPembayaran', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_PEMBAYARAN_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-keterangan">Keterangan</Label>
                <Textarea
                  id="add-keterangan"
                  placeholder="Keterangan tambahan (opsional)"
                  value={formData.keterangan}
                  onChange={(e) => handleInputChange('keterangan', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
                <Button type="button" variant="outline" onClick={copyToClipboard} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                  {copied ? 'Tersalin!' : 'Salin'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setAddDialogOpen(false); resetForm(); }}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog for SPPG */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Data SPPG
              </DialogTitle>
              <DialogDescription>
                Ubah data SPPG sesuai kebutuhan
              </DialogDescription>
            </DialogHeader>

            {editSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Data berhasil diupdate!</span>
              </div>
            )}

            {editError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tanggal">Tanggal</Label>
                <Input
                  id="edit-tanggal"
                  type="date"
                  value={editFormData.tanggal}
                  onChange={(e) => handleEditInputChange('tanggal', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-alamat">Alamat</Label>
                <Input
                  id="edit-alamat"
                  value={editFormData.alamat}
                  onChange={(e) => handleEditInputChange('alamat', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-namaKlien">Nama Klien</Label>
                <Input
                  id="edit-namaKlien"
                  value={editFormData.namaKlien}
                  onChange={(e) => handleEditInputChange('namaKlien', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-noTelephone">No. Telepon</Label>
                <Input
                  id="edit-noTelephone"
                  value={editFormData.noTelephone}
                  onChange={(e) => handleEditInputChange('noTelephone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-teknisi">Teknisi</Label>
                <Input
                  id="edit-teknisi"
                  value={editFormData.teknisi}
                  onChange={(e) => handleEditInputChange('teknisi', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-statusBa">Status BA</Label>
                <Select 
                  value={editFormData.statusBa} 
                  onValueChange={(value) => handleEditInputChange('statusBa', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status BA" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_BA_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-statusPekerjaan">Status Pekerjaan</Label>
                <Select 
                  value={editFormData.statusPekerjaan} 
                  onValueChange={(value) => handleEditInputChange('statusPekerjaan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pekerjaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_PEKERJAAN_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-statusPembayaran">Status Pembayaran</Label>
                <Select 
                  value={editFormData.statusPembayaran} 
                  onValueChange={(value) => handleEditInputChange('statusPembayaran', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_PEMBAYARAN_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-keterangan">Keterangan</Label>
              <Textarea
                id="edit-keterangan"
                value={editFormData.keterangan}
                onChange={(e) => handleEditInputChange('keterangan', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleEditSave} disabled={editSubmitting} className="gap-2">
                <Pencil className="w-4 h-4" />
                {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button variant="outline" onClick={copyEditToClipboard} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin ke Clipboard'}
              </Button>
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Add Dialog */}
        <Dialog open={userAddDialogOpen} onOpenChange={setUserAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Tambah Data User
              </DialogTitle>
              <DialogDescription>
                Masukkan data user baru untuk disimpan langsung ke database.
              </DialogDescription>
            </DialogHeader>

            {userAddSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Data berhasil disimpan!</span>
              </div>
            )}

            {userAddError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{userAddError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {userHeaders.map((header, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`user-add-${idx}`}>{header}</Label>
                  <Input
                    id={`user-add-${idx}`}
                    placeholder={`Masukkan ${header}`}
                    value={userAddFormData[header] || ''}
                    onChange={(e) => handleUserAddInputChange(header, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleUserAddSubmit} disabled={userAddSubmitting} className="gap-2">
                <Send className="w-4 h-4" />
                {userAddSubmitting ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
              <Button variant="ghost" onClick={() => setUserAddDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Edit Dialog */}
        <Dialog open={userEditDialogOpen} onOpenChange={setUserEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Data User
              </DialogTitle>
              <DialogDescription>
                Ubah data user sesuai kebutuhan. Data akan disimpan langsung ke Google Sheet.
              </DialogDescription>
            </DialogHeader>

            {userEditSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Data berhasil disimpan!</span>
              </div>
            )}

            {userEditError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{userEditError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {userHeaders.map((header, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`user-edit-${idx}`}>{header}</Label>
                  <Input
                    id={`user-edit-${idx}`}
                    placeholder={`Masukkan ${header}`}
                    value={userEditFormData[header] || ''}
                    onChange={(e) => handleUserEditInputChange(header, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleUserEditSubmit} disabled={userEditSubmitting} className="gap-2">
                <Send className="w-4 h-4" />
                {userEditSubmitting ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
              <Button variant="ghost" onClick={() => setUserEditDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
