# Curewell Pharmacy OS 🛡️
### Medical Shop Digitalization & Smart Billing System
*Refactored & fully optimized to run on standard Python Flask, React Vite, Gunicorn, PostgreSQL/SQLite, and Nginx architectures natively with **zero Docker or container dependencies**.*

---

## 📋 Migration Summary Report

As part of the modernization mandate, all container overheads, complex Docker files, network layers, and localized bridge aliases was deleted from the codebase. The application now runs with higher native security, lower system overhead, and direct native deployment channels.

### 🗑️ Files & configurations Removed
- `Dockerfile` (Removed server container setups)
- `docker-compose.yml` (Removed microservice orchestrations)
- All localhost bridge aliases and custom virtual networks (e.g., `db://`, `redis-service:`, `localhost:5432` container mapping hooks)

### 📌 Files Newly Created & Refactored
1. **`app.py`**: A fully functional Flask production backend supporting persistent SQLAlchemy architectures. Connects automatically to active **PostgreSQL** databases or falls back to serverless local SQLite databases if none configured.
2. **`server.ts`**: Express-based Node full-stack middleware setup which powers the AI Studio sandbox previews perfectly on port 3000.
3. **`requirements.txt`**: Complete Python dependencies sheet (Flask, SQLAlchemy, Gunicorn, CORS).
4. **`nginx.conf`**: Industrial Nginx site-configuration for static directory parsing on port 80 proxying api routes directly to WSGI Gunicorn sockets.
5. **`INSTALL.md`**: Simplified, robust setup instructions spanning development environments, Linux VPS (systemd), Windows Waitress, and Serverless PaaS.

---

## ⭐ Advanced Features Matrix

- **Smart Dashboard**: Business intelligence summary tracking total sales, inventory size, low-stock quantities, and expiring medicine warnings alongside interactive **Recharts** charts.
- **Interactive POS Billing Terminal**: POS layout featuring incremental medication lookups, stock validations, real-time sales tax computations, and custom invoice generators.
- **Unified Inventory Manager**: Register and inspect therapeutic profiles with designated batch numbers, cost metrics, and shelf locations.
- **Predictive Expiration Warning Feed**: Alert dashboards warning staff about medications near expiration (within 30 days) or already expired so they are never dispensed.
- **System Logs terminal**: CRT visual system monitor inside the Reports panel mimicking actual Gunicorn active workers and SQLite transactions.

---

## ⚡ Quickstart Development Instructions

### 1. Initiate React Sandbox Dev Server (Node)
```bash
npm install
npm run dev
```

### 2. Run Flask Production Backend (Python)
```bash
pip install -r requirements.txt
python app.py
```
*Wait! Refer to `INSTALL.md` for complete configuration steps, VPS daemons deployment, and SQL Migrations details.*
