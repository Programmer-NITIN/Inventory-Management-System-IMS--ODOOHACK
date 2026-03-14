# CoreInventory – Local Setup Guide

Follow these steps to configure and run the CoreInventory Management System locally.

## Prerequisites
1. **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
2. **PostgreSQL**: Ensure you have PostgreSQL installed and running on your machine.
3. **Firebase Account**: You need a Firebase project for Authentication.

---

## Part 1: PostgreSQL Database Setup

If you do not have PostgreSQL installed, follow these steps to install and configure it on Windows:

### 1. Download and Install PostgreSQL
1. Go to the official PostgreSQL download page: [EnterpriseDB PostgreSQL Installers](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
2. Download the latest version for **Windows x86-64**.
3. Run the installer (`.exe` file).
4. During installation:
   - Keep the default installation directory.
   - **Select components:** Ensure *PostgreSQL Server*, *pgAdmin 4* (GUI tool), and *Command Line Tools* are checked.
   - **Data Directory:** Keep the default.
   - **Password:** Create a strong password for the default `postgres` superuser. **Remember this password**, as you will need it for the `.env` file!
   - **Port:** Keep the default `5432`.
   - **Locale:** Keep the default or select your region.
5. Finish the installation (you can uncheck the Stack Builder prompt at the end).

### 2. Create the Database
You can create the database using either the GUI (pgAdmin) or the command line (psql).

**Option A: Using pgAdmin 4 (GUI - Recommended for beginners)**
1. Open **pgAdmin 4** from your Windows Start menu.
2. Enter the password you created during installation to unlock pgAdmin.
3. In the left sidebar, expand **Servers** > **PostgreSQL [Version]**. (Enter your password again if prompted).
4. Right-click on **Databases** and select **Create** > **Database**.
5. In the "Database" field, type exactly: `coreinventory`
6. Click **Save**.

**Option B: Using psql (Command Line)**
1. Open the "SQL Shell (psql)" application from your Windows Start menu.
2. Press `Enter` for Server, Database, Port, and Username to accept the defaults.
3. Type the password you created during installation (the characters won't show up on screen).
4. Run the following SQL command to create the database:
   ```sql
   CREATE DATABASE coreinventory;
   ```
5. Type `\q` and press Enter to exit.

### 3. Verify Database Credentials
Your database URL format for the backend `.env` file will look like this:
`postgres://[username]:[password]@localhost:[port]/[database_name]`

Because you used the default settings, yours will be:
`postgres://postgres:YOUR_PASSWORD@localhost:5432/coreinventory`

---

## Part 2: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Dependencies:**
   *(If you haven't already)*
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy the example environment file to create your actual `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Open `backend/.env` and update the database configuration to match your local PostgreSQL setup:
     ```env
     PORT=5000
     # Change 'postgres' and 'password' to your actual PostgreSQL username and password
     DATABASE_URL=postgres://postgres:password@localhost:5432/coreinventory
     CORS_ORIGIN=http://localhost:3000
     ```

4. **Firebase Admin SDK Setup:**
   - Go to your [Firebase Console](https://console.firebase.google.com/).
   - Click the **Gear icon** (Project settings) > **Service accounts**.
   - Click **Generate new private key** and save the `.json` file.
   - Rename the downloaded file to `firebase-service-account.json`.
   - Place this file directly inside the `backend/src/config/` folder.

5. **Run Database Migrations and Seed Data:**
   This command will create all the necessary 14 tables and insert some initial demo data (warehouses, locations, categories, products):
   ```bash
   npm run migrate
   ```

6. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   *You should see a message saying `✅ Database connected` and `🚀 CoreInventory API running on port 5000`.*

---

## Part 3: Frontend Setup

1. **Open a new terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   *(If you haven't already)*
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy the example environment file:
     ```bash
     cp .env.local.example .env.local
     ```
   - Go back to your [Firebase Console](https://console.firebase.google.com/).
   - Click the **Gear icon** (Project settings) > **General**.
   - Scroll down to "Your apps". If you haven't added a web app, click the **`</>` (Web)** icon to create one.
   - Copy the `firebaseConfig` keys from the Firebase console and paste them into `frontend/.env.local`:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

4. **Start the Frontend Server:**
   ```bash
   npm run dev
   ```
   *The Next.js app will start compiling.*

---

## Part 4: Using the Application

1. **Set Up Authentication:**
   - In your Firebase Console, go to **Build > Authentication** and **Get Started**.
   - Go to the **Sign-in method** tab and enable **Email/Password**.
   - Next, go to the **Users** tab and click **Add User** to create your first admin account (e.g., `admin@coreinventory.com` / `password123`).

2. **Log In:**
   - Open your browser and go to `http://localhost:3000`.
   - Log in using the email and password you just created in Firebase.

3. **Troubleshooting Sync:**
   - On the very first login, the frontend will take your Firebase token and sync your user account into the PostgreSQL database. 
   - Since the DB sets the default role to `operator` for new users, your initial login won't have manager privileges.
   - **To switch to Manager (optional):** Open your SQL client and run:
     ```sql
     UPDATE users SET role = 'manager' WHERE email = 'admin@coreinventory.com';
     ```
   - Refresh the page to see all Manager-level dashboard charts and the ability to validate operations.
