# 🛡️ PRAHARI AI
### **Telangana Infrastructure Intelligence Platform (Pilot)**
> **"Protecting Infrastructure. Empowering Decisions."**

---

## 📌 1. Project Overview & Problem Statement

### ❌ The Core Problem
Telangana's civil infrastructure (bridges, flyovers, highways, dams, hospitals, schools, and government buildings) degrades silently because inspections are:
* **Manual & Slow**: Inspection reports are compiled on clipboards, resulting in weeks of delays.
* **Reactive**: Authorities only respond *after* visible crack failures or partial collapses occur.
* **Disconnected**: Structural inspection photos, contractor field notes, and official building codes (like IS-456 or IRC manuals) remain siloed across departments.
* **Expensive**: Structural degradation expands exponentially. A minor ₹40 lakh crack seal, if delayed by 6 months, can grow into a ₹1 crore+ critical rehabilitation issue.

### ✅ The PRAHARI AI Solution
PRAHARI AI compiles these sources into a living **Predictive Digital Twin Platform** for Telangana's 18 districts. It uses a coordinated network of AI Agents to:
1. Parse visual inspection imagery (drones, CCTV).
2. Run OCR on unstructured contractor reports.
3. Query and cite official building codes using semantic **RAG vector databases** (21 curated knowledge collections).
4. Synthesize structural evaluations, hazard indicators, and deterioration timelines.
5. Model what-if degradation simulations side-by-side to optimize municipal repair budgets.
6. Provide an executive decision support layer for district collectors and state-level authorities.

---

## 🗺️ Telangana Pilot Coverage

| Scope | Details |
|---|---|
| **Districts Covered** | Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam, Nalgonda, Mahabubnagar, Adilabad, Rangareddy, Siddipet, Medak, Jagitial, Mancherial, Peddapalli, Suryapet, Sangareddy, Vikarabad, Bhadradri Kothagudem |
| **Asset Count (Pilot)** | 250 representative infrastructure assets |
| **Infrastructure Classes** | Roads, State Highways, Bridges, Flyovers, Schools, Hospitals, Universities, Water Utilities, Drainage Systems, Smart City Assets, Railway Infrastructure, Government Buildings, Public Utilities |
| **GPS Coverage** | Telangana bounds: 15.8°N–19.8°N, 77.2°E–81.8°E |
| **Architecture Scalability** | Designed for full national rollout across all Indian states |

---

## 🚀 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 19, TypeScript, **Tailwind CSS v4** (Utility CSS in JS-free `@theme` declarations) |
| **Data Viz & Maps** | **Leaflet Maps** (geolocating assets with pulsing status markers), **Recharts** (modelling deterioration and repair cost curves) |
| **Orchestration Flow** | **React Flow** (visualizing the multi-agent graph layout on the landing page) |
| **Backend API** | FastAPI (Python 3.12), Uvicorn, SQLite, SQLAlchemy ORM (Supabase PostgreSQL schema-aligned) |
| **AI & RAG Core** | **Gemini 2.5 Flash / Vision** (multimodal analysis), **Gemini Embeddings** (RAG), and a custom pure-Python **TF-IDF + Cosine Similarity** fallback engine |
| **Authentication** | Glassmorphic Sign In / Sign Up portal with Email+Password and Google Account login |
| **Real Photos** | Unsplash Source API (free, no key required) for deterministic infrastructure photos per asset |

---

## 📦 3. System Architecture & 3D Workflow Topology

Below is the layout of the PRAHARI AI multi-agent pipeline. It follows a coordinated state-flow where each node updates the Digital Twin memory.

### 🗺️ System Blueprint (LangGraph Orchestration)

