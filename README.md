# Dak Ghar Niryat Kendra (DNK) — Electronic Export & Customs Marketplace Platform

> **Smart India Hackathon (SIH) Project**  
> An end-to-end digital integration platform empowering rural Indian artisans to export authentic handcrafted goods globally through India Post, automated PBE-III / ICEGATE customs clearance, multimodal AI cataloging (Gemini Vision + Voice STT), and milestone-based escrow payouts.

---

## 1. System Architecture

The DNK platform operates as a distributed microservice ecosystem:

```mermaid
graph TD
    subgraph Client Apps
        ArtisanApp["🎨 Artisan App (Expo / React Native) :8081"]
        BuyerStore["🛍️ Buyer Storefront (Next.js 14) :3000"]
    end

    subgraph Core Backend
        BackendAPI["⚡ Core Backend API (FastAPI) :8000"]
        PostgresDB[("🐘 PostgreSQL Database :5432 / :5433")]
    end

    subgraph Intelligence & Services
        AIEngine["🤖 DNK AI Engine (FastAPI) :8001"]
        GeminiAPI["✨ Google Gemini 3.6 Flash"]
        QdrantDB["📦 Vector HS-Code Index (SentenceTransformers)"]
        StripeGateway["💳 Stripe Payment Gateway"]
        MockICEGATE["🏛️ ICEGATE / Customs PBE Gateway"]
    end

    ArtisanApp -->|REST / JWT| BackendAPI
    BuyerStore -->|REST / JSON| BackendAPI
    BackendAPI -->|SQLAlchemy ORM| PostgresDB
    BackendAPI -->|Multimodal Ingestion| AIEngine
    AIEngine -->|Vision & Voice STT| GeminiAPI
    AIEngine -->|8-digit ITC-HS Match| QdrantDB
    BuyerStore -->|Checkout Redirect| StripeGateway
    BackendAPI -->|PBE-III Electronic Filing| MockICEGATE
```

---

## 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Core Backend API** | Python 3.10+, FastAPI, SQLAlchemy 2.0, PostgreSQL, Pydantic v2, Python-Jose (JWT), ReportLab (CN-23 PDF Generator), Stripe SDK |
| **AI Intelligence Engine** | Python 3.10+, FastAPI, Google GenAI SDK (`gemini-3.6-flash`), Sentence-Transformers (`all-MiniLM-L6-v2`), Qdrant Client, NumPy, PyTorch |
| **Buyer Storefront** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion, Lucide Icons, Zustand State Management |
| **Artisan Mobile & Web App** | React Native, Expo 57, Expo AV (Voice Recording), Expo Camera/ImagePicker, NativeWind / TailwindCSS, Zustand |
| **Database & Vector Store** | PostgreSQL 14+, Qdrant Vector Engine (with local vector similarity fallback) |
| **Logistics & Customs** | Electronic PBE-III filing format, CBIC Foreign Post Office (FPO) integration, automated Let Export Order (LEO) workflow |

---

## 3. Repository Structure

