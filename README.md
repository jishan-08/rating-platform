# Rating Platform

A full-stack role-based Store Rating Platform that allows customers to discover stores, submit and update ratings, while Store Owners can monitor their store performance and Administrators can manage users, stores, and platform-level statistics.

## 🌐 Project Overview

The Rating Platform is designed around three primary roles:

- Customer
- Store Owner
- Administrator

Each role has a dedicated workflow and permissions.

The system uses backend-enforced Role-Based Access Control (RBAC) to prevent unauthorized access to protected resources.

---

## ✨ Main Features

### 👤 Customer

- Register an account
- Login securely
- Browse stores
- Search stores by name/address
- View store rating information
- Submit 1–5 star ratings
- Update existing ratings
- View personal ratings
- Access customer dashboard

### 🏪 Store Owner

- Login through the standard authentication portal
- Access Store Owner Dashboard
- View store information
- View average store rating
- View total number of ratings
- View 1–5 star rating distribution
- View customer reviews and feedback
- Access only their own store data

### 🛡️ Administrator

- Dedicated Admin Login
- Admin Dashboard
- View platform statistics
- View all registered users
- Filter users by role
- Search users
- View all stores
- Search stores
- View store rating statistics
- Create store and associated Store Owner
- Manage platform-level data

---

## 🏗️ System Architecture

The application follows a layered full-stack architecture.

Frontend:

React + Vite

Backend:

Node.js + Express.js

Database:

MySQL

Backend architecture:

Routes
→ Controllers
→ Services
→ Repositories
→ MySQL Database

Authentication:

JWT

Password Security:

bcrypt

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS

### Backend

- Node.js
- Express.js
- JavaScript
- JWT Authentication
- bcrypt Password Hashing

### Database

- MySQL
- SQL
- Relational database design
- Parameterized queries

### Development Tools

- Git
- GitHub
- VS Code
- Postman / browser testing

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MySQL-compatible hosted database

---

## 🔐 Authentication & Authorization

The application uses JWT-based authentication.

After successful login, the server generates a JWT containing:

- User ID
- User Role

Protected requests send the token using:

Authorization: Bearer <token>

The backend verifies the token before allowing access to protected resources.

---

## 🛡️ Role-Based Access Control

The platform implements backend Role-Based Access Control (RBAC).

### Customer

Role:

USER

Customers can access customer-specific functionality but cannot access Store Owner or Admin APIs.

### Store Owner

Role:

STORE_OWNER

Store Owners can access only their own store-related information.

### Administrator

Role:

ADMIN

Administrators can access platform management APIs.

---

## 🔒 Security

The project implements several security mechanisms:

- JWT authentication
- Backend role authorization
- bcrypt password hashing
- Protected API routes
- Parameterized SQL queries
- SQL injection prevention
- JWT secret validation
- Password hash removal from API responses
- Owner data isolation
- Input validation

Unauthorized API requests return appropriate HTTP status codes.

Example:

401 Unauthorized
→ Authentication is missing or invalid.

403 Forbidden
→ User is authenticated but does not have sufficient permissions.

---

## ⭐ Rating System

Customers can submit ratings from 1 to 5 stars.

The system allows a customer to have one rating per store.

If the customer rates the same store again, the existing rating is updated instead of creating a duplicate rating.

The platform dynamically calculates:

- Average rating
- Total ratings
- Rating distribution
- Individual customer ratings

---

## 🗄️ Database

The application uses MySQL as its relational database.

The database stores information related to:

- Users
- Stores
- Ratings
- Store Owners
- Relationships between users and stores

Database operations are implemented through repository classes.

Parameterized SQL queries are used to reduce SQL injection risks.

---

## 📁 Project Structure

```text
rating-platform/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── config/
│   │   └── ...
│   │
│   ├── scripts/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