```mermaid
graph TD
    subgraph Client [Vite React Interface]
        AuthGate[0. Auth Portal - Sign In/Sign Up]
        UploadView[1. File Upload Portal]
        TelemetryMap[2. Telangana Command Map]
        TimelineRep[3. Timeline Replay]
        SimulatorView[4. What-If Simulator]
        CopilotPanel[5. Conversational Copilot]
        KnowledgeCenter[6. Knowledge Center - 21 Collections]
        NationalCommand[7. National Command Center]
        ExecutiveDecision[8. Executive Decision Support]
    end

    subgraph Server [FastAPI Agent Engine]
        API[FastAPI Router] --> DB[SQLite / Supabase]
        API --> Coordinator[Coordinator Agent Graph]
        
        subgraph Multi-Agent Network
            Coordinator --> Inspector[🛰️ Inspector Agent Vision]
            Inspector --> Document[📄 Document Agent OCR]
            Document --> RAG[📚 Knowledge RAG Agent - 21 Collections]
            RAG --> Engineer[👷 Structural Engineer Agent]
            Engineer --> Analyst[📊 Risk Analyst Agent]
            Analyst --> Simulator[🎮 Simulation Agent]
            Simulator --> Report[📥 Report Agent]
        end
    end

    subgraph DataStore [Storage & Vector RAG]
        RAG --> RAGIndex[rag_index.json TF-IDF/Gemini Embeddings]
        DB --> SQLiteStore[(prahari_ai.db - 250 Telangana Assets)]
    end

    AuthGate --> TelemetryMap
    UploadView -->|multipart/form-data| API
    TelemetryMap -->|REST JSON| API
    TimelineRep -->|REST JSON| API
    SimulatorView -->|REST JSON| API
    CopilotPanel -->|Semantic Chat| API
```

---

## 🧭 4. 3D Style Agent Execution Pipeline

Every scan executes the following coordinated workflow in sequence:

```
  ┌────────────────────────────────────────────────────────┐
  │ 🛰️ 1. Inspector Agent (Vision AI)                       │
  │    ├─ Inputs: JPG/PNG Drone Inspections                │
  │    └─ Outputs: [JSON] Crack coordinates, widths, rust   │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 📄 2. Document Agent (OCR / NLP)                       │
  │    ├─ Inputs: PDF Contractor forms & written notes     │
  │    └─ Outputs: [JSON] Extracted urgency metrics        │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 📚 3. Knowledge Agent (RAG - 21 Collections)           │
  │    ├─ Inputs: Detected anomalies keywords              │
  │    └─ Outputs: [RAG] Matching IS-456 & IRC clauses     │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 👷 4. Structural Engineer Agent                        │
  │    ├─ Inputs: Anomalies + Code clauses + Memory        │
  │    └─ Outputs: [JSON] Engineering damage profiles      │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 📊 5. Risk Analyst Agent                               │
  │    ├─ Inputs: Engineering Profiles + Weather + Traffic │
  │    └─ Outputs: [JSON] Safety Score & Public Impact     │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 🎮 6. Simulation Agent                                 │
  │    ├─ Inputs: Risk Profiles + Environmental Vectors    │
  │    └─ Outputs: [JSON] 5-Scenario deterioration curves │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 📥 7. Report Agent                                     │
  │    ├─ Inputs: Completed Multi-Agent States             │
  │    └─ Outputs: [MD/PDF] Structural compliance audits   │
  └────────────────────────────────────────────────────────┘
```

---

## 🛠️ 5. Installation & Local Setup

### 1. Backend Server Setup
Open your terminal in the `backend/` directory:
```bash
# 1. Create Python Virtual Environment
python -m venv venv
.\venv\Scripts\activate   # On Windows (PowerShell)
source venv/bin/activate  # On macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Compile the Vector RAG guidelines & seed the SQLite Database (250 Telangana assets)
python -m app.rag_indexer
python -m app.seed

# 4. Start the FastAPI local server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Note: The backend will now serve the API at `http://127.0.0.1:8000`.*

### 2. Frontend Client Setup
Open a second terminal in the `frontend/` directory:
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```
*Note: Open `http://localhost:5173` in your web browser.*

---

## 📖 6. User Manual: How to Use PRAHARI AI

### 🔐 Step 0: Authentication Portal
* On first launch, click **"Access Control Panel"** on the landing page.
* Sign in with your **email & password** or click **"Sign In with Google"**.
* After successful authentication, you are redirected to the Telangana Command Dashboard.
* Your profile avatar and name appear in the top-right navbar. Hover to **Sign Out**.

