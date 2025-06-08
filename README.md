# SecuEHR: Secure Electronic Health Records Platform

SecuEHR is a robust, production-ready platform for managing Electronic Health Records (EHR) with a strong focus on **security**, **authentication**, and **user management**. Built using the MERN stack and modern microservices architecture, SecuEHR leverages advanced encryption and role-based access controls to ensure sensitive healthcare data is protected and compliant.

## 🚀 Features

- **Secure EHR Management:** Store, update, and retrieve electronic health records with end-to-end encryption using AES.
- **User Authentication & Authorization:** 
  - Registration and login with JWT-based authentication.
  - Two-Factor Authentication (TOTP compatible with Google Authenticator/Authy).
  - Role-Based Access Control (RBAC) for fine-grained permissions.
- **Admin & User Management:** 
  - Admin dashboard for managing users and roles.
  - Super Admin setup and privileged operations.
- **Brute-Force Protection:** Login limiter to mitigate brute-force attacks.
- **API for Multiple Applications:** Secure API endpoints for accessing EHR data and authentication services.
- **Audit & Monitoring:** Logging and health endpoints for monitoring microservices.

## 🛡️ Security

- **AES Encryption:** All sensitive health data is encrypted at rest in MongoDB.
- **SHA-256 Hashing:** Passwords are securely hashed before storage.
- **JWT Tokens:** All API access is authenticated using signed JWTs.
- **Rate Limiting:** Prevents abuse and brute-force attacks.

## 🛠️ Technology Stack

- **Frontend:** React, React Router, Bootstrap
- **Backend:** Node.js, Express, TypeScript (microservices)
- **Database:** MongoDB (EHR), PostgreSQL (Auth), TypeORM
- **Authentication:** JWT, TOTP (2FA)
- **Containerization:** Docker, Docker Compose
- **Testing:** Jest, Supertest
- **Logging & Monitoring:** Winston, Morgan, Prometheus-ready metrics

## 📂 Project Structure

```
SecuEHR/
├── frontend/        # React application (EHR client)
├── backend/         # Node/Express API for EHR data
├── auth-service/    # Authentication & Authorization microservice (Node/TS)
├── ehr-service/     # EHR management microservice
├── docker-compose.yml
├── README.md
```

## ⚙️ Installation & Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (for local development)
- [Docker](https://www.docker.com/) (for production deployment)

### Local Development

#### 1. Clone the Repository
```sh
git clone https://github.com/abhishekverma276/SecuEHR.git
cd SecuEHR
```

#### 2. Setup Frontend
```sh
cd frontend
npm install
npm run dev
# Visit http://localhost:5173/
```

#### 3. Setup Backend (EHR Service)
```sh
cd ../backend
npm install
npm start
```

#### 4. Setup Auth Service
```sh
cd ../auth-service
npm install
cp .env.example .env   # Edit with your DB and JWT config
npm run build
npm run migrate
npm run seed
npm start
# Auth service runs on http://localhost:3000/
```

### Docker Deployment

Spin up the entire stack with:
```sh
docker-compose up --build -d
```
Stop services with:
```sh
docker-compose down
```

## 🧪 Running Tests

Each service contains its own unit and integration tests:
```sh
# Example for auth-service
cd auth-service
npm test
```

## 📌 API Endpoints

#### Authentication
- `POST /auth/register` — Register new user with 2FA option
- `POST /auth/login` — User login (JWT)
- `POST /auth/2fa` — 2FA verification

#### User Management
- `GET /admin/users` — List all users (admin)
- `PATCH /admin/users/:id` — Update user
- `DELETE /admin/users/:id` — Delete user

#### Health & Metrics
- `GET /health` — Service health check
- `GET /metrics` — Prometheus metrics

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/45065f28-db22-43e9-8919-82d587f25194)
![image](https://github.com/user-attachments/assets/3eed4db4-e31e-4551-8c34-5f83824a5cc3)
![image](https://github.com/user-attachments/assets/1bf6155a-5478-43ec-a743-1b2599ce44c0)
![Screenshot 2023-12-12 221548](https://github.com/abhishekverma276/SecuEHR/assets/96565154/91087459-8977-4794-bc9e-564cf5096d5f)
![Screenshot 2023-12-12 224918](https://github.com/abhishekverma276/SecuEHR/assets/96565154/cb024dcf-ade6-4909-b80b-035b40dc733b)
![Screenshot 2023-12-12 224903](https://github.com/abhishekverma276/SecuEHR/assets/96565154/82ded2ec-4882-4619-983a-6aec98684ac7)


## 📜 License

MIT License © 2025 abhishekverma276

---

**Give us a star if you find this project useful! ⭐🤗**
