# User Management System

## Backend Prerequisite

1. go to `/backend` and run this command to install dependencies

```
npm install
```

2. create `.env` files at `/backend`. I use Postgre 17.

```
PORT=5000
DATABASE_URL=
JWT_SECRET=
```

3. run this command

```
npx nodemon server.js
```

## API Endpoints

#### User Endpoints

- Register:

  - URL: `/api/auth/register`
  - Method: `POST`
  - Roles: `admin, viewer, superadmin`
  - Body:

  ```json
  {
    "name": "admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }
  ```

  - **Expected output**:

  ```json
  {
    "message": "Registrasi berhasil",
    "user": {
      "id": 1,
      "name": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```

- Login:

  - URL: `/api/auth/login`
  - Method: `POST`
  - Body:

  ```json
  {
    "email": "admin@example.com",
    "password": "securepassword"
  }
  ```

  - **Expected output**:

  ```json
  {
    "message": "Login successful",
    "token": <TOKEN>
  }
  ```

---

#### Admin Endpoints

- View admin data:

  - URL: `/api/inventory/admin-data`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN_ADMIN>
  - Body:

  ```json
  -
  ```

  - **Expected output**:

  ```json
  {
    "message": "Data ini hanya bisa diakses oleh admin"
  }
  ```

  - **Expected output (not appropriate token role)**:

  ```json
  {
    "message": "message": "Akses ditolak, Anda tidak memiliki izin"
  }
  ```

  - **Expected output (invalid token)**:

  ```json
  {
    "message": "message": "Token tidak valid"
  }
  ```

---

#### Viewer Endpoints

- View viewer data:

  - URL: `/api/inventory/viewer-data`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN_VIEWER>
  - Body:

  ```json
  -
  ```

  - **Expected output**:

  ```json
  {
    "message": "Data ini hanya bisa diakses oleh viewer"
  }
  ```

  - **Expected output (not appropriate token role)**:

  ```json
  {
    "message": "message": "Akses ditolak, Anda tidak memiliki izin"
  }
  ```

  - **Expected output (invalid token)**:

  ```json
  {
    "message": "message": "Token tidak valid"
  }
  ```

---

#### Superadmin Endpoints

- View admin data:

  - URL: `/api/inventory/admin-data`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <token>
  - Body:

  ```json
  -
  ```

  - **Expected output**:

  ```json
  {
    "message": "Data ini hanya bisa diakses oleh admin"
  }
  ```

- View viewer data:

  - URL: `/api/inventory/viewer-data`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN_SUPERADMIN>
  - Body:

  ```json
  -
  ```

  - **Expected output**:

  ```json
  {
    "message": "Data ini hanya bisa diakses oleh viewer"
  }
  ```

  - **Expected output (invalid token)**:

  ```json
  {
    "message": "message": "Token tidak valid"
  }
  ```

---

#### Color Enpoints

- View all colors:

  - URL: `/api/colors`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**: List colors in database

- Add color:

  - URL: `/api/colors`
  - Method: `POST`
  - **Headers**: Authorization: Bearer <TOKEN>
  - Body:

  ```json
  {
    "name": "Merah"
  }
  ```

  - **Expected output**:

  ```json
  {
    "message": "Warna baru berhasil ditambahkan"
  }
  ```

- Delete color:

  - URL: `/api/colors/:id`
  - Method: `DELETE`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**:
    ```json
    {
      "message": "Warna berhasil dihapus"
    }
    ```

---

#### Price Enpoints

- View all price:

  - URL: `/api/price`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**: List price in database

- Add price:

  - URL: `/api/price`
  - Method: `POST`
  - **Headers**: Authorization: Bearer <TOKEN>
  - Body:

  ```json
  {
    "price": 50000
  }
  ```

  - **Expected output**:

  ```json
  {
    "message": "price baru berhasil ditambahkan"
  }
  ```

- Delete price:

  - URL: `/api/price/:id`
  - Method: `DELETE`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**:
    ```json
    {
      "message": "Harga berhasil dihapus"
    }
    ```

---

#### Inventory Enpoints

- View all inventory:

  - URL: `/api/inventory`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**: List inventory in database

- View inventory based on ID:

  - URL: `/api/inventory/:id`
  - Method: `GET`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**: List inventory based on ID

- Add inventory:

  - URL: `/api/inventory`
  - Method: `POST`
  - **Headers**: Authorization: Bearer <TOKEN>
  - Body:

  ```json
  {
    "name": "Kain Katun",
    "color_id": 1,
    "price_id": 1,
    "stock": 100,
    "updated_by": 2
  }
  ```

  - **Expected output**:

  ```json
  {
    "message": "inventory baru berhasil ditambahkan"
  }
  ```

- Update inventory:

  - URL: `/api/inventory/:id`
  - Method: `PUT`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**:
    ```json
    {
      "message": "Data inventory berhasil diperbarui"
    }
    ```

- Delete inventory:

  - URL: `/api/inventory/:id`
  - Method: `DELETE`
  - **Headers**: Authorization: Bearer <TOKEN>

  - **Expected output**:
    ```json
    {
      "message": "inventory berhasil dihapus"
    }
    ```

---
