import { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  FileText,
  Building,
  CheckCircle,
  Percent,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DashboardStats, Bill } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onSetView: (view: string) => void;
  onSelectBill: (bill: Bill) => void;
}

const COLORS = ['#059669', '#3b82f6', '#d97706', '#dc2626', '#8b5cf6'];

export default function Dashboard({ stats, loading, onSetView, onSelectBill }: DashboardProps) {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Format currency in Indian standard Rupees (₹)
  const formatCur = (v: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(v);
  };

  // Indian standard GST breakdown (prices are inclusive of GST rate, standard median 12%)
  const totalCollectedSales = stats.totalSales;
  const baseValue = totalCollectedSales / 1.12;
  const totalGstCollected = totalCollectedSales - baseValue;
  const cgstAmount = totalGstCollected / 2;
  const sgstAmount = totalGstCollected / 2;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Revenue (₹) */}
        <div id="stat_sales" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Revenue</p>
            <h3 className="text-xl font-extrabold text-slate-900">{formatCur(stats.totalSales)}</h3>
            <p className="text-xs text-emerald-650 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats.totalSalesCount} bills registered</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <span className="text-xl font-black">₹</span>
          </div>
        </div>

        {/* Card 2: Total Active Medicines */}
        <div id="stat_medicines" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Medicines</p>
            <h3 className="text-xl font-extrabold text-slate-900">{stats.totalMedicines}</h3>
            <p className="text-xs text-gray-450 font-medium">Active catalog listings</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Low Stock Warnings */}
        <div id="stat_low_stock" className={`p-5 rounded-xl border shadow-xs flex items-center justify-between ${
          stats.lowStockCount > 0 ? "bg-amber-50/50 border-amber-200 animate-pulse animate-duration-3000" : "bg-white border-gray-100"
        }`}>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock Items</p>
            <h3 className="text-xl font-extrabold text-slate-900">{stats.lowStockCount}</h3>
            <p className={`text-xs font-bold ${stats.lowStockCount > 0 ? "text-amber-800" : "text-gray-455"}`}>
              {stats.lowStockCount > 0 ? "Needs ordering list" : "Stocks fully healthy"}
            </p>
          </div>
          <div className={`p-3 rounded-lg shrink-0 ${stats.lowStockCount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-50 text-gray-400"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Expiring & Expired Medicines */}
        <div id="stat_expiry" className={`p-5 rounded-xl border shadow-xs flex items-center justify-between ${
          stats.expiringSoonCount > 0 || stats.expiredMedicinesCount > 0 ? "bg-rose-50/50 border-rose-200" : "bg-white border-gray-100"
        }`}>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiring Medicines</p>
            <h3 className="text-xl font-extrabold text-slate-900">{stats.expiringSoonCount + stats.expiredMedicinesCount}</h3>
            <p className="text-xs font-bold text-rose-800">
              {stats.expiredMedicinesCount > 0 ? `${stats.expiredMedicinesCount} batch expired` : `${stats.expiringSoonCount} limits < 30 days`}
            </p>
          </div>
          <div className={`p-3 rounded-lg shrink-0 ${stats.expiringSoonCount + stats.expiredMedicinesCount > 0 ? "bg-rose-100 text-rose-700" : "bg-gray-50 text-gray-400"}`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Analytics & GST Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">Daily Revenue Ledger</h4>
              <p className="text-xs text-gray-400 mt-0.5">Rolling last 7 days of pharmacy billing turnover</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-extrabold px-2 py-0.5 rounded-full select-none">
              LIVE SQLITE
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByDate} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} style={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} />
                <YAxis style={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} />
                <Tooltip 
                  formatter={(value: any) => [`₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Sales Revenue"]}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GST Tax Summary Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">GST Summary (IGST/CGST/SGST)</h4>
              <p className="text-xs text-gray-400 mt-0.5">Calculations based on retail inclusive inventory rates</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-150 text-emerald-700 rounded-md">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block font-bold uppercase tracking-wider">Total Sales (Tax-Inc)</span>
                    <span className="text-xs font-extrabold text-emerald-800">{formatCur(totalCollectedSales)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wide">Estimated Base Value</span>
                  <span className="font-semibold text-gray-850">{formatCur(baseValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wide">CGST (Central Tax 6%)</span>
                  <span className="font-mono text-gray-800 font-bold">{formatCur(cgstAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-450 font-bold uppercase text-[9px] tracking-wide">SGST (State Tax 6%)</span>
                  <span className="font-mono text-gray-800 font-bold">{formatCur(sgstAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-950 font-extrabold uppercase text-[9px] tracking-widest">Total Tax Collected</span>
                  <span className="font-mono text-gray-950 font-extrabold text-right">{formatCur(totalGstCollected)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-gray-150 text-[10px] text-gray-450 leading-relaxed font-bold flex gap-2 items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ready for quarterly state drug ledger filing.</span>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Invoices & Regional Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bills (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">Recent Retail Transactions</h4>
            <button 
              onClick={() => onSetView('billing')} 
              className="text-xs text-emerald-600 hover:text-emerald-850 font-black flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Build POS Invoice</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead>
                <tr className="bg-slate-50/50 text-gray-400 font-bold border-b border-gray-100 text-[10px] uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Invoice No</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5 font-bold">Aadhaar Verification</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5 pr-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentBills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400 font-bold">
                      No invoices created. Proceed to the POS module to start billing.
                    </td>
                  </tr>
                ) : (
                  stats.recentBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-gray-900">{bill.invoiceNumber}</td>
                      <td className="p-3.5">
                        <div>
                          <p className="font-extrabold text-slate-800">{bill.customerName}</p>
                          <p className="text-[10px] text-gray-450">{bill.customerPhone || 'No Contact'}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-gray-500 font-semibold uppercase">
                        {bill.customerAadhaar ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            {bill.customerAadhaar.slice(0, 4)}XXXX{bill.customerAadhaar.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-gray-300">Not Linked</span>
                        )}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900">{formatCur(bill.total)}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          bill.paymentMode === 'cash' ? "bg-green-50 text-green-700 border-green-250" :
                          bill.paymentMode === 'card' ? "bg-blue-50 text-blue-700 border-blue-250" :
                          "bg-purple-50 text-purple-700 border-purple-250"
                        }`}>
                          {bill.paymentMode}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button 
                          onClick={() => {
                            // Direct router to receipt simulation
                            onSelectBill(bill);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          View GST Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Tools & Stock Radar Panel */}
        <div className="space-y-6">
          {/* Live Alerts Radar */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 animate-pulse"></span>
                </span>
                <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">Medical Safety Radar</h4>
              </div>
              <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-sm font-extrabold uppercase">
                Active Alerts
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
              Real-time monitor of drug viability, batch warnings, and stocking levels across Indian standard drug categories.
            </p>

            <div className="space-y-3 pt-1">
              {/* Expiry alerts list */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Expiry Warnings</span>
                  <span>{((stats.expiredMedicines?.length || 0) + (stats.expiringSoonMedicines?.length || 0))} critical</span>
                </div>
                
                {((stats.expiredMedicines?.length || 0) + (stats.expiringSoonMedicines?.length || 0)) === 0 ? (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 text-[10px] font-bold text-center border border-dashed border-gray-200">
                    No active batches expired or dying soon.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.expiredMedicines?.map(med => (
                      <div key={med.id} className="p-2 bg-red-50/70 hover:bg-red-50 border border-red-100 rounded-lg flex items-center justify-between text-[11px] font-semibold text-red-900 transition-colors">
                        <span className="truncate pr-2">⚠ {med.name} (Batch: {med.batchNumber})</span>
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-extrabold shrink-0 uppercase">EXPIRED</span>
                      </div>
                    ))}
                    {stats.expiringSoonMedicines?.map(med => (
                      <div key={med.id} className="p-2 bg-amber-50/70 hover:bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between text-[11px] font-semibold text-amber-900 transition-colors">
                        <span className="truncate pr-2">⏰ {med.name} (Batch: {med.batchNumber})</span>
                        <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-extrabold shrink-0 uppercase">Expiring</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock alerts list */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Stock Deficits</span>
                  <span>{stats.lowStockMedicines?.length || 0} critical</span>
                </div>
                
                {(stats.lowStockMedicines?.length || 0) === 0 ? (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 text-[10px] font-bold text-center border border-dashed border-gray-200">
                    All drugs levels perfectly compliant.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.lowStockMedicines?.slice(0, 3).map(med => (
                      <div key={med.id} className="p-2 bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100 rounded-lg flex items-center justify-between text-[11px] font-semibold text-orange-950 transition-colors">
                        <span className="truncate pr-2">📦 {med.name} ({med.quantity} left)</span>
                        <button 
                          onClick={() => onSetView('inventory')} 
                          className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                        >
                          Replenish
                        </button>
                      </div>
                    ))}
                    {(stats.lowStockMedicines?.length || 0) > 3 && (
                      <p className="text-[10px] text-gray-400 text-center font-bold">
                        Plus {(stats.lowStockMedicines?.length || 0) - 3} more critical deficits...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Tools Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">Business Quick Hub</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                Maintain regulatory compliant pharmacy records. Access instant configurations for medicine inventory, batch tags, HSN, and GST tracking easily.
              </p>
              
              <div className="space-y-2 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between border border-gray-100 text-[11px]">
                  <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wide">Registry Compliance</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">CGST/SGST Standard</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between border border-gray-100 text-[11px]">
                  <span className="text-gray-500 font-bold uppercase text-[9px] tracking-wide">Drug Certificate</span>
                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 border border-gray-200 px-2 py-0.5 rounded-md">SWASTHYA-DL-2026</span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between select-none">
              <button 
                onClick={() => onSetView('reports')}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-lg font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Financial Reports</span>
              </button>
              <button 
                onClick={() => onSetView('inventory')}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-emerald-700"
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>Manage Meds</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
