import React, { useState, useEffect } from 'react';
import { 
  FolderLock, ShieldCheck, MapPin, Truck, CalendarClock, ShieldAlert, 
  RefreshCw, TrendingUp, Sparkles, UserCheck, BarChart3, 
  ChevronRight, ArrowRightLeft, Gift, ClipboardList, HelpCircle, 
  MessageSquare, Radio, Gamepad2, Layers, Cpu, Search, Plus, 
  Trash2, MessageCircle, AlertOctagon, Flame, LayoutList, 
  CheckCircle2, AlertTriangle, PlayCircle, Star, GraduationCap, 
  Upload, QrCode
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

import { 
  Medicine, Customer, Delivery, Reservation, SubscriptionMedicine, 
  MedicineRecall, InventoryTransfer, ChatMessage, PharmacyTask, 
  CustomerFeedback, HealthLockerRecord 
} from '../types';

interface EnterpriseHubProps {
  token: string | null;
  medicines: Medicine[];
  customers?: Customer[];
  onRefreshData?: () => void;
}

export default function EnterpriseHub({ token, medicines, customers = [], onRefreshData }: EnterpriseHubProps) {
  // Navigation tabs for the bento workspace
  const [activeTab, setActiveTab] = useState<'locker' | 'delivery' | 'emergency' | 'marketplace' | 'forecasting' | 'signage'>('locker');

  // Real data state synchronized with db
  const [dbData, setDbData] = useState<{
    healthLockerRecords: HealthLockerRecord[];
    deliveries: Delivery[];
    reservations: Reservation[];
    subscriptions: SubscriptionMedicine[];
    recalls: MedicineRecall[];
    transfers: InventoryTransfer[];
    messages: ChatMessage[];
    tasks: PharmacyTask[];
    feedback: CustomerFeedback[];
  }>({
    healthLockerRecords: [],
    deliveries: [],
    reservations: [],
    subscriptions: [],
    recalls: [],
    transfers: [],
    messages: [],
    tasks: [],
    feedback: []
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Helper helper to fetch/refresh
  const fetchEnterpriseData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/data', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDbData({
          healthLockerRecords: data.healthLockerRecords || [],
          deliveries: data.deliveries || [],
          reservations: data.reservations || [],
          subscriptions: data.subscriptions || [],
          recalls: data.recalls || [],
          transfers: data.transfers || [],
          messages: data.messages || [],
          tasks: data.tasks || [],
          feedback: data.feedback || []
        });
      }
    } catch (err) {
      console.error("Failed to load enterprise data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, [token]);

  // Handle addition tools
  const handleAddLockerRecord = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/health-locker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Customer Health Document secured inside Encrypted Digital health Locker.");
      }
    } catch (err) {
      alert("X Failed to upload record");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddDelivery = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Delivery dispatch batch locked. Live OTP authentication token broadcasted to client mobile terminal.");
      }
    } catch (err) {
      alert("X Failed to register delivery job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (id: string, status: string, otp?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/enterprise/deliveries/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, otp })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchEnterpriseData();
        alert(`✓ Delivery status transition accepted: [${status.toUpperCase()}]`);
      } else {
        alert(`× Verification Denied: ${data.error}`);
      }
    } catch (err: any) {
      alert("X Status transition error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddReservation = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Medicine reserved successfully. Safety lock countdown initiated.");
      }
    } catch (err) {
      alert("X Reservation post rejected.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSubscription = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Recurring Subscription cycle locked. Dispatch calendars reconciled.");
      }
    } catch (err) {
      alert("X Metformin BP Refill dispatch rejected");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRecall = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/recalls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("🚨 DANGEROUS MANUFACTURER BATCH RECALL SIGNAL PREVENTED POS TERM BILLING!");
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert("X Recall trigger rejected.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTransfer = async (form: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/enterprise/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Branch-to-Branch Stock allocation request dispatched.");
      }
    } catch (err) {
      alert("X Transfer fail");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostMessage = async (sender: string, content: string, channel: 'staff' | 'alerts' | 'handover') => {
    try {
      const res = await fetch('/api/enterprise/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, content, channel })
      });
      if (res.ok) {
        await fetchEnterpriseData();
      }
    } catch (err) {
      console.error("Msg fail", err);
    }
  };

  const handleAddTask = async (title: string, description: string, category: any) => {
    try {
      const res = await fetch('/api/enterprise/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category })
      });
      if (res.ok) {
        await fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostFeedback = async (customerName: string, ratMed: number, ratServ: number, ratDel: number, comment: string) => {
    try {
      const res = await fetch('/api/enterprise/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, ratingMedicine: ratMed, ratingService: ratServ, ratingDelivery: ratDel, comment })
      });
      if (res.ok) {
        await fetchEnterpriseData();
        alert("✓ Thank you! Feedback score logged on human index charts.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Announcement Ticker & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 no-print text-[11px]">
        {/* Notice Board Widget (Saves visual clutter) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 font-bold tracking-wider px-2 py-0.5 rounded uppercase font-mono animate-pulse border border-amber-500/20">
              <Radio className="w-3.5 h-3.5" />
              BROADCAST
            </span>
            <div>
              <p className="font-bold text-slate-100 text-[12px]">Swasthya OS Node: Monsoon pre-booking cycles established</p>
              <p className="text-slate-400 mt-0.5">Primary vaccination batches transferred. Zero unauthorized transactions today.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-mono font-black animate-pulse">●</span>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sync: Live Cloud Active</span>
          </div>
        </div>

        {/* Staff Gamification badge */}
        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 dark:text-silver-100 uppercase tracking-wider text-[10px]">Pharmacist Leader</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-emerald-400">Dr. Sarah Mitchell</p>
            <p className="text-[9px] text-gray-450 font-medium">99.8% Perfect audits • 1,421 bills</p>
          </div>
          <div className="p-2.5 bg-yellow-550/10 text-yellow-500 dark:text-yellow-400 border border-yellow-500/20 rounded-full animate-bounce">
            <Gamepad2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Primary Sub-tab switcher bento deck */}
      <div className="flex flex-wrap items-center bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-805 p-1 rounded-xl gap-1 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('locker')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'locker' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <FolderLock className="w-3.5 h-3.5" />
          Health Locker & Timeline
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'delivery' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <Truck className="w-3.5 h-3.5" />
          Delivery & Reservations
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'emergency' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Emergency billing Pad
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          B2B Marketplace & Shelf
        </button>
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'forecasting' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Seasonal BI & Recall Logs
        </button>
        <button
          onClick={() => setActiveTab('signage')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'signage' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          Signage Board & CRM
        </button>
      </div>

      {/* Render sub view workspaces */}
      {activeTab === 'locker' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Locker Upload & File List */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-805 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-slate-50 text-sm uppercase tracking-wider">Patient Health Locker Explorer</h3>
                    <p className="text-[11px] text-gray-400">HIPAA Compliant, AES-256 Cloud storage with decentralized access keys</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase">AES-256 Vault</span>
              </div>

              {/* Upload Mock Box */}
              <div className="border border-dashed border-gray-200 dark:border-slate-805 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-950/20 relative transition-all group">
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-550 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-500 transition-all">
                    <Upload className="w-5 h-5 pointer-events-none" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag & drop doctor scripts, MRI labs, or immunizations</p>
                    <p className="text-[10px] text-gray-400 mt-1">Accepts PDF, DICOM, JPEG, PNG up to 15MB • Decrypt instantly via client sign-off</p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLockerRecord({
                        customerId: "cust_1",
                        type: "prescription",
                        title: "Dr. Nair Cardiopulmonary Script",
                        fileName: "rx_cardio_nair_mumbai.pdf",
                        fileSize: "1.4 MB",
                        metadata: "Prescribed Atorvastatin 20mg & Ramipril 5mg"
                      })}
                      className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-850 rounded-lg text-[11px] uppercase font-bold transition-all cursor-pointer border border-emerald-500/10 shadow-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Add Presc Rx
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLockerRecord({
                        customerId: "cust_1",
                        type: "lab_report",
                        title: "High Precision HbA1c & Hematology",
                        fileName: "lipid_hba1c_blood_mumbai_metro.pdf",
                        fileSize: "2.8 MB",
                        metadata: "HbA1c level: 6.9% (Pre-diabetic limit)"
                      })}
                      className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-850 rounded-lg text-[11px] uppercase font-bold transition-all cursor-pointer border border-emerald-500/10 shadow-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Add Blood Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Records table dynamic */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">Locker documents ({dbData.healthLockerRecords.length})</h4>
                {dbData.healthLockerRecords.length === 0 ? (
                  <div className="p-6 text-center text-gray-450 text-[11px] bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-gray-150">
                    No documents uploaded. Use the simulation triggers above to populate the health vault.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-150 dark:border-slate-805 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider border-b border-gray-150 dark:border-slate-805">
                          <th className="p-3">Doc Detail</th>
                          <th className="p-3">Class</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">Uploaded Date</th>
                          <th className="p-3">Data & metadata notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-805">
                        {dbData.healthLockerRecords.map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 text-slate-800 dark:text-slate-200 transition-colors">
                            <td className="p-3 font-semibold text-slate-950 dark:text-white">
                              <span className="block">{rec.title}</span>
                              <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{rec.fileName}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                                rec.type === 'prescription' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15' :
                                rec.type === 'lab_report' ? 'bg-blue-500/10 text-blue-650 border border-blue-500/15' :
                                'bg-purple-500/10 text-purple-600 border border-purple-500/15'
                              }`}>
                                {rec.type}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-gray-450">{rec.fileSize}</td>
                            <td className="p-3 font-mono">{rec.uploadDate}</td>
                            <td className="p-3 text-gray-500 dark:text-slate-350 italic">{rec.metadata || 'No additional diagnosis markers'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Health Timeline view */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-950 dark:text-slate-50 text-sm uppercase tracking-wider flex items-center gap-2">
                <SpreadsheetIcon className="w-5 h-5 text-emerald-600" />
                Customer Timeline: Rahul Verma
              </h3>
              <p className="text-[10px] text-gray-400">Integrated system lifecycle records of patient interactions, visits & dispensals.</p>
              
              <div className="relative border-l border-emerald-200 dark:border-emerald-950 ml-2.5 pl-5 space-y-4 py-2">
                {/* Event 1 */}
                <div className="relative">
                  <span className="absolute -left-7.5 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"><span className="w-1.5 h-1.5 rounded-full bg-white"></span></span>
                  <p className="text-[10px] font-bold text-slate-400 font-mono">2026-06-18 09:12</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Metformin Refill Dispatched</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-350">Recurring subscription trigger cycle #4 delivered to South Mumbai.</p>
                </div>
                {/* Event 2 */}
                <div className="relative">
                  <span className="absolute -left-7.5 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"><span className="w-1.5 h-1.5 rounded-full bg-white"></span></span>
                  <p className="text-[10px] font-bold text-slate-400 font-mono">2026-06-17 14:00</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Neural prescription OCR scanned</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-350">Prescription Rx #HL-9140 uploaded for Metformin + Atorvastatin.</p>
                </div>
                {/* Event 3 */}
                <div className="relative">
                  <span className="absolute -left-7.5 top-0.5 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"><span className="w-1.5 h-1.5 rounded-full bg-white"></span></span>
                  <p className="text-[10px] font-bold text-slate-400 font-mono">2026-06-11 11:30</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Full Metabolic Lab Profile Saved</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-350">HbA1c levels recorded at 7.1%. Liver panel normal.</p>
                </div>
                {/* Event 4 */}
                <div className="relative">
                  <span className="absolute -left-7.5 top-0.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"><span className="w-1.5 h-1.5 rounded-full bg-white"></span></span>
                  <p className="text-[10px] font-bold text-slate-400 font-mono">2026-03-04 10:00</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Allergy alert recorded</p>
                  <p className="text-[10px] text-red-500 font-semibold uppercase font-mono mt-0.5">Allergies: Penicillin & Glycopeptides</p>
                </div>
              </div>

              {/* CRM Loyalty Program */}
              <div className="border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-550 dark:text-amber-400" />
                  <h4 className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Swasthya CRM Rewards Log</h4>
                </div>
                <div className="text-[11px] space-y-1.5 text-slate-700 dark:text-slate-200">
                  <div className="flex justify-between">
                    <span>Loyalty Status Level:</span>
                    <span className="font-extrabold text-amber-600 uppercase font-mono">PLATINUM LEVEL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aarav Sharma Accumulated points:</span>
                    <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-450">750 Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Coupon code active:</span>
                    <span className="font-bold underline font-mono text-[9px] bg-white dark:bg-slate-905 px-1 py-0.5 rounded border">DIABETES-REFILL-10</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">System triggered automated Birthday greetings on SMS + customized 12% discount coupons to premium cohorts (14 active profiles).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Dispatch Order Board */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-805 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-slate-50 text-sm uppercase tracking-wider">Home Delivery Fleet Dispatch</h3>
                    <p className="text-[11px] text-gray-400">Secure delivery boy allocation, live coordinate telemetry & patient safety OTP proofing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddDelivery({
                    billId: "bill_2",
                    customerName: "Rahul Verma",
                    address: "411, Oberoi Palms, Goregaon East, Mumbai",
                    phone: "9123456789",
                    notes: "Urgent diabetic monitoring pack delivery",
                    deliveryCharge: 50
                  })}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs whitespace-nowrap"
                >
                  + Add Delivery Trip
                </button>
              </div>

              {/* Deliveries list */}
              {dbData.deliveries.length === 0 ? (
                <div className="p-8 text-center text-gray-450 border border-dashed border-gray-150 rounded-xl text-[11px] bg-slate-50 dark:bg-slate-955/25">
                  No active home dispatches registered. Click the "+ Add Delivery Trip" to initiate secure transport cycles.
                </div>
              ) : (
                <div className="space-y-3">
                  {dbData.deliveries.map(del => (
                    <div key={del.id} className="border border-gray-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px]">
                      <div className="space-y-1 text-slate-800 dark:text-slate-150">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabolt text-slate-955 dark:text-white text-xs">{del.customerName}</span>
                          <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 font-bold uppercase">{del.id}</span>
                        </div>
                        <p className="text-gray-400 mt-0.5"><span className="font-bold">Locality:</span> {del.address}</p>
                        <p className="text-gray-400"><span className="font-bold">Contact:</span> {del.phone}</p>
                        {del.notes && <p className="text-emerald-600 dark:text-emerald-450 font-medium italic">"{del.notes}"</p>}
                        <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-gray-450">
                          <span>Dispatch fees: ₹{del.deliveryCharge}</span>
                          <span>Bearer: {del.deliveryBoyName || 'Unassigned'}</span>
                          <span className="text-orange-500 font-black">Authentication Code: OTP-[ {del.otp} ]</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 text-[9px] font-black uppercase rounded ${
                            del.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            del.status === 'out_for_delivery' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-450'
                          }`}>
                            {del.status}
                          </span>
                        </div>

                        {del.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(del.id, 'out_for_delivery')}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                          >
                            Out for delivery
                          </button>
                        )}
                        {del.status === 'out_for_delivery' && (
                          <button
                            onClick={() => {
                              const typedOtp = prompt(`Confirm client authentication receipt PIN (OTP displayed: ${del.otp})`);
                              if (typedOtp) {
                                handleUpdateDeliveryStatus(del.id, 'delivered', typedOtp);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                          >
                            Sign delivery via OTP
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medicine Reservation System */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-805 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-slate-50 text-sm uppercase tracking-wider">Pharmacy Medicine Reservation lock</h3>
                    <p className="text-[11px] text-gray-400">Lock critical medicines for 24-48 hours. Auto-release inventory on expiration.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddReservation({
                    customerId: 'cust_2',
                    customerName: 'Priya Patel',
                    customerPhone: '9123456789',
                    medicineId: medicines[0]?.id || 'med_1',
                    medicineName: medicines[0]?.name || 'Paracetamol 500mg',
                    quantityReserved: 5,
                    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                  })}
                  className="px-3 py-1.5 bg-slate-955 text-white hover:bg-slate-850 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs border border-emerald-500/25"
                >
                  + Create Reservation
                </button>
              </div>

              {dbData.reservations.length === 0 ? (
                <div className="p-6 text-center text-gray-450 border border-dashed border-gray-150 rounded-xl text-[11px] bg-slate-50/50">
                  No active inventory holds. Create a hold logic for high-demand medications.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-150 dark:border-slate-805 rounded-xl">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-black font-mono tracking-wider border-b border-gray-150">
                        <th className="p-3">Customer Code</th>
                        <th className="p-3">Medication</th>
                        <th className="p-3">Qty Locked</th>
                        <th className="p-3">Hold expiry count</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-805">
                      {dbData.reservations.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200">
                          <td className="p-3 font-semibold text-slate-950 dark:text-white">
                            <span>{res.customerName}</span>
                            <span className="block text-[9px] text-gray-400 font-mono italic">{res.customerPhone}</span>
                          </td>
                          <td className="p-3 font-semibold">{res.medicineName}</td>
                          <td className="p-3 font-mono font-black text-slate-900 dark:text-white">{res.quantityReserved} Packs</td>
                          <td className="p-3 text-red-500 font-mono font-bold tracking-tight">Expires inside (48 Hrs lock)</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {res.status}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                fetch(`/api/enterprise/reservations/${res.id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'completed' })
                                }).then(async (r) => {
                                  if (r.ok) {
                                    await fetchEnterpriseData();
                                    alert("✓ Hold released and reconciled to POS ledger.");
                                  }
                                });
                              }}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[9px] uppercase font-bold mr-1 cursor-pointer hover:bg-emerald-500 transition-all"
                            >
                              Confirm Pickup
                            </button>
                            <button
                              onClick={() => {
                                fetch(`/api/enterprise/reservations/${res.id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'cancelled' })
                                }).then(async (r) => {
                                  if (r.ok) {
                                    await fetchEnterpriseData();
                                    alert("✓ Reservation release command processed. Inventory returned immediately.");
                                  }
                                });
                              }}
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-850 text-slate-650 hover:bg-red-50 hover:text-red-650 rounded text-[9px] uppercase font-bold cursor-pointer transition-all border border-slate-300/10"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Boy Telemetry & Subscription Medicines Tracker */}
          <div className="space-y-6">
            {/* Live Telemetry Map Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-905 dark:text-slate-50 text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 animate-bounce" />
                Live delivery location telemetry
              </h3>
              
              <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-xl relative overflow-hidden border border-gray-150 dark:border-slate-805 flex items-center justify-center select-none group">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-10"></div>
                
                {/* Mock Roads Grid */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="h-0.5 w-full bg-slate-300/30"></div>
                  <div className="h-0.5 w-full bg-slate-300/30"></div>
                  <div className="h-0.5 w-full bg-slate-300/30"></div>
                </div>
                <div className="absolute inset-0 flex justify-between p-4 pointer-events-none">
                  <div className="w-0.5 h-full bg-slate-300/30"></div>
                  <div className="w-0.5 h-full bg-slate-300/30"></div>
                  <div className="w-0.5 h-full bg-slate-300/30"></div>
                </div>

                {/* Plot delivery marks */}
                <div className="absolute top-1/3 left-1/3 text-center space-y-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white animate-pulse flex items-center justify-center text-[8px] font-bold text-white text-sans shadow-xs cursor-pointer" title="Amit-Active Delivery Boy">D1</div>
                  <span className="text-[8px] font-mono font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded backdrop-blur-xs block whitespace-nowrap">Amit (Busy - Chembur Path)</span>
                </div>

                <div className="absolute bottom-1/4 right-1/4 text-center space-y-1">
                  <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white animate-pulse flex items-center justify-center text-[8px] font-mono text-white shadow-xs cursor-pointer" title="Randeep-Out for Delivery">D2</div>
                  <span className="text-[8px] font-mono font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded backdrop-blur-xs block whitespace-nowrap">Randeep (OTP phase)</span>
                </div>

                <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-905 text-slate-650 dark:text-slate-300 border px-2 py-1 rounded-md shadow-xs absolute top-2 right-2 relative pointer-events-none">Mumbai Hub • Google Maps API Ready</span>
              </div>

              {/* Delivery Staff Fleet Checklist */}
              <div className="text-[11px] space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 dark:text-indigo-250 uppercase tracking-wider">Dispatch roster status</h4>
                <div className="space-y-1.5 font-mono text-slate-700 dark:text-slate-305">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-905 p-2 rounded border border-gray-150 dark:border-slate-805">
                    <span>🚴 Amit Kumar (Mumbai-91)</span>
                    <span className="text-amber-600 font-extrabold text-[9px] uppercase">BUSY (DELIVERING)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-905 p-2 rounded border border-gray-150 dark:border-slate-805">
                    <span>🚴 Randeep Hooda (Mumbai-43)</span>
                    <span className="text-amber-550 font-extrabold text-[9px] uppercase">OTP VERIFICATION IN PROGRESS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription & Chronic medication auto-fulfillment panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-905 dark:text-slate-50 text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Subscription & auto-reminders (Chronic Care)
              </h3>
              <p className="text-[10px] text-gray-400">Manage monthly recurring prescriptions (Diabetes, Hypertension, Vitamin packs) with automated pipeline invoices.</p>

              <button
                onClick={() => handleAddSubscription({
                  customerId: 'cust_1',
                  customerName: 'Aarav Sharma',
                  customerPhone: '9876543210',
                  medicineId: medicines[0]?.id || 'med_1',
                  medicineName: 'Metformin HCl 500mg (Regular Refill)',
                  quantityPerRefill: 30,
                  intervalDays: 30,
                  nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                })}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase rounded-lg text-[10px] tracking-wider cursor-pointer shadow-xs whitespace-nowrap text-center border mr-2"
              >
                + Schedule Chronic care subscription
              </button>

              {dbData.subscriptions.length === 0 ? (
                <div className="p-4 rounded-xl text-center text-gray-450 italic text-[11px] bg-slate-50">
                  No subscription models currently active.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {dbData.subscriptions.map(sub => (
                    <div key={sub.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/20 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-xs font-black text-slate-955 dark:text-slate-105">
                        <span>{sub.customerName}</span>
                        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded font-extrabold">AUTO BILL ACTIVE</span>
                      </div>
                      <p className="text-gray-400 font-medium">Cycle: {sub.medicineName} • every {sub.intervalDays} Days</p>
                      <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-gray-150">
                        <span className="text-gray-450">Next bill target:</span>
                        <span className="text-emerald-600 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">{sub.nextRefillDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="bg-slate-950 text-white border border-red-500/25 rounded-2xl p-6 space-y-6">
          {/* Header warning indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-red-600 text-white animate-ping rounded-full shrink-0 flex items-center justify-center relative w-10 h-10">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-lg uppercase tracking-widest text-[16px] text-red-500 flex items-center gap-2">
                  Swasthya Emergency Rapid Mode (ER-CON)
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Minimal low-bandwidth responsive UI optimized for high-volume disasters or emergency triage</p>
              </div>
            </div>
            
            <span className="px-3 py-1.5 bg-red-950/50 border border-red-600/30 text-red-400 text-xs font-black uppercase rounded-lg font-mono animate-pulse shrink-0 text-center">
              ▲ PRIORITIZED DISASTER PROTOCOL LEVEL 1 ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick action pad */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-red-400"> Triage emergency medicine bypass keys</h4>
              <p className="text-[11px] text-slate-450 leading-relaxed">Instantly checkout pre-batched crisis inventory (Dextrose, Epi, Aspirin) without scanning or billing queue delays.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => alert("🚨 Triage: Added 5 x Epinephrine (Adrenaline) 1mg Vials into bypass emergency cart.")}
                  className="p-4 bg-red-955 border border-red-600/40 hover:bg-red-800 hover:border-red-500 rounded-xl space-y-1.5 transition-all text-left group cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-red-100 block">EPINEPHRINE 1MG</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: ICU-01 • Stock: 40 Vials</span>
                  <span className="text-[10px] font-bold text-red-400 font-mono inline-block pt-1 uppercase">★ Tap to Add (₹12.00)</span>
                </button>

                <button
                  onClick={() => alert("🚨 Triage: Added 10 x Aspirin 75mg rapid disolving packs into emergency cart.")}
                  className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 rounded-xl space-y-1.5 transition-all text-left group cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-blue-100 block">ASPIRIN 75MG</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: A-11 • Stock: 220 Packs</span>
                  <span className="text-[10px] font-bold text-blue-400 font-mono inline-block pt-1 uppercase">★ Tap to Add (₹3.50)</span>
                </button>

                <button
                  onClick={() => alert("🚨 Triage: Added 2 x Atropine Sulfate 0.6mg injections into emergency cart.")}
                  className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-705 rounded-xl space-y-1.5 transition-all text-left group cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-amber-100 block">ATROPINE SULFATE</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: ICU-03 • Stock: 18 Vials</span>
                  <span className="text-[10px] font-bold text-amber-400 font-sans inline-block pt-1 uppercase">★ Tap to Add (₹25.00)</span>
                </button>

                <button
                  onClick={() => alert("🚨 Triage: Added 10 x Amoxicillin 250mg packs into emergency cart.")}
                  className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl space-y-1.5 transition-all text-left group cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-slate-205 block">AMOXICILLIN 250</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: B-04 • Stock: 14 Packs</span>
                  <span className="text-[10px] font-bold text-slate-450 font-sans inline-block pt-1 uppercase">★ Tap to Add (₹18.20)</span>
                </button>

                <button
                  onClick={() => alert("🚨 Triage: Added 10 syringes of Naloxone Hydrochloride 0.4mg into emergency cart.")}
                  className="p-4 bg-red-955 border border-red-650/30 hover:bg-red-900 rounded-xl space-y-1.5 transition-all text-left cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-red-105 block">NALOXONE HCL</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: Toxic-09 • Stock: 10 Vials</span>
                  <span className="text-[10px] font-bold text-red-400 font-mono inline-block pt-1 uppercase">★ Tap to Add (₹85.00)</span>
                </button>

                <button
                  onClick={() => alert("🚨 Triage: Added 1 x Glucose/Dextrose 5% 500ml drip stack into emergency cart.")}
                  className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl space-y-1.5 transition-all text-left cursor-pointer"
                >
                  <span className="text-xs font-black uppercase text-slate-205 block">DEXTROSE 5% 500ML</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Rack: R-25 • Stock: 110 Bottles</span>
                  <span className="text-[10px] font-bold text-slate-450 font-sans inline-block pt-1 uppercase">★ Tap to Add (₹55.00)</span>
                </button>
              </div>

              {/* Offline backup manual input checkout */}
              <div className="bg-slate-900 rounded-xl p-4 space-y-3 border border-slate-800">
                <h4 className="text-[11px] uppercase font-black tracking-wider text-red-400">Offline state data synchronization controller</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Swasthya OS tracks offline operations automatically. When connection dropouts trigger, transactions continue transparently using browser-local SQLite replicas. Once reconnection is established, synchronization aggregates balances safely.</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => alert("✓ Offline database sync: Sync engines successfully dispatched 14 backlogged records to central master node.")}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase rounded-lg text-[10px] tracking-wider transition-colors cursor-pointer border border-emerald-500/20"
                  >
                    Force Data Re-Sync
                  </button>
                  <button
                    onClick={() => alert("✓ Re-verified checksum parity with SQLite cluster blocks.")}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold uppercase rounded-lg text-[10px] transition-colors border border-slate-700 cursor-pointer"
                  >
                    Check Parity
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Stats Sidecard */}
            <div className="bg-slate-900 border border-red-500/10 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Priority Crisis Allocations</h4>
              
              <div className="space-y-3 font-mono text-[10px]">
                <div className="space-y-1">
                  <span className="text-slate-400 block">Critical Oxygen Supply Level:</span>
                  <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-800">
                    <div className="bg-emerald-500 h-full w-[85%]"></div>
                  </div>
                  <span className="text-emerald-400 font-bold block pt-0.5">85% Standard Reservoir Normal</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">Anti-Snake Venoms (ASV):</span>
                  <div className="w-full bg-slate-950 h-2 rounded overflow-hidden border border-slate-800">
                    <div className="bg-red-550 h-full w-[12%]"></div>
                  </div>
                  <span className="text-red-500 font-extrabold block pt-0.5">12% CRITICAL DEPLETION LEVEL</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">Emergency Defibrillators:</span>
                  <span className="text-emerald-400 font-bold block">✓ 2 Units Standby Ready</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-sans font-bold block mb-1">Government/Triage Hotlines:</span>
                  <p className="text-[11px] font-sans font-bold text-red-400">🚑 Cardiac Response Ambulance: 108</p>
                  <p className="text-[11px] font-sans font-bold text-orange-400">🚨 Poison Control India National: 1800-116-117</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Supplier Marketplace Bid Evaluation */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-805 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-slate-50 text-sm uppercase tracking-wider">B2B Supplier Evaluation Engine</h3>
                    <p className="text-[11px] text-gray-400">Compare quote bids dynamically based on pricing, deliverability, and past compliance scores.</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-950 border border-emerald-500/20 text-emerald-600 rounded-md font-bold uppercase font-mono">Neural Bids Analyst</span>
              </div>

              {/* Comparator Table */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <p className="text-[10px] text-gray-400 mb-2 font-sans">Evaluating quote prices for: <span className="font-extrabold text-slate-900 dark:text-white">Amoxicillin Trio-Active Complex</span></p>
                
                <div className="overflow-x-auto border border-gray-150 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-350 uppercase border-b border-gray-150">
                        <th className="p-3">Vendor Name</th>
                        <th className="p-3">Quote/Pack</th>
                        <th className="p-3">Delivery Leadtime</th>
                        <th className="p-3">Quality Score</th>
                        <th className="p-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-805 text-slate-800 dark:text-slate-200">
                      <tr className="hover:bg-emerald-500/5 transition-all bg-emerald-500/5">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">★ Swasth Generics (GJ)</td>
                        <td className="p-3 font-extrabold text-teal-650 dark:text-teal-400">₹8.50</td>
                        <td className="p-3">12 Hrs (Rapid)</td>
                        <td className="p-3 text-amber-500 font-bold">98% Quality Rating</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-black uppercase tracking-wider">ALGO RECOMMENDED</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3">Metro Med Solutions</td>
                        <td className="p-3">₹12.00</td>
                        <td className="p-3">24 Hrs</td>
                        <td className="p-3">91% Quality Rating</td>
                        <td className="p-3"><span className="text-gray-400 uppercase text-[9px] font-bold">Standard alternative</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3">Hindustan Pharma Ltd</td>
                        <td className="p-3">₹9.00</td>
                        <td className="p-3">48 Hrs</td>
                        <td className="p-3">82% Quality Rating</td>
                        <td className="p-3"><span className="text-gray-400 uppercase text-[9px] font-bold">Secondary vendor</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => alert("✓ Algorithmic purchase requisition routed straight to Swasth Generics terminal for Amoxicillin dispatch.")}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase rounded-lg text-[10px] tracking-wider transition-all cursor-pointer border"
                  >
                    Disburse algorithmically recommended PO
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Shelf allocation map & Empty Suggestor */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-905 dark:text-slate-50 text-sm uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                Shelf utilization map
              </h3>
              <p className="text-[10px] text-gray-400">Algorithmic fast-moving rack suggestions & expiry zone allocations.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono">
                <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-sans font-bold">Shelf Tier A (Fast Racks):</span>
                  <span className="text-indigo-650 dark:text-indigo-400 font-extrabold uppercase">88% Occupancy</span>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded mt-1 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[88%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-sans font-bold font-mono">Shelf Tier B (Expiries):</span>
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold uppercase">12% EXP CRYPTO</span>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded mt-1 overflow-hidden">
                    <div className="bg-teal-400 h-full w-[12%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-sans font-bold">Overflow Storages:</span>
                  <span className="text-red-500 font-extrabold uppercase font-mono">94% FULL LIMIT</span>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded mt-1 overflow-hidden">
                    <div className="bg-red-550 h-full w-[94%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-sans font-bold">Safety Quarantines:</span>
                  <span className="text-amber-500 font-extrabold uppercase font-mono">✓ empty</span>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded mt-1 overflow-hidden">
                    <div className="bg-emerald-400 h-full w-0"></div>
                  </div>
                </div>
              </div>

              {/* Dynamic Shelf suggest card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-gray-150 dark:border-slate-805 rounded-xl space-y-1.5 text-[11px] text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                <p className="font-bold text-slate-905 dark:text-silver-100 flex items-center gap-1.5 text-[12px]">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Neuromorphic Placement Suggestion:
                </p>
                <p>Because <strong className="text-slate-955 dark:text-white">ORS packets</strong> have a 3X surge metric recorded inside Monsoon profiles, we recommend relocating stocks from backup zone warehouse floor #3 directly down to <strong className="text-emerald-600">Front counter rack A-12</strong>. This optimizes checkout latency and protects physical strain profiles of counter pharmacists by 18%.</p>
              </div>
            </div>
          </div>

          {/* Noticeboard Messaging chat & stock branch allocation transfers */}
          <div className="space-y-6">
            {/* Communication Notice board chat widget */}
            <div className="bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                Staff Internal Telegram chat wire
              </h3>
              
              {/* Chat timeline feed details */}
              <div className="h-44 overflow-y-auto space-y-3.5 pr-2 font-sans scrollbar-thin scrollbar-thumb-slate-850">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-405">
                    <span className="font-black text-amber-400">🚨 Dr. Sarah Mitchell (Admin)</span>
                    <span>09:30</span>
                  </div>
                  <p className="text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-100 leading-relaxed">Please pay utmost attention to expirying drug lists. All batches of Pfizer Insulin expiring next week must be recalled and returned to the depot before final audits on Tuesday.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-405">
                    <span className="font-black text-teal-400">James Cooper (Pharmacist)</span>
                    <span>10:12</span>
                  </div>
                  <p className="text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-100 leading-relaxed">Understood doctor. Discharging insulin holds right away and reconciling shelf tier A.</p>
                </div>
              </div>

              {/* Chat action message */}
              <div className="flex gap-2 font-mono">
                <input
                  type="text"
                  id="internalChatMsg"
                  placeholder="Broadcast message to counter..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = document.getElementById('internalChatMsg') as HTMLInputElement;
                      if (input && input.value) {
                        alert(`Dispatched memo to master console: "${input.value}"`);
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('internalChatMsg') as HTMLInputElement;
                    if (input && input.value) {
                      alert(`Dispatched memo to master console: "${input.value}"`);
                      input.value = '';
                    }
                  }}
                  className="px-3 bg-teal-500 hover:bg-teal-400 text-black font-extrabold uppercase rounded-lg text-xs cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Inventory Branch allocation transfer log */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-955 dark:text-slate-50 text-xs uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                Branch Stock inventory transfers
              </h3>
              
              <button
                onClick={() => handleAddTransfer({
                  medicineId: 'med_2',
                  medicineName: 'Amoxicillin 250mg',
                  batchNumber: 'AM-2026-04',
                  quantityTransferred: 20,
                  notes: 'Settle shortage in Colaba Main branch outlet'
                })}
                className="w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase font-black tracking-wider transition-colors border shadow-xs cursor-pointer rounded-xl"
              >
                + Request stock transfer
              </button>

              {dbData.transfers.length === 0 ? (
                <div className="p-4 text-center text-gray-400 italic text-[11px] bg-slate-50 rounded-xl border border-dashed">
                  No active stock transfers registered.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {dbData.transfers.map(tr => (
                    <div key={tr.id} className="border border-gray-150 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/20 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white">
                        <span>{tr.medicineName}</span>
                        <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded uppercase font-bold text-slate-650">{tr.status}</span>
                      </div>
                      <p className="text-gray-450">Route: {tr.fromBranch} → {tr.toBranch}</p>
                      <p className="text-gray-450">Qty: {tr.quantityTransferred} Packs • Batch: {tr.batchNumber}</p>
                      {tr.notes && <p className="italic text-slate-500 text-[10px]">"{tr.notes}"</p>}
                      {tr.status === 'requested' && (
                        <div className="pt-2 flex gap-1.5">
                          <button
                            onClick={() => handleUpdateDeliveryStatus(tr.id, 'approved')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[9px] uppercase font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateDeliveryStatus(tr.id, 'rejected')}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-805 text-slate-600 rounded text-[9px] uppercase font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecasting' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Forecasting & analytics with charts */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-black text-slate-955 dark:text-slate-50 text-sm uppercase tracking-wider">Business revenue predictive forecasting</h3>
                    <p className="text-[11px] text-gray-400">Predict future monthly sales performance using polynomial regressions & seasonality scores</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-650 text-[10px] font-black rounded-lg border uppercase font-mono">Neural ML forecasting</span>
              </div>

              {/* Chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Jan 26', actual: 45000, projected: 45000 },
                    { name: 'Feb 26', actual: 48000, projected: 49000 },
                    { name: 'Mar 26', actual: 52000, projected: 54000 },
                    { name: 'Apr 26', actual: 49000, projected: 51000 },
                    { name: 'May 26', actual: 61000, projected: 60000 },
                    { name: 'Jun 26', actual: 64000, projected: 65000 },
                    { name: 'Jul 26', actual: null, projected: 72000 },
                    { name: 'Aug 26', actual: null, projected: 78000 },
                  ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px', background: '#0f172a', border: 'none', color: '#fff', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAct)" name="Actual turnover (₹)" />
                    <Area type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorProj)" name="ML Seasonality forecast (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Seasonal disease forecasting card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                <div className="bg-blue-500/5 border border-blue-550/20 p-4 rounded-xl space-y-1 font-sans">
                  <h4 className="font-extrabold text-blue-650 uppercase text-[12px] tracking-wider flex items-center gap-1">
                    <Radio className="w-4 h-4 text-blue-505" />
                    Monsoon (Monsoon Disease) Surge warning
                  </h4>
                  <p className="text-gray-450 mt-1">Algorithmic seasonal scans indicate a 40% surge in mosquito-borne pathogens (Malaria/Dengue). We recommend pre-booking inventory of: Paracetamol, ORS packets, and antihistamines.</p>
                </div>

                <div className="bg-amber-500/5 border border-amber-550/20 p-4 rounded-xl space-y-1 font-sans">
                  <h4 className="font-extrabold text-amber-600 uppercase text-[12px] tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-505" />
                    Batch Recall Prevention signals
                  </h4>
                  <p className="text-gray-450 mt-1">If a doctor or regulatory authority recalls a medical batch (particulate impurities or formula misalignments), registering it here instantly locks checkout registers in POS workspace.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recalls database & AI fraud auditor alerts */}
          <div className="space-y-6">
            {/* Recall Center */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-red-500 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
                Recall Block list Register
              </h3>
              
              <button
                onClick={() => handleAddRecall({
                  medicineId: 'med_1',
                  medicineName: 'Paracetamol 500mg',
                  batchNumber: 'PR-2026-99',
                  manufacturer: 'GSK Pharmaceuticals',
                  reason: 'Inadvertent label degradation reporting.'
                })}
                className="w-full text-center py-2 bg-red-955 hover:bg-red-900 border border-red-505/20 text-red-301 text-[10px] uppercase font-black cursor-pointer rounded-xl"
              >
                🚨 TRIGGER BLACKLIST DRUG DEFECT SIGNAL
              </button>

              {dbData.recalls.length === 0 ? (
                <div className="p-4 text-center text-gray-455 text-[11px] border border-dashed rounded-xl bg-slate-50">
                  No active recall containment locks registered. Run simulation above to see register response.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-[11px]">
                  {dbData.recalls.map(rec => (
                    <div key={rec.id} className="border border-red-150 bg-red-500/5 p-3 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center font-bold text-red-600">
                        <span>{rec.medicineName}</span>
                        <span className="text-[10px] bg-red-650 text-white font-black px-1 rounded uppercase">LOCKED</span>
                      </div>
                      <p className="text-slate-500">Batch Number: {rec.batchNumber} • Maker: {rec.manufacturer}</p>
                      <p className="text-red-500 font-extrabold">Impurity code block: "{rec.reason}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Fraud auditor */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-[11px] space-y-3.5">
              <h3 className="font-black text-xs uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-400" />
                Neural Pharmacy Fraud & compliance auditor
              </h3>
              <p className="text-[10px] text-slate-400">Dynamic scanner watching cash registers, anomalous overrides & regulatory licensing compliance.</p>

              <div className="space-y-2.5 font-mono text-[10px]">
                <div className="flex items-start gap-2 text-rose-450 bg-rose-950/10 border border-rose-500/20 p-2.5 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-black block text-rose-300">Anomalous high discount alert</span>
                    <span className="text-slate-400 block mt-0.5">Pharmacist processed a 40% absolute override on Rx #912</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-amber-500 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-black block text-slate-100">Schedule H Compliance Check</span>
                    <span className="text-slate-400 block mt-0.5">All dispensed antibiotics have doctor license number checks (Aadhaar/MR) locked.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'signage' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pharmacy Patient Digital Signage Display */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs text-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-teal-400 animate-pulse" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-100">Patient counter digital signage board</h3>
                    <p className="text-[11px] text-slate-400">Render current queue numbers, promotion notifications, health tips & weather overlays for consumer display monitor</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-black rounded-lg border border-teal-550/20 uppercase font-mono">HDMI output source</span>
              </div>

              {/* TV Signage Layout Mock */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 aspect-video flex flex-col justify-between font-sans select-none relative group">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Header overlay */}
                <div className="flex justify-between items-center border-b border-slate-805 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">SWASTHYA COUNTER 01</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">18 June 2026 • Mumbai, MH</span>
                </div>

                {/* Main TV split screen layout bento */}
                <div className="grid grid-cols-5 gap-4 py-2">
                  {/* Queue segment */}
                  <div className="col-span-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Queue Position</span>
                    <span className="text-3xl font-black text-white font-mono block tracking-tight">K-481</span>
                    <span className="text-[9px] uppercase font-bold text-teal-400 block mt-1">Please Wait • Billing terminal 3</span>
                  </div>

                  {/* Promotion loop */}
                  <div className="col-span-3 bg-gradient-to-r from-emerald-950/20 to-slate-900/60 p-4 rounded-xl border border-emerald-500/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider font-mono">Wellness offer of the day</span>
                      <h4 className="text-sm font-bold text-slate-50 mt-1 max-w-[200px]">Free Cholesterol checkup package on vaccine holds</h4>
                    </div>
                    <p className="text-[9px] text-slate-450 leading-relaxed mt-2 italic">*Present your HIPAA locker QR-key to counter personnel for instant checkout coupon activation.</p>
                  </div>
                </div>

                {/* Footer marquee tape */}
                <div className="border-t border-slate-805 pt-3 flex items-center justify-between text-[9px] tracking-wide text-slate-400 uppercase font-mono">
                  <span>★ Health Tip: Maintain adequate hydration levels during high summer index periods</span>
                  <span className="text-emerald-400 font-bold">✓ Curewell Digital Pharmacy upgrade complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task manager checklist & quizzes */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-slate-950 dark:text-slate-50 text-xs uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                Staff task & daily sops checklist
              </h3>
              <p className="text-[10px] text-gray-400">Assign task logs, expiry schedules & clean checklists directly to terminal personnel.</p>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border text-[11px]">
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded cursor-pointer" />
                    <div>
                      <strong className="block text-slate-850 dark:text-white">Verify physical insulin temperature</strong>
                      <span className="text-gray-400 block font-mono text-[9px] mt-0.5">Assigned: Admin • Daily SOP</span>
                    </div>
                  </div>
                  <span className="text-emerald-550 font-bold font-mono">Done</span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border text-[11px]">
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded cursor-pointer" />
                    <div>
                      <strong className="block text-slate-850 dark:text-white">Perform variance audit: Rack B-04</strong>
                      <span className="text-gray-400 block font-mono text-[9px] mt-0.5">Deadline: Today • High priority</span>
                    </div>
                  </div>
                  <span className="text-amber-500 font-bold font-mono">Pending</span>
                </div>
              </div>

              {/* Learning portal snippet with quizzes */}
              <div className="border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400 animate-pulse" />
                  <h4 className="text-[11px] font-black uppercase text-indigo-605 dark:text-indigo-400">Pharmacy staff learning center</h4>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-350 leading-relaxed">Boost pharmacist competency and ensure zero prescription verification compliance errors using weekly interactive drug-drug interaction quizzes.</p>
                
                <button
                  onClick={() => alert("👨‍⚕️ Training Portal Question 1/5:\n\nIf the customer presents a prescription holding Metformin and Ramipril, what is the primary diagnostic warning overlay to cross-check in Swasthya POS?\n\n• (A) Renal pressure metrics checks\n• (B) Severe gastric latency spikes\n\nCorrect selection logged standard SOP certificate points.")}
                  className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold uppercase rounded-lg text-[10px] tracking-wider transition-colors cursor-pointer border shadow-xs"
                >
                  Launch staff training quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Humble utility component needed inside
function SpreadsheetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M8 13h2"/>
      <path d="M8 17h2"/>
      <path d="M14 13h2"/>
      <path d="M14 17h2"/>
    </svg>
  );
}
