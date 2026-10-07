import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Home, Ticket, BarChart2, LogOut, Plus, Search, Filter,
  FileText, X, AlertCircle, Clock, CheckCircle, Upload, Menu
} from 'lucide-react';
const API_URL = 'http://localhost/api_tickets';
const initialTickets = [
  {
    id: 1,
    subjek: 'Gangguan Internet Lambat',
    idPelanggan: 'CID001',
    dispatcher: 'Helpdesk',
    status: 'In Progress',
    tanggalTicket: '2026-10-01 08:30',
    history: [
      { status: 'NEW', date: '2026-10-01 08:30', user: 'System', notes: 'Tiket dibuat' },
      { status: 'In Progress', date: '2026-10-01 08:45', user: 'Helpdesk', notes: 'Pengecekan awal link' }
    ]
  },
  {
    id: 2,
    subjek: 'Router LOS',
    idPelanggan: 'CID002',
    dispatcher: 'Technical Support',
    status: 'NEW',
    tanggalTicket: '2026-10-02 10:15',
    history: [
      { status: 'NEW', date: '2026-10-02 10:15', user: 'System', notes: 'Tiket dibuat' }
    ]
  },
  {
    id: 3,
    subjek: 'Kabel Putus',
    idPelanggan: 'CID003',
    dispatcher: 'NOC',
    status: 'Closed',
    tanggalTicket: '2026-10-02 14:00',
    history: [
      { status: 'NEW', date: '2026-10-02 14:00', user: 'System', notes: 'Tiket dibuat' },
      { status: 'In Progress', date: '2026-10-02 14:20', user: 'NOC', notes: 'Tim menuju lokasi' },
      { status: 'Resolved', date: '2026-10-02 16:00', user: 'NOC', notes: 'Kabel tersambung' },
      { status: 'Closed', date: '2026-10-02 16:30', user: 'Admin', notes: 'Konfirmasi pelanggan OK' }
    ]
  },
  {
    id: 4,
    subjek: 'Koneksi Terputus (RTO)',
    idPelanggan: 'CID004',
    dispatcher: 'Technical Support',
    status: 'In Progress',
    tanggalTicket: '2026-10-03 09:00',
    history: [
      { status: 'NEW', date: '2026-10-03 09:00', user: 'System', notes: 'Tiket dibuat' },
      { status: 'In Progress', date: '2026-10-03 09:30', user: 'Technical Support', notes: 'Cek routing OSPF' }
    ]
  },
  {
    id: 5,
    subjek: 'Modem Mati Total',
    idPelanggan: 'CID005',
    dispatcher: 'Helpdesk',
    status: 'NEW',
    tanggalTicket: '2026-10-04 07:45',
    history: [
      { status: 'NEW', date: '2026-10-04 07:45', user: 'System', notes: 'Tiket dibuat' }
    ]
  }
];