```text
dnk-project/
├── dak-ghar-backend/              # Core FastAPI Backend API (Port 8000)
│   ├── main.py                    # API routes, auth, products, orders, escrow, tracking
│   ├── models.py                  # SQLAlchemy Database Models (Users, Products, Orders, Escrow, PBE)
│   ├── schemas.py                 # Pydantic validation schemas
│   ├── database.py                # Database connection & session factory
│   ├── auth.py                    # JWT token creation & password hashing
│   ├── icegate.py                 # Mock ICEGATE customs filing router
│   ├── cn23_generator.py          # Automated CN-23 Customs Declaration PDF engine
│   ├── ai_engine.py               # Microservice client proxying AI requests to port 8001
│   ├── create_tables.py           # Table initialization script
│   ├── create_test_user.py        # Seed default test seller account
│   ├── requirements.txt           # Python backend dependencies
│   └── .env.example               # Backend environment template
│
├── dnk-ai-engine/                 # AI Engine Microservice (Port 8001)
│   ├── app/
│   │   ├── main.py                # FastAPI app entry & health endpoints
│   │   ├── core/                  # Gemini & Qdrant configuration
│   │   ├── services/
│   │   │   ├── catalog_service.py # Multimodal catalog synthesis & keyword extraction
│   │   │   ├── speech_service.py  # Voice speech-to-text transcription engine
│   │   │   └── hscode_service.py  # 8-digit ITC-HS Code vector matching
│   │   └── api/v1/endpoints/      # Endpoints for transcribe, vision, and cataloging
│   ├── requirements.txt           # AI engine dependencies
│   └── .env.example               # AI Engine environment template
│
├── DNK/
│   ├── dnk-buyer-storefront/      # Next.js 14 E-Commerce Marketplace (Port 3000)
│   │   ├── app/                   # App Router pages (Home, Products, Checkout, Tracking)
│   │   ├── components/            # Reusable UI components
│   │   ├── context/               # Cart and Currency contexts
│   │   ├── package.json           # Next.js dependencies
│   │   └── .env.local.example     # Frontend environment template
│   │
│   └── dnk-artisan-app/           # Expo Web & Mobile Artisan App (Port 8081)
│       ├── app/                   # Expo Router screens (Voice Catalog, Products, Orders, Payouts)
│       ├── components/            # PermanentSidebar, CameraModal, DropOffModal
│       ├── services/api.ts        # API client for backend authentication & catalog creation
│       ├── store/                 # Zustand multi-language and profile store
│       ├── package.json           # Expo dependencies
│       └── .env.example           # Artisan app environment template
│
├── start_all_services.ps1         # Windows PowerShell Master Startup Script
├── start_all_services.sh          # Linux/macOS Bash Master Startup Script
├── test_master_integration.py     # Master 10-module automated end-to-end test suite
├── .env.example                   # Master environment template
├── .gitignore                     # Git ignore rules protecting credentials & builds
└── README.md                      # Complete system documentation
```

---

## 4. Prerequisites

Before running the project on a new system, ensure the following are installed:

