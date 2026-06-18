import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit, 
  ShieldAlert, 
  Award, 
  Activity, 
  Phone, 
  Mail, 
  Check, 
  AlertCircle,
  Bell,
  HeartPulse
} from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
  token: string | null;
}

export default function Customers({ token }: CustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(50);
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [preferredMedicinesInput, setPreferredMedicinesInput] = useState('');
  const [refillRemindersActive, setRefillRemindersActive] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setLoyaltyPoints(50);
    setAllergies('');
    setChronicDiseases('');
    setMedicalHistory('');
    setPreferredMedicinesInput('');
    setRefillRemindersActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setLoyaltyPoints(c.loyaltyPoints);
    setAllergies(c.allergies || '');
    setChronicDiseases(c.chronicDiseases || '');
    setMedicalHistory(c.medicalHistory || '');
    setPreferredMedicinesInput(c.preferredMedicines?.join(', ') || '');
    setRefillRemindersActive(c.refillRemindersActive !== false);
    setIsModalOpen(true);
  };

  const saveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const bodyData = {
      name,
      phone,
      email,
      loyaltyPoints: Number(loyaltyPoints),
      allergies,
      chronicDiseases,
      medicalHistory,
      preferredMedicines: preferredMedicinesInput ? preferredMedicinesInput.split(',').map(s => s.trim()) : [],
      refillRemindersActive
    };

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this medical customer profile? This action deletes active drug safety allergy monitors.")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.allergies?.toLowerCase().includes(search.toLowerCase()) ||
    c.chronicDiseases?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500 animate-pulse" />
            Patient CRM & Chronic Care
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registry containing patient health histories, known pharmaceutical allergies, automatic refill trackers, and loyalty program point systems.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer border border-emerald-500/20 shadow-md shadow-emerald-500/5 hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4 text-emerald-450 text-emerald-400" />
          Add Customer profile
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/30 text-emerald-600 dark:text-emerald-405 text-emerald-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customers.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Patients CRM</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 text-rose-600 dark:text-rose-405 text-rose-500 rounded-xl animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {customers.filter(c => c.allergies && c.allergies !== "None" && c.allergies !== "").length}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Allergy Alert Rules</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/30 text-amber-600 dark:text-amber-405 text-amber-500 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {customers.filter(c => c.refillRemindersActive).length}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Refill Reminders Active</div>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-805 rounded-xl shadow-xs">
        <div className="p-4 border-b border-gray-150 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, phone, allergy hazard, or disease..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-800 rounded-lg text-xs pl-10 pr-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
            <span className="text-xs text-slate-500 font-mono">Loading patient profile registers...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-450 text-slate-400 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-350">No patient files found</h4>
            <p className="text-xs text-slate-400 mt-1">Register a new profile to track clinical histories.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/30 border-b border-gray-150 dark:border-slate-801 text-slate-500 dark:text-slate-400 font-display font-semibold text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Patient Account</th>
                  <th className="px-5 py-3">Allergies Status</th>
                  <th className="px-5 py-3">Chronic Diseases</th>
                  <th className="px-5 py-3 text-center">Refill Triggers</th>
                  <th className="px-5 py-3 text-center">Loyalty Tier</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-800 text-xs">
                {filteredCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors text-slate-700 dark:text-slate-350"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</div>
                        <div className="flex flex-col mt-1 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {c.phone}</span>
                          {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {c.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {c.allergies ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-950/20 px-2.5 py-1 rounded-lg w-max font-semibold text-[10px]">
                          <ShieldAlert className="w-3.5 h-3.5 animate-bounce" />
                          {c.allergies}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None logged</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.chronicDiseases ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-955/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-950/20 px-2.5 py-1 rounded-lg w-max font-semibold text-[10px]">
                          <Activity className="w-3.5 h-3.5" />
                          {c.chronicDiseases}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None logged</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.refillRemindersActive 
                          ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {c.refillRemindersActive ? 'ENABLED' : 'MUTED'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/25 text-purple-700 dark:text-purple-400 rounded-lg text-[11px] font-bold">
                        <Award className="w-3.5 h-3.5" />
                        {c.loyaltyPoints} pts
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 px-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 px-2 text-[11px] font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-150 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3 hover:text-emerald-500" />
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          className="p-1 px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-100 dark:border-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RETAIL PROFILE DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 font-sans p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-display">{editingCustomer ? 'Refit Patient Profile' : 'Register New Patient Profile'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">×</button>
            </div>

            <form onSubmit={saveCustomer} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Patient Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. rahul@verma.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Loyalty points</label>
                  <input
                    type="number"
                    value={loyaltyPoints}
                    onChange={e => setLoyaltyPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1">Drug Allergies & Chemical Hazards</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs, Macrolides"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-240 border-rose-300 dark:border-rose-950 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-rose-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider mb-1">Chronic Diseases & Clinical status</label>
                <input
                  type="text"
                  value={chronicDiseases}
                  onChange={e => setChronicDiseases(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Severe Asthma, Hypertension"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Detailed Patient Medical History</label>
                <textarea
                  value={medicalHistory}
                  onChange={e => setMedicalHistory(e.target.value)}
                  placeholder="Enter historical clinical reports, dosage restrictions, or pregnancy metrics..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Preferred Medicines (Comma-separated)</label>
                <input
                  type="text"
                  value={preferredMedicinesInput}
                  onChange={e => setPreferredMedicinesInput(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Lipitor 10mg"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-gray-150 dark:border-slate-850">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">Refill Automations</div>
                  <div className="text-[10px] text-slate-450 text-slate-400">Receive system alerts at the login dashboard for prescriptions</div>
                </div>
                <input
                  type="checkbox"
                  checked={refillRemindersActive}
                  onChange={e => setRefillRemindersActive(e.target.checked)}
                  className="w-4.5 h-4.5 text-emerald-600 border-gray-300 rounded-sm focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer font-bold border border-emerald-550 border-emerald-500/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
