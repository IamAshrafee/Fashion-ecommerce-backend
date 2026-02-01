# 🚀 THE FASHION ENGINE

> **Universal E-commerce Backend for Fashion & Apparel**  
> A white-label, production-ready NestJS backend that powers fashion e-commerce stores selling anything from Sneakers to Sarees to Jewelry.

---

## 📖 Project Vision

**The Problem:** Building a new backend for every fashion client is slow and unprofitable.

**The Solution:** The Fashion Engine is a master codebase where you can:
1. Clone the repository
2. Update the `.env` file
3. Instantly launch a new store for any fashion niche

**Core Philosophy:** 100% Reusable. Zero hardcoding. Plug-and-play for ANY fashion vertical.

---

## 🛠️ Technology Stack

| **Category** | **Technology** | **Purpose** |
|--------------|----------------|-------------|
| **Runtime** | Node.js | Server execution |
| **Framework** | NestJS | Modular architecture |
| **Language** | TypeScript (Strict Mode) | Type safety |
| **Database** | MongoDB + Mongoose | NoSQL document storage |
| **Validation** | Zod via `nestjs-zod` | Schema validation |
| **Storage** | Self-Hosted MinIO | S3-compatible object storage |
| **Documentation** | Swagger/OpenAPI | Automated API docs |
| **Security** | Helmet + Throttler | Headers & rate limiting |
| **Containerization** | Docker & Docker Compose | Consistent dev environment |

---

## 🚦 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Fashion-ecommerce-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration (default values work for local development)
```

### 4. Start Docker Services
```bash
# Start MongoDB and MinIO
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5. Run the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 6. Access the Application
- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs
- **MinIO Console:** http://localhost:9001 (Login: `minioadmin` / `minioadmin123`)

---

## 📂 Project Structure

```
Fashion-ecommerce-backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts            # Root module
│   ├── app.controller.ts        # Root controller
│   └── app.service.ts           # Root service
├── test/                        # E2E tests
├── docker-compose.yml           # Docker infrastructure
├── .env.example                 # Environment template
├── .env                         # Local environment (git-ignored)
├── nest-cli.json                # NestJS CLI configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies & scripts
└── PROJECT_BLUEPRINT.md         # Master architecture document
```

---

## 🐳 Docker Services

### MongoDB
- **Port:** 27017
- **Database:** `fashion_engine`
- **Default Credentials:** `admin` / `password123`
- **Health Check:** Automatic ping every 10s

### MinIO (S3-Compatible Storage)
- **API Port:** 9000
- **Console Port:** 9001
- **Default Bucket:** `product-images` (auto-created)
- **Default Credentials:** `minioadmin` / `minioadmin123`
- **Access Policy:** Public download for product images

---

## 📜 Available Scripts

```bash
# Development
npm run start          # Start application
npm run start:dev      # Start with hot reload
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build for production
npm run start:prod     # Run production build

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run end-to-end tests

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

---

## 🔐 Environment Variables

Key environment variables (see `.env.example` for full list):

| **Variable** | **Description** | **Default** |
|--------------|-----------------|-------------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://admin:password123@localhost:27017/fashion_engine?authSource=admin` |
| `MINIO_ENDPOINT` | MinIO server endpoint | `localhost` |
| `MINIO_PORT` | MinIO API port | `9000` |
| `MINIO_DEFAULT_BUCKET` | Default storage bucket | `product-images` |
| `JWT_SECRET` | JWT signing secret | *Change in production* |
| `CLIENT_URL` | Frontend CORS origin | `http://localhost:5173` |

---

## 🏗️ Architecture Patterns

### 1. Smart Variant Product Schema
Products are containers; variants are physical items with dynamic attributes.

**Example:**
```json
{
  "title": "Nike Air Max",
  "variants": [
    {
      "sku": "NIKE-001-RED-40",
      "attributes": { "Size": "40", "Color": "Red" },
      "stock": 15,
      "price": 1200,
      "images": ["red-variant.jpg"]
    }
  ]
}
```

### 2. Adapter Pattern for External Services
Decouple business logic from external providers.

- **Storage Interface:** `IStorageService` → `MinioStorageService`
- **Payment Interface:** `IPaymentGateway` → `SSLCommerzService` / `CashOnDeliveryService`

### 3. Universal Filtering Protocol
Dynamic filtering from frontend:
```
GET /products?filters[color]=red&filters[size]=42
```

---

## 🛣️ Development Roadmap

- [x] **Phase 1:** The Engine Room (NestJS, Docker, Swagger)
- [ ] **Phase 2:** The Chameleon (Settings Module, Adapters)
- [ ] **Phase 3:** The Catalog (Smart Variant Products)
- [ ] **Phase 4:** The Commerce (Cart, Orders, Inventory)
- [ ] **Phase 5:** One-Click Seed (Multi-niche proof of concept)

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI:** http://localhost:3000/api/docs

All endpoints are documented with request/response schemas.

---

## 🔒 Security Features

- **Helmet:** Secure HTTP headers
- **CORS:** Configured for trusted origins
- **Rate Limiting:** 10 requests/minute per IP (configurable)
- **JWT Authentication:** Secure token-based auth
- **Input Validation:** Zod schema validation on all inputs

---

## 🤝 Contributing

This is a commercial project. For feature requests or bug reports, please contact the development team.

---

## 📄 License

Proprietary - All Rights Reserved

---

## 👨‍💻 Development Team

**CTO/Lead Architect:** AI Agent  
**Founder/Product Owner:** Ashrafee

---

## 📞 Support

For questions or support, refer to the `PROJECT_BLUEPRINT.md` for architectural decisions and implementation details.

---

**Built with ❤️ for the Fashion Industry**
