# DAK GHAR NIRYAT KENDRA (DNK)
### Smart India Hackathon 2026 — Omnichannel & Smart Cataloging Platform

---

## QUICK START — WINDOWS + VS CODE

Follow these 10 steps to set up and run the entire DNK ecosystem from scratch in Visual Studio Code on Windows:

### Step 1: Clone the Repository
`powershell
git clone <YOUR_GITHUB_REPO_URL>
cd dnk-project
`

### Step 2: Open Folder in VS Code
`powershell
code .
`
*(Or open VS Code and use File -> Open Folder... -> select D:\dnk-project)*

### Step 3: Configure Environment (.env) Files
Copy each .env.example template to create your local .env configuration files:
`powershell
# Core Backend
Copy-Item dak-ghar-backend\.env.example dak-ghar-backend\.env

# AI Engine
Copy-Item dnk-ai-engine\.env.example dnk-ai-engine\.env

# Buyer Storefront
Copy-Item DNK\dnk-buyer-storefront\.env.local.example DNK\dnk-buyer-storefront\.env.local

# Artisan App
Copy-Item DNK\dnk-artisan-app\.env.example DNK\dnk-artisan-app\.env
`
> **Note:** Open dnk-ai-engine\.env and paste your GEMINI_API_KEY from [Google AI Studio](https://aistudio.google.com/).
> In dak-ghar-backend\.env, verify DATABASE_URL matches your local PostgreSQL instance (default: postgresql+psycopg2://postgres:password@localhost:5432/dak_ghar).

### Step 4: Install Backend Dependencies
Open a PowerShell terminal in VS Code:
`powershell
cd dak-ghar-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
`

### Step 5: Install AI Engine Dependencies
`powershell
cd dnk-ai-engine
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
`

### Step 6: Install Artisan App Dependencies
`powershell
cd DNK\dnk-artisan-app
npm install
cd ..\..
`

### Step 7: Install Buyer Storefront Dependencies
`powershell
cd DNK\dnk-buyer-storefront
npm install
cd ..\..
`

### Step 8: Run Database Initialization & Migrations
In the backend virtual environment:
`powershell
cd dak-ghar-backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python create_tables.py
python create_test_user.py
cd ..
`

### Step 9: Launch All 4 Services (One Command)
Run the master PowerShell startup script:
`powershell
powershell -ExecutionPolicy Bypass -File .\start_all_services.ps1
`

### Step 10: Access Live Applications
* **Artisan App (Web):** [http://localhost:8081](http://localhost:8081)
* **Buyer Storefront:** [http://localhost:3000](http://localhost:3000)
  * D2C Shop: [http://localhost:3000/shop](http://localhost:3000/shop)
  * B2B Wholesale: [http://localhost:3000/b2b](http://localhost:3000/b2b)
  * Dwara Export Gateway: [http://localhost:3000/dwara](http://localhost:3000/dwara)
* **Core Backend API (Swagger Docs):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **AI Engine API (Swagger Docs):** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

## 1. System Architecture & Designated Ports

`
                       ┌──────────────────────────────┐
                       │   ARTISAN APP (:8081)        │
                       │   React Native / Expo Web    │
                       └──────────────┬───────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   │ (Voice/Audio/Image)                 │ (Auth / Products /
                   ▼                                     │  Orders / Payouts)
        ┌─────────────────────┐                          │
        │  AI ENGINE (:8001)  │                          ▼
        │  • Gemini STT       │                ┌─────────────────────┐
        │  • Rembg Vision     │                │ BACKEND API (:8000) │
        │  • ITC-HS & CITES   │                │ • FastAPI / JWT     │
        │  • Wage Heuristics  │◄───────────────┤ • Pexels Proxy      │
        └─────────────────────┘ (Proxy / Check)│ • Logistics Code-128│
                                               │ • Customs CN22/PBE  │
                                               └──────────┬──────────┘
                                                          │
                   ┌──────────────────────────────────────┼────────────────────────┐
                   │                                      │                        │
                   ▼                                      ▼                        ▼
        ┌─────────────────────┐                ┌─────────────────────┐  ┌─────────────────────┐
        │ PostgreSQL Database │                │ BUYER STOREFRONT    │  │ INDIA POST LOGISTICS│
        │ Products, Orders,   │                │ (:3000)             │  │ 4x6 Label & Code-128│
        │ Escrow, Tracking    │                │ /shop  /b2b  /dwara │  │ Barcode & Tracking  │
        └─────────────────────┘                └─────────────────────┘  └─────────────────────┘
`

| Microservice | Port | Tech Stack | Root Directory |
|---|---|---|---|
| **Core Backend** | 8000 | FastAPI, Python 3.10-3.12, SQLAlchemy, PostgreSQL, ReportLab | dak-ghar-backend/ |
| **AI Engine** | 8001 | FastAPI, Google GenAI SDK (google.genai), Rembg, ONNX Runtime | dnk-ai-engine/ |
| **Buyer Storefront** | 3000 | Next.js 14 App Router, React 18, TailwindCSS, TypeScript | DNK/dnk-buyer-storefront/ |
| **Artisan App** | 8081 | React Native, Expo 51+, Expo Router, TypeScript | DNK/dnk-artisan-app/ |

---

## 2. Prerequisites

Ensure the following tools are installed on your host system:

1. **Python**: Version 3.10.x, 3.11.x, or 3.12.x ([python.org](https://www.python.org/))
2. **Node.js**: Version 18.17.0 or higher (Recommended: LTS 20.x) ([nodejs.org](https://nodejs.org/))
3. **npm**: Version 9.x or higher (bundled with Node.js)
4. **PostgreSQL**: Version 14 or higher (Default port: 5432 or 5433)
5. **Git**: Version 2.30+ ([git-scm.com](https://git-scm.com/))
6. **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

## 3. Individual Service Startup (4 Separate Terminals)

If debugging or running individual services in separate VS Code terminals:

### Terminal 1: Core Backend (:8000)
`powershell
cd dak-ghar-backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
`

### Terminal 2: AI Engine (:8001)
`powershell
cd dnk-ai-engine
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
`

### Terminal 3: Buyer Storefront (:3000)
`powershell
cd DNK\dnk-buyer-storefront
npm run dev
`

### Terminal 4: Artisan Client (:8081)
`powershell
cd DNK\dnk-artisan-app
npx expo start --web --port 8081
`

---

## 4. VS Code Tasks & Debugging Support

The repository includes pre-configured VS Code tasks and launch configurations in .vscode/:

### Running Tasks (Ctrl+Shift+B or Terminal -> Run Task...):
* **Start All DNK Services (PowerShell)**: Runs the master startup script.
* **Stop All DNK Services**: Gracefully releases ports 8000, 8001, 3000, and 8081.
* **Start Backend (:8000)**: Launches backend in a dedicated VS Code terminal.
* **Start AI Engine (:8001)**: Launches AI Engine in a dedicated terminal.
* **Start Buyer Storefront (:3000)**: Launches Next.js dev server.
* **Start Artisan App (:8081)**: Launches Expo web bundler.
* **Run Master Integration Tests**: Executes the complete 10-module integration test suite.

---

## 5. Environment Variables Reference

### dak-ghar-backend/.env
| Variable | Required | Description | Example |
|---|---|---|---|
| DATABASE_URL | Yes | PostgreSQL connection string | postgresql+psycopg2://postgres:password@localhost:5432/dak_ghar |
| SECRET_KEY | Yes | 256-bit secret key for signing JWT tokens |
andom_secret_32_characters |
| AI_ENGINE_URL | Yes | AI Engine base URL | http://127.0.0.1:8001 |
| PEXELS_API_KEY | Optional | Pexels API key for visual fallbacks | your_pexels_api_key |
| STRIPE_SECRET_KEY| Optional | Stripe Test Secret Key | sk_test_placeholder |

### dnk-ai-engine/.env
| Variable | Required | Description | Example |
|---|---|---|---|
| GEMINI_API_KEY | Yes | Google Gemini API Key | AIzaSy... |
| GEMINI_MODEL | Optional | Default Gemini model | gemini-3.1-flash-lite |
| QDRANT_HOST | Optional | Qdrant vector database host | localhost |
| QDRANT_PORT | Optional | Qdrant port (fallback active if offline) | 6333 |

### DNK/dnk-buyer-storefront/.env.local
| Variable | Required | Description | Example |
|---|---|---|---|
| NEXT_PUBLIC_API_BASE_URL | Yes | Backend API base URL | http://localhost:8000 |
| NEXT_PUBLIC_API_URL | Yes | Backend API base URL alias | http://localhost:8000 |

### DNK/dnk-artisan-app/.env
| Variable | Required | Description | Example |
|---|---|---|---|
| EXPO_PUBLIC_API_URL | Yes | Backend API base URL | http://localhost:8000 |
| EXPO_PUBLIC_DEMO_MODE | Optional | Preset demo credentials | 	rue |

---

## 6. External Services & Fallback Architecture

| External Service | Role | Live vs. Fallback Behavior |
|---|---|---|
| **Google Gemini AI** | Multilingual Voice STT & AI Cataloging | **Live**: Real-time Gemini 1.5/3.1 STT. **Fallback**: Graceful model cascade and text mode. |
| **Pexels API** | High-resolution handicraft imagery | **Live**: Curated Indian artisan photos. **Fallback**: Deterministic local handicraft assets. |
| **Qdrant Vector DB** | 8-digit ITC-HS Code matching | **Live**: Vector search. **Fallback**: Curated fuzzy keyword classification (itc_hs_codes.json). |
| **India Post Core API** | Parcel tracking & postal counters | **Simulated Demo Mode**: Realistic 4-milestone event lifecycle (BOOKED $\rightarrow$ DELIVERED). |
| **ICEGATE Customs** | Postal Bill of Export (PBE-III) | **Simulated Demo Mode**: PDF generation and automated customs clearance verification. |

---

## 7. Troubleshooting

| Symptom | Cause | Safe Solution |
|---|---|---|
| **WinError 10048 / 10013 (Port in use)** | Background process holding port 8000, 8001, 3000, or 8081 | Run powershell -ExecutionPolicy Bypass -File .\start_all_services.ps1 -StopOnly to free ports. |
| **AI Engine HTTP 500 / 400** | GEMINI_API_KEY missing or expired in dnk-ai-engine/.env | Verify key in [Google AI Studio](https://aistudio.google.com/) and update dnk-ai-engine/.env. |
| **Database connection failed** | PostgreSQL server not started or invalid password | Verify PostgreSQL is running on port 5432 and update DATABASE_URL in dak-ghar-backend/.env. |
| **Next.js image / network error** | Backend not running on port 8000 | Ensure backend is active at http://127.0.0.1:8000/docs. |
| **Expo Metro Bundler not responding** | Port 8081 conflict | Run
px expo start --web --port 8081 --clear in DNK/dnk-artisan-app. |

---

## 8. Master Integration Test Execution

To verify the entire 10-module end-to-end integration:

`powershell
cd dak-ghar-backend
.\.venv\Scripts\Activate.ps1
cd ..
python test_master_integration.py
`

### Verified Modules:
1. [PASS] Microservices Health Probes (Backend :8000 & AI Engine :8001)
2. [PASS] Artisan Passwordless Authentication (OTP & JWT Lifecycle)
3. [PASS] Product Creation & Artisan Scoping
4. [PASS] Duplicate Product Prevention Engine
5. [PASS] AI Vision Multimodal Studio & ITC-HS Code Matching
6. [PASS] AI Voice STT & Multimodal Cataloging Pipeline
7. [PASS] Order & Escrow Account Initialization
8. [PASS] Customs PBE-III ICEGATE Acceptance
9. [PASS] Escrow Vault & IPPB Savings Ledger
10. [PASS] India Post Postal Tracking & Milestone Progression
