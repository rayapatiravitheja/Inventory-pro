# 🔌 InventoryPro — REST API Technical Specification & Reference

This document provides the exhaustive API reference for **InventoryPro**, detailing endpoints, HTTP verbs, RBAC access levels, request parameters, JSON payloads, and response schemas.

- **Base URL (Production)**: `https://inventorypro-api-l20i.onrender.com/api/v1`
- **Base URL (Local)**: `http://localhost:3001/api/v1`
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <JWT>`) or HTTP-only signed cookie (`accessToken`).

---

## 📑 Table of Contents
1. [Standard Response Envelope](#1-standard-response-envelope)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Product Catalog & Image Ingestion](#3-product-catalog--image-ingestion)
4. [Warehouse Management System (WMS)](#4-warehouse-management-system-wms)
5. [Stock Transfers & Adjustments](#5-stock-transfers--adjustments)
6. [Customer Storefront & Orders](#6-customer-storefront--orders)
7. [Razorpay Payment Gateway](#7-razorpay-payment-gateway)
8. [Customer Returns (RMA) & Refunds](#8-customer-returns-rma--refunds)
9. [Suppliers & Procurement](#9-suppliers--procurement)
10. [Reports & Low-Stock Scheduler](#10-reports--low-stock-scheduler)
11. [Double-Entry Stock Ledger](#11-double-entry-stock-ledger)
12. [System Health & Diagnostics](#12-system-health--diagnostics)

---

## 1. Standard Response Envelope

All API endpoints return a standardized JSON structure:

### Success Response (`HTTP 200 / 201`)
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Operation completed successfully",
  "success": true
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": [],
  "success": false
}
```

---

## 2. Authentication & User Management

Prefix: `/users`

### 2.1 User Registration
- **Method**: `POST`
- **Path**: `/users/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password@123",
  "role": "customer",
  "phone": "9876543210"
}
```
- **Response**: `201 Created` with created user object (passwords and sensitive tokens omitted).

### 2.2 User Login
- **Method**: `POST`
- **Path**: `/users/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "6aebee944e479aab8b989298",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User logged In Successfully",
  "success": true
}
```

### 2.3 Current Session Profile
- **Method**: `GET`
- **Path**: `/users/current-user`
- **Access**: Private (Authenticated)
- **Response**: `200 OK` with full profile and assigned warehouses.

### 2.4 User Logout
- **Method**: `POST`
- **Path**: `/users/logout`
- **Access**: Private
- **Response**: `200 OK` (clears cookies and revokes MongoDB refresh token).

---

## 3. Product Catalog & Image Ingestion

Prefix: `/products`

### 3.1 List Products
- **Method**: `GET`
- **Path**: `/products`
- **Access**: Private
- **Query Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `search`: Keyword string matching SKU or product name
  - `category_id`: Category filter
  - `warehouse_id`: Facility filter
- **Response**: `200 OK` with paginated products array and total counts.

### 3.2 Create Product (Multi-Image)
- **Method**: `POST`
- **Path**: `/products`
- **Access**: Admin only
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `product_name`: String
  - `product_code`: Strict 8-char uppercase alphanumeric SKU (`[A-Z0-9]{8}`)
  - `category_id`: MongoDB ObjectId
  - `unit_id`: MongoDB ObjectId
  - `buying_price`: Number
  - `selling_price`: Number
  - `stock`: Initial integer count
  - `min_threshold`: Number (default: `10`)
  - `images`: File array (up to 8 images, JPEG/PNG/WebP, max 5MB each)
  - `primary_image_index`: Index of primary cover photo (default: `0`)
- **Response**: `201 Created`

### 3.3 Bulk CSV Product Upload
- **Method**: `POST`
- **Path**: `/products/bulk-upload`
- **Access**: Admin only
- **Content-Type**: `multipart/form-data`
- **Payload**: `file` (CSV with headers: `product_name, product_code, category, unit, buying_price, selling_price, stock, min_threshold`)
- **Response**: `200 OK` or `207 Multi-Status` with partial failure log.

---

## 4. Warehouse Management System (WMS)

Prefix: `/warehouses`

### 4.1 List Facilities
- **Method**: `GET`
- **Path**: `/warehouses`
- **Access**: Private (Admin & Manager)
- **Response**: `200 OK` with facility list and location details.

### 4.2 Create Facility
- **Method**: `POST`
- **Path**: `/warehouses`
- **Access**: Admin only
- **Request Body**:
```json
{
  "warehouse_name": "Bengaluru Central Hub",
  "warehouse_code": "WH-BLR-01",
  "address": {
    "street": "Plot 42, Electronic City Phase 1",
    "state": "Karnataka",
    "city": "Bengaluru",
    "pincode": "560100"
  },
  "capacity": 15000,
  "is_default": true
}
```

### 4.3 Query Warehouse Stock by Facility
- **Method**: `GET`
- **Path**: `/warehouses/stock?warehouse_id=...`
- **Access**: Private
- **Response**: `200 OK` returning item counts and bin locations per product.

---

## 5. Stock Transfers & Adjustments

Prefix: `/transfers` & `/adjustments`

### 5.1 Create Inter-Warehouse Transfer
- **Method**: `POST`
- **Path**: `/transfers`
- **Access**: Manager+
- **Request Body**:
```json
{
  "source_warehouse_id": "6aebee954e479aab8b9892c1",
  "destination_warehouse_id": "6aebee954e479aab8b9892c2",
  "items": [
    {
      "product_id": "6aebee974e479aab8b9892d6",
      "quantity": 10
    }
  ],
  "notes": "Regional replenishment"
}
```

