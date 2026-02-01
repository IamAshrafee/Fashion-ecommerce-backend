# PROJECT: THE FASHION ENGINE (Universal Apparel Backend)

## 0. THE VISION (READ THIS FIRST)
**To the AI Agent:**
You are not just writing code for a single assignment. You are the **Chief Technology Officer (CTO)** of a new Software Company founded by me (Ashrafee).

**The Mission:**
We are building **"The Engine"**—a master e-commerce backend.
* **The Problem:** Building a new backend for every client is slow and unprofitable.
* **The Solution:** We need a codebase where we can clone the repo, update a `.env` file, and instantly launch a new store for a client (whether they sell Sneakers, Sarees, or Jewelry).

**Your Core Directive:**
Write code that is **100% Reusable**. Never hardcode "Shoes" or "Shirts" into the logic. Always assume the next client might sell something completely different. If a feature (like "Payment Provider") might change per client, you MUST use an Adapter Pattern/Interface so we can swap it easily.

---

## 1. PROJECT PHILOSOPHY
**Objective:** Build a commercial-grade, white-label backend engine for the **Fashion & Apparel** market.
**Key Focus:**
* **Visuals First:** Fashion is visual. We need high-quality image galleries per variant.
* **Universal Variant Support:** The system must handle:
    * **Shoes:** Variation by Size (40, 41, 42).
    * **Sharees:** Variation by Color/Fabric (Red Jamdani, White Silk).
    * **Accessories:** Variation by Type (Gold, Silver) or Size (Diameter).
* **Zero-Hardcoding:** Payment gateways, storage providers, and currency must be pluggable via configuration.

## 2. TECHNOLOGY STACK (STRICT)
* **Runtime:** Node.js
* **Framework:** NestJS (Modular Architecture)
* **Language:** TypeScript (Strict Mode)
* **Database:** MongoDB (via Mongoose)
* **Validation:** Zod (via `nestjs-zod`)
* **Storage:** Self-Hosted MinIO (S3 Compatible)
* **Documentation:** Swagger / OpenAPI (Automated API Docs)
* **Security:** Helmet (Headers) + Throttler (Rate Limiting)
* **Containerization:** Docker & Docker Compose

## 3. ARCHITECTURAL PATTERNS

### A. The "Smart Variant" Product Schema (CRITICAL)
The schema must handle the "Matrix Problem" for ANY fashion item without code changes.
* **Concept:** A product is a container; the *Variant* is the physical item.
* **Schema Definition:**
    1.  **Base Product:** Title, Description, Base Price, Category, `options` definition.
    2.  **Variants Array:**
        ```typescript
        variants: [{
            sku: "ITEM-001-A",
            attributes: { "Size": "40", "Color": "Red" }, // Dynamic Key-Value
            stock: 15,
            price: 1200,    // Specific price for this variant
            images: ["url1.jpg"] // Images specific to this COLOR
        }]
        ```

### B. The "Adapter Pattern" (Future-Proofing)
Do not couple business logic to external providers.
1.  **Storage:** Create `IStorageService`. Implement `MinioStorageService`.
    * *Why:* Allows swapping to AWS S3 or Cloudinary later without rewriting code.
2.  **Payment:** Create `IPaymentGateway`. Implement `SSLCommerzService` (or `CashOnDeliveryService`).
    * *Why:* Each client will want a different payment provider.

### C. Universal Filtering Protocol
The backend must accept dynamic filters from the frontend.
* **Query Standard:** `GET /products?filters[color]=red&filters[size]=42`
* **Implementation:** The Service must dynamically map `filters[key]` to `variants.attributes.key`.

## 4. CORE MODULES & FEATURES

### A. Auth & Users (RBAC)
* **Roles:** `ADMIN` (Full Dashboard Access), `CUSTOMER` (Own Profile).
* **Guards:** Standard JWT Guard + Role Guard.

### B. Catalog (Products & Categories)
* **Collections:** Tag-based groups (e.g., "Eid Special").
* **SEO:** Every product must have a unique `slug`.

### C. Cart & Orders (The Commerce)
* **Stock Validation:** Middleware must check `variant.stock >= requestedQty` *before* creating an order.
* **Snapshotting:** Copy Product Title, Image, and Unit Price into the Order. *Never reference the Product ID for price history.*
* **Status Workflow:** `PENDING` -> `PAID` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`.

### D. System Settings (The "White Label" Config)
Store visual config in the database (Collection: `Settings`).
* `storeName`: String
* `currency`: String (BDT, USD)
* `shippingCharge`: Number
* `logoUrl`: String

### E. Documentation & Security (The "Pro" Layer)
* **Swagger:** All DTOs must have `@ApiProperty` decorators. The API must serve a documentation UI at `/api/docs`.
* **Rate Limiting:** Use `ThrottlerModule` to prevent abuse.
* **CORS:** Configure strict CORS based on the `.env` CLIENT_URL.

## 5. DATABASE SCHEMA STRATEGY (MongoDB)

**Collection: `Products`**
* **Indexes:** `{ "variants.sku": 1 }` (Unique), `{ "category": 1, "price": 1 }` (Filter), `{ "title": "text" }` (Search).

**Collection: `Orders`**
* **Fields:** `customerDetails` (JSON), `items` (Array of snapshots), `totalAmount`, `paymentMethod`.

## 6. DEVELOPMENT ROADMAP FOR AGENT (is optional, you don't have to follow it strictly)

1.  **Phase 1: The Engine Room:** Setup NestJS, Docker (Mongo + MinIO), Swagger, and Global Filters.
2.  **Phase 2: The Chameleon:** Implement the `Settings` module and Storage/Payment Adapters.
3.  **Phase 3: The Catalog:** Build the `Product` schema with "Smart Variant" logic.
4.  **Phase 4: The Commerce:** Implement Cart, Order (Snapshotting), and Inventory Logic.
5.  **Phase 5: The "One-Click" Seed:** Create `seed.ts` that generates a "Proof of Concept" store containing:
    * 1 Pair of Sneakers (Size/Color variants)
    * 1 Saree (Color/Blouse variants)
    * 1 Bangle Set (Diameter variants)
    *(This proves to me that the Engine works for all niches).*

## 7. WE ARE USING SKILLS.
1. check our agents/agent folder keep it in your mind that we should use those skills when you are doing a thing which has a skills for it in that folder. 
2. Like - 
---
**FINAL INSTRUCTION:**
**Action:** Initialize the project structure now.
**Mindset:** You are the Lead Architect. Before writing any file, ask yourself: *"Does this help Ashrafee sell this software to a new client easily?"* If yes, build it. If no, discard it.