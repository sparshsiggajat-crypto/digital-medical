import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  Receipt, 
  FileSpreadsheet, 
  Bell, 
  LogOut, 
  Activity, 
  Database,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Building
} from 'lucide-react';
import { User, Medicine, Bill, Notification, DashboardStats } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Reports from './components/Reports';
import Notifications from './components/Notifications';
import Suppliers from './components/Suppliers';

// Helper to resolve API URLs safely using VITE_API_URL and fallback options
const apiFetch = (path: string, options?: RequestInit): Promise<Response> => {
  let baseUrl = (import.meta as any).env?.VITE_API_URL || '';
  
  // Safe URL fallback: if VITE_API_URL is missing, or points to local/Flask port 5000,
  // or if we are viewed in a non-localhost browser but baseUrl is absolute on localhost,
  // we force relative path '/api'.
  if (!baseUrl || baseUrl === '/' || baseUrl.includes('localhost:5000') || baseUrl.includes('127.0.0.1:5000')) {
    baseUrl = '/api';
  } else if (typeof window !== 'undefined' && window.location) {
    const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    if (!isLocalhost && (baseUrl.startsWith('http://localhost') || baseUrl.startsWith('http://127.0.0.1') || baseUrl.startsWith('https://localhost'))) {
      baseUrl = '/api';
    }
  }

  let route = path;
  if (route.startsWith('/api/')) {
    route = route.slice(5);
  } else if (route.startsWith('api/')) {
    route = route.slice(4);
  } else if (route.startsWith('/api')) {
    route = route.slice(4);
  }

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const separator = route.startsWith('/') ? '' : '/';
  const url = `${cleanBase}${separator}${route}`;

  return fetch(url, options);
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<string>('dashboard');
  
  // App-wide collections
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Loading & Action feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  
  // Auth parameters form
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Fetch initial collections
  const loadAppData = async (authToken: string) => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Parallel requests optimized for Node speed
      const [medRes, billRes, notifRes, statsRes] = await Promise.all([
        apiFetch('/api/inventory', { headers }).then(r => r.json()),
        apiFetch('/api/billing', { headers }).then(r => r.json()),
        apiFetch('/api/notifications', { headers }).then(r => r.json()),
        apiFetch('/api/dashboard/stats', { headers }).then(r => r.json())
      ]);

      setMedicines(medRes);
      setBills(billRes);
      setNotifications(notifRes);
      setStats(statsRes);
    } catch (e) {
      console.error("Failed to load backend databases.", e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch statistics & inventory on item mutations
  const refreshStatsAndData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [medRes, notifRes, statsRes] = await Promise.all([
        apiFetch('/api/inventory', { headers }).then(r => r.json()),
        apiFetch('/api/notifications', { headers }).then(r => r.json()),
        apiFetch('/api/dashboard/stats', { headers }).then(r => r.json())
      ]);
      setMedicines(medRes);
      setNotifications(notifRes);
      setStats(statsRes);
    } catch (e) {
      console.error("Failed to synchronise data", e);
    }
  };

  // Check login state
  useEffect(() => {
    // Try to auto login with token if saved
    const savedToken = localStorage.getItem('curewell_session_token');
    if (savedToken) {
      setToken(savedToken);
      apiFetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setUser(res.user);
          loadAppData(savedToken);
        } else {
          localStorage.removeItem('curewell_session_token');
          setToken(null);
        }
      })
      .catch(() => {
        setToken(null);
      });
    }
  }, []);

  // Submit Login credentials
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('curewell_session_token', data.token);
        loadAppData(data.token);
      } else {
        setAuthError(data.error || 'Server rejected credentials.');
      }
    } catch (error) {
      setAuthError('Connection failed. Verify Node full stack backend is live.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('curewell_session_token');
  };

  // Fast trigger helper to ease testing
  const selectCredentialPreset = (usr: string, pass: string) => {
    setUsername(usr);
    setPassword(pass);
    setAuthError('');
  };

  // --- API Mutators called by nested components ---
  
  const handleAddMedicine = async (payload: Partial<Medicine>) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/inventory', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await refreshStatsAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMedicine = async (id: string, payload: Partial<Medicine>) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await refreshStatsAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshStatsAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBill = async (payload: any) => {
    if (!token) return null;
    const res = await apiFetch('/api/billing', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok) {
      await refreshStatsAndData();
      return result.bill;
    } else {
      throw new Error(result.error || 'Checkout process rejected by database.');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshStatsAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshStatsAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unread Alert Count for red badge
  const unreadAlertsCount = notifications.filter(n => !n.isRead).length;

  // Render Login page if not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-linear-to-tr from-emerald-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 p-6 text-center text-white space-y-1 select-none">
            <div className="flex items-center justify-center gap-2 text-emerald-450">
              <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
              <h1 className="text-sm font-black tracking-wider uppercase font-sans">Swasthya Medical Store</h1>
            </div>
            <p className="text-xs text-slate-400 font-medium font-sans">Digital Pharmacy & Billing Solution for India</p>
            <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-400/20 mt-1">
              Indian Pharmacy Standard (₹)
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-750 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{authError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-wider text-gray-505 uppercase block">Pharmacist Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. admin or pharmacist" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-205 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-wider text-gray-505 uppercase block">Terminal Security PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="e.g. admin123" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-205 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-gray-800"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Unlock Access Port</span>
            </button>

            {/* Presets and auto fill helper */}
            <div className="pt-4 border-t border-gray-100 space-y-2 select-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">Indian Demo Presets</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button 
                  type="button"
                  onClick={() => selectCredentialPreset('admin', 'admin123')}
                  className="bg-slate-50 border border-gray-200 hover:bg-gray-100 p-2 rounded-lg text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[9px] font-extrabold text-gray-800">Rajesh S.</span>
                  <span className="text-[8px] text-gray-400 font-medium">Owner</span>
                </button>

                <button 
                  type="button"
                  onClick={() => selectCredentialPreset('pharmacist', 'pharmacist123')}
                  className="bg-slate-50 border border-gray-200 hover:bg-gray-100 p-2 rounded-lg text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[9px] font-extrabold text-gray-800">Priya G.</span>
                  <span className="text-[8px] text-gray-400 font-medium">Pharma</span>
                </button>

                <button 
                  type="button"
                  onClick={() => selectCredentialPreset('staff', 'staff123')}
                  className="bg-slate-50 border border-gray-200 hover:bg-gray-100 p-2 rounded-lg text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors"
                >
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[9px] font-extrabold text-gray-800">Amit K.</span>
                  <span className="text-[8px] text-gray-400 font-medium">Staff</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // Active view router helper
  const renderCurrentView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            loading={loading} 
            onSetView={setView} 
            onSelectBill={(bill) => {
              setView('billing');
            }} 
          />
        );
      case 'inventory':
        return (
          <Inventory 
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
          />
        );
      case 'billing':
        return (
          <Billing 
            medicines={medicines}
            onAddBill={handleAddBill}
            currentUserFullname={user.fullName}
          />
        );
      case 'suppliers':
        return (
          <Suppliers 
            apiFetch={(path, options) => {
              const fullRoute = path.startsWith('/api') ? path : `/api${path}`;
              const defaultHeaders = { 'Authorization': `Bearer ${token}` };
              const userOptions = options || {};
              const headersMerged = { ...defaultHeaders, ...userOptions.headers };
              return apiFetch(fullRoute, { ...userOptions, headers: headersMerged }).then(r => r.json());
            }}
          />
        );
      case 'reports':
        return (
          <Reports 
            stats={stats}
            medicines={medicines}
            loading={loading}
          />
        );
      case 'notifications':
        return (
          <Notifications 
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        );
      default:
        return <div>View unresolved</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGATION MODULE */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between">
        <div className="p-5 flex flex-col">
          
          {/* Brand header */}
          <div className="flex items-center gap-2 pb-5 border-b border-slate-850 select-none">
            <Activity className="w-7 h-7 text-emerald-500 animate-pulse animate-duration-3000" />
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase leading-tight">Swasthya MS</h1>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-widest">Digital Pharmacy OS</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 pt-5 text-xs font-semibold">
            
            {/* Dashboard */}
            <button
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'dashboard' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Executive Dashboard</span>
              </div>
            </button>

            {/* Inventory */}
            <button
              onClick={() => setView('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'inventory' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4 shrink-0" />
                <span>Medicine Catalog</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">{medicines.length}</span>
            </button>

            {/* Billing */}
            <button
              onClick={() => setView('billing')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'billing' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Prescription Billing (POS)</span>
              </div>
            </button>

            {/* Suppliers */}
            <button
              onClick={() => setView('suppliers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'suppliers' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 shrink-0" />
                <span>Suppliers Registry</span>
              </div>
            </button>

            {/* Reports */}
            <button
              onClick={() => setView('reports')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'reports' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Ledger & System Logs</span>
              </div>
            </button>

            {/* Notifications Alert Center */}
            <button
              onClick={() => setView('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                view === 'notifications' 
                  ? "bg-emerald-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Alerts Warning Feed</span>
              </div>
              {unreadAlertsCount > 0 && (
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full animate-bounce shrink-0">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

          </nav>
        </div>

        {/* User Identity and Signout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/20 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-sm uppercase shrink-0">
              {user.username.slice(0,2)}
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-100 truncate">{user.fullName}</p>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user.role}</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-red-900 border border-slate-750 text-slate-300 hover:text-white py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Close Session</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        
        {/* Top bar header */}
        <header className="bg-white border-b border-gray-150 p-4 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none">
          <div>
            <h2 className="text-sm font-black text-gray-900 capitalize tracking-tight">
              {view === 'dashboard' ? 'Executive Dashboard Metrics' :
               view === 'inventory' ? 'Medication Stock Ledger' :
               view === 'billing' ? 'Prescription Sales POS Terminal' :
               view === 'suppliers' ? 'Suppliers Registry (GSTIN & DL)' :
               view === 'reports' ? 'Pharmacy Business Analytics' :
               'Security alerts and warning logs'}
            </h2>
            <p className="text-[11px] text-gray-400">Digital Pharmacy & Billing Solution for India</p>
          </div>

          {/* Server / DB Status indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>SQLite Local Active</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase bg-green-50 border border-green-200 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>WSGI Flask Live</span>
            </span>
          </div>
        </header>

        {/* View console Content */}
        <section className="flex-1 p-5 lg:p-6 pb-20">
          {renderCurrentView()}
        </section>

      </main>

    </div>
  );
}
