
# Deployment Guide: Dehradun Estates on Hostinger

## 1. OVERVIEW
Dehradun Estates is a modern real estate listing platform built with React, Vite, Tailwind CSS, and shadcn/ui. This guide provides step-by-step instructions for deploying the application to Hostinger Business Hosting.

**Prerequisites:**
- Hostinger Business Hosting account
- Registered domain name
- Google Cloud Console account (for OAuth)
- Basic familiarity with FTP and control panels

## 2. HOSTINGER SETUP
1. Log in to your [Hostinger hPanel](https://hpanel.hostinger.com/).
2. Navigate to **Websites** and select your domain.
3. Ensure your domain is pointing to Hostinger's nameservers.
4. Go to **Advanced -> Node.js** (if deploying a custom Node backend) or prepare to use the **File Manager** for static frontend hosting.
5. Enable **SSL** under the Security tab to ensure HTTPS is active.

## 3. DATABASE SETUP
1. In hPanel, go to **Databases -> Management**.
2. Create a new MySQL or PostgreSQL database. Note down the Database Name, Username, and Password.
3. Open **phpMyAdmin** (for MySQL) or **phpPgAdmin** (for PostgreSQL).
4. Select your newly created database.
5. Go to the **SQL** tab.
6. Copy the contents of `database-schema-mysql.sql` (or postgresql equivalent) from the root directory.
7. Paste and execute the SQL script to create the `users`, `listings`, and `inquiries` tables.

## 4. ENVIRONMENT VARIABLES
1. In your local project root, copy `.env.example` to `.env`.
2. Update `REACT_APP_API_BASE_URL` to your production domain (e.g., `https://yourdomain.com/api`).
3. Update `DATABASE_URL` with your Hostinger database credentials.
4. *Note: For a Vite frontend, variables must be prefixed with `VITE_` instead of `REACT_APP_` if accessed directly in the frontend code. Ensure your build tool is configured correctly.*

## 5. GOOGLE OAUTH SETUP
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: "Dehradun Estates".
3. Navigate to **APIs & Services -> Credentials**.
4. Click **Create Credentials -> OAuth client ID**.
5. Select **Web application**.
6. Under **Authorized JavaScript origins**, add: `https://yourdomain.com`
7. Under **Authorized redirect URIs**, add: `https://yourdomain.com/callback`
8. Copy the generated **Client ID** and paste it into your `.env` file.

## 6. BUILD AND DEPLOYMENT
1. On your local machine, run the production build:
   