# Curewell Pharmacy OS: Clean Installation & Setup Guide
This document delivers instructions to deploy and host the system **completely without Docker dependencies**.

---

## 🛠️ 1. Development Environment Setup

### Prerequisites
- NodeJS (v18+) & npm (v9+)
- Python (v3.10+) & pip

### Step A: Relational Database Configuration
Curewell OS connects to a relational database based on the `DATABASE_URL` environment parameter.
- **SQLite Option (Zero Config)**: The system automatically boots with SQLite if no other connection string is specified.
- **PostgreSQL Option (Highly Recommended)**: Set up a local database and configure parameters inside a newly created `.env` file (copying from `.env.example`).
  ```bash
  # Example PostgreSQL connection string
  DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/curewell"
  ```

### Step B: Backend Server Setup (Python + Flask)
Navigate to the root directory to set up and boot your backend workspace:
```bash
# 1. Initiate Python virtual environment
python -v env venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# 2. Install required pip requirements
pip install -r requirements.txt

# 3. Boot development web server
python app.py
```
*The local database tables will instantly compile and seed with five therapeutic medicine records and three test bills!*

### Step C: Frontend Client Setup (React + Vite)
Open a separate terminal window to run the Vite dev pipeline:
```bash
# 1. Install all NodeJS packages
npm install

# 2. Boot Vite development hot-reloaded workspace
npm run dev
```
Open your browser to `http://localhost:3000` to interact with the full dashboard panels!

---

## 🚀 2. Production Environment Deployments

### Option A: Local Windows Deployment
1. **Frontend**:
   ```cmd
   npm run build
   ```
2. **Backend**:
   - Install `waitress` as Gunicorn is unsupported on native Windows shells:
     ```cmd
     pip install waitress
     ```
   - Build a starter script `prod_server.py`:
     ```python
     from waitress import serve
     from app import app
     serve(app, host='0.0.0.0', port=8000)
     ```
   - Start using: `python prod_server.py`
3. Serve the built static `dist/` folder using Microsoft IIS, Nginx for Windows, or custom Node static wrappers.

---

### Option B: VPS Linux Deployment with Nginx & Gunicorn
1. **Prepare static built files**:
   ```bash
   npm run build
   # Copy built files to standard Nginx path
   sudo mkdir -p /var/www/curewell
   sudo cp -r dist/* /var/www/curewell/
   ```
2. **Install Nginx & configure parameters**:
   - Copy the repository's `nginx.conf` file to Nginx's system folders:
     ```bash
     sudo cp nginx.conf /etc/nginx/sites-available/curewell
     sudo ln -s /etc/nginx/sites-available/curewell /etc/nginx/sites-enabled/
     sudo systemctl restart nginx
     ```
3. **Configure systemd to serve Gunicorn**:
   - Build a daemon file `/etc/systemd/system/gunicorn_curewell.service`:
     ```ini
     [Unit]
     Description=Gunicorn Curewell web app daemon
     After=network.target

     [Service]
     User=ubuntu
     WorkingDirectory=/home/ubuntu/curewell-pharmacy
     ExecStart=/home/ubuntu/curewell-pharmacy/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 app:app
     Restart=always

     [Install]
     WantedBy=multi-user.target
     ```
   - Start and inspect the daemon process:
     ```bash
     sudo systemctl daemon-reload
     sudo systemctl start gunicorn_curewell
     sudo systemctl enable gunicorn_curewell
     ```

---

### Option C: PaaS Cloud Deployments (Render / Railway)

#### 1. PostgreSQL Live database
Create a managed PostgreSQL database inside Render's or Railway's cloud interfaces, and extract the generated connection URL string.

#### 2. Deploying Python + Flask backend:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command / Entrypoint**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Environment variables**: Set `DATABASE_URL` to your live database socket, and adjust `FLASK_ENV=production`.

#### 3. Deploying React static client:
Deploy the repository as a Static Site:
- **Build Command**: `npm run build`
- **Publish Directory / Static output**: `dist/` or `build/`
- Configure any API routing redirects pointing your public domain.
