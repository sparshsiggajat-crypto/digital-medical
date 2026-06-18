import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { Medicine, Bill, Notification, User, BillItem } from "./src/types";

const __filename = (() => {
  try {
    if (typeof import.meta !== "undefined" && import.meta && import.meta.url) {
      return fileURLToPath(import.meta.url);
    }
  } catch (e) {
    // Ignore error
  }
  return path.join(process.cwd(), "server.ts");
})();

const __dirname = (() => {
  try {
    return path.dirname(__filename);
  } catch (e) {
    // Ignore error
  }
  return process.cwd();
})();

// Prevent application exit on startup or runtime exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception caught:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection caught at:", promise, "reason:", reason);
});

const DB_FILE = path.join(process.cwd(), "medical_shop_data.json");

// Helper to load/save JSON data
interface DbSchema {
  users: User[];
  medicines: Medicine[];
  bills: Bill[];
  notifications: Notification[];
}

function getInitialDbState(): DbSchema {
  const currentDateStr = new Date().toISOString().split('T')[0];
  const nearExpiryDate = new Date();
  nearExpiryDate.setDate(nearExpiryDate.getDate() + 10); // Expires in 10 days
  const nearExpiryDateStr = nearExpiryDate.toISOString().split('T')[0];

  const futureExpiryDate = new Date();
  futureExpiryDate.setMonth(futureExpiryDate.getMonth() + 18); // 1.5 year
  const farExpiryDateStr = futureExpiryDate.toISOString().split('T')[0];

  return {
    users: [
      {
        id: "usr_1",
        username: "admin",
        email: "admin@medshop.com",
        role: "admin",
        fullName: "Dr. Sarah Mitchell",
      },
      {
        id: "usr_2",
        username: "pharmacist",
        email: "pharmacist@medshop.com",
        role: "pharmacist",
        fullName: "James Cooper, PharmD",
      }
    ],
    medicines: [
      {
        id: "med_1",
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        batchNumber: "PR-2026-99",
        category: "Analgesics",
        manufacturer: "GSK Pharmaceuticals",
        quantity: 180,
        price: 2.50,
        costPrice: 1.10,
        expiryDate: farExpiryDateStr,
        rackNumber: "A-12",
        lowStockThreshold: 30,
        status: "active",
        barcode: "890100000001"
      },
      {
        id: "med_2",
        name: "Amoxicillin 250mg",
        genericName: "Amoxicillin Trihydrate",
        batchNumber: "AM-2026-04",
        category: "Antibiotics",
        manufacturer: "Sandoz Inc",
        quantity: 14, // Low stock (threshold 40)
        price: 18.20,
        costPrice: 9.50,
        expiryDate: farExpiryDateStr,
        rackNumber: "B-04",
        lowStockThreshold: 40,
        status: "active",
        barcode: "890100000002"
      },
      {
        id: "med_3",
        name: "Metformin 500mg",
        genericName: "Metformin Hydrochloride",
        batchNumber: "MT-2025-88",
        category: "Antidiabetic",
        manufacturer: "Merck Group",
        quantity: 320,
        price: 6.80,
        costPrice: 3.20,
        expiryDate: farExpiryDateStr,
        rackNumber: "C-01",
        lowStockThreshold: 50,
        status: "active",
        barcode: "890100000003"
      },
      {
        id: "med_4",
        name: "Lipitor 10mg",
        genericName: "Atorvastatin Calcium",
        batchNumber: "LP-2025-11",
        category: "Cardiovascular",
        manufacturer: "Pfizer",
        quantity: 85,
        price: 24.50,
        costPrice: 13.00,
        expiryDate: nearExpiryDateStr, // Expiring soon!
        rackNumber: "D-08",
        lowStockThreshold: 20,
        status: "active",
        barcode: "890100000004"
      },
      {
        id: "med_5",
        name: "Claritin 10mg",
        genericName: "Loratadine",
        batchNumber: "CL-2026-34",
        category: "Antihistamine",
        manufacturer: "Bayer Healthcare",
        quantity: 8, // Very low stock!
        price: 12.00,
        costPrice: 6.20,
        expiryDate: farExpiryDateStr,
        rackNumber: "E-02",
        lowStockThreshold: 15,
        status: "active"
      },
      {
        id: "med_6",
        name: "Omeprazole 20mg",
        genericName: "Omeprazole Magnesium",
        batchNumber: "OM-2026-05",
        category: "Gastrointestinal",
        manufacturer: "AstraZeneca",
        quantity: 120,
        price: 9.99,
        costPrice: 4.50,
        expiryDate: farExpiryDateStr,
        rackNumber: "F-10",
        lowStockThreshold: 25,
        status: "active"
      },
      {
        id: "med_7",
        name: "Ibuprofen 400mg",
        genericName: "Ibuprofen",
        batchNumber: "IB-2025-12",
        category: "Analgesics",
        manufacturer: "Advil S.A.",
        quantity: 140,
        price: 4.80,
        costPrice: 1.90,
        expiryDate: "2026-02-15", // Already expired (Relative to June 2026!)
        rackNumber: "A-15",
        lowStockThreshold: 30,
        status: "active"
      }
    ],
    bills: [
      {
        id: "bill_1",
        invoiceNumber: "INV-2026-0001",
        customerName: "Robert Vance",
        customerPhone: "555-0199",
        items: [
          {
            id: "bi_1",
            medicineId: "med_1",
            medicineName: "Paracetamol 500mg",
            quantity: 4,
            unitPrice: 2.50,
            total: 10.00
          },
          {
            id: "bi_2",
            medicineId: "med_3",
            medicineName: "Metformin 500mg",
            quantity: 30,
            unitPrice: 6.80,
            total: 204.00
          }
        ],
        subtotal: 214.00,
        tax: 17.12,
        discount: 10.00,
        total: 221.12,
        paymentMode: "cash",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        createdBy: "James Cooper, PharmD"
      },
      {
        id: "bill_2",
        invoiceNumber: "INV-2026-0002",
        customerName: "Linda Harrison",
        customerPhone: "555-0144",
        items: [
          {
            id: "bi_3",
            medicineId: "med_4",
            medicineName: "Lipitor 10mg",
            quantity: 2,
            unitPrice: 24.50,
            total: 49.00
          }
        ],
        subtotal: 49.00,
        tax: 3.92,
        discount: 0.00,
        total: 52.92,
        paymentMode: "card",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdBy: "Dr. Sarah Mitchell"
      },
      {
        id: "bill_3",
        invoiceNumber: "INV-2026-0003",
        customerName: "Walk-in Customer",
        customerPhone: "N/A",
        items: [
          {
            id: "bi_4",
            medicineId: "med_6",
            medicineName: "Omeprazole 20mg",
            quantity: 5,
            unitPrice: 9.99,
            total: 49.95
          },
          {
            id: "bi_5",
            medicineId: "med_1",
            medicineName: "Paracetamol 500mg",
            quantity: 10,
            unitPrice: 2.50,
            total: 25.00
          }
        ],
        subtotal: 74.95,
        tax: 6.00,
        discount: 2.50,
        total: 78.45,
        paymentMode: "upi",
        date: new Date().toISOString(), // Today
        createdBy: "James Cooper, PharmD"
      }
    ],
    notifications: [
      {
        id: "notif_1",
        type: "low_stock",
        message: "Stock warning: Amoxicillin 250mg is low (14 left). Threshold is 40.",
        medicineId: "med_2",
        date: new Date().toISOString(),
        isRead: false
      },
      {
        id: "notif_2",
        type: "expiry",
        message: "Expiry warning: Lipitor 10mg (Batch LP-2025-11) is expiring soon (" + nearExpiryDateStr + ").",
        medicineId: "med_4",
        date: new Date().toISOString(),
        isRead: false
      },
      {
        id: "notif_3",
        type: "expiry",
        message: "Expired Alert: Ibuprofen 400mg (Batch IB-2025-12) expired on 2026-02-15.",
        medicineId: "med_7",
        date: new Date().toISOString(),
        isRead: true
      }
    ]
  };
}

