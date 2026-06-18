export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'pharmacist' | 'cashier' | 'auditor';
  fullName: string;
}

export interface Supplier {
  id: string;
  name: string;
  gstin: string;
  drugLicense: string;
  contactNumber: string;
  email?: string;
  address?: string;
  outstandingPayment?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  allergies?: string;
  chronicDiseases?: string;
  medicalHistory?: string;
  preferredMedicines?: string[];
  refillRemindersActive?: boolean;
}

export interface AuditLog {
  id: string;
  username: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
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
  image?: string; // Medicine image URL/base64
  uses?: string;
  sideEffects?: string;
  contraindications?: string;
  storageConditions?: string;
  dosage?: string;
  drugClass?: string;
  warnings?: string;
  pregnancySafety?: string;
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

export interface HealthLockerRecord {
  id: string;
  customerId: string;
  type: 'prescription' | 'lab_report' | 'vaccination' | 'insurance' | 'medical_note';
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  url?: string;
  metadata?: string; // Any special notes or diagnoses
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'busy' | 'offline';
  currentLat?: number;
  currentLng?: number;
}

export interface Delivery {
  id: string;
  billId: string;
  customerName: string;
  address: string;
  phone: string;
  scheduledTime: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  status: 'pending' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  otp: string;
  deliveryCharge: number;
  notes?: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  medicineId: string;
  medicineName: string;
  quantityReserved: number;
  reservedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  reminderSent: boolean;
}

export interface SubscriptionMedicine {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  medicineId: string;
  medicineName: string;
  quantityPerRefill: number;
  intervalDays: number;
  lastRefillDate?: string;
  nextRefillDate: string;
  status: 'active' | 'paused' | 'completed';
}

export interface MedicineRecall {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  manufacturer: string;
  reason: string;
  replacementMedicineId?: string;
  replacementMedicineName?: string;
  recallDate: string;
  status: 'active' | 'completed';
}

export interface InventoryTransfer {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantityTransferred: number;
  fromBranch: string;
  toBranch: string;
  requestedBy: string;
  requestedAt: string;
  status: 'requested' | 'approved' | 'in_transit' | 'received' | 'rejected';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  channel: 'staff' | 'alerts' | 'handover';
}

export interface PharmacyTask {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'expiry' | 'stock' | 'audit' | 'cleanup' | 'delivery' | 'billing';
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  ratingMedicine: number;
  ratingService: number;
  ratingDelivery: number;
  comment?: string;
  date: string;
}

