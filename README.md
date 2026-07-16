# 🛡️ AEGIS X
### **Autonomous Engineering Guardian Intelligence System**
> **"The AI that prevents infrastructure disasters before they happen."**

---

## 📌 1. Project Overview & Problem Statement

### ❌ The Core Problem
Civil infrastructure (bridges, tunnels, dams, commercial skyscrapers, and expressways) collapses because inspections are:
* **Manual & Slow**: Inspection reports are compiled on clipboards, resulting in weeks of delays.
* **Reactive**: Authorities only respond *after* visible crack failures or partial collapses occur.
* **Disconnected**: Structural inspection photos, contractor field notes, and official building codes (like IS-456 or IRC manuals) remain siloed. 
* **Expensive**: Structural degradation expands exponentially. A minor $50,000 crack seal, if delayed by 6 months, can grow into a $1,200,000 critical rehabilitation issue.

### ✅ The AEGIS X Solution
AEGIS X compiles these sources into a living **Predictive Digital Twin Platform**. It uses a coordinated network of AI Agents to:
1. Parse visual inspection imagery (drones, CCTV).
2. Run OCR on unstructured contractor reports.
3. Query and quote official building codes using semantic **RAG vector databases**.
4. Synthesize structural evaluations, hazard indicators, and deterioration timelines.
5. Model what-if degradation simulations side-by-side to optimize municipal repair budgets.

---

## 🚀 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 19, TypeScript, **Tailwind CSS v4** (Utility CSS in JS-free `@theme` declarations), Framer Motion |
| **Data Viz & Maps** | **Leaflet Maps** (geolocating assets with pulsing status markers), **Recharts** (modelling deterioration and repair cost curves) |
| **Orchestration Flow** | **React Flow** (visualizing the multi-agent graph layout on the landing page) |
| **Backend API** | FastAPI (Python 3.12), Uvicorn, SQLite, SQLAlchemy ORM (Supabase PostgreSQL schema-aligned) |
| **AI & RAG Core** | **Gemini 2.5 Flash / Vision** (multimodal analysis), **Gemini Embeddings** (RAG), and a custom pure-Python **TF-IDF + Cosine Similarity** fallback engine |

---

## 📦 3. System Architecture & 3D Workflow Topology

Below is the layout of the AEGIS multi-agent pipeline. It follows a coordinated state-flow where each node updates the Digital Twin memory.

### 🗺️ System Blueprint (LangGraph Orchestration)

```mermaid
graph TD
    subgraph Client [Vite React Interface]
        UploadView[1. File Upload Portal]
        TelemetryMap[2. Command Map]
        TimelineRep[3. Timeline Replay]
        SimulatorView[4. What-If Simulator]
        CopilotPanel[5. Conversational Copilot]
    end

    subgraph Server [FastAPI Agent Engine]
        API[FastAPI Router] --> DB[SQLite / Supabase]
        API --> Coordinator[Coordinator Agent Graph]
        
        subgraph Multi-Agent Network
            Coordinator --> Inspector[🛰️ Inspector Agent Vision]
            Inspector --> Document[📄 Document Agent OCR]
            Document --> RAG[📚 Knowledge RAG Agent]
            RAG --> Engineer[👷 Structural Engineer Agent]
            Engineer --> Analyst[📊 Risk Analyst Agent]
            Analyst --> Simulator[🎮 Simulation Agent]
            Simulator --> Report[📥 Report Agent]
        end
    end

    subgraph DataStore [Storage & Vector RAG]
        RAG --> RAGIndex[rag_index.json TF-IDF/Gemini Embeddings]
        DB --> SQLiteStore[(aegis_x.db)]
    end

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
  │ 📚 3. Knowledge Agent (FAISS RAG)                      │
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

# 3. Compile the Vector RAG guidelines & seed the SQLite Database
python -m app.rag_indexer
python -m app.seed

# 4. Start the FastAPI local server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Note: The backend will now serve the API at `http://127.0.0.1:8000`.*