### 🗺️ Step 1: The Telangana Command Center Map
* The dashboard displays all **250 infrastructure assets** on a dark Leaflet Map centered on Telangana.
* Pulsing circles indicate telemetry safety tiers:
  * **🔴 Critical (Health < 65)**: Advanced failures requiring immediate intervention.
  * **🟡 Warning (Health 65-75)**: Elevated risk — monitor closely.
  * **🟡 Monitor (Health 75-85)**: Early-stage degradation observed.
  * **🟢 Safe (Health > 85)**: Structure operating within normal parameters.
* Use the **District** and **Infrastructure Class** dropdown filters to narrow the view.
* Click any marker popup to enter the Digital Twin detail page.

### 🕒 Step 2: Timeline Replay & AI Memory
* Select any bridge or road asset and look at the **Timeline Replay** widget.
* Drag the chronological slider across inspection dates to observe deterioration progression.
* The **AI Digital Twin Memory** card compiles cumulative degradation rates and past repair outcomes.

### 🎮 Step 3: What-If Simulator
* Open the **Simulator** page and compare scenarios side-by-side:
  1. **Repair Now**: Lower cost, safer outcome.
  2. **Delay 3 Months**: Crack expands, scaffolding required, cost rises.
  3. **Delay 6 Months**: Structural collapse risk, lane restrictions, maximum cost.
  4. **Heavy Monsoon**: Acidic water ingress triggers spalling.
  5. **Traffic Spike**: Overloaded freight induces fatigue limits.
* Examine the **Line Chart** to map the health decline curve vs. the spiking repair budget.

### 🛰️ Step 4: Execute a Multi-Agent Audit
1. Go to **Audit Upload** on the top navigation bar.
2. Select an asset (e.g., Hussain Sagar Bridge). Enter inspector logs.
3. Upload a drone inspection image and/or contractor PDF report.
4. Click **Execute Multi-Agent Audit**.
5. Watch the **Node Network** lights change from **Idle → Processing → Completed**, printing real-time diagnostic logs.
6. Download the **Audit Report** markdown file directly.

### 💬 Step 5: Consult the AI Copilot
* Click **Ask Copilot** on any screen to open the slide-out panel.
* Type structural queries:
  * *"Why is this asset high risk?"*
  * *"Which engineering codes apply here?"*
  * *"What is the recommended repair protocol?"*
* The Copilot queries the vector DB across 21 knowledge collections and cites exact standards (e.g. **IS-456:2000 Clause 11.3** and **IRC:SP-18 Section 4**).

### 📚 Step 6: Knowledge Center
* Browse all **21 RAG knowledge collections** including Engineering Standards, Defect Library, Repair Methods, Telangana State Knowledge, Government Policies, and more.
* Each collection is searchable and linked to the Copilot's reasoning engine.

---

## 🔒 7. Enterprise API & Security Credentials

To activate live AI API calls:
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=AIzaSyYourGeminiApiKey
```
If no key is present, the backend automatically runs **Heuristic Fallback Reasoning Engines** that mirror the exact outputs, assuring full demo functionality.

### Transitioning to Production Database
1. Create a [Supabase](https://supabase.com) project.
2. Replace `DATABASE_URL` in your production environments:
```env
DATABASE_URL=postgresql://postgres.your_supabase_ref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```
SQLAlchemy automatically creates schemas and syncs the PostgreSQL database tables on startup.

---

## 🏛️ 8. Government Deployment Roadmap

| Phase | Scope | Timeline |
|---|---|---|
| **Phase 1 (Current)** | Telangana Pilot — 18 districts, 250 assets | Q3 2026 |
| **Phase 2** | Andhra Pradesh + Karnataka expansion | Q1 2027 |
| **Phase 3** | South India rollout — 5 states | Q3 2027 |
| **Phase 4** | National rollout — all 28 states | 2028 |

---

*Built with ❤️ for Telangana | PRAHARI AI v1.0 Pilot | Protecting Infrastructure. Empowering Decisions.*