### 5.2 Physical Cycle Count Adjustment
- **Method**: `POST`
- **Path**: `/adjustments`
- **Access**: Manager+
- **Request Body**:
```json
{
  "warehouse_id": "6aebee954e479aab8b9892c1",
  "product_id": "6aebee974e479aab8b9892d6",
  "counted_quantity": 48,
  "reason": "Physical cycle count variance"
}
```
- **Behavior**: Compares counted vs system stock, dispatches `adjustment_add` or `adjustment_deduct`, and appends immutable entry to `StockLedger`.

---

## 6. Customer Storefront & Orders

Prefix: `/orders`

### 6.1 Customer Checkout (COD or Offline)
- **Method**: `POST`
- **Path**: `/orders/checkout` (Alias: `/orders/customer-checkout`)
- **Access**: Customer
- **Request Body**:
```json
{
  "items": [
    {
      "product_id": "6aecb1a9527505843151652c",
      "quantity": 1
    }
  ],
  "payment_method": "cod",
  "shipping_address": {
    "street": "123 Market Road",
    "city": "Guntur",
    "state": "Andhra Pradesh",
    "pincode": "522502"
  }
}
```

### 6.2 Stream Branded PDF Tax Invoice
- **Method**: `GET`
- **Path**: `/orders/:id/invoice`
- **Access**: Private (Customer owns order, or Staff)
- **Response**: `application/pdf` streaming official A4 GST tax bill generated via `pdfkit`.

---

## 7. Razorpay Payment Gateway

Prefix: `/payments`

### 7.1 Fetch Payment Configuration
- **Method**: `GET`
- **Path**: `/payments/config`
- **Access**: Private
- **Response**:
```json
{
  "statusCode": 200,
  "data": {
    "key_id": "rzp_live_TwYmHsX3omQmQE",
    "currency": "INR",
    "is_mock": false,
    "company_name": "InventoryPro"
  }
}
```

### 7.2 Create Razorpay Order
- **Method**: `POST`
- **Path**: `/payments/create-order`
- **Access**: Customer
- **Request Body**:
```json
{
  "items": [
    {
      "product_id": "6aecb1a9527505843151652c",
      "quantity": 1
    }
  ]
}
```
- **Server Behavior**: Queries MongoDB to verify unit price & available stock. Computes standard 18% GST and calls Razorpay API to generate live order ID (`order_...`).

### 7.3 Verify Payment & Commit Order
- **Method**: `POST`
- **Path**: `/payments/verify`
- **Access**: Customer
- **Request Body**:
```json
{
  "razorpay_order_id": "order_TwYzvBBG6vG3nw",
  "razorpay_payment_id": "pay_TwZEHyi7joT7z3",
  "razorpay_signature": "4575d71093e9a27078a6e22f9a2efbd20d036168f3655ee0e3fe5ad890d4a9dd",
  "items": [{ "product_id": "...", "quantity": 1 }],
  "shipping_address": { "street": "...", "city": "...", "pincode": "..." }
}
```
- **Security Check**: Computes HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`. Rejects if mismatch. Runs idempotent database transaction to allocate order, deduct stock, and notify Customer and Admin via Brevo HTTPS API.

### 7.4 Razorpay Background Webhook
- **Method**: `POST`
- **Path**: `/payments/webhook`
- **Access**: Public (Validated via `x-razorpay-signature` header)
- **Supported Events**: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`.

---

## 8. Customer Returns (RMA) & Refunds

Prefix: `/returns`

### 8.1 Submit Return Request
- **Method**: `POST`
- **Path**: `/returns/request`
- **Access**: Customer
- **Request Body**:
```json
{
  "order_id": "6aecb1a9527505843151652e",
  "items": [
    {
      "product_id": "6aecb1a9527505843151652c",
      "quantity": 1
    }
  ],
  "reason": "Defective"
}
```
- **Behavior**: Validates 7-day return window. Sends automated confirmation email to customer and action alert to administrators.

### 8.2 Approve Return & Trigger Automated Gateway Refund
- **Method**: `PATCH`
- **Path**: `/returns/:id/status`
- **Access**: Manager+
- **Request Body**:
```json
{
  "status": "approved",
  "admin_notes": "Return verified. Initiating Razorpay refund."
}
```
- **Automated Financial Execution**: Calls `rzp.instance.payments.refund(paymentId, { amount })` to credit funds back to the customer's source account.

---

## 9. Reports & Low-Stock Scheduler

Prefix: `/reports` & `/scheduler`

### 9.1 Real-Time Stock Valuation Report
- **Method**: `GET`
- **Path**: `/reports/stock`
- **Access**: Manager+
- **Response**: Aggregated count of in-stock items, deficit units ($\le 10$), out-of-stock items, and total catalog valuation in INR.

### 9.2 Trigger Live Low-Stock Scan
- **Method**: `POST`
- **Path**: `/scheduler/trigger-alerts`
- **Access**: Admin only
- **Behavior**: Scans entire catalog, queries products $\le$ safety threshold, compiles itemized report, dispatches email to admins, and logs record in `AlertLog`.

### 9.3 Query Alert Audit Logs
- **Method**: `GET`
- **Path**: `/scheduler/logs`
- **Access**: Manager+
- **Response**: Chronological history of automated cron and manual test alert dispatches with message IDs.

