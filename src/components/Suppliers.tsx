import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  CheckCircle, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersProps {
  apiFetch: (path: string, options?: any) => Promise<any>;
}

export default function Suppliers({ apiFetch }: SuppliersProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/suppliers');
      setSuppliers(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch suppliers registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setGstin('');
    setDrugLicense('');
    setContactNumber('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingId(sup.id);
    setName(sup.name);
    setGstin(sup.gstin);
    setDrugLicense(sup.drugLicense);
    setContactNumber(sup.contactNumber);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);
      const payload = { name, gstin, drugLicense, contactNumber };
      
      if (editingId) {
        await apiFetch(`/suppliers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Supplier updated successfully.');
      } else {
        await apiFetch('/suppliers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Supplier registered successfully.');
      }
      
      setIsModalOpen(false);
      loadSuppliers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError('Failed to save supplier details. Check fields and try again.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove supplier "${name}" from the registry?`)) return;

    try {
      setError(null);
      await apiFetch(`/suppliers/${id}`, { method: 'DELETE' });
      setSuccessMsg('Supplier removed successfully.');
      loadSuppliers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError('Failed to remove supplier.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>Suppliers Registry (GSTIN & DL)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage Indian pharmaceutical wholesale distributorship certifications and tax codes
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="btn-add-supplier"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-emerald-700 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Supplier</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-bold select-all">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="bg-white p-20 rounded-xl border border-gray-100 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs text-gray-400 font-bold">Verifying wholesale linkages...</span>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white p-20 rounded-xl border border-gray-100 text-center text-gray-400">
          <Building className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xs font-bold text-gray-800 uppercase">No Suppliers Registered</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You have not registered any pharmaceutical suppliers yet. Press the button above to add default distributors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(sup => (
            <div 
              key={sup.id} 
              className="bg-white border border-gray-100 rounded-xl shadow-xs hover:shadow-xs transition-shadow p-5 flex flex-col justify-between space-y-4"
              id={`supplier-card-${sup.id}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 leading-tight pr-2">{sup.name}</h3>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold tracking-wider px-1.5 py-0.5 rounded-sm uppercase">
                        {sup.id}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(sup)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-all cursor-pointer"
                      title="Edit Supplier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id, sup.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-rose-50 transition-all cursor-pointer"
                      title="Remove Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold uppercase text-[9px] tracking-wide">GSTIN Limit</span>
                    <span className="font-mono text-gray-800 font-bold select-all">{sup.gstin || 'NOT DECLARED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold uppercase text-[9px] tracking-wide">Drug License</span>
                    <span className="font-mono text-gray-800 font-bold select-all text-right">{sup.drugLicense || 'NOT REGISTERED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold uppercase text-[9px] tracking-wide">Contact</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{sup.contactNumber || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-scaleUp">
            
            <div className="bg-slate-50 px-5 py-4 border-b border-gray-150 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {editingId ? 'Modify Distributor Profile' : 'Register Wholesale Supplier'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-slate-800 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Reddy's Laboratories"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">GSTIN Identifier (15 digit)</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  maxLength={15}
                  className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Drug License Certificate No.</label>
                <input
                  type="text"
                  placeholder="e.g. DL-12345/MUM"
                  value={drugLicense}
                  onChange={e => setDrugLicense(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Wholesale Contact / Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                />
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 border border-gray-200 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 rounded-lg transition-all cursor-pointer shadow-xs"
                >
                  {editingId ? 'Modify Record' : 'Register Distributor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
