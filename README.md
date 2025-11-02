# ⚙️ Auto-Generated CRUD + RBAC Platform

### 📄 Overview
This project implements a **fully automated CRUD + RBAC (Role-Based Access Control) platform** built using **Node.js (Express)** and **Vanilla JavaScript**.  
It allows users (Admin, Manager, Viewer) to dynamically define models and instantly generate RESTful CRUD APIs, all without writing backend code manually.

This project was developed as part of the **SDE Assignment: Auto-Generated CRUD + RBAC Platform**.

---

## 🧱 Features
- 🧩 **Model Builder UI** – Create models dynamically (name, fields, RBAC).  
- ⚙️ **Auto CRUD API Generation** – Instantly registers `/api/<model>` routes.  
- 🔒 **Role-Based Access Control (RBAC)** – Admin / Manager / Viewer permissions.  
- 💾 **File-Based Storage** – Models and data are stored in JSON files.  
- 🧭 **Admin Dashboard** – Displays total models, total records, and active users.  
- 🌙 **Modern Corporate UI** – Responsive layout with light/dark themes.  
- 🔁 **Persistent Sessions** – Logged-in users stay signed in after reload.  
- 👤 **Profile Dropdown** – Displays current user info (ID, role).  

---

## 📁 Folder Structure
auto-crud-platform/
│
├── backend/
│ ├── server.js # Express server entry point
│ ├── routes/
│ │ └── dynamicRoutes.js # Auto-registers model CRUD APIs
│ ├── models/ # Saved model definition JSON files
│ ├── data/ # JSON data for records of each model
│ └── utils/ # Helper modules for RBAC & file operations
│
├── frontend/
│ └── static-ui/
│ ├── index.html # Dashboard + Model Builder + Login UI
│ ├── style.css # Corporate & responsive design
│ └── script.js # Client-side logic for CRUD & login


---

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites
Ensure you have:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

---

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/BattulaNagaVenkataDurgaVignesh/auto-crud-platform.git
cd auto-crud-platform

3️⃣ Setup Backend
cd backend
npm install
npm start

✅ The backend starts on http://localhost:4000

4️⃣ Access Frontend

Option 1 – Served by backend:
http://localhost:4000/index.html

Option 2 – Directly open:
frontend/static-ui/index.html
(or serve it with VS Code “Live Server”)


🧠 How to Use
🧾 1. Login
Enter any User ID (e.g. admin1)
Select a Role (Admin / Manager / Viewer)
Click Login

✅ After login:
Sidebar shows Dashboard, Published Models, and Model Builder (for Admins).
Logout button becomes visible on the top-right.


🏗️ 2. Create & Publish a Model

Open Model Builder (visible only to Admins).
Enter Model Name (e.g. Employee).
Click + Add Field to define model attributes (e.g. name, age).
Adjust RBAC JSON if needed.
Click Publish Model.

🗂️ The backend saves the model file in:
backend/models/Employee.json
Example:
{
  "name": "Employee",
  "fields": [
    { "name": "name", "type": "string" },
    { "name": "age", "type": "number" }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create","read","update"],
    "Viewer": ["read"]
  }
}

📂 3. File Write Mechanism

When a model is published, frontend sends a POST /models request.
The backend writes the model JSON file to /backend/models/<ModelName>.json.
A matching data file is created in /backend/data/<ModelName>.json for records.
This ensures models and their data persist even after a restart.


🔄 4. Dynamic CRUD Endpoint Registration

When a new model is added:
  1) Backend reads the new model file.
  2) Dynamically registers REST routes for it:
    GET    /api/<model>
    POST   /api/<model>
    PUT    /api/<model>/:id
    DELETE /api/<model>/:id

  3)RBAC middleware checks the user’s role and model permissions.
  4)The API is instantly active — no server restart needed.


📊 5. Published Models

Click Published Models in sidebar.
Displays all created models.
Click any model → view & manage its records.

🔐 6. Role-Based Access Control (RBAC)
Role	Permissions
Admin	All (create, read, update, delete)
Manager	create, read, update
Viewer	read only

RBAC rules are defined in each model’s JSON file and enforced per request.


🌗 Dashboard Overview

Displays real-time animated stats:
🧩 Total Models
🗂️ Total Records
👥 Active Users

Stats reset to 0 on logout.


🧰 Tech Stack

Frontend: HTML, CSS, Vanilla JS
Backend: Node.js, Express.js
Storage: JSON files (models & data)
Authentication: Token-based role simulation
UI: Responsive corporate design (light/dark themes)


🧪 Example API Endpoints
Method	Endpoint	Description
GET	/models	List all models
POST	/models	Publish new model
GET	/api/<model>	List all records
POST	/api/<model>	Create new record
PUT	/api/<model>/:id	Update record
DELETE	/api/<model>/:id	Delete record


Use this header in all API requests:

Authorization: Bearer <token>


🧾 Deliverables Checklist
Deliverable	Status
GitHub Repo Link	✅ https://github.com/BattulaNagaVenkataDurgaVignesh/auto-crud-platform
Working Backend + Admin UI	✅ Implemented
README with Setup & Usage	✅ Included
File-write + Dynamic Route Docs	✅ Explained
Sample Models	✅ Added via UI
Screenshots / Demo Video


👨‍💻 Author
Vignesh Battula
🗓️ November 2025
Auto-Generated CRUD + RBAC Platform
