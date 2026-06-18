import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Terminal, 
  Compass, 
  Database, 
  User, 
  Tag, 
  Activity, 
  TrendingUp, 
  LayoutDashboard, 
  PlusCircle, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { Medicine } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  token: string | null;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, token }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load medicines to allow direct autocomplete searches
  useEffect(() => {
    if (isOpen) {
      fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setMedicines(data || []))
      .catch(err => console.error(err));
      
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Escape and Navigation keydowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const navActions = [
    { label: "Go to Dashboard", icon: LayoutDashboard, tab: "dashboard", description: "Overview of sales and active inventory counters" },
    { label: "New POS Billing Invoice", icon: PlusCircle, tab: "billing", description: "Open checkout lane to generate invoices" },
    { label: "Stock Inventory Manager", icon: Database, tab: "inventory", description: "Search, update quantities, edit drug prices" },
    { label: "Patients CRM List", icon: User, tab: "customers", description: "Medical profiling and known allergy tracking" },
    { label: "Suppliers accounts", icon: Tag, tab: "suppliers", description: "Track outstanding liabilities and distributor contacts" },
    { label: "Security Activity Log", icon: Activity, tab: "activity_logs", description: "Cryptographic system transaction histories" }
  ];

  const filteredNavs = navActions.filter(n => 
    n.label.toLowerCase().includes(search.toLowerCase()) || 
    n.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMeds = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const handleAction = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-start justify-center pt-[15vh] p-4 no-print font-sans">
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs"
          />

          {/* Dialog block */}
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl shadow-3xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Type a command or search medicines (e.g. Paracetamol)..."
                className="flex-1 bg-transparent border-0 text-sm focus:outline-hidden focus:ring-0 text-slate-850 dark:text-slate-100"
              />
              <div className="px-2 py-0.5 bg-gray-200/65 dark:bg-slate-800 text-slate-500 rounded-sm text-[10px] font-mono select-none">
                ESC
              </div>
            </div>

            {/* Results body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
              {/* Navigation Options */}
              {filteredNavs.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[9px] font-bold text-slate-405 text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-slate-50 dark:bg-slate-950/25 py-2 px-3 rounded-lg">
                    <Compass className="w-3.5 h-3.5" />
                    Quick Navigation
                  </div>
                  
                  <div className="space-y-0.5">
                    {filteredNavs.map((nav, key) => {
                      const Icon = nav.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => handleAction(nav.tab)}
                          className="w-full text-left px-3.5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl flex items-center gap-3 transition-colors group cursor-pointer"
                        >
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                            <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-all" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-205 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {nav.label}
                            </div>
                            <div className="text-[10px] text-slate-450 text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                              {nav.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Medicine Autocomplete Results */}
              {search.trim() && filteredMeds.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[9px] font-bold text-slate-405 text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-slate-50 dark:bg-slate-950/25 py-2 px-3 rounded-lg">
                    <Terminal className="w-3.5 h-3.5" />
                    Live Medicines Inventory Match
                  </div>

                  <div className="space-y-0.5">
                    {filteredMeds.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleAction("inventory")} // Go to inventory manager
                        className="w-full text-left px-3.5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-500">
                              {med.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {med.genericName} • Category: {med.category}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">${med.price.toFixed(2)}</div>
                          <div className="text-[9px] text-slate-450 mt-0.5">Rack {med.rackNumber} • Qty {med.quantity}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredNavs.length === 0 && filteredMeds.length === 0 && (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-slate-400 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold">No command, navigation tabs or medications match.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Try a simpler input query, like "billing" or "aspirin".</p>
                </div>
              )}
            </div>

            {/* Hint Footer */}
            <div className="p-3 border-t border-gray-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between select-none">
              <span className="font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Navigate using mouse clicks on results
              </span>
              <span>Press <strong className="font-bold">ESC</strong> to exit</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
