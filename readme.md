# Inventory & Sales Management System

## Overview

A fullstack web application for managing inventory and sales, built with Node.js backend and React frontend.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [JSON Structure](#json-structure)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and hybrid role-based access control
- Inventory management
- Sales processing and order management
- Customer management
- Reports and analytics
- Dashboard with key performance indicators

## Changelog

[Trello](https://trello.com/b/ACki64OY/inventory-sales)

## Tech Stack

### Backend

- Node.js
- Express.js
- Database: PostgreSQL
- Authentication: JWT
- Other key libraries: Express, Sequelize

### Frontend

- React
- State Management: [Redux/Context API]
- UI Framework: [Material-UI/Bootstrap/Tailwind]
- Key libraries: [React Router, Axios, etc.]

## System Architecture

```
├── Backend (Node.js)
│   ├── API Layer
│   ├── Business Logic
│   ├── Data Access Layer
│   └── Authentication
└── Frontend (React)
    ├── Components
    ├── Pages
    ├── State Management
    └── API Services
```

## Installation

### Prerequisites

- Node.js (v14.x or higher)
- PostgreSQL 17

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/darrenjo/inventory-sales.git
cd inventory-sales/backend

# Install dependencies
npm install

# Set up environment variables
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in both backend and frontend directories based on the provided examples.

### Backend Environment Variables

```bash
PGHOST=
PGDATABASE=
PGUSER=
PGPASSWORD=
JWT_SECRET=
PGPORT=5432
PORT=5000
```

### Frontend Environment Variables

```bash
REACT_APP_API_URL=http://localhost:5000/v1/api
```

## API Documentation

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | v1/api/auth/login    | User login        |
| POST   | v1/api/auth/register | User registration |

### User

| Method | Endpoint     | Description  |
| ------ | ------------ | ------------ |
| GET    | v1/api/users | See all user |

### Product

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | v1/api/products     | Get all products   |
| POST   | v1/api/products     | Create new product |
| DELETE | v1/api/products/:id | Delete product     |

### Stock

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| GET    | v1/api/stocks      | Get all products          |
| POST   | v1/api/stocks      | Create new product        |
| GET    | v1/api/:id/batches | Get batches by product id |

### Color

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | v1/api/colors | Get all colors   |
| POST   | v1/api/colors | Create new color |

### Sales

| Method | Endpoint                            | Description                         |
| ------ | ----------------------------------- | ----------------------------------- |
| GET    | v1/api/sales/products               | Get all orders                      |
| POST   | v1/api/sales/transactions           | Create new order                    |
| POST   | v1/api/sales/refund                 | Create refund                       |
| POST   | v1/api/sales/return                 | Create return                       |
| GET    | v1/api/sales/summary                | Get sales summary                   |
| GET    | v1/api/sales/category-summary       | Get sales summary data per category |
| GET    | v1/api/sales/sales-by-staff         | Get staff sales summary data        |
| GET    | v1/api/sales/customer-loyalty-stats | Get customer loyalty data           |

### Customer

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| GET    | v1/api/customers/:customerId | Get single customer |
| POST   | v1/api/customers             | Create new customer |

### Permission

| Method | Endpoint                     | Description       |
| ------ | ---------------------------- | ----------------- |
| GET    | v1/api/permissions           | Get permission    |
| POST   | v1/api/permissions           | Create permission |
| PUT    | v1/api/permissions/:id       | Edit permission   |
| DELETE | v1/api/permissions/:id       | Delete permission |
| POST   | v1/api/:id/assign-permission | Assign permission |
| POST   | v1/api/:id/remove-permission | Remove permission |

### Role

| Method | Endpoint         | Description |
| ------ | ---------------- | ----------- |
| GET    | v1/api/roles     | Get role    |
| POST   | v1/api/roles     | Create role |
| PUT    | v1/api/roles/:id | Edit role   |
| DELETE | v1/api/roles/:id | Delete role |

## API Documentation Swagger

```bash
cd backend
npm run dev
```

Visit `localhost:5000/api-docs`

## Database Schema

### Users

```sql
id: UUIDV4
username: VARCHAR
password: VARCHAR
roleId: INT, Foreign Key referencing Roles.id
```

### Product

```sql
id: UUID, Primary Key
name: VARCHAR
category: ENUM ("fabric", "kerah", "manset", "others")
color_code: VARCHAR, Foreign Key referencing Colors.color_code
sell_price: INT
by_who: VARCHAR, Foreign Key referencing Users.id
```

### Batch

```sql
id: VARCHAR, Primary Key
product_id: UUID
price: INT
quantity: INT
by_who: VARCHAR, Foreign Key referencing Users.id
status: ENUM ("new", "return")
```

### Color

```sql
color_code: VARCHAR, Primary Key
fabric_type: VARCHAR
color: VARCHAR
by_who: VARCHAR, Foreign Key referencing Users.id
createdAt: timestamp
```

### StockHistories

```sql
id: UUID, Primary Key
batch_id: VARCHAR
product_id: UUID
price_per_unit: INT
quantity: INT
id: VARCHAR
by_who: VARCHAR, Foreign Key referencing Users.id
createdAt: timestamp
```

### transactions

```sql
id: UUID, Primary Key
sales_staff_id: UUID, Foreign Key referencing Users.id
total_price: INT
customer_id: UUID, Foreign Key referencing Customers.id, allow null
discount: FLOAT
points_earned: INT
createdAt: timestamp

```

### transaction_details

```sql
id: UUID, Primary Key
transaction_id: UUID, Foreign Key referencing transactions.id
product_id: UUID, Foreign Key referencing products.id
quantity: INT
sell_price_at_time: INT
createdAt: timestamp

```

### Refunds

```sql
id: UUID, Primary Key
transaction_id: UUID, Foreign Key referencing transactions.id
product_id: UUID, Foreign Key referencing products.id
quantity: INT
refund_amount: FLOAT
refunded_by: UUID, Foreign Key referencing Users.id
refunded_at: timestamp
```

### Returns

```sql
id: UUID, Primary Key
transaction_id: UUID, Foreign Key referencing transactions.id
product_id: UUID, Foreign Key referencing products.id
batch_id: VARCHAR, Foreign Key referencing Batches.id
quantity: INT
reason: VARCHAR
returned_by: UUID, Foreign Key referencing Users.id
returned_at: timestamp
```

### Customers

```sql
id: UUID, Primary Key
name: VARCHAR
phone: VARCHAR
email: VARCHAR
total_spent: INT
points: INT
membership_tier: ENUM ("Default", "Starter", "Regular", "Bronze","Silver", "Gold", "Platinum"), default value: "Default"
last_transaction_at: timestamp
```

### loyalty_history

```sql
id: UUID, Primary Key
customer_id: UUID, Foreign Key referencing Customers.id
transaction_id: UUID, Foreign Key referencing transactions.id
points_added: INT
total_points_after: INT
createdAt: timestamp
```

### Roles

```sql
id: INT, Primary Key, auto increment
name: VARCHAR
```

### Permissions

```sql
id: INT, Primary Key, auto increment
name: VARCHAR
```

### RolePermissions

```sql
roleId: INT, Foreign Key referencing Roles.id
permissionId: INT, Foreign Key referencing Permissions.id
```

## Usage

### Admin Dashboard

The admin dashboard provides a comprehensive view of the system, including:

1. Sales overview
2. Inventory status
3. Recent orders
4. Customer activity

### Inventory Management

Steps to add a new product:

1. Navigate to Products > Add New Product
2. Fill in product details
3. Set pricing and stock information
4. Save the product

### Processing Sales

1. Navigate to POS/Sales section
2. Select customer or create new
3. Apply discounts if applicable
4. Process payment
5. Complete order

## Testing

```bash
# Run backend tests
cd backend
npm run dev

# Run frontend tests
cd frontend
npm run dev
```

## Deployment

### Backend Deployment

Instructions for deploying the Node.js backend to your preferred hosting platform (e.g., Heroku, AWS, DigitalOcean).

### Frontend Deployment

Instructions for deploying the React frontend to your preferred hosting platform (e.g., Netlify, Vercel, AWS S3).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
