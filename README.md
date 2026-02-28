# 🏕️ CampSync Inventory Application

CampSync is a robust Next.js application designed to manage, lend, and track camping equipment. This tool gives you the ability to view a global rental list, organize personal gear, and arbitrate loan returns. 

## 🚀 Local Deployment Guide

Follow these instructions to safely build and spin up your own local isolated instance of the platform.

### Prerequisites
Make sure you have Node.js and NPM installed on your machine.
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher 

### 1. Installation

Clone this repository and install the Node runtime dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create a secure, active configuration script:
```bash
cp .env.example .env
```
Ensure the `DATABASE_URL` within the `.env` file points to your local `.db` file path. It will look like this: `DATABASE_URL="file:./dev.db"`. 

### 3. Initialize the Database
This application uses **SQLite** as its lightweight, filesystem-bound database and **Prisma** as the ORM.

You must push the data models (Tables) into the SQLite database to generate `dev.db`:
```bash
npx prisma db push
```

### 4. Administrator Setup & Actions
*Note: Administrator accounts cannot be created on the public `localhost:3000/register` website for security purposes.*

**Generate an Admin Account:**
Generate a secure root Administrator account to manage global arbitrations on your instance:
```bash
npx tsx scripts/create-admin.ts <your_username> <your_password>
```

**List System Users:**
View all registered accounts, their UUIDs, karma scores, and roles:
```bash
npx tsx scripts/list-users.ts
```

**Deactivate an Account:**
If a user is abusing the system, you can strip their login privileges without touching their existing rental rows:
```bash
npx tsx scripts/deactivate-user.ts <target_username>
```

### 5. Launch the Application
Start the Next.js development server:
```bash
npm run dev
```

The application is now actively serving! Visit [http://localhost:3000](http://localhost:3000) to create a standard account or login with your shiny new Administrator credentials. 

---

### Future Notes
*Instructions targeting public web deployments (e.g. Vercel, Docker mapping) will be added to this document as production requirements finalize.*
