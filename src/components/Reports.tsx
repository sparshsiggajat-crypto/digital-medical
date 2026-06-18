import { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Terminal, 
  Database, 
  Download, 
  ShieldAlert,
  Server,
  RefreshCw
} from 'lucide-react';
import { DashboardStats, Medicine } from '../types';

interface ReportsProps {
  stats: DashboardStats | null;
  medicines: Medicine[];
  loading: boolean;
}

export default function Reports({ stats, medicines, loading }) {
  const [activeTab, setActiveTab] = useState<'financial' | 'inventory' | 'server'>('financial');
  const [logsTriggerReset, setLogsTriggerReset] = useState(0);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Profit/Revenue Margins calculation helper
  const totalCostOfInventory = medicines.reduce((sum, m) => sum + (m.costPrice * m.quantity), 0);
  const retailValueOfInventory = medicines.reduce((sum, m) => sum + (m.price * m.quantity), 0);
  const unrealizedProfit = retailValueOfInventory - totalCostOfInventory;

  // Indian format helper for Indian currency localization (en-IN Rupees)
  const formatCurLocal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  // Mock server console entries simulating Non-Dockerized Flask + Gunicorn + Nginx!
  const serverLogs = [
    "[2026-06-12 23:30:11 +0000] [9981] [INFO] Starting gunicorn 21.2.0",
    "[2026-06-12 23:30:11 +0000] [9981] [INFO] Listening at: http://127.0.0.1:8000",
    "[2026-06-12 23:30:11 +0000] [9981] [INFO] Using worker: sync",
    "[2026-06-12 23:30:11 +0000] [9984] [INFO] Booting worker with pid: 9984",
    "[2026-06-12 23:30:11 +0000] [9985] [INFO] Booting worker with pid: 9985",
    "nginx: [info] nginx/1.24.0 started successfully, proxying port 3000 -> 8000 (wsgi)",
    "wsgi: [database] psycopg2-binary initiated connection state pool...",
    "wsgi: [database] Connected to PostgreSQL schema 'curewell_meds_prod' on localhost:5432",
    "pgsql: [migration] Schema verified. Table count: 5 (users, medicines, bills, bill_items, notifications)",
    "system-auth: [cors] Static Nginx file directory mapped at /var/www/curewell/dist",
    "127.0.0.1 - - [12/Jun/2026:23:32:41] \"GET /api/dashboard/stats HTTP/1.1\" 200 4882",
    "127.0.0.1 - - [12/Jun/2026:23:33:12] \"GET /api/inventory HTTP/1.1\" 200 12040",
    "127.0.0.1 - - [12/Jun/2026:23:33:55] \"POST /api/auth/profile HTTP/1.1\" 200 342",
    "127.0.0.1 - - [12/Jun/2026:23:35:01] \"POST /api/billing HTTP/1.1\" 201 1308",
    "system-auth: [session] JWT verification succeeded. User ID usr_1 authorized.",
    "wsgi: [worker-88] Garbage Collection clean completed in 1.44ms",
    "127.0.0.1 - - [12/Jun/2026:23:37:08] \"GET /api/notifications HTTP/1.1\" 200 1195",
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs switches */}
      <div className="flex border-b border-gray-100 bg-white p-2.5 rounded-xl border gap-1">
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'financial' 
              ? "bg-blue-600 text-white" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Financial Sales Register</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'inventory' 
              ? "bg-blue-600 text-white" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory Margins Audit</span>
        </button>
        <button
          onClick={() => setActiveTab('server')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'server' 
              ? "bg-blue-600 text-white" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Flask & Gunicorn Terminal</span>
        </button>
      </div>

      {/* Tab Content 1: Financial Sales Ledger */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Gross Transactions Sum</span>
                  <span className="font-extrabold text-gray-900">{formatCurLocal(stats.totalSales)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Recorded Tax (8% included)</span>
                  <span className="font-bold text-red-600">{formatCurLocal(stats.totalSales * 0.08 / 1.08)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-50">
                  <span className="text-gray-600 font-bold">Net Pharmacy Revenue</span>
                  <span className="font-black text-green-600 text-sm">{formatCurLocal(stats.totalSales / 1.08)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction Volumes</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Transactions Count</span>
                  <span className="font-bold text-gray-900">{stats.totalSalesCount} bills</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Average Basket Value</span>
                  <span className="font-bold text-blue-600">
                    {formatCurLocal(stats.totalSalesCount > 0 ? (stats.totalSales / stats.totalSalesCount) : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-50">
                  <span className="text-gray-550 font-semibold">Payment Methods balance</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">UPI, Cash, Visa cards</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Report widget */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Download Sales Ledger Sheets</h3>
              <p className="text-xs text-gray-400 mt-0.5">Export custom PDF summaries for taxes, audits, and compliance records</p>
            </div>
            <button 
              onClick={() => alert("Non-Docker System Report: Sheet generated and saved locally is prepared for download.")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Content 2: Inventory Margins Audit */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-700">
            <div className="bg-white p-5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block pb-1">Inventory Cost Basis</span>
              <h4 className="text-xl font-bold text-gray-950">{formatCurLocal(totalCostOfInventory)}</h4>
              <p className="text-[10px] text-gray-450 mt-1">Capital invested in physical stocks</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block pb-1">Inventory Retail Potential</span>
              <h4 className="text-xl font-bold text-gray-950">{formatCurLocal(retailValueOfInventory)}</h4>
              <p className="text-[10px] text-gray-450 mt-1">Market sellout value of active stocks</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 bg-green-50/50 border-green-250">
              <span className="text-[10px] text-green-700 uppercase font-black tracking-widest block pb-1">Unrealized Gross Margin</span>
              <h4 className="text-xl font-bold text-green-600">{formatCurLocal(unrealizedProfit)}</h4>
              <p className="text-[10px] text-green-700 mt-1">Average profit margin of ~{retailValueOfInventory > 0 ? Math.round((unrealizedProfit / retailValueOfInventory) * 100) : 0}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unit Margin Ledger</h4>
              <span className="text-[11px] text-gray-400 italic">Tracking purchasing vs retail pricing</span>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 font-semibold border-b border-gray-50">
                    <th className="p-3 pl-4">Brand Medicine</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Batch #</th>
                    <th className="p-3 text-center">Cost Price</th>
                    <th className="p-3 text-center">Retail Price</th>
                    <th className="p-3 text-right pr-4">Profile Margin (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {medicines.map(m => {
                    const mathMargin = m.price - m.costPrice;
                    const percentMargin = m.price > 0 ? (mathMargin / m.price) * 100 : 0;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-950">{m.name}</td>
                        <td className="p-3">{m.category}</td>
                        <td className="p-3 text-center font-mono text-[10px] text-gray-400">{m.batchNumber}</td>
                        <td className="p-3 text-center font-semibold text-gray-500">{formatCurLocal(m.costPrice)}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{formatCurLocal(m.price)}</td>
                        <td className="p-3 text-right pr-4 font-bold text-green-600">
                          {percentMargin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Server Logs / Gunicorn / Nginx WSGI diagnostics */}
      {activeTab === 'server' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg shrink-0">
                <Server className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Virtual Web Diagnostics console</h4>
                <p className="text-xs text-gray-400">Live streams showing gunicorn worker cycles, PostgreSQL logs, and Nginx reverse proxies</p>
              </div>
            </div>
            
            <button 
              onClick={() => setLogsTriggerReset(prev => prev + 1)}
              className="p-1 px-3 bg-gray-100 hover:bg-gray-250 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* Interactive CRT-like system terminal */}
          <div className="bg-slate-950 p-5 rounded-xl shadow-inner border border-slate-900 font-mono text-xs text-white overflow-hidden leading-relaxed">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-3 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-red-500 block shrink-0"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 block shrink-0"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 block shrink-0"></span>
              <span className="text-[10px] pl-3 select-none text-slate-500">production: gunicorn_curewell.log</span>
            </div>
            <div className="space-y-1.5 select-all max-h-72 overflow-y-auto">
              {serverLogs.map((log, i) => {
                const isErr = log.includes("[error]") || log.includes("crit");
                const isInfo = log.includes("INFO") || log.includes("started");
                const isGet = log.includes("GET") || log.includes("POST");
                
                return (
                  <p key={i} className={`text-[11px] ${
                    isErr ? "text-red-400 font-bold" :
                    isInfo ? "text-blue-300" :
                    isGet ? "text-green-300" :
                    "text-slate-300"
                  }`}>
                    {log}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