export default function App() {
  // State untuk Data Persisten
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lifemedia_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/get_tickets.php`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Gagal mengambil data dari database:", err);
    }
  };
  
  useEffect(() => {
    fetchTickets();
  }, []);

  const [storageError, setStorageError] = useState('');

  // Sync dengan LocalStorage setiap kali state berubah
  /*
  useEffect(() => {
    try {
      localStorage.setItem('lifemedia_tickets', JSON.stringify(tickets));
      setStorageError(''); // Bersihkan error jika berhasil
    } catch (error) {
      console.error("Local storage error:", error);
      setStorageError('Penyimpanan browser penuh. Sistem gagal menyimpan data secara permanen karena ukuran foto terlalu besar.');
    }
  }, [tickets]);
  */
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lifemedia_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lifemedia_current_user');
    }
  }, [currentUser]);

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form Create State
  const [newSubjek, setNewSubjek] = useState('');
  const [newIdPelanggan, setNewIdPelanggan] = useState('');
  const [newDispatcher, setNewDispatcher] = useState('Technical Support');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [newDokumentasi, setNewDokumentasi] = useState(null);

  // Form Edit State
  const [editStatus, setEditStatus] = useState('NEW');
  const [editDeskripsiUpdate, setEditDeskripsiUpdate] = useState('');
  const [editDokumentasi, setEditDokumentasi] = useState(null);
  const [updateError, setUpdateError] = useState('');

  // Helpers: Modul Kompresi Foto (Auto-Compressor)
  const processImageToCompressBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Kompresi agar lebar max 800px
          const MAX_HEIGHT = 800; // Kompresi agar tinggi max 800px
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Ubah ke JPEG dan kompres kualitas menjadi 70% (0.7)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const getCurrentDateStr = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Resolved': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // User Tickets (Role based filtering)
  const userTickets = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.username === 'Admin') return tickets;
    return tickets.filter(t => t.dispatcher === currentUser.username);
  }, [tickets, currentUser]);

  // Chart Data Calculation
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map(month => ({ name: month, all: 0, downtime: 0 }));

    userTickets.forEach(t => {
      const tDate = new Date(t.tanggalTicket);
      if (tDate.getFullYear() === currentYear) {
        const monthIndex = tDate.getMonth();
        data[monthIndex].all += 1;
        if (t.dispatcher === 'Technical Support' || t.dispatcher === 'NOC') {
          data[monthIndex].downtime += 1;
        }
      }
    });
    return data;
  };

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const validUsers = ['Admin', 'Technical Support', 'NOC', 'Helpdesk'];
    if (validUsers.includes(loginUsername) && loginPassword === loginUsername) {
      setCurrentUser({ username: loginUsername });
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError('Username atau Password tidak valid!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
  };

 const handleCreateSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    idPelanggan: newIdPelanggan,
    subjek: newSubjek,
    dispatcher: newDispatcher,
    deskripsi: newDeskripsi,
    user: currentUser?.username || 'Admin'
  };

  try {
    const res = await fetch(`${API_URL}/create_ticket.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'success') {
      setIsCreateOpen(false);
      setNewSubjek('');
      setNewIdPelanggan('');
      setNewDeskripsi('');
      fetchTickets(); // Muat ulang data terbaru dari database
    } else {
      alert("Gagal membuat tiket: " + result.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

  const handleUpdateSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    id: selectedTicket.id,
    status: editStatus,
    user: currentUser?.username || 'Admin',
    notes: editDeskripsiUpdate
  };

  try {
    const res = await fetch(`${API_URL}/update_ticket.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'success') {
      setIsEditOpen(false);
      setIsDetailOpen(false);
      setEditDeskripsiUpdate('');
      fetchTickets();
    } else {
      alert("Gagal update tiket: " + result.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

  const handleDeleteConfirm = async (id) => {
  try {
    const res = await fetch(`${API_URL}/delete_ticket.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await res.json();

    if (result.status === 'success') {
      setIsDetailOpen(false);
      setShowDeleteConfirm(false);
      fetchTickets();
    } else {
      alert("Gagal menghapus tiket: " + result.message);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

  const ticketsToExport = useMemo(() => {
    return userTickets.filter(t => {
      const ticketDate = t.tanggalTicket?.split(' ')[0] || ''; // Mengambil bagian YYYY-MM-DD saja
      let isAfterStart = true;
      let isBeforeEnd = true;
      
      if (reportStartDate) {
        isAfterStart = ticketDate >= reportStartDate;
      }
      if (reportEndDate) {
        isBeforeEnd = ticketDate <= reportEndDate;
      }
      
      return isAfterStart && isBeforeEnd;
    });
  }, [userTickets, reportStartDate, reportEndDate]);

  const exportToCSV = () => {
    const headers = ['No Ticket', 'Subjek', 'ID Pelanggan', 'Dispatcher', 'Status Akhir', 'Tanggal Ticket', 'Riwayat (Status - Waktu - User - Catatan)'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    ticketsToExport.forEach((ticket) => {
      const historyStr = ticket.history.map(h => `[${h.status}] ${h.date} by ${h.user}: ${h.notes}`).join(' || ');
      const row = [
        `"TKT-${String(ticket.id).padStart(4, '0')}"`,
        `"${ticket.subjek}"`,
        `"${ticket.idPelanggan}"`,
        `"${ticket.dispatcher}"`,
        `"${ticket.status}"`,
        `"${ticket.tanggalTicket}"`,
        `"${historyStr}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Laporan_History_Ticket.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Screens
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-[#a81c43] p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Service Portal</h1>
            <p className="text-red-100 text-sm">Silakan login untuk melanjutkan</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:border-[#a81c43] focus:ring-1 focus:ring-[#a81c43]"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:border-[#a81c43] focus:ring-1 focus:ring-[#a81c43]"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#a81c43] text-white p-3 rounded-xl font-bold hover:bg-[#8a1535] transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredTickets = userTickets.filter(t => {
    const matchSearch = t.idPelanggan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.subjek.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* FULL TOP BAR */}
      <header className="bg-[#a81c43] text-white shadow-md z-20 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3 w-64">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
              <Menu size={20} />
            </button>
            {/* Kosong di area logo sesuai permintaan */}
          </div>
          <div className="flex items-center space-x-4 pr-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold">{currentUser.username}</div>
              <div className="text-xs text-red-200">Online</div>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {currentUser.username.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - WHITE BACKGROUND */}
        {isSidebarOpen && (
          <aside className="w-64 bg-white shadow-lg flex flex-col z-10 flex-shrink-0 transition-all duration-300">
            <nav className="flex-1 py-6 px-3 space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-colors ${
                  activeTab === 'dashboard' ? 'bg-red-50 text-[#a81c43] font-semibold border-l-4 border-[#a81c43]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#a81c43]'
                }`}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-colors ${
                  activeTab === 'ticket' ? 'bg-red-50 text-[#a81c43] font-semibold border-l-4 border-[#a81c43]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#a81c43]'
                }`}
              >
                <Ticket size={20} />
                <span>Ticket</span>
              </button>
              {currentUser.username === 'Admin' && (
                <button
                  onClick={() => setActiveTab('report')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-r-full transition-colors ${
                    activeTab === 'report' ? 'bg-red-50 text-[#a81c43] font-semibold border-l-4 border-[#a81c43]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#a81c43]'
                  }`}
                >
                  <FileText size={20} />
                  <span>Report</span>
                </button>
              )}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Peringatan jika penyimpanan localStorage penuh */}
          {storageError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative flex items-center gap-3 shadow-sm animate-fadeIn">
              <AlertCircle size={20} className="shrink-0" />
              <span className="block sm:inline text-sm font-bold">{storageError}</span>
            </div>
          )}

          {/* ================= DASHBOARD VIEW ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Overview Dashboard</h2>
                  <p className="text-gray-500 text-sm mt-1">Data dan statistik tiket terkini.</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Ticket size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Ticket</p>
                    <p className="text-2xl font-bold text-gray-800">{userTickets.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><CheckCircle size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Solved / Closed</p>
                    <p className="text-2xl font-bold text-gray-800">{userTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">On Progress</p>
                    <p className="text-2xl font-bold text-gray-800">{userTickets.filter(t => t.status === 'NEW' || t.status === 'In Progress').length}</p>
                  </div>
                </div>
              </div>

              {/* Charts & Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Statistik Ticket 2026</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f9fafb'}} />
                        <Legend />
                        <Bar dataKey="all" name="Semua Ticket" fill="#1f2937" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="downtime" name="Ticket Downtime" fill="#a81c43" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Ticket On Progress</h3>
                  <div className="flex-1 overflow-auto">
                    <div className="space-y-3">
                      {userTickets.filter(t => t.status === 'NEW' || t.status === 'In Progress').map(ticket => (
                        <div key={ticket.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-[#a81c43]">{ticket.idPelanggan}</span>
                            <span className={`text-xs px-2 py-1 rounded-md font-semibold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800">{ticket.subjek}</p>
                          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                            <span>{ticket.dispatcher}</span>
                            <span>{ticket.tanggalTicket}</span>
                          </div>
                        </div>
                      ))}
                      {userTickets.filter(t => t.status === 'NEW' || t.status === 'In Progress').length === 0 && (
                        <div className="text-center text-gray-400 py-10 text-sm">Tidak ada tiket on progress</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TICKET VIEW ================= */}
          {activeTab === 'ticket' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Manajemen Ticket</h2>
                  <p className="text-gray-500 text-sm mt-1">Kelola dan update status tiket di sini.</p>
                </div>
                {currentUser.username === 'Admin' && (
                  <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-[#a81c43] text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#8a1535] transition-colors shadow-sm font-medium"
                  >
                    <Plus size={18} />
                    <span>Buat Ticket Baru</span>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari ID Pelanggan atau Subjek..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#a81c43] focus:ring-1 focus:ring-[#a81c43] text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-400" />
                  <select 
                    className="border border-gray-300 py-2.5 px-4 rounded-lg outline-none focus:border-[#a81c43] text-sm bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="NEW">NEW</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                      <tr>
                        <th className="px-6 py-4 font-semibold">No. Ticket</th>
                        <th className="px-6 py-4 font-semibold">ID Pelanggan</th>
                        <th className="px-6 py-4 font-semibold">Subjek</th>
                        <th className="px-6 py-4 font-semibold">Dispatcher</th>
                        <th className="px-6 py-4 font-semibold">Tanggal Ticket</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTickets.map((ticket, index) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700">TKT-{String(ticket.id).padStart(4, '0')}</td>
                          <td className="px-6 py-4 font-bold text-[#a81c43]">{ticket.idPelanggan}</td>
                          <td className="px-6 py-4 text-gray-700">{ticket.subjek}</td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                              {ticket.dispatcher}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{ticket.tanggalTicket}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => { setSelectedTicket(ticket); setIsDetailOpen(true); }}
                              className="text-[#a81c43] hover:text-[#8a1535] font-medium text-sm underline underline-offset-2"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTickets.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            Tidak ada data tiket ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= REPORT VIEW ================= */}
          {activeTab === 'report' && currentUser.username === 'Admin' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Report & Export</h2>
                  <p className="text-gray-500 text-sm mt-1">Tarik laporan data tiket dalam format CSV.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="p-4 bg-red-50 text-[#a81c43] rounded-2xl hidden sm:block">
                    <FileText size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Export History Ticket</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">Unduh riwayat tiket ke dalam file Excel (CSV). Anda dapat memfilter data yang ingin diunduh berdasarkan tanggal tiket dibuat.</p>
                    
                    {/* Filter Tanggal */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dari Tanggal</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#a81c43] text-sm bg-white"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sampai Tanggal</label>
                        <input 
                          type="date" 
                          className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#a81c43] text-sm bg-white"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Data siap diekspor:</span> 
                      <span className="ml-2 px-2.5 py-1 bg-red-50 text-[#a81c43] font-bold rounded-md border border-red-100">
                        {ticketsToExport.length} Tiket
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <button 
                    onClick={exportToCSV}
                    disabled={ticketsToExport.length === 0}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-sm transition-colors ${
                      ticketsToExport.length > 0 
                        ? 'bg-[#a81c43] text-white hover:bg-[#8a1535]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FileText size={20} />
                    <span>Download Laporan CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL CREATE TICKET ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-[#a81c43] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Buat Ticket</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-sm text-gray-700">
              <div>
                <label className="block font-semibold mb-1.5">ID Pelanggan</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#a81c43] bg-gray-50"
                  required 
                  value={newIdPelanggan}
                  onChange={(e) => setNewIdPelanggan(e.target.value)}
                  placeholder="Contoh: CID006"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5">Subjek</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#a81c43]"
                  required 
                  value={newSubjek}
                  onChange={(e) => setNewSubjek(e.target.value)}
                  placeholder="Contoh: Gangguan Internet Lambat"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5">Dispatch Ke (Tim)</label>
                <select 
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#a81c43] bg-white"
                  value={newDispatcher}
                  onChange={(e) => setNewDispatcher(e.target.value)}
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="NOC">NOC</option>
                  <option value="Helpdesk">Helpdesk</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1.5">Detail Kendala</label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#a81c43] resize-none bg-gray-50 text-sm"
                  rows="3"
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  placeholder="Ceritakan keluhan spesifik pelanggan di sini agar tim teknis mudah memahaminya..."
                  required
                ></textarea>
              </div>
              <div>
                <span className="block font-semibold mb-1.5 text-gray-700">Dokumentasi (Opsional)</span>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center w-full">
                  <Upload size={24} className="text-[#a81c43] mb-2" />
                  <span className="text-gray-600 text-xs font-medium">Klik area ini untuk upload foto kendala</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setNewDokumentasi(e.target.files[0])}
                  />
                </label>
                {newDokumentasi && (
                  <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                    ✓ File terpilih: {newDokumentasi.name}
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-[#a81c43] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#8a1535] transition-colors shadow-sm">
                  Simpan Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETAIL TICKET ================= */}
      {isDetailOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="bg-[#a81c43] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Ticket size={18} /> Detail Ticket
              </h3>
              <button onClick={() => { setIsDetailOpen(false); setShowDeleteConfirm(false); }} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm mb-6 flex flex-wrap gap-y-4">
                <div className="w-1/2">
                  <p className="text-xs text-gray-500 font-medium mb-1">No. Ticket</p>
                  <p className="font-bold text-gray-800 text-lg">TKT-{String(selectedTicket.id).padStart(4, '0')}</p>
                </div>
                <div className="w-1/2">
                  <p className="text-xs text-gray-500 font-medium mb-1">ID Pelanggan</p>
                  <p className="font-bold text-[#a81c43] text-lg">{selectedTicket.idPelanggan}</p>
                </div>
                <div className="w-1/2">
                  <p className="text-xs text-gray-500 font-medium mb-1">Status Saat Ini</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="w-1/2">
                  <p className="text-xs text-gray-500 font-medium mb-1">Subjek</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.subjek}</p>
                </div>
                <div className="w-full">
                  <p className="text-xs text-gray-500 font-medium mb-1">Dispatcher</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.dispatcher}</p>
                </div>
              </div>

              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-gray-500" /> Riwayat Penanganan (Timeline)
              </h4>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {selectedTicket.history.map((hist, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-[#a81c43] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(hist.status)}`}>
                          {hist.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{hist.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-medium">{hist.notes}</p>
                      {hist.attachment && (
                        <div className="mt-3">
                          <img 
                            src={hist.attachment} 
                            alt="Dokumentasi Lampiran" 
                            className="rounded-lg max-h-48 w-auto object-contain border border-gray-200 shadow-sm bg-gray-50 p-1" 
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-50 pt-2">Updated by: <span className="font-bold">{hist.user}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
              {currentUser.username === 'Admin' ? (
                showDeleteConfirm ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-600">Yakin hapus?</span>
                    <button
                      onClick={() => handleDeleteConfirm(selectedTicket.id)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold px-4 py-2 transition-colors"
                  >
                    Hapus Ticket
                  </button>
                )
              ) : (
                <div></div> /* Placeholder kosong agar posisi tombol di kanan tidak bergeser */
              )}
              <div className="space-x-3">
                <button onClick={() => { setIsDetailOpen(false); setShowDeleteConfirm(false); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  Tutup
                </button>
                {selectedTicket.status !== 'Closed' && (
                  <button 
                    onClick={() => {
                      setEditStatus(selectedTicket.status);
                      setEditDeskripsiUpdate('');
                      setEditDokumentasi(null);
                      setUpdateError('');
                      setIsEditOpen(true);
                    }}
                    className="bg-[#1f2937] text-white px-5 py-2 rounded-lg font-bold hover:bg-black transition-colors text-sm shadow-sm"
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL UPDATE TICKET ================= */}
      {isEditOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-[#1f2937] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Update Status Ticket</h3>
              <button onClick={() => { setIsEditOpen(false); setUpdateError(''); setEditDokumentasi(null); }} className="text-white hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 text-sm text-gray-700">
              {updateError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg font-medium">
                  {updateError}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1.5">Status Penanganan</label>
                <select 
                  className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-[#1f2937] bg-white"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="NEW">NEW</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1.5">Deskripsi Tindakan</label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-[#1f2937] resize-none"
                  rows="4"
                  placeholder="Ceritakan detail pengecekan atau perbaikan yang dilakukan..."
                  value={editDeskripsiUpdate}
                  onChange={(e) => setEditDeskripsiUpdate(e.target.value)}
                ></textarea>
              </div>
              <div>
                <span className="block font-semibold mb-1.5 text-gray-700">Dokumentasi Update (Opsional)</span>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center w-full">
                  <Upload size={24} className="text-[#1f2937] mb-2" />
                  <span className="text-gray-600 text-xs font-medium">Klik area ini untuk upload foto hasil perbaikan</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setEditDokumentasi(e.target.files[0])}
                  />
                </label>
                {editDokumentasi && (
                  <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                    ✓ File terpilih: {editDokumentasi.name}
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => { setIsEditOpen(false); setUpdateError(''); setEditDokumentasi(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" className="bg-[#1f2937] text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors shadow-sm">
                  Simpan Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}