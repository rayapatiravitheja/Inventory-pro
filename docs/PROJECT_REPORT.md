# 📘 InventoryPro — Formal Academic Project Report & Documentation
### Full-Stack MERN Enterprise Inventory & Warehouse Management System

---

## 🏛️ Academic Submission Details
- **Project Title**: **InventoryPro — Enterprise Multi-Tenant Inventory & Warehouse Management System with Customer Storefront & Live Razorpay Fintech Integration**
- **Course / Degree**: Full-Stack MERN Development / Final Technical Review
- **Candidate Name**: **Ravi Theja Rayapati**
- **Review Period**: November 6th, 10th & 11th, 2026
- **Live Deployment URLs**:
  - Web Application (Vercel): [https://inventory-pro-azure-two.vercel.app/](https://inventory-pro-azure-two.vercel.app/)
  - REST API Engine (Render): [https://inventorypro-api-l20i.onrender.com](https://inventorypro-api-l20i.onrender.com)
  - GitHub Repository: [https://github.com/rayapatiravitheja/Inventory-pro](https://github.com/rayapatiravitheja/Inventory-pro)

---

## 📑 Table of Contents
1. [Certificate & Declaration](#1-certificate--declaration)
2. [Abstract & Executive Summary](#2-abstract--executive-summary)
3. [Introduction & Problem Statement](#3-introduction--problem-statement)
4. [Software Requirements Specification (SRS)](#4-software-requirements-specification-srs)
   - 4.1 Functional Requirements
   - 4.2 Non-Functional Requirements
5. [System Architecture & Design](#5-system-architecture--design)
   - 5.1 High-Level Architecture (Controller-Service-Repository)
   - 5.2 Role-Based Access Control (RBAC) Matrix
   - 5.3 Concurrency Control & Atomic Stock Locking
6. [Database Design (17 Mongoose Models)](#6-database-design-17-mongoose-models)
7. [Fintech & Payment Gateway Integration (Razorpay Live)](#7-fintech--payment-gateway-integration-razorpay-live)
8. [Automated Returns Management (RMA) & Gateway Refunds](#8-automated-returns-management-rma--gateway-refunds)
9. [Resilient 3-Tier Email Infrastructure (Port 443 HTTPS)](#9-resilient-3-tier-email-infrastructure-port-443-https)
10. [Automated Low-Stock Scheduler & Immutable Audit Ledger](#10-automated-low-stock-scheduler--immutable-audit-ledger)
11. [Testing, Verification & Live Test Cases](#11-testing-verification--live-test-cases)
12. [Installation, Setup & Deployment Instructions](#12-installation-setup--deployment-instructions)
13. [Conclusion & Future Enhancements](#13-conclusion--future-enhancements)
14. [References](#14-references)

---

## 1. Certificate & Declaration

### Candidate Declaration
I, **Ravi Theja Rayapati**, hereby declare that the project titled **"InventoryPro — Enterprise Multi-Tenant Inventory & Warehouse Management System with Customer Storefront & Live Razorpay Fintech Integration"** is an authentic work carried out by me. The software implementation, database models, cloud deployments, and accompanying technical documentation submitted herein represent my original effort and have not been submitted for any other degree or diploma.

- **Candidate**: Ravi Theja Rayapati  
- **Date**: November 5, 2026  
- **Signature**: *[Digital Submission Verified]*

---

## 2. Abstract & Executive Summary

Modern enterprise supply chains demand seamless interoperability between physical distribution logistics and digital customer-facing e-commerce channels. Traditional Inventory Management Systems (IMS) suffer from fragmented single-warehouse architectures, race conditions during concurrent consumer checkouts, high operational friction in processing customer returns, and fragile email alert pipelines caused by cloud outbound SMTP firewall restrictions.

**InventoryPro** solves these enterprise challenges through a production-ready, full-stack MERN (MongoDB Atlas, Express.js, React 18, Node.js ESM) web platform. The system unites three mission-critical domains:
1. **Enterprise IMS**: Master product catalog enforcing strict 8-character alphanumeric SKUs, up to 8 high-resolution Cloudinary CDN images per product, category classifications, and bulk CSV ingest (500 rows/batch).
2. **Multi-Facility Warehouse Management System (WMS)**: Manages regional fulfillment hubs (`WH-BLR-01`, `WH-MUM-01`), rigid address hierarchy (`Street → State → City → 6-Digit PIN`), bin/rack locations (`A-01-01`), inter-warehouse stock transfers, and physical cycle count reconciliations.
3. **Consumer Buyer Storefront**: Dynamic storefront browsing with real-time stock indicators, anti-tamper server-calculated cart totals (18% GST), official A4 PDF tax invoice streaming, and production **Razorpay Live Gateway Integration** (`rzp_live_TwYmHsX3omQmQE`) with cryptographic HMAC-SHA256 signature verification and automated gateway refunds on approved return requests (RMA).

The platform guarantees 100% email delivery over cloud firewalls via a 3-tier Port 443 HTTPS REST API pipeline (Brevo v3 $\rightarrow$ Resend with sandbox auto-forwarding $\rightarrow$ Gmail SMTP fallback) and logs every inventory mutation in an immutable double-entry `StockLedger`.

---

## 3. Introduction & Problem Statement

### 3.1 Background & Motivation
In digital commerce, stock discrepancies directly impact revenue and brand trust. When a customer places an order for an item that is physically out of stock due to concurrency race conditions or uncoordinated warehouse transfers, customer dissatisfaction and operational overhead escalate. Furthermore, when goods are returned, manual refunds and delayed facility restocking result in lost sales opportunities.

### 3.2 Key Challenges Addressed
- **The Concurrency Problem**: Concurrent shopping carts reading stale inventory and attempting to purchase the same unit simultaneously.
- **The Physical Logistics Gap**: Lack of precise warehouse bin mapping and inter-hub transfer transit tracking.
- **The Cloud SMTP Blockade**: Leading platform-as-a-service providers (Render, AWS, DigitalOcean) block outbound SMTP ports (25, 465, 587) by default to deter spam, breaking standard Nodemailer SMTP scripts.
- **Audit Invisibility**: Lack of immutable, double-entry financial audit ledgers detailing who changed what quantity, when, and under which reference document.

---

## 4. Software Requirements Specification (SRS)

### 4.1 Functional Requirements
- **FR1: Role-Based Authentication**: Secure JWT-based registration, login, session validation, and multi-tier role authorization (`admin`, `manager`, `customer`).
- **FR2: Product & Image Management**: Create, update, soft-delete, and query items; support 8-image galleries with designated primary cover photo selection via Cloudinary CDN.
- **FR3: Multi-Facility WMS**: Configure regional facilities, assign managers, allocate items to specific bins, and process inter-warehouse transfers with transit states (`pending`, `in_transit`, `completed`, `cancelled`).
- **FR4: Buyer Storefront & Cart**: Real-time browsing, category tabs, server-side price calculation, and 18% GST invoice generation.
- **FR5: Online Payment Verification**: Razorpay live checkout modal, HMAC-SHA256 cryptographic verification, idempotent order recording, and stock deduction.
- **FR6: 7-Day Customer Return (RMA) & Refunds**: Customer-initiated return portal with categorized return reasons, automated dual-party emails, automated Razorpay Refund API execution upon admin approval, and bin restocking.
- **FR7: Automated Low-Stock Scheduler**: In-process `node-cron` scanning product safety thresholds every Monday at 9:00 AM IST, accompanied by a manual UI test trigger and persistent `AlertLog` records.

### 4.2 Non-Functional Requirements
- **NFR1: Performance**: Sub-200ms API response time under normal operational load; sub-10ms database query resolution via compound indexing.
- **NFR2: Security**: Passwords salted and hashed with `bcryptjs` (salt factor 10); HTTP-only, SameSite cookies for token storage; strict CORS origin whitelisting.
- **NFR3: Reliability & Fault Tolerance**: Mongoose multi-document ACID transactions with automatic rollback on error.
- **NFR4: Regulatory Compliance**: Full alignment with Reserve Bank of India (RBI) payment gateway guidelines and Razorpay merchant compliance policies (Terms, Privacy, Shipping, Refund, and Contact).

---

## 5. System Architecture & Design

### 5.1 High-Level Architecture
InventoryPro follows the decoupled **Controller-Service-Repository** pattern:

```
┌──────────────────────────────────────────────────────────────┐
│       Frontend: Single Page Application (React 18 + Vite)     │
│   Storefront (/customer/catalog)  •  Admin ERP (/dashboard)  │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP/HTTPS (JWT Bearer Token / Cookies)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│           API Gateway & Middlewares (Express 4.x ESM)         │
│   CORS Whitelist • verifyJWT • requireRole • Multer Upload    │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
       ┌───────▼───────┐               ┌───────▼───────┐
       │  Controllers  │               │ Third Parties │
       └───────┬───────┘               └───────┬───────┘
               │                               ├─ Razorpay Live API
       ┌───────▼───────┐                       ├─ Brevo HTTPS API
       │ Service Layer │                       ├─ Cloudinary CDN
       └───────┬───────┘                       └─ PDFKit Invoicing
               │
       ┌───────▼───────────────────────────────────────┐
       │ Persistence: MongoDB Atlas (17 Schemas, ACID) │
       └───────────────────────────────────────────────┘
```

### 5.2 Role-Based Access Control (RBAC) Matrix
| Module / Capability | Administrator | Warehouse Manager | Customer Buyer |
| :--- | :---: | :---: | :---: |
| Global Analytics & Valuation | ✅ Full | ❌ | ❌ |
| User & Role Management | ✅ Full | ❌ | ❌ |
| Product Catalog & 8-Image Upload | ✅ Full | ❌ | ❌ |
| Facility & Bin Location Master | ✅ Global | ✅ Assigned Hubs | ❌ |
| Inter-Warehouse Transfers & Adjustments | ✅ Global | ✅ Assigned Hubs | ❌ |
| Buyer Storefront & Cart | Preview | Preview | ✅ Full Access |
| Place Order (Razorpay / COD) | ❌ | ❌ | ✅ Full Access |
| Customer Return Request (RMA) | ❌ | ❌ | ✅ Full Access |
| RMA Review & Automated Razorpay Refund | ✅ Full | ✅ Assigned Hubs | ❌ |
| Facility Restock of Returned Items | ✅ Global | ✅ Assigned Hubs | ❌ |
| Low-Stock Scheduler Controls & Logs | ✅ Full | ❌ (View Logs) | ❌ |

### 5.3 Concurrency Control & Atomic Stock Locking
To eliminate race conditions and overselling, stock deductions execute atomically inside a Mongoose transaction session (`runWithOptionalTransaction`):

```javascript
const updatedProduct = await Product.findOneAndUpdate(
    { _id: item.product_id, stock: { $gte: item.quantity } },
    { $inc: { stock: -item.quantity } },
    { new: true, session }
);

if (!updatedProduct) {
    throw new ApiError(400, "Insufficient stock during checkout.");
}
```

---

## 6. Database Design (17 Mongoose Models)

The data layer is hosted on **MongoDB Atlas** across 17 distinct Mongoose collections:

1. **`users`**: User identities, roles (`admin`, `manager`, `customer`), password hashes, shipping addresses, OTPs.
2. **`products`**: Master items, 8-char SKU, 8-image gallery, prices, safety thresholds, category/unit references.
3. **`categories`**: Classifications with icon identifiers and isolation controls.
4. **`units`**: Measurement units (Piece, Box, Kilogram, Set, Meter, Liter).
5. **`warehouses`**: Regional fulfillment centers with rigid address schema (`Street → State → City → 6-Digit PIN`).
6. **`warehousestocks`**: Compound mapping tracking item balances and bin coordinates (`A-01-01`).
7. **`stocktransfers`**: Inter-warehouse transit documents with statuses (`pending`, `in_transit`, `completed`, `cancelled`).
8. **`stockadjustments`**: Cycle count audit records storing counted vs system variances.
9. **`stockledgers`**: Immutable double-entry ledger tracking `quantity_before`, `quantity_change`, `quantity_after`, `reference_no`.
10. **`orders`**: Customer orders, invoice numbers (`INV-XXXXXX`), Razorpay payment info, and fulfillment states.
11. **`orderdetails`**: Individual line items, quantities, unit prices, line totals.
12. **`returnrequests`**: 7-day customer RMA tracking, categorized reasons, Razorpay refund IDs.
13. **`suppliers`**: Inbound procurement vendor profiles, contact information, tax IDs.
14. **`purchases`**: Inbound purchase orders (`PUR-XXXXXX`), GRN receiving statuses.
15. **`purchasedetails`**: Line items for purchase orders, unit acquisition costs, received counts.
16. **`customers`**: B2B buyer profiles and shipping profiles.
17. **`alertlogs`**: Persistent audit records of weekly cron scans and manual low-stock test alerts with message IDs.

---

## 7. Fintech & Payment Gateway Integration (Razorpay Live)

### 7.1 Production Live Mode Configuration
- **Active Live Key ID**: `rzp_live_TwYmHsX3omQmQE`
- **Supported Payment Channels**: UPI (Google Pay, PhonePe, Paytm, BHIM), Cards (Visa, MasterCard, RuPay), NetBanking (50+ banks), and Wallets.

### 7.2 Cryptographic Verification & Idempotency
When a customer completes payment in the Razorpay Checkout modal, the frontend transmits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The backend re-computes the HMAC-SHA256 hash using the secret key:

$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{razorpay\_order\_id} \parallel \text{"|"} \parallel \text{razorpay\_payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

If the signature matches, the order is idempotently committed, eliminating duplicate stock deduction risks on browser reload.

---

## 8. Automated Returns Management (RMA) & Gateway Refunds

1. **7-Day Window**: Delivered orders allow customer return submissions within 7 calendar days directly from `/customer/returns`.
2. **Dual-Party Alerts**: Customer receives confirmation `#RET-XXXXXX`, and admins receive operational alerts.
3. **Automated Razorpay Refund API**: When an admin approves an online-paid return, the backend triggers:
   ```javascript
   await rzp.instance.payments.refund(razorpayPaymentId, {
       amount: amountInPaise,
       notes: { return_no: returnReq.return_no, reason: returnReq.reason }
   });
   ```
4. **Facility Restocking**: Warehouse staff marks goods as received, restocking items back into the designated bin (`A-01-01`) and recording an `adjustment_add` entry in the `StockLedger`.

---

## 9. Resilient 3-Tier Email Infrastructure (Port 443 HTTPS)

To overcome the cloud firewall restriction blocking ports 25, 465, and 587 on Render:
- **Tier 1 (Primary)**: **Brevo HTTPS REST API v3** (`https://api.brevo.com/v3/smtp/email`) over Port 443 with verified sender `rayapatiravitheja@gmail.com`. Delivers to any domain worldwide.
- **Tier 2 (Secondary)**: **Resend HTTPS REST API** over Port 443. Equipped with intelligent sandbox auto-forwarding to store owner if running under unverified test domain.
- **Tier 3 (Fallback)**: Nodemailer Gmail SMTP singleton with strict 4-second fail-fast timeout.
- **Dual Admin Routing**: All operational events (purchases, low-stock, customer returns) notify both `rayapatiravitheja@gmail.com` and `admin@inventorypro.com`.

---

## 10. Automated Low-Stock Scheduler & Immutable Audit Ledger

- **Weekly Cron Singleton**: Powered by `node-cron`, scanning catalog inventories every Monday at 9:00 AM IST (`0 9 * * 1`).
- **Interactive UI Test Trigger**: Administrators can trigger live alert broadcasts directly from the Reports page (`/reports`).
- **Immutable Double-Entry Ledger**: Records mutations under 7 transaction types: `purchase_receipt`, `order_dispatch`, `transfer_out`, `transfer_in`, `adjustment_add`, `adjustment_deduct`, `purchase_return`.

---

## 11. Testing, Verification & Live Test Cases

| Test Case ID | Feature / Module | Test Procedure | Expected Outcome | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | User Authentication | Register, login with bcrypt password, verify JWT cookie | Token issued, user session established | User logged in, cookie set | **PASS** |
| **TC-02** | Anti-Tamper Cart | Alter cart prices in browser DOM, submit checkout | Server recalculates price from DB | Correct DB total charged | **PASS** |
| **TC-03** | Razorpay Live Payment | Pay real money via UPI for item | Payment captured, order marked 'paid' | Order #INV-718884 captured (₹8.26) | **PASS** |
| **TC-04** | Atomic Stock Deduction | Complete order checkout for 1 item | Product stock decremented by 1 | Stock decremented, ledger updated | **PASS** |
| **TC-05** | Customer Return & Refund | Submit RMA for delivered order, approve in admin | Automated Razorpay refund executed | Refund issued, status updated | **PASS** |
| **TC-06** | Low-Stock Trigger | Click "Trigger Test Alerts" in `/reports` | Digest email dispatched to admins | Brevo 201 Created, alert received | **PASS** |
| **TC-07** | PDF Invoice Streaming | Request `/api/v1/orders/:id/invoice` | Valid A4 PDF streamed inline | PDF generated with GST table | **PASS** |

---

## 12. Installation, Setup & Deployment Instructions

### Prerequisites
- Node.js $\ge 18.0.0$
- MongoDB Atlas account or local MongoDB instance
- Razorpay account (Live or Test keys)
- Brevo account with API key

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/rayapatiravitheja/Inventory-pro.git
cd Inventory-pro

# 2. Setup Backend
cd Backend
npm install
cp .env.example .env # Configure MONGODB_URI, RAZORPAY_KEY_ID, BREVO_API_KEY
npm run dev

# 3. Setup Frontend
cd ../Frontend
npm install
npm run dev # Launches at http://localhost:5173
```

---

## 13. Conclusion & Future Enhancements

### 13.1 Conclusion
InventoryPro successfully bridges physical warehouse management with modern digital customer commerce. Built on the MERN stack with enterprise design patterns, it provides bulletproof concurrency protection, cryptographic payment security, automated RMA refunds, resilient transactional email routing, and immutable audit trails.

### 13.2 Future Enhancements
- **Warehouse Barcode / RFID Scanning**: Mobile progressive web app (PWA) with camera-based barcode scanning for warehouse stock handlers.
- **Predictive Demand Forecasting**: Machine learning time-series regression models forecasting seasonal reorder points.
- **Multi-Currency Global Checkout**: Real-time foreign exchange conversion for international buyers.

---

## 14. References
1. MongoDB, Inc., "MongoDB Transactions and Concurrency Control Documentation," 2026.
2. Razorpay Software Private Ltd., "Standard Checkout & Automated Refunds API Reference," 2026.
3. Express.js Foundation, "Error Handling and Middleware Pipelines," 2026.
4. React Documentation, "Hooks, Context API, and Concurrent Features," 2026.
5. Reserve Bank of India, "Master Directions on Payment Aggregators and Payment Gateways," 2024–2026.