1. **Node.js**: v18.17.0 or higher ([Download Node.js](https://nodejs.org/))
2. **Python**: v3.10, v3.11, or v3.12 ([Download Python](https://www.python.org/))
3. **PostgreSQL**: v14+ active on port 5432 or 5433 ([Download PostgreSQL](https://www.postgresql.org/))
4. **Google Gemini API Key**: Free tier API key from [Google AI Studio](https://aistudio.google.com/)

---

## 5. Quick Start (Run Everything with 1 Command)

### Step 1: Clone the Repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd dnk-project
```

### Step 2: Configure Environment Files
Copy the template files to create your active `.env` configurations:

```bash
# Backend configuration
cp dak-ghar-backend/.env.example dak-ghar-backend/.env

# AI Engine configuration
cp dnk-ai-engine/.env.example dnk-ai-engine/.env

# Buyer Storefront configuration
cp DNK/dnk-buyer-storefront/.env.local.example DNK/dnk-buyer-storefront/.env.local

# Artisan App configuration
cp DNK/dnk-artisan-app/.env.example DNK/dnk-artisan-app/.env
```

> **Important:** Open `dnk-ai-engine/.env` and paste your `GEMINI_API_KEY`.  
> Open `dak-ghar-backend/.env` and adjust your PostgreSQL credentials if needed.

### Step 3: Launch All 4 Services
**On Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File .\start_all_services.ps1
```

**On Linux / macOS (Bash):**
```bash
chmod +x start_all_services.sh
./start_all_services.sh
```

---

## 6. Manual Setup & Individual Service Startup

If you prefer to start services individually in separate terminals:

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running, then create the database:
```sql
CREATE DATABASE dak_ghar;
```

### 2. Core Backend Setup (Port 8000)
```bash
cd dak-ghar-backend
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database tables and test user
python create_tables.py
python create_test_user.py

# Start Backend Server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. AI Engine Setup (Port 8001)
```bash
cd dnk-ai-engine
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start AI Engine Server
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 4. Buyer Storefront Setup (Port 3000)
```bash
cd DNK/dnk-buyer-storefront
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Artisan Mobile & Web App Setup (Port 8081)
```bash
cd DNK/dnk-artisan-app
npm install
npx expo start
```
Press **`w`** in the terminal to open the web version in your browser at **`http://localhost:8081`**.

---

## 7. Environment Variables Reference

### `dak-ghar-backend/.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL SQLAlchemy connection URL | `postgresql+psycopg2://postgres:password@localhost:5432/dak_ghar` |
| `SECRET_KEY` | 256-bit secret for signing JWT tokens | `random_secret_string_32_chars` |
| `AI_ENGINE_URL` | Microservice URL for the AI Engine | `http://127.0.0.1:8001` |
| `STRIPE_SECRET_KEY` | Stripe Test API Secret Key | `sk_test_51U5...` |

### `dnk-ai-engine/.env`
| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-3.6-flash` |
| `QDRANT_HOST` | Vector DB Host (optional) | `localhost` |
| `QDRANT_PORT` | Vector DB Port (optional) | `6333` |

### `DNK/dnk-buyer-storefront/.env.local`
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Core Backend API Base URL | `http://localhost:8000` |

### `DNK/dnk-artisan-app/.env`
| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Core Backend API Base URL | `http://localhost:8000` |

---

## 8. Test Accounts & Credentials

For immediate testing, default accounts are pre-seeded in the database:

| Role | Username / Email | Password |
|---|---|---|
| **Artisan / Seller** | `seller@dakghar.local` | `DakGhar@123` |
| **New Artisan** | Register directly via Artisan App UI | Any password |
| **Buyer** | Auto-registered during checkout | Dynamic checkout session |

---

## 9. Automated Testing & Verification

Run the master integration test suite to verify that all 10 modules work end-to-end:

```bash
# Run from repository root with backend and AI engine active:
python test_master_integration.py
```

### Verified Test Modules:
1. **[PASS] Microservices Health Probes:** Validates `/` (Backend) and `/health` + `/api/v1/health` (AI Engine).
2. **[PASS] Artisan Authentication Lifecycle:** Tests Registration, Login, JWT session tokens, and protected `/me` endpoints.
3. **[PASS] Product Creation & Scoping:** Verifies product listing and isolation per artisan ID.
4. **[PASS] Duplicate Prevention Engine:** Validates HTTP 409 Conflict rejection for duplicate product submissions.
5. **[PASS] AI Vision Multimodal Engine:** Multimodal product image identification and 8-digit ITC-HS Code matching.
6. **[PASS] AI Voice STT & Multimodal Pipeline:** Tests combined audio speech-to-text narrative + image feature extraction.
7. **[PASS] Order & Escrow Initialization:** Validates order placement and automated escrow creation.
8. **[PASS] Customs PBE-III ICEGATE Acceptance:** Tests electronic PBE generation and mock ICEGATE customs acceptance.
9. **[PASS] Escrow Vault & Ledger:** Validates held escrow funds for active orders.
10. **[PASS] Logistics & Customs Tracking:** Tests parcel tracking lifecycle across Postal Intake, Customs LEO, Air Mail Hub, and Destination Handover.

---

## 10. API Documentation (Interactive Swagger / OpenAPI)

Interactive OpenAPI documentation is generated automatically for all endpoints:

* **Core Backend API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **AI Engine API Docs:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

## 11. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **`[WinError 10013]` / `Port in use`** | A previously running instance is holding port 8000 or 8001 | Run `powershell -ExecutionPolicy Bypass -File .\start_all_services.ps1 -StopOnly` to free ports. |
| **`AI Engine returned HTTP 500 / 400`** | Missing or invalid `GEMINI_API_KEY` in `dnk-ai-engine/.env` | Verify your API key at [Google AI Studio](https://aistudio.google.com/) and set `GEMINI_MODEL=gemini-3.6-flash`. |
| **`Database connection failed`** | PostgreSQL service is stopped or invalid credentials | Check PostgreSQL status and update `DATABASE_URL` in `dak-ghar-backend/.env`. |
| **`Next.js image / network error`** | Backend not running on port 8000 | Verify backend is up at `http://127.0.0.1:8000/`. |
| **`CORS error in browser console`** | Frontend origin blocked | Both `dak-ghar-backend` and `dnk-ai-engine` include permissive CORS middleware for development ports. |

---

## 12. Team Development Workflow

```bash
# 1. Clone your fork or branch
git clone <REPO_URL>
cd dnk-project

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and verify all tests pass
python test_master_integration.py

# 4. Commit and push
git add .
git commit -m "feat: description of your improvement"
git push origin feature/your-feature-name
```
