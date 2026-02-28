# Administrator Guide 🛡️

**AUTHORIZED PERSONNEL ONLY**
This document outlines the privileged system commands, workflows, and arbitration paths restricted strictly to `ADMIN` accounts. 

---

## 👥 Managing System Access

For security purposes, the ability to create new Administrator accounts is completely removed from the frontend Next.js interface. Escalation of privileges from a standard `USER` directly to an `ADMIN` via the web API is prohibited.

### Creating an Admin Account
To grant an individual Administrative rights, the System Owner must execute a backend generation script directly via the production server terminal.

1. SSH into the production server.
2. Navigate to the root directory `project_camp_inventory`.
3. Run the secure generation script:
   ```bash
   npx tsx scripts/create-admin.ts <desired_username> <secure_password>
   ```
4. The script will hash the password via bcrypt and inject the Administrator entity directly into the database. Provide the credentials to the new Admin manually.

---

## ⚖️ Admin Arbitration

Administrators are responsible for mediating disputes between users regarding returned rental equipment.

### The Arbitration Process
1. A loan completes, but the Owner claims the item was damaged while the Loanee claims it was received that way. 
2. Either party triggers the "Request Arbitration" flag on the loan record.
3. *Future Implementation:* Administrators will receive an alert in the dashboard. They can review both the `Loanee Observation` notes and the `Owner Status Update` notes to mediate the conflict.
4. Arbitration disputes do not block the active loan cycle, and the item can still be requested by others if the owner resets it to `AVAILABLE`. 

---

## 🗄️ Universal Inventory Overview

Unlike standard users who only see Public global gear and their own Private gear, Administrators possess a complete overview.

- **Universal Visibility**: Admins can view *all* items in the system, bypassing the `isPublic` flag toggles set by owners.
- **Global Search**: Admins can utilize the tags filtering system to rapidly search the entire database across all privacy scopes.
