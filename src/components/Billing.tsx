import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  User, 
  Phone, 
  Percent, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  MapPin,
  ClipboardCheck,
  Award,
  Barcode,
  QrCode
} from 'lucide-react';
import { Medicine, Bill, BillItem } from '../types';

interface BillingProps {
  medicines: Medicine[];
  onAddBill: (payload: any) => Promise<Bill | null>;
  currentUserFullname: string;
}

export default function Billing({ medicines, onAddBill, currentUserFullname }: BillingProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  
  // Invoice form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi'>('cash');
  
  // Prescription requirement verification
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);

  // Receipt modal state
  const [savedBill, setSavedBill] = useState<Bill | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Barcode scanning state
  const [barcodeScanTerm, setBarcodeScanTerm] = useState('');
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');

  // Active medicines selection list (with current stock)
  const activeMedicines = useMemo(() => {
    return medicines.filter(m => m.status === 'active' && m.quantity > 0);
  }, [medicines]);

  // Handle direct barcode search and add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeScanTerm.trim()) return;

    const matched = activeMedicines.find(m => m.barcode === barcodeScanTerm.trim());
    if (matched) {
      addItemToCart(matched);
      setScanSuccessMessage(`Success: Added ${matched.name} to billing cart!`);
      setScanErrorMessage('');
      setBarcodeScanTerm('');
      setTimeout(() => setScanSuccessMessage(''), 4000);
    } else {
      setScanErrorMessage(`Error: No active drug found with barcode "${barcodeScanTerm}".`);
      setScanSuccessMessage('');
      setTimeout(() => setScanErrorMessage(''), 4000);
    }
  };

  // Simulate a barcode scan for evaluation
  const handleSimulateScan = (code: string) => {
    const matched = activeMedicines.find(m => m.barcode === code);
    if (matched) {
      addItemToCart(matched);
      setScanSuccessMessage(`Simulated barcode scan: ${matched.name} added!`);
      setScanErrorMessage('');
      setBarcodeScanTerm('');
      setTimeout(() => setScanSuccessMessage(''), 4000);
    } else {
      setScanErrorMessage(`Simulated error: Barcode "${code}" is not in active stock.`);
      setScanSuccessMessage('');
      setTimeout(() => setScanErrorMessage(''), 4000);
    }
  };

  // Lookup results
  const searchedMedicines = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return activeMedicines.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, activeMedicines]);

  // Expiry check
  const isExpired = (expiryStr: string) => {
    return new Date(expiryStr) < new Date();
  };

  // Add Item to POS Cart
  const addItemToCart = (medicine: Medicine) => {
    if (isExpired(medicine.expiryDate)) {
      alert(`Safety Lock: "${medicine.name}" has expired on ${medicine.expiryDate} and cannot be dispensed.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.quantity) {
          alert(`Insufficient Stock: Only ${medicine.quantity} units of ${medicine.name} are available in total.`);
          return prev;
        }
        return prev.map(item => 
          item.medicine.id === medicine.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { medicine, quantity: 1 }];
      }
    });
    setSearchTerm(''); // Clear search
  };

  // Update Cart Quantity
  const updateQuantity = (medicineId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.medicine.id === medicineId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.medicine.quantity) {
            alert(`Insufficient Stock: Only ${item.medicine.quantity} units left.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { medicine: Medicine; quantity: number }[];
    });
  };

  // Remove Item
  const removeItemFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medicineId));
  };

  // Calculations (India Retail pricing: MRP is tax-inclusive)
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);
  }, [cart]);

  // Compute item-wise GST tax distributions
  const cgstAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const rate = item.medicine.gstRate || 12;
      const itemSum = item.medicine.price * item.quantity;
      const preTaxBase = itemSum / (1 + (rate / 100));
      const totalTax = itemSum - preTaxBase;
      return sum + (totalTax / 2); // CGST is 50%
    }, 0);
  }, [cart]);

  const sgstAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const rate = item.medicine.gstRate || 12;
      const itemSum = item.medicine.price * item.quantity;
      const preTaxBase = itemSum / (1 + (rate / 100));
      const totalTax = itemSum - preTaxBase;
      return sum + (totalTax / 2); // SGST is 50%
    }, 0);
  }, [cart]);

  const total = useMemo(() => {
    const discVal = Number(discount) || 0;
    return Math.max(0, subtotal - discVal);
  }, [subtotal, discount]);

  // Check if any drug in the cart is RX Only (requires verified prescription)
  const rxVerificationRequired = useMemo(() => {
    return cart.some(item => item.medicine.prescriptionRequired);
  }, [cart]);

  // Format currency
  const formatCurLocal = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  // Handle billing checkout
  const handleSubmitBill = async () => {
    if (cart.length === 0) {
      setErrorMessage('Billing cart is empty. Search and add items.');
      return;
    }

    if (rxVerificationRequired && !prescriptionVerified) {
      setErrorMessage('Verification Error: Cart contains Schedule H drugs. You must check the prescription verification checkbox to buy.');
      return;
    }

    const payload = {
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      customerAddress: customerAddress.trim() || 'General Retail Sale',
      customerAadhaar: customerAadhaar.trim() || 'N/A',
      discount: Number(discount) || 0,
      paymentMode,
      createdBy: currentUserFullname,
      items: cart.map(item => ({
        medicineId: item.medicine.id,
        quantity: item.quantity
      }))
    };

    try {
      setErrorMessage('');
      const billResult = await onAddBill(payload);
      if (billResult) {
        setSavedBill(billResult);
        // Reset POS fields
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerAadhaar('');
        setDiscount('0');
        setPaymentMode('cash');
        setPrescriptionVerified(false);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Server database rejected checkout request.');
    }
  };

  // Printing
  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Search and Cart section */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Dynamic Search */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <span className="text-lg font-black leading-none">₹</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">Pharmacy Billing Counter</h3>
                <p className="text-[11px] text-gray-400 font-medium">Add medications via classical search or instant barcodes</p>
              </div>
            </div>
            
            {/* Active notifications indicator inside POS */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-1 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              GATEWAY LIVE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Manual Search Column */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Manual Brand / Salt Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter brand name, molecular composition, or batch..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50 focus:bg-white font-semibold text-gray-800 transition-all"
                />

                {/* Suggestions drop card */}
                {searchTerm && (
                  <div className="absolute top-12 left-0 right-0 bg-white border border-gray-150 rounded-xl shadow-xl z-25 divide-y divide-gray-150 overflow-hidden font-sans">
                    {searchedMedicines.length === 0 ? (
                      <div className="p-5 text-center text-xs text-gray-400 font-bold">
                        No matching active medicine found. Confirm stock quantity is above 0 in catalog!
                      </div>
                    ) : (
                      searchedMedicines.map(med => (
                        <div 
                          key={med.id} 
                          onClick={() => addItemToCart(med)}
                          className="p-3 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between transition-colors text-xs select-none"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-extrabold text-slate-900 truncate leading-snug">{med.name}</p>
                              {med.prescriptionRequired && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-1 rounded-sm shrink-0">
                                  Rx Required
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5 animate-pulse-slow">
                              {med.genericName} • Batch: {med.batchNumber}
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="font-extrabold text-emerald-600 font-mono text-xs">{formatCurLocal(med.price)}</p>
                            <p className="text-[9px] text-gray-400 font-bold">
                              In: <span className="font-extrabold text-gray-700">{med.quantity} qty</span>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Scanner Column */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-purple-650 uppercase tracking-wider block flex items-center justify-between">
                <span>Fast Barcode Reader</span>
                <span className="text-[9px] text-gray-400 italic">USB Scanner Emulation Mode</span>
              </label>
              
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-3 w-4 h-4 text-purple-550 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Scan EAN/UPC barcode number here..." 
                    value={barcodeScanTerm}
                    onChange={(e) => setBarcodeScanTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs bg-purple-50/15 focus:bg-white font-mono font-bold text-gray-800 transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Scan
                </button>
              </form>

              {/* Feedback messages */}
              {scanSuccessMessage && (
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn select-none leading-tight">
                  ✓ {scanSuccessMessage}
                </div>
              )}
              {scanErrorMessage && (
                <div className="text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 animate-fadeIn select-none leading-tight">
                  ⚠ {scanErrorMessage}
                </div>
              )}

              {/* Emulator Triggers */}
              {!scanSuccessMessage && !scanErrorMessage && (
                <div className="text-[10px] select-none text-gray-400">
                  <span className="font-black text-gray-500 uppercase tracking-widest text-[9px] block mb-1">Click to simulate hardware scan:</span>
                  <div className="flex flex-wrap gap-1">
                    <button 
                      type="button"
                      onClick={() => handleSimulateScan("890100000001")}
                      className="px-2 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-extrabold text-gray-600 transition-colors border border-gray-200"
                    >
                      [Paracetamol]
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateScan("890100000002")}
                      className="px-2 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-extrabold text-gray-600 transition-colors border border-gray-200"
                    >
                      [Amoxicillin]
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateScan("890100000004")}
                      className="px-2 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[10px] font-extrabold text-gray-600 transition-colors border border-gray-200"
                    >
                      [Lipitor]
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSimulateScan("999999999999")}
                      className="px-2 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 rounded text-[10px] font-extrabold text-gray-600 transition-colors border border-gray-200"
                    >
                      [Unknown Drug]
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Products Cart List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-slate-50/40 select-none">
            <h4 className="text-xs font-black text-gray-950 uppercase tracking-widest">Active Sales Cart Items</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/50 text-gray-400 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-5">Product Brand</th>
                  <th className="p-3.5 text-center font-bold">GST (%)</th>
                  <th className="p-3.5 text-center">Batch No</th>
                  <th className="p-3.5 text-center">MRP Unit</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5 text-right">Cart Total</th>
                  <th className="p-3.5 pr-5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-gray-400 font-bold">
                      Sales billing cart is empty. Type in the molecular search bar above to pull medicine profiles.
                    </td>
                  </tr>
                ) : (
                  cart.map(({ medicine, quantity }) => (
                    <tr key={medicine.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-3.5 pl-5 font-extrabold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{medicine.name}</span>
                          {medicine.prescriptionRequired && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-1 rounded-sm uppercase tracking-wider">Rx Only</span>
                          )}
                        </div>
                        <span className="block text-[10px] font-bold text-gray-400 mt-0.5 truncate max-w-xs leading-relaxed italic">
                          {medicine.genericName || 'Nosalt'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">{medicine.gstRate || 12}%</td>
                      <td className="p-3.5 text-center font-mono text-[10px] font-bold text-slate-500 uppercase">{medicine.batchNumber}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">{formatCurLocal(medicine.price)}</td>
                      
                      {/* Quantity editors */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(medicine.id, -1)}
                            className="p-1 hover:bg-slate-100 border border-gray-250 hover:border-gray-400 rounded-sm cursor-pointer select-none"
                          >
                            <Minus className="w-3 h-3 text-slate-600" />
                          </button>
                          <span className="font-mono font-bold text-gray-900 min-w-[20px] text-center">{quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(medicine.id, 1)}
                            className="p-1 hover:bg-slate-100 border border-gray-250 hover:border-gray-400 rounded-sm cursor-pointer select-none"
                          >
                            <Plus className="w-3 h-3 text-slate-600" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="p-3.5 text-right font-mono font-extrabold text-slate-900">
                        {formatCurLocal(medicine.price * quantity)}
                      </td>
                      <td className="p-3.5 pr-5 text-right select-none">
                        <button 
                          type="button"
                          onClick={() => removeItemFromCart(medicine.id)}
                          className="text-gray-400 hover:text-red-650 p-1.5 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POS Checkout form panel */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-3">POS Billing Receipt Ledger</h3>
          
          {/* Customer settings inputs */}
          <div className="space-y-2.5 text-xs">
            <span className="text-[10px] text-gray-450 uppercase tracking-widest font-black block">Indian Customer Credentials</span>
            
            <div className="space-y-2 font-semibold">
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Patient / Customer Fullname *" 
                  value={customerName}
                  required
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg pl-9 pr-3 py-2 outline-hidden transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Indian mobile number (10 digit) *" 
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg pl-9 pr-3 py-2 outline-hidden transition-all"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Postal Address (for drug tracking)" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg pl-9 pr-3 py-2 outline-hidden transition-all"
                />
              </div>

              <div className="relative">
                <Award className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Aadhaar Card Number (12 digit)" 
                  maxLength={12}
                  value={customerAadhaar}
                  onChange={(e) => setCustomerAadhaar(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs font-mono font-bold text-gray-800 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded-lg pl-9 pr-3 py-2 outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* Schedule H Prescription Warning and Controls */}
          {rxVerificationRequired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex gap-2 items-start text-red-850">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block text-red-900 leading-none">Schedule H Rx Warning</span>
                  <p className="text-[11px] font-bold mt-1 leading-snug">
                    This cart contains prescription-locked chemicals and medicines. Drug control authority requires doctor license validation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-red-100">
                <input 
                  type="checkbox"
                  id="chk-rx-verify"
                  checked={prescriptionVerified}
                  onChange={(e) => setPrescriptionVerified(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 accent-red-600 shrink-0 cursor-pointer"
                />
                <label htmlFor="chk-rx-verify" className="text-[10px] font-extrabold text-red-900 cursor-pointer select-none leading-tight">
                  I certify that I have verified the doctor's drug seal and prescription certificate.
                </label>
              </div>
            </div>
          )}

          {/* Pricing Ledger calculations card */}
          <div className="space-y-2.5 text-xs border-y border-gray-100 py-4 select-all">
            <div className="flex justify-between text-gray-500 font-bold">
              <span className="uppercase text-[9px] tracking-wide">Gross Subtotal (MRP Inc)</span>
              <span className="font-mono font-bold text-gray-800">{formatCurLocal(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-gray-500 font-bold">
              <span className="uppercase text-[9px] tracking-wide">Central CGST Portion</span>
              <span className="font-mono font-bold text-slate-600">{formatCurLocal(cgstAmount)}</span>
            </div>

            <div className="flex justify-between text-gray-500 font-bold">
              <span className="uppercase text-[9px] tracking-wide">State SGST Portion</span>
              <span className="font-mono font-bold text-slate-600">{formatCurLocal(sgstAmount)}</span>
            </div>
            
            {/* Discount input */}
            <div className="flex items-center justify-between text-gray-500 font-bold">
              <span className="uppercase text-[9px] tracking-wide">Special Discount (₹)</span>
              <div className="relative w-28">
                <input 
                  type="number" 
                  min="0"
                  max={subtotal.toString()}
                  placeholder="0.00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full text-xs font-mono font-bold text-gray-800 bg-gray-50 border border-gray-250 hover:border-gray-400 rounded-md py-1 pl-2 pr-6 text-right focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <span className="absolute right-2 top-1 w-3 h-3 text-[10px] text-gray-450 leading-none">₹</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-dashed border-gray-150">
              <span className="uppercase text-[10px] tracking-widest font-black">Net Net-Payable (MRP)</span>
              <span className="text-emerald-700 font-mono font-black text-sm">{formatCurLocal(total)}</span>
            </div>
          </div>

          {/* Tender payment selectors */}
          <div className="space-y-2 text-xs select-none">
            <span className="text-[10px] text-gray-450 uppercase tracking-widest font-black block">Tender Ledger Method</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2.5 border rounded-lg font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                  paymentMode === 'cash' 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs uppercase font-bold">CASH</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`py-2.5 border rounded-lg font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                  paymentMode === 'card' 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="text-[10px] uppercase font-mono mt-0.5">CARD</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2.5 border rounded-lg font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                  paymentMode === 'upi' 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-black italic text-indigo-700 italic font-mono uppercase tracking-tight">UPI / QR</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2 leading-relaxed font-bold select-all">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-655" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit POS billing */}
          <button 
            type="button"
            onClick={handleSubmitBill}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-200 disabled:border-gray-205 disabled:text-gray-400 disabled:cursor-not-allowed uppercase text-[10px] tracking-widest"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            <span>Produce GST Invoice</span>
          </button>
        </div>
      </div>

      {/* PRINT-READY DIGITAL GST INVOICE RECEIPT MODAL */}
      {savedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 max-w-md w-full overflow-hidden flex flex-col print_modal my-8 animate-scaleUp select-text">
            
            {/* Control banner (invisible on printing sheets) */}
            <div className="bg-emerald-600 p-3.5 text-white flex items-center justify-between print:hidden select-none">
              <span className="text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100" />
                <span>Invoice produced successfully!</span>
              </span>
              <button 
                onClick={() => setSavedBill(null)}
                className="text-emerald-100 hover:text-white font-extrabold text-xs bg-black/15 hover:bg-black/25 rounded-full px-3 py-1 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

            {/* Printable Frame Area */}
            <div id="printable-area" className="p-6 space-y-4">
              
              {/* Receipt Cross logo and pharmacy identity */}
              <div className="text-center space-y-1 pb-4 border-b border-gray-200 select-all font-sans relative">
                <span className="text-[25px] font-black text-rose-600 leading-none block shrink-0 select-none">➕</span>
                <h2 className="text-sm font-black text-slate-950 tracking-widest uppercase">Swasthya Medical Store</h2>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">DRUG LICENSE CODE: SWASTHYA-DL-2026</p>
                <p className="text-[9px] text-gray-400">Main Market Crossing, New Delhi, India 110001</p>
                <p className="text-[9px] text-emerald-700 font-extrabold uppercase">Government GST Compliant Invoice</p>
              </div>

              {/* Invoice system parameters */}
              <div className="grid grid-cols-2 gap-y-1.5 text-[9px] font-bold text-gray-650 border-b border-gray-150 pb-3">
                <div>
                  <span className="text-gray-400 font-bold uppercase block tracking-wider text-[8px]">Tax Invoice No:</span>
                  <span className="font-mono font-black text-gray-950 text-[10px]">{savedBill.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-bold uppercase block tracking-wider text-[8px]">Billing Date:</span>
                  <span className="font-semibold text-gray-900 text-[10px]">
                    {new Date(savedBill.date).toLocaleDateString('en-IN', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase block tracking-wider text-[8px]">Dispensed By:</span>
                  <span className="font-semibold text-gray-950 text-[10px]">{savedBill.createdBy || 'Authorized Executive'}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-bold uppercase block tracking-wider text-[8px]">Tender Mode:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 font-black uppercase rounded-sm bg-slate-100 text-slate-800 text-[9px] tracking-widest">
                    {savedBill.paymentMode}
                  </span>
                </div>
              </div>

              {/* Customer verified data */}
              <div className="bg-slate-50 p-3 rounded-lg border border-gray-150 text-[9px] font-semibold text-gray-700 space-y-1 shadow-xxs">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[8px] text-gray-450 block">Registered Patient Ledger</p>
                <p className="font-bold text-[10px] text-slate-800">Name: <span className="font-extrabold">{savedBill.customerName}</span></p>
                <p>Phone No: <span className="font-mono font-bold text-slate-900">{savedBill.customerPhone || 'N/A'}</span></p>
                <p className="truncate">Address: <span className="font-medium">{savedBill.customerAddress || 'Walk-in Customer'}</span></p>
                {savedBill.customerAadhaar && savedBill.customerAadhaar !== 'N/A' && (
                  <p>Aadhaar Verification: <span className="font-mono font-bold text-emerald-800">{savedBill.customerAadhaar.slice(0, 4)}XXXX{savedBill.customerAadhaar.slice(-4)}</span></p>
                )}
              </div>

              {/* Serial Cart Items */}
              <div className="space-y-2 border-b border-gray-150 pb-3">
                <div className="grid grid-cols-12 text-[8px] font-black text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-50">
                  <span className="col-span-6">Taxable Item Descr.</span>
                  <span className="col-span-2 text-center">Batch</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">MRP (INR)</span>
                </div>
                
                <div className="space-y-1.5 divide-y divide-gray-50">
                  {savedBill.items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 text-[10px] text-gray-800 pt-1.5 font-bold">
                      <div className="col-span-6">
                        <p className="font-extrabold text-slate-900 leading-tight">{item.medicineName}</p>
                      </div>
                      <span className="col-span-2 text-center font-mono text-[9px] font-bold text-gray-450 uppercase">{savedBill.items.find(x => x.medicineId === item.medicineId)?.medicineId?.slice(0, 4) || 'CR-99'}</span>
                      <span className="col-span-2 text-center font-extrabold">{item.quantity}</span>
                      <span className="col-span-2 text-right font-mono font-extrabold text-slate-900">{formatCurLocal(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing taxation summaries */}
              <div className="space-y-1 px-1 text-xs text-gray-700 pl-24">
                <div className="flex justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-wide">Gross Subtotal</span>
                  <span className="font-mono font-semibold">{formatCurLocal(savedBill.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-wide flex items-center">Central CGST portion</span>
                  <span className="font-mono font-semibold">{formatCurLocal(savedBill.cgst ?? (savedBill.subtotal * 12 / 112) / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-wide flex items-center">State SGST portion</span>
                  <span className="font-mono font-semibold">{formatCurLocal(savedBill.sgst ?? (savedBill.subtotal * 12 / 112) / 2)}</span>
                </div>
                {savedBill.discount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span className="text-[9px] uppercase font-black tracking-wide">Discount deduction</span>
                    <span className="font-mono font-bold">-{formatCurLocal(savedBill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-sm font-black text-emerald-800">
                  <span className="uppercase text-[10px] tracking-wider">Net Amount Paid</span>
                  <span className="font-mono font-black">{formatCurLocal(savedBill.total)}</span>
                </div>
              </div>

              {/* Print Legal Warnings and credit */}
              <div className="text-center pt-5 border-t border-gray-200 border-dotted space-y-1.5 select-none text-[9px] text-gray-400">
                <p className="font-extrabold text-blue-700 italic">Get Well Soon! Government drug laws: Sold pharmaceuticals cannot be returned or refunded.</p>
                <p className="font-bold text-[8px]">System node: WSGI Gunicorn Native • SQLite Persistent</p>
              </div>
            </div>

            {/* Receipt Modal buttons (hidden on printed sheet) */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 flex items-center justify-between print:hidden select-none">
              <button 
                type="button"
                onClick={() => setSavedBill(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-150 text-xs font-bold text-gray-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                Cancel / Return
              </button>
              <button 
                type="button"
                onClick={printInvoice}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