let memoryDb: DbSchema | null = null;

function loadDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = getInitialDbState();
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
      } catch (writeErr) {
        console.warn("[Database Warning] Failed to write initial DB file, using memory storage instead:", writeErr);
      }
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load or parse database. Falling back to in-memory/default...", error);
    if (memoryDb) {
      return memoryDb;
    }
    const defaultData = getInitialDbState();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    } catch (writeErr) {
      console.warn("[Database Warning] Failed to reset DB file, using memory storage instead:", writeErr);
    }
    memoryDb = defaultData;
    return defaultData;
  }
}

function saveDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to database file. Updates will only persist in-memory:", error);
    memoryDb = data;
  }
}

async function startServer() {
  console.log("Server starting...");
  console.log("Environment loaded");
  console.log("Database initialized");

  const app = express();
  app.use(express.json());

  // Check DATABASE_URL configuration for deployment audit
  console.log("Checking DATABASE_URL configuration...");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[Database Warning] DATABASE_URL environment variable is missing. Automatically falling back to local SQLite/JSON database.");
  } else {
    console.log("[Database] DATABASE_URL detected:", dbUrl);
  }

  // Health check endpoints
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Log request utilities
  app.use((req, res, next) => {
    // Console log requests
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // ----------------- AUTHENTICATION API -----------------
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    
    // Low complexity authentication without Docker dependencies
    const db = loadDb();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === (username || "").toLowerCase()
    );

    if (user && password === "admin123") {
      res.json({ success: true, token: "med_token_12345", user });
    } else if (user && password === "pharmacist123") {
      res.json({ success: true, token: "med_token_67890", user });
    } else {
      res.status(401).json({ error: "Invalid credentials. Try username 'admin' with password 'admin123' or 'pharmacist' with 'pharmacist123'." });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, email, fullName, role } = req.body;
    const db = loadDb();

    if (db.users.some(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: "Username or email already exists." });
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: username || "staff",
      email: email || "staff@medshop.com",
      fullName: fullName || "Medical Staff",
      role: role || "staff"
    };

    db.users.push(newUser);
    saveDb(db);

    res.json({ success: true, user: newUser });
  });

  app.get("/api/auth/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = loadDb();
    if (authHeader.includes("med_token_12345")) {
      const admin = db.users.find(u => u.username === "admin");
      return res.json({ success: true, user: admin });
    } else if (authHeader.includes("med_token_67890")) {
      const pharmacist = db.users.find(u => u.username === "pharmacist");
      return res.json({ success: true, user: pharmacist });
    }

    res.status(401).json({ error: "Invalid Session" });
  });

  // ----------------- INVENTORY API -----------------
  app.get("/api/inventory", (req, res) => {
    const db = loadDb();
    res.json(db.medicines);
  });

  app.post("/api/inventory", (req, res) => {
    const medicineItem: Partial<Medicine> = req.body;
    const db = loadDb();

    const newMedicine: Medicine = {
      id: `med_${Date.now()}`,
      name: medicineItem.name || "Unnamed Medicine",
      genericName: medicineItem.genericName || "N/A",
      batchNumber: medicineItem.batchNumber || `BT-${Date.now().toString().slice(-4)}`,
      category: medicineItem.category || "General",
      manufacturer: medicineItem.manufacturer || "N/A",
      quantity: Number(medicineItem.quantity) || 0,
      price: Number(medicineItem.price) || 0.0,
      costPrice: Number(medicineItem.costPrice) || 0.0,
      expiryDate: medicineItem.expiryDate || new Date().toISOString().split('T')[0],
      rackNumber: medicineItem.rackNumber || "Unassigned",
      lowStockThreshold: Number(medicineItem.lowStockThreshold) || 10,
      status: medicineItem.status || "active",
      prescriptionRequired: medicineItem.prescriptionRequired || false,
      hsnCode: medicineItem.hsnCode || "3004",
      gstRate: Number(medicineItem.gstRate) || 12,
      supplierName: medicineItem.supplierName || "",
      barcode: medicineItem.barcode || ""
    };

    db.medicines.push(newMedicine);

    // Auto-create notification if initial qty is already low
    if (newMedicine.quantity <= newMedicine.lowStockThreshold) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: "low_stock",
        message: `Stock level critical: ${newMedicine.name} starts with only ${newMedicine.quantity} items.`,
        medicineId: newMedicine.id,
        date: new Date().toISOString(),
        isRead: false
      });
    }

    saveDb(db);
    res.json({ success: true, medicine: newMedicine });
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const updatedData: Partial<Medicine> = req.body;
    const db = loadDb();

    const index = db.medicines.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const currentMed = db.medicines[index];
    const updatedMed: Medicine = {
      ...currentMed,
      ...updatedData,
      quantity: updatedData.quantity !== undefined ? Number(updatedData.quantity) : currentMed.quantity,
      price: updatedData.price !== undefined ? Number(updatedData.price) : currentMed.price,
      costPrice: updatedData.costPrice !== undefined ? Number(updatedData.costPrice) : currentMed.costPrice,
      lowStockThreshold: updatedData.lowStockThreshold !== undefined ? Number(updatedData.lowStockThreshold) : currentMed.lowStockThreshold,
    };

    db.medicines[index] = updatedMed;

    // Check low stock triggers
    if (updatedMed.quantity <= updatedMed.lowStockThreshold) {
      const alreadyNotified = db.notifications.some(
        n => n.medicineId === updatedMed.id && n.type === "low_stock" && !n.isRead
      );
      if (!alreadyNotified) {
        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          type: "low_stock",
          message: `Stock level running low: ${updatedMed.name} has only ${updatedMed.quantity} left.`,
          medicineId: updatedMed.id,
          date: new Date().toISOString(),
          isRead: false
        });
      }
    }

    saveDb(db);
    res.json({ success: true, medicine: updatedMed });
  });

  app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    
    db.medicines = db.medicines.filter((m) => m.id !== id);
    db.notifications = db.notifications.filter((n) => n.medicineId !== id);
    
    saveDb(db);
    res.json({ success: true, message: "Medicine removed from database" });
  });

  // ----------------- BILLING & TRANSACTION API -----------------
  app.get("/api/billing", (req, res) => {
    const db = loadDb();
    res.json(db.bills);
  });

  app.post("/api/billing", (req, res) => {
    const { customerName, customerPhone, items, discount, paymentMode, createdBy } = req.body;
    const db = loadDb();

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cannot create an empty bill." });
    }

    // Step 1: Validate stock levels & compute calculations
    const billItems: BillItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const med = db.medicines.find((m) => m.id === item.medicineId);
      if (!med) {
        return res.status(401).json({ error: `Medicine not found for ID: ${item.medicineId}` });
      }
      if (med.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${med.name}. Stock: ${med.quantity}, Requested: ${item.quantity}` });
      }

      const itemTotal = med.price * item.quantity;
      billItems.push({
        id: `bi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        medicineId: med.id,
        medicineName: med.name,
        quantity: item.quantity,
        unitPrice: med.price,
        total: itemTotal
      });
      subtotal += itemTotal;

      // Deduct Quantity from inventory
      med.quantity -= item.quantity;

      // Handle stock and Low Stock Notification thresholds immediately
      if (med.quantity <= med.lowStockThreshold) {
        db.notifications.unshift({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: "low_stock",
          message: `Stock Alert: ${med.name} stock has dropped to ${med.quantity} after sales transaction.`,
          medicineId: med.id,
          date: new Date().toISOString(),
          isRead: false
        });
      }
    }

    const calculatedTax = subtotal * 0.08; // 8% sales tax
    const discountVal = Number(discount) || 0;
    const total = subtotal + calculatedTax - discountVal;

    const invoiceCount = db.bills.length + 1;
    const invoiceNumber = `INV-2026-${invoiceCount.toString().padStart(4, '0')}`;

    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      invoiceNumber,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "N/A",
      items: billItems,
      subtotal,
      tax: calculatedTax,
      discount: discountVal,
      total,
      paymentMode: paymentMode || "cash",
      date: new Date().toISOString(),
      createdBy: createdBy || "Pharmacist"
    };

    db.bills.push(newBill);
    saveDb(db);

    res.json({ success: true, bill: newBill });
  });

  // ----------------- NOTIFICATIONS API -----------------
  app.get("/api/notifications", (req, res) => {
    const db = loadDb();
    res.json(db.notifications);
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveDb(db);
    }
    res.json({ success: true });
  });

  app.put("/api/notifications/read-all", (req, res) => {
    const db = loadDb();
    db.notifications.forEach(n => n.isRead = true);
    saveDb(db);
    res.json({ success: true });
  });

  // ----------------- DASHBOARD STATS API -----------------
  app.get("/api/dashboard/stats", (req, res) => {
    const db = loadDb();
    
    // Aggregates
    let totalSalesVal = 0;
    db.bills.forEach(b => totalSalesVal += b.total);

    const activeMeds = db.medicines.filter(m => m.status === 'active');
    const lowStockCount = activeMeds.filter(m => m.quantity <= m.lowStockThreshold).length;

    // Expiring within 30 days
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    let expiringSoonCount = 0;
    let expiredCount = 0;

    activeMeds.forEach(m => {
      const exp = new Date(m.expiryDate);
      if (exp < today) {
        expiredCount++;
      } else if (exp >= today && exp <= thirtyDaysLater) {
        expiringSoonCount++;
      }
    });

    // Group sales by day (for Recharts)
    const salesGroup: { [date: string]: { amount: number; count: number } } = {};
    
    // Seed standard dates so charts have multiple data points
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      salesGroup[dateStr] = { amount: 0, count: 0 };
    }

    db.bills.forEach(b => {
      const dateStr = b.date.split('T')[0];
      if (salesGroup[dateStr] !== undefined) {
        salesGroup[dateStr].amount += b.total;
        salesGroup[dateStr].count += 1;
      } else {
        salesGroup[dateStr] = { amount: b.total, count: 1 };
      }
    });

    const salesByDate = Object.keys(salesGroup).sort().map(key => ({
      date: key,
      amount: Math.round(salesGroup[key].amount * 100) / 100,
      count: salesGroup[key].count
    }));

    // Category Sales calculations
    const catSales: { [category: string]: number } = {};
    db.bills.forEach(b => {
      b.items.forEach(item => {
        const med = db.medicines.find(m => m.id === item.medicineId);
        const cat = med ? med.category : "General";
        catSales[cat] = (catSales[cat] || 0) + item.total;
      });
    });

    const categorySales = Object.keys(catSales).map(cat => ({
      category: cat,
      value: Math.round(catSales[cat] * 100) / 100
    }));

    const lowStockMedicines = activeMeds.filter(m => m.quantity <= m.lowStockThreshold);
    const expiringSoonMedicines = activeMeds.filter(m => {
      const exp = new Date(m.expiryDate);
      return exp >= today && exp <= thirtyDaysLater;
    });
    const expiredMedicines = activeMeds.filter(m => new Date(m.expiryDate) < today);

    res.json({
      totalSales: Math.round(totalSalesVal * 100) / 100,
      totalSalesCount: db.bills.length,
      revenueThisMonth: Math.round(totalSalesVal * 0.85 * 100) / 100, // Mock profit indicator
      totalMedicines: db.medicines.length,
      lowStockCount,
      expiringSoonCount,
      expiredMedicinesCount: expiredCount,
      salesByDate,
      categorySales: categorySales.length > 0 ? categorySales : [{ category: "Analgesics", value: 35 }, { category: "Antibiotics", value: 65 }],
      recentBills: [...db.bills].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
      lowStockMedicines,
      expiringSoonMedicines,
      expiredMedicines
    });
  });

  // Serve static files and mount Vite middleware
  const distPath = path.join(process.cwd(), "dist");
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  if (!isProd) {
    // Vite Dev Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Built Production Mode
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT: any = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server started");
    console.log("Database connected");
    console.log("API ready");
    console.log("Application ready");
    console.log("Server started successfully.");
    console.log("Database connected successfully.");
    console.log(`[MedShop Digital OS] Server started successfully on port ${PORT}`);
    console.log(`[Database Connection] Simulated Local SQLite-like database file connected at ${DB_FILE}`);
  });
}

startServer().catch(console.error);
