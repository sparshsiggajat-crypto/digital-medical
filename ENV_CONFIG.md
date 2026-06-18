# Curewell Pharmacy OS — Environment Configuration Guide

This document explains the configuration structure, environment parameters, fail-safe fallbacks, and multi-mode setups of the Curewell Pharmacy platform.

---

## 📋 1. Core Configuration Variables

The following key-value criteria regulate the runtime environments of both the React client interface and Flask/Express backing processes:

| Variable Name | Default Value (Development) | Purpose | Stability & Security Level |
| :--- | :--- | :--- | :--- |
| **`VITE_API_URL`** | `http://localhost:5000/api` | Base URL routing for browser AJAX/fetch callbacks. | **Public client-side.** Defaults to relative path `/api` inside proxies or if absent. |
| **`FLASK_APP`** | `app.py` | Flask bootstrap and controller entry file. | **Private backend.** Dev server utility. |
| **`FLASK_ENV`** | `development` | Dictates debug, verbose logs, and auto-reload properties. | **Private backend.** Standard deployment profile. |
| **`SECRET_KEY`** | `generate-a-secure-random-secret-key-for-development` | Signs tokens to prevent user state forgery. | **Highly Sensitive.** Must be rotated in staging and live VPS nodes. |
| **`DATABASE_URL`** | `sqlite:///medical_shop.db` | Data persistence connection socket. | **Private backend.** Automatically defaults to SQLite on failure or missing states. |
| **`PORT`** | `3000` | Port allocation binding for Sandbox. | Standard port binding. |

---

## 🛡️ 2. Automated Safe Fallbacks (Zero-Crash Architecture)

To run successfully in serverless containers and other quick sandboxes, both backends feature a built-in zero-crash fallback system:

1. **Database Fallback (`DATABASE_URL`)**: 
   - If no variables are specified, or if the connection to PostgreSQL/MySQL drops or is invalid/failed, the system displays a log warning and routes transactions to a local serverless **SQLite** archive file (`sqlite:///medical_shop.db`).
2. **Key Security Fallback (`SECRET_KEY`)**:
   - If absent, a default development fallback key is integrated to allow safe sessions in development mode without requiring any environment bootstrapping.
3. **Frontend Routing Fallback (`VITE_API_URL`)**:
   - If not set in the build pipeline, the React frontend falls back to standard local relative queries (`/api`) so it routes seamlessly when compiled static directories are served by Express/Nginx.

---

## ⚡ 3. Setting Up Your Files

### Developer Flow (Automatic SQLite Default)
To boot the application with development specifications, create or copy instructions into your root location:
```bash
cp .env.example .env.development
```
Both the Python server and Node server will automatically detect, parse, and incorporate these local environment variables.
