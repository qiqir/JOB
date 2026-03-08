export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Dashboard SPPG</h1>
        <p className="text-slate-600 mb-8">Sistem monitoring data SPPG</p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Deploy Berhasil!</h2>
          <p className="text-green-600">✅ Aplikasi sudah berjalan dengan baik.</p>
        </div>
      </div>
    </div>
  );
}
