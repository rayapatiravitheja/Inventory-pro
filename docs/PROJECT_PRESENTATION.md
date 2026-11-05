# 📦 InventoryPro — Enterprise Multi-Tenant Inventory & Warehouse Management System
### MERN Stack University Final Review Presentation (November 2026)

---

## 📑 Slide Deck Outline (15 Slides)

1. **Title & Candidate Profile**
2. **Problem Statement & Motivation**
3. **Project Vision & High-Level Scope**
4. **End-to-End System Architecture**
5. **Role-Based Access Control (RBAC) Matrix**
6. **E-Commerce Buyer Storefront & Dynamic Cart**
7. **Razorpay Live Gateway Integration & Security**
8. **Automated Customer Returns (RMA) & Refunds**
9. **Multi-Facility Warehouse Management (WMS)**
10. **Resilient 3-Tier Email Engine (Port 443 HTTPS)**
11. **Low-Stock Cron Engine & Live Audit Trail**
12. **Double-Entry Immutable Stock Ledger**
13. **MongoDB Atlas Architecture (17 Data Models)**
14. **Production Deployment & Cloud Infrastructure**
15. **Conclusion, Future Scope & Live Q&A**

---

### Slide 1: Title & Candidate Profile
- **Project Title**: **InventoryPro**
- **Domain**: Enterprise Supply Chain, Multi-Facility WMS & Digital E-Commerce Storefront
- **Stack**: MongoDB Atlas, Express.js 4.x, React 18, Node.js (ESM), Tailwind CSS, Ant Design
- **Developer / Student**: Ravi Theja Rayapati
- **Institutional Review**: Final University Review — November 6th, 10th & 11th, 2026
- **Live URLs**:
  - Web Application: [https://inventory-pro-azure-two.vercel.app/](https://inventory-pro-azure-two.vercel.app/)
  - REST API: [https://inventorypro-api-l20i.onrender.com](https://inventorypro-api-l20i.onrender.com)
  - GitHub Repo: [https://github.com/rayapatiravitheja/Inventory-pro](https://github.com/rayapatiravitheja/Inventory-pro)

---

### Slide 2: Problem Statement & Motivation
- **Single-Location Limitation**: Existing retail systems assume inventory lives in a single shop rather than across geographically dispersed regional distribution centers.
- **Race Conditions & Overselling**: Concurrent online shopping checkouts often corrupt inventory counts without atomic database locking.
- **Disconnected Return Cycles (RMA)**: Customer return workflows are usually manual, lacking automated payment gateway refund disbursement and facility bin restocking.
- **Cloud SMTP Delivery Block**: Modern cloud providers (Render, AWS) block outbound SMTP ports (25, 465, 587), causing email notifications to silently fail.
- **Audit Deficits**: Most small-to-medium platforms overwrite quantities in place without an immutable double-entry ledger.

---

### Slide 3: Project Vision & High-Level Scope
- **Unified 3-in-1 Platform**:
  1. **Enterprise IMS**: Master product catalog, 8-character SKU validation, 8-image Cloudinary gallery.
  2. **Multi-Facility WMS**: Regional warehouse hubs, standardized address hierarchy, bin/rack coordinates (`A-01-01`), and stock transfers.
  3. **Consumer Buyer Storefront**: Live catalog browsing, real-time stock badges, dynamic cart with 18% GST calculation, and Razorpay live payments.
- **Production Hardened**: Built with ACID MongoDB transactions, cryptographic HMAC signatures, and multi-tier email failover over Port 443.

---

### Slide 4: End-to-End System Architecture
- **Controller-Service-Repository Pattern**: Decoupled, modular architecture.
- **Frontend Layer**: React 18 SPA built with Vite 6, styled with Ant Design 5 & Tailwind CSS, powered by Axios interceptors for JWT cookies.
- **Backend API Layer**: Express 4.x runtime on Node.js ESM, featuring centralized error serialization, Multer image parsing, and RBAC middleware.
- **Persistence Layer**: MongoDB Atlas cluster housing 17 interconnected Mongoose models with compound index optimizations.
- **External Cloud Integrations**:
  - **Razorpay**: Live payment captures & automated return refunds.
  - **Brevo & Resend**: Port 443 HTTPS REST APIs for transactional emails.
  - **Cloudinary**: Global CDN for high-resolution product imagery.
  - **PDFKit**: Server-side vector streaming for A4 GST tax invoices.

---

### Slide 5: Role-Based Access Control (RBAC) Matrix
- **Strict 3-Tier Security Hierarchy**:
  - **Administrator** (`admin`): Master global oversight, user management, facility creation, product catalog, financial valuation, low-stock scheduler controls.
  - **Warehouse Manager** (`manager`): Assigned regional facility access, inbound procurement receipts (GRN), inter-warehouse transfers, cycle count adjustments, return review.
  - **Customer Buyer** (`customer`): Public catalog browsing, cart operations, Razorpay / COD checkout, live order tracking, and 7-day return submissions.

---

### Slide 6: E-Commerce Buyer Storefront & Dynamic Cart
- **Modern Responsive UX**: Located at `/customer/catalog` with category filters, dynamic search, price range filtering, and real-time inventory badges.
- **Server-Side Price Authority**: The frontend calculates cart totals for user convenience, but the Express backend re-fetches product prices from MongoDB during order creation to prevent browser tampering.
- **Tax Breakdown**: Automatically computes standard 18% Goods and Services Tax (GST) and final invoice amounts.
- **Branded Invoicing**: Instant on-demand streaming of A4 PDF tax invoices complete with company credentials, HSN codes, and digital signatures.

---

### Slide 7: Razorpay Live Gateway Integration & Security
- **Production Live Key ID**: `rzp_live_TwYmHsX3omQmQE` (Approved by Razorpay).
- **Payment Modalities**: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
- **Cryptographic HMAC-SHA256 Verification**: Server recalculates expected signature using `order_id|payment_id` and the secret key to reject spoofed callbacks.
- **Idempotency Protection**: Ensures duplicate payment captures or page refreshes do not trigger duplicate orders or stock deductions.
- **Real-Money Verified**: Completed live transaction testing in production (Orders `#INV-718884` and `#INV-334112`).

---

### Slide 8: Automated Customer Returns (RMA) & Refunds
- **7-Day Customer Return Window**: Customers can select delivered orders, choose items to return, and pick standardized reasons (`Defective`, `Damaged`, `Wrong Item`, `Size Issue`, `Other`).
- **Dual-Party Email Notifications**: Sends confirmation to customer with reference `#RET-XXXXXX` and alerts admins with review action links.
- **Automated Gateway Refund Execution**: Upon admin approval, the backend invokes `rzp.instance.payments.refund(...)` automatically, crediting funds back to the customer's original payment method within 5–7 banking days.
- **Facility Restocking**: Managers restock returned units into target warehouse bins, triggering an automated `adjustment_add` ledger entry.

---

### Slide 9: Multi-Facility Warehouse Management (WMS)
- **Rigid Indian Address Hierarchy**: Standardizes facility coordinates into:
  $$\text{Street / Landmark} \longrightarrow \text{State (Dropdown)} \longrightarrow \text{City (Dropdown)} \longrightarrow \text{6-Digit PIN ([0-9]{6})}$$
- **Aisle / Rack / Bin Coordinates**: Stores exact physical storage positions (`A-01-01`).
- **Inter-Warehouse Transit**: Tracks regional stock transfers (`pending` $\rightarrow$ `in_transit` $\rightarrow$ `completed` / `cancelled`).
- **Cycle Counts**: Reconciles physical inventory counts against system records, recording variances in the audit ledger.

---

### Slide 10: Resilient 3-Tier Email Engine (Port 443 HTTPS)
- **The Cloud Firewall Dilemma**: Cloud hosting platforms block outbound SMTP ports (25, 465, 587) to prevent spam, causing traditional Nodemailer scripts to hang.
- **The 3-Tier Failover Pipeline**:
  1. **Tier 1 (Primary)**: **Brevo HTTPS REST API v3** over Port 443 with verified sender `rayapatiravitheja@gmail.com`. Delivers to any domain worldwide.
  2. **Tier 2 (Secondary)**: **Resend HTTPS REST API** over Port 443 with smart sandbox auto-forwarding to store owner.
  3. **Tier 3 (Fallback)**: Nodemailer Gmail SMTP singleton with strict 4-second timeout to prevent request blocking.
- **Dual Admin Routing**: Dispatches operational alerts simultaneously to `rayapatiravitheja@gmail.com` and `admin@inventorypro.com`.

---

### Slide 11: Low-Stock Cron Engine & Live Audit Trail
- **Automated Weekly Singleton**: Powered by `node-cron`, executing every Monday at 9:00 AM IST (`0 9 * * 1`).
- **Threshold Scanner**: Automatically checks on-hand stock against safety thresholds (default: $\le 10$ units) across all regional hubs.
- **Live UI Test Trigger**: Administrators can click **"Trigger Test Alerts"** in `/reports` to trigger a live catalog scan immediately.
- **Persistent Audit Logging**: MongoDB `AlertLog` records trigger event, recipient emails, alerted SKUs, deficit counts, and gateway message IDs.

---

### Slide 12: Double-Entry Immutable Stock Ledger
- **Financial-Grade Inventory Accounting**: Every stock change creates a non-deletable record in the `StockLedger` collection:
  - `purchase_receipt`: Inward goods from supplier purchase orders (GRN).
  - `order_dispatch`: Outward customer sales order fulfillment.
  - `transfer_out` / `transfer_in`: Regional inter-warehouse stock movements.
  - `adjustment_add` / `adjustment_deduct`: Physical cycle counts, product edits, and return restocks.
  - `purchase_return`: Outward return of inventory back to suppliers.
- **Audit Columns**: Stores `quantity_before`, `quantity_change`, `quantity_after`, `reference_no`, and user attribution.

---

### Slide 13: MongoDB Atlas Architecture (17 Data Models)
- **17 Interconnected Schemas**:
  1. `User` (RBAC & Auth)
  2. `Product` (Catalog & 8-Images)
  3. `Category` (Classifications)
  4. `Unit` (Measurement Units)
  5. `Warehouse` (WMS Facilities)
  6. `WarehouseStock` (Bin Allocations)
  7. `StockTransfer` (Inter-Facility Transit)
  8. `StockAdjustment` (Cycle Counts)
  9. `StockLedger` (Immutable Audit)
  10. `Order` (Sales & Razorpay)
  11. `OrderDetail` (Line Items)
  12. `ReturnRequest` (RMA & Refunds)
  13. `Supplier` (Vendor Profiles)
  14. `Purchase` (Inbound POs)
  15. `PurchaseDetail` (PO Line Items)
  16. `Customer` (B2B Accounts)
  17. `AlertLog` (Scheduler Logs)

---

### Slide 14: Production Deployment & Cloud Infrastructure
- **Frontend SPA**: Deployed on **Vercel** (`https://inventory-pro-azure-two.vercel.app/`).
- **Backend REST API**: Containerized Node.js service running on **Render** (`https://inventorypro-api-l20i.onrender.com`).
- **Database**: Cloud-hosted **MongoDB Atlas** M0 Cluster with multi-region replication.
- **Image CDN**: **Cloudinary** media pipeline with auto-format optimization.
- **Payment Engine**: **Razorpay** live gateway with KYC approval and live webhooks.
- **Compliance Ready**: Integrated public legal policy pages (`/terms`, `/privacy`, `/shipping-policy`, `/cancellation-refund`, `/contact`).

---

### Slide 15: Conclusion, Future Scope & Live Q&A
- **Summary**: InventoryPro demonstrates an enterprise-grade full-stack MERN implementation handling real-world concurrency, physical warehouse logistics, and consumer digital payments.
- **Future Enhancements**:
  - Mobile scanner app for warehouse floor workers (Barcode / RFID scan).
  - Machine learning time-series demand forecasting using historical order velocity.
  - Multi-currency international checkout with automated currency conversion.
- **Live Demonstration**: Open for examiner review and live functional walkthrough.
- **Thank You!**