### 2. Frontend client Setup
Open a second terminal in the `frontend/` directory:
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```
*Note: Open `http://localhost:5173` in your web browser.*

---

## 📖 6. User Manual: How to Use AEGIS X

### 🗺️ Step 1: The Command Center Map
* The dashboard displays all infrastructure assets on a **dark Leaflet Map**.
* Pulsing circles indicate telemetry safety tiers:
  * **🔴 Critical (Health < 65)**: Advanced failures (e.g., Ganga Bridge shear cracks).
  * **🟡 Warning (Health 65-75)**: Basement building columns overload.
  * **🟡 Monitor (Health 75-85)**: Metro tunnel joint moisture seepage.
  * **🟢 Safe (Health > 85)**: Hydrostatic dam gate operation optimal.
* Click any marker popup to enter the Digital Twin.

### 🕒 Step 2: Timeline Replay & AI Memory
* Select the **Ganga Bridge** asset and look at the **Timeline Replay** widget.
* Drag the chronological slider across the years:
  * **2024 Scan**: Hairline 0.2mm crack on Pier 2 (Safe).
  * **2025 Scan**: Wider 1.8mm crack on Pier 2 (Monitor).
  * **2026 Scan**: Dangerous 5.2mm shear crack, spalling concrete, exposed steel (Critical).
* Observe how the **AI Digital Twin Memory** card automatically compiles the deterioration rates and cautions against past temporary acrylic repairs that failed.

### 🎮 Step 3: What-If Simulator
* Open the **Simulator** page and compare scenarios side-by-side:
  1. **Repair Now**: Epoxy injection grouting costs $250,000 (Safe).
  2. **Delay 3 Months**: Crack expands. Requires support scaffolding, increasing cost to $480,000.
  3. **Delay 6 Months**: Structural collapse risk. Restricts traffic to single lanes, costing $1,200,000.
  4. **Heavy Monsoon**: Acidic water ingress triggers spalling, costing $750,000.
  5. **40% Traffic Spike**: Overloaded freight induces fatigue limits, costing $900,000.
* Examine the **Line Chart** to map the health decline curve vs. the spiking repair budget.

### 🛰️ Step 4: Execute a Multi-Agent Audit
1. Go to **Audit Upload** on the top navigation bar.
2. Select **Ganga Bridge** (or any asset). Enter inspector logs.
3. Choose the pre-packaged files in your directory:
   * 📷 **Image**: `aegis-x/data/sample_bridge_defect.png`
   * 📄 **PDF**: `aegis-x/data/sample_inspection_report.pdf`
4. Click **Execute Multi-Agent Audit**.
5. Watch the **Node Network** lights change from **Idle** to **Processing** and **Completed**, printing real-time diagnostic logs in the terminal stream.
6. Once finished, download the **Audit Report** markdown file directly.

### 💬 Step 5: Consult the AI Copilot
* Click **Ask Copilot** on any screen to open the slide-out panel.
* Type structural queries:
  * *"Why is this asset high risk?"*
  * *"Which engineering codes apply here?"*
  * *"What is the recommended repair protocol?"*
* The Copilot queries the vector DB and cites the exact standards (e.g. **IS-456:2000 Clause 11.3** and **IRC:SP-18 Section 4**) with source snippets.

---

## 🔒 7. Enterprise API & Security Credentials

To activate live API calls:
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=AIzaSyYourGeminiApiKey
```
If no key is present, the backend automatically runs **Heuristic Fallback Reasoning Engines** that mirror the exact outputs, assuring full functionality.

### Transitioning to Production Database
1. Create a [Supabase](https://supabase.com) project.
2. Replace `DATABASE_URL` in your production environments:
```env
DATABASE_URL=postgresql://postgres.your_supabase_ref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```
SQLAlchemy automatically creates schemas and syncs the PostgreSQL database tables on startup.
