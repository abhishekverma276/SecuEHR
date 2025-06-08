# Authentication & Authorization Microservice

## 🚀 Overview
This is a **production-ready** Authentication & Authorization Microservice built with **Node.js, Express, and TypeScript**. It supports:

- **JWT Authentication**
- **Two-Factor Authentication (TOTP)**
- **Role-Based Access Control (RBAC)**
- **User Registration & Management**
- **API Authentication for Multiple Applications & Organizations**
- **Super Admin Management**
- **Database Migrations & Seeding**
<!-- - **Logging & Monitoring** -->
- **Docker Deployment**

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, TypeORM
- **Authentication:** JWT, TOTP (Google Authenticator, Authy)
- **Validation:** Express-Validator
<!-- - **Logging & Monitoring:** Winston, Morgan -->
- **Containerization:** Docker, Docker Compose
- **Testing:** Jest, Supertest

---

## 📂 Project Structure
```
├── src/
│   ├── controllers/     # API Controllers
│   ├── entitiy/        # Database Entities (TypeORM)
│   ├── middleware/      # Authentication & Validation Middleware
│   ├── routes/         # API Routes       
│   ├── utility/          # Helper Functions
│   ├── migration/     # Database Migrations
│   ├── scripts/        # Super Admin Seeder        
│   ├── tests/          
│   └── index.ts        # Main Application Entry Point
├── .env 
├── __tests__            # Unit & Integration Tests
├── docker-compose.yml   # Docker Configuration
├── Dockerfile           # Docker Build File
├── package.json         # Dependencies & Scripts
└── README.md            # Project Documentation
```

---

## 🔧 Installation & Setup
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/saurabh2k1/auth-service.git
cd auth-service
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory and update it with your values:
```ini
# Database Configuration
DB_HOST=db  # Use 'localhost' if not using Docker
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=authdb

# Authentication
JWT_SECRET=your-jwt-secret
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=superadmin
```

### 4️⃣ Run Database Migrations & Seed Super Admin
```sh
npm run build
npm run migrate
npm run seed
```

### 5️⃣ Start the Server
```sh
npm start
```
Server runs on **http://localhost:3000** 🚀

---

## 📌 API Endpoints

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login with username/password |
| `POST` | `/auth/password-request` | Password request |
| `POST` | `/auth/reset-password` | Reset password |
| `POST` | `/auth/2fa/setup/:userId` | Two Factor Setup |
| `POST` | `/auth//2fa/verify/:userId` | Verify Two Factor OTP |

### **User Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users/` | Get all users (Admin Only) |
| `PATCH` | `/admin/users/:id` | Update user details |
| `DELETE` | `/api/users/:id` | Delete user (Admin Only) |

<!-- ### **Roles & Permissions**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roles` | Get all roles |
| `POST` | `/api/roles` | Create new role (Admin) |
| `PATCH` | `/api/roles/:id` | Update role |
| `DELETE` | `/api/roles/:id` | Delete role | -->

---

## 🐳 Docker Deployment

### 1️⃣ Build & Run with Docker
```sh
docker-compose up --build -d
```

### 2️⃣ Check Running Containers
```sh
docker ps
```

### 3️⃣ Stop & Remove Containers
```sh
docker-compose down
```

---

## 🧪 Running Tests
### Run Unit & Integration Tests
```sh
npm test
```


---

## 🔥 Logging & Monitoring
- **Logs are stored in `/logs` directory** using Winston & Morgan.
- API performance monitoring can be done with tools like Prometheus, Grafana.

---

## 📜 License
MIT License © 2025 Saurabh Sharma.

---

## 👨‍💻 Author
Developed & Maintained by **Saurabh Sharma** 🚀

