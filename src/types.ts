export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'staff';
  fullName: string;
}

export interface Supplier {
  id: string;
  name: string;
  gstin: string;
  drugLicense: string;
  contactNumber: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  batchNumber: string;
  category: string;
  manufacturer: string;
  quantity: number;
  price: number;
  costPrice: number;
  expiryDate: string; // YYYY-MM-DD
  rackNumber: string;
  lowStockThreshold: number;
  status: 'active' | 'inactive';
  prescriptionRequired?: boolean;
  hsnCode?: string;
  gstRate?: number;
  supplierName?: string;
  barcode?: string;
}

export interface BillItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerAadhaar?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  discount: number;
  total: number;
  paymentMode: 'cash' | 'card' | 'upi';
  date: string; // ISO String
  createdBy: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'expiry' | 'system';
  message: string;
  medicineId?: string;
  date: string;
  isRead: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalSalesCount: number;
  revenueThisMonth: number;
  totalMedicines: number;
  lowStockCount: number;
  expiringSoonCount: number;
  salesByDate: { date: string; amount: number; count: number }[];
  categorySales: { category: string; value: number }[];
  recentBills: Bill[];
  expiredMedicinesCount: number;
  lowStockMedicines?: Medicine[];
  expiringSoonMedicines?: Medicine[];
  expiredMedicines?: Medicine[];
}
