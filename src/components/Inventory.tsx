import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  SlidersHorizontal,
  X,
  FileText,
  BadgePercent,
  Check,
  User,
  Shield,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';
import { Medicine } from '../types';

interface InventoryProps {
  medicines: Medicine[];
  onAddMedicine: (med: Partial<Medicine>) => Promise<any>;
  onUpdateMedicine: (id: string, med: Partial<Medicine>) => Promise<any>;
  onDeleteMedicine: (id: string) => Promise<any>;
}

// Fixed standard category selections
const INDIAN_CATEGORIES = [
  'General',
  'Analgesics',
  'Antibiotics',
  'Antidiabetics',
  'Cardiovascular',
  'Vitamins & Supplements',
  'Dermatologicals',
  'Inhalers & Respiratory'
];

export default function Inventory({ medicines, onAddMedicine, onUpdateMedicine, onDeleteMedicine }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'expired' | 'expiring_soon' | 'prescription'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [category, setCategory] = useState('General');
  const [manufacturer, setManufacturer] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('150');
  const [costPrice, setCostPrice] = useState('90');
  const [expiryDate, setExpiryDate] = useState('');
  const [rackNumber, setRackNumber] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('20');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Localized Indian specifics
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [hsnCode, setHsnCode] = useState('3004');
  const [gstRate, setGstRate] = useState('12');
  const [supplierName, setSupplierName] = useState('Sun Pharmaceutical Industries Ltd');
  const [barcode, setBarcode] = useState('');

  // Load Form for Edit
  const openModalForEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setName(med.name);
    setGenericName(med.genericName);
    setBatchNumber(med.batchNumber);
    setCategory(med.category);
    setManufacturer(med.manufacturer);
    setQuantity(med.quantity.toString());
    setPrice(med.price.toString());
    setCostPrice(med.costPrice.toString());
    setExpiryDate(med.expiryDate);
    setRackNumber(med.rackNumber);
    setLowStockThreshold(med.lowStockThreshold.toString());
    setStatus(med.status);
    
    // Fallback load defaults 
    setPrescriptionRequired(med.prescriptionRequired || false);
    setHsnCode(med.hsnCode || '3004');
    setGstRate((med.gstRate || 12).toString());
    setSupplierName(med.supplierName || 'Sun Pharmaceutical Industries Ltd');
    setBarcode(med.barcode || '');

    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setBatchNumber('');
    setCategory('General');
    setManufacturer('');
    setQuantity('100');
    setPrice('150.00');
    setCostPrice('90.00');
    
    // Set expiry 1-year from today by default
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    setExpiryDate(futureDate.toISOString().split('T')[0]);
    
    setRackNumber('Shelf A');
    setLowStockThreshold('15');
    setStatus('active');
    
    setPrescriptionRequired(false);
    setHsnCode('3004');
    setGstRate('12');
    setSupplierName('Sun Pharmaceutical Industries Ltd');
    setBarcode('');

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      genericName,
      batchNumber,
      category,
      manufacturer,
      quantity: Number(quantity),
      price: Number(price),
      costPrice: Number(costPrice),
      expiryDate,
      rackNumber,
      lowStockThreshold: Number(lowStockThreshold),
      status,
      prescriptionRequired,
      hsnCode,
      gstRate: Number(gstRate),
      supplierName,
      barcode
    };

    if (editingMedicine) {
      await onUpdateMedicine(editingMedicine.id, payload);
    } else {
      await onAddMedicine(payload);
    }
    setIsModalOpen(false);
  };

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  // Date thresholds
  const isExpiringSoon = (dateStr: string) => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const expDate = new Date(dateStr);
    return expDate >= today && expDate <= thirtyDaysLater;
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  // Indian format helpers
  const formatCurLocal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDateLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter and searches
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.hsnCode && m.hsnCode.includes(searchTerm));

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    let matchesFilterType = true;
    if (filterType === 'low_stock') {
      matchesFilterType = m.quantity <= m.lowStockThreshold;
    } else if (filterType === 'expired') {
      matchesFilterType = isExpired(m.expiryDate);
    } else if (filterType === 'expiring_soon') {
      matchesFilterType = isExpiringSoon(m.expiryDate);
    } else if (filterType === 'prescription') {
      matchesFilterType = m.prescriptionRequired === true;
    }

    return matchesSearch && matchesCategory && matchesFilterType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Search and Filters Layout */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by brand name, generic drug ingredient, batch number or HSN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50 focus:bg-white font-semibold text-gray-800 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={openModalForNew}
              id="btn-register-medicine"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-lg border border-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Indian Drug</span>
            </button>
          </div>
        </div>

        {/* Filters control row */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-50 gap-3">
          <div className="flex flex-wrap items-center gap-2 select-none">
            <div className="flex items-center gap-1 text-[10px] font-black text-gray-450 uppercase tracking-widest mr-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>
            
            {/* Specialty specialty filter dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-slate-50 text-gray-700 focus:outline-none focus:border-emerald-500 font-bold"
            >
              <option value="all">All Specialties</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Quick status tabs buttons */}
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'all' 
                  ? "bg-slate-900 text-white font-bold" 
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              All Drugs ({medicines.length})
            </button>
            <button
              onClick={() => setFilterType('prescription')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                filterType === 'prescription' 
                  ? "bg-red-500 text-white font-bold" 
                  : "bg-red-50 text-red-750 hover:bg-red-100"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Prescription (Rx) Required</span>
            </button>
            <button
              onClick={() => setFilterType('low_stock')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                filterType === 'low_stock' 
                  ? "bg-amber-600 text-white font-bold" 
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Low Stock ({medicines.filter(m => m.quantity <= m.lowStockThreshold).length})
            </button>
            <button
              onClick={() => setFilterType('expiring_soon')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                filterType === 'expiring_soon' 
                  ? "bg-rose-600 text-white font-bold" 
                  : "bg-rose-50 text-rose-750 hover:bg-rose-100"
              }`}
            >
              Expiring ({medicines.filter(m => isExpiringSoon(m.expiryDate)).length})
            </button>
            <button
              onClick={() => setFilterType('expired')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                filterType === 'expired' 
                  ? "bg-red-650 text-white font-bold" 
                  : "bg-red-50 text-red-800 hover:bg-red-100"
              }`}
            >
              Expired ({medicines.filter(m => isExpired(m.expiryDate)).length})
            </button>
          </div>
          <span className="text-[10px] uppercase font-black text-gray-400">
            {filteredMedicines.length} of {medicines.length} cataloged
          </span>
        </div>
      </div>

      {/* Grid of Medicines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-150 p-16 text-center rounded-xl">
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">No matching medicines</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Verify your active drug filters or create a new drug profile in the database registry using the button above.
            </p>
          </div>
        ) : (
          filteredMedicines.map(m => {
            const lowStock = m.quantity <= m.lowStockThreshold;
            const expired = isExpired(m.expiryDate);
            const expSoon = isExpiringSoon(m.expiryDate);

            return (
              <div 
                key={m.id} 
                className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-xs transition-all flex flex-col justify-between ${
                  expired ? "border-red-300 bg-red-50/5" :
                  expSoon ? "border-rose-300 bg-rose-50/5" :
                  lowStock ? "border-amber-300 bg-amber-50/5" :
                  "border-gray-100 hover:border-gray-200"
                }`}
                id={`medicine-card-${m.id}`}
              >
                {/* Visual Header */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight truncate">{m.name}</h4>
                        {m.prescriptionRequired && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1 rounded-sm tracking-wide shrink-0">
                            Rx Only
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-450 italic mt-0.5 truncate">{m.genericName || "Unclassified Composition"}</p>
                    </div>
                    
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider border ${
                      m.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-205'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-gray-600 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wide">HSN Code</span>
                      <span className="font-mono font-bold text-gray-850">{m.hsnCode || '3004'}</span>
                    </div>
                    
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wide">GST Rate (%)</span>
                      <span className="font-mono font-bold text-slate-800 flex items-center gap-0.5">
                        <BadgePercent className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{m.gstRate || 12}% GST</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wide">MRP Retail</span>
                      <span className="font-extrabold text-slate-900 text-xs">{formatCurLocal(m.price)}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wide">Rack Location</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{m.rackNumber || "Shelf A"}</span>
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wide">Authorized Supplier</span>
                      <p className="text-[11px] font-bold text-slate-755 truncate flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.supplierName || 'Sun Pharmaceutical'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stock or Expiry details */}
                  <div className="space-y-1.5 pt-3 border-t border-gray-100 select-all">
                    
                    {/* Quantity count */}
                    <div className="flex items-center justify-between text-xs font-bold bg-slate-50 p-2 rounded-lg">
                      <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wide">In-Stock Level</span>
                      <span className={`font-mono font-bold ${
                        m.quantity === 0 ? "text-red-650" :
                        lowStock ? "text-amber-600 animate-pulse" :
                        "text-emerald-700"
                      }`}>{m.quantity} Units</span>
                    </div>
                    
                    {/* Expiry count */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-450 font-bold uppercase text-[9px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Expiry Date</span>
                      </span>
                      <span className={`font-mono font-bold text-right ${
                        expired ? "text-red-700 bg-red-50 px-1 py-0.5 rounded border border-red-200" :
                        expSoon ? "text-rose-600 animate-pulse bg-rose-50 px-1 py-0.5 rounded border border-rose-205" :
                        "text-gray-700"
                      }`}>{formatDateLocal(m.expiryDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="bg-slate-50/50 px-5 py-3 border-t border-gray-100 flex items-center justify-between select-none">
                  <div className="flex items-center gap-1 text-[9px]">
                    {expired && (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded-sm font-black uppercase tracking-wider">
                        EXPIRED BATCH
                      </span>
                    )}
                    {!expired && expSoon && (
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        CRITICAL EXPIRY
                      </span>
                    )}
                    {!expired && lowStock && (
                      <span className="bg-amber-500 text-white px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        OUT-OF-STOCK ALERT
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openModalForEdit(m)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-blue-700 px-3 py-1.5 rounded-md font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 shrink-0" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove medication "${m.name}" from the Swasthya database?`)) {
                          onDeleteMedicine(m.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-650 rounded-md hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register/Edit Medicine Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white rounded-xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col justify-between my-8 animate-scaleUp">
            
            <div className="p-4 bg-slate-50 border-b border-gray-150 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {editingMedicine ? `Modify Medication Profile` : `Register New Indian Drug`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-150 text-gray-500 rounded-lg transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[82vh] text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Brand name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Brand Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Crocin Advance 500mg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Generic name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Generic Salt Composition (Chemical)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol / Acetaminophen IP"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Batch No */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Batch Number *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. CR-9920"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold text-gray-850 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Category Specialty selection */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Specialty Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  >
                    {INDIAN_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* HSN CODE */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">HSN Tax Code (GST compliance)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3004"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full text-xs font-mono font-bold text-gray-850 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Barcode/UPC */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Barcode Number / UPC (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 890100000001"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full text-xs font-mono font-bold text-gray-850 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* GST Tax Rate */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">CGST/SGST Slab (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full text-xs font-mono font-bold text-slate-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  >
                    <option value="5">5% GST (Essential Drugs)</option>
                    <option value="12">12% GST (Standard Medicines)</option>
                    <option value="18">18% GST (Nicotine & Cosmetics)</option>
                    <option value="28">28% GST (Specialty & Luxuries)</option>
                    <option value="0">0% Exempted GST</option>
                  </select>
                </div>

                {/* Distributor supplier */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Indian Distributor / Supplier</label>
                  <select
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  >
                    <option value="Sun Pharmaceutical Industries Ltd">Sun Pharmaceutical Industries Ltd</option>
                    <option value="Cipla Ltd wholesales">Cipla Wholesales Ltd</option>
                    <option value="Dr. Reddy's Laboratories">Dr. Reddy's Laboratories</option>
                    <option value="Mankind Pharma Supplier">Mankind Pharma Supplier</option>
                    <option value="Lupin Limited Distb">Lupin Limited Distb</option>
                    <option value="General Wholesale Distributors">General Wholesale Distributors</option>
                  </select>
                </div>

                {/* Prescription requirement */}
                <div className="col-span-2 flex items-center gap-2 py-2 bg-rose-50/50 px-3.5 rounded-lg border border-rose-100">
                  <input
                    type="checkbox"
                    id="prescriptionRequired"
                    checked={prescriptionRequired}
                    onChange={(e) => setPrescriptionRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-600 shrink-0 cursor-pointer"
                  />
                  <label htmlFor="prescriptionRequired" className="font-extrabold text-rose-800 cursor-pointer select-none">
                    Schedule H Drug Warning: prescription (Rx Only) required for billing checkout
                  </label>
                </div>

                {/* Manufacturer */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Manufacturer name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cipla Healthcare"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Shelf Rack room location */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Rack / Shelf Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Drawer C-04"
                    value={rackNumber}
                    onChange={(e) => setRackNumber(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Opening Stock Quantity *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Warning limit threshold */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Low Stock Warning Threshold *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="20"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Purchase Cost price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Wholesale Cost Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Selling price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">MRP Selling Price (₹ GST-Inc) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Expiration Expiry Date *</label>
                  <input 
                    type="date" 
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all font-mono"
                  />
                </div>

                {/* Active/Inactive */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Catalog Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full text-xs font-semibold text-slate-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg p-2.5 outline-hidden transition-all"
                  >
                    <option value="active">Active (Available for Bills)</option>
                    <option value="inactive">Suspended / Recalled</option>
                  </select>
                </div>

              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 select-none">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs border border-gray-200 hover:bg-slate-50 text-gray-500 hover:text-slate-850 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-colors border border-emerald-700 shadow-xs"
                >
                  {editingMedicine ? 'Apply Modification' : 'Register Med Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
