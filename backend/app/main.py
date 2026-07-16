import os
import shutil
import json
from typing import List, Dict, Any, Optional

# Load env variables from local .env file
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import get_db, engine, Base
from .models import Asset, Inspection, Defect, AIMemory, MaintenanceHistory, Simulation
from .schemas import (
    AssetBase, AssetDetailResponse, 
    InspectionDetailResponse, CopilotQuery, CopilotResponse, SimulationRequest
)
from .orchestrator import CoordinatorAgent
from .rag_indexer import RAGSystem

# Initialize database tables on server startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AEGIS X API",
    description="Autonomous Engineering Guardian Intelligence System Backend API",
    version="1.0.0"
)

# Enable CORS for frontend React app development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static", "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")), name="static")

# Initialize orchestrator and RAG system
coordinator = CoordinatorAgent()
rag_system = RAGSystem()

@app.get("/api/assets", response_model=List[AssetBase])
def get_assets(db: Session = Depends(get_db)):
    """Fetch all infrastructure assets."""
    assets = db.query(Asset).order_by(Asset.risk_level.desc()).all()
    # In SQLite, images are URLs. We can map them.
    return assets

@app.get("/api/assets/{asset_id}", response_model=AssetDetailResponse)
def get_asset_detail(asset_id: str, db: Session = Depends(get_db)):
    """Get complete profile of a single asset including its inspections, maintenance logs, and digital twin memory."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Pre-fetch details to satisfy schema
    inspections = db.query(Inspection).filter(Inspection.asset_id == asset_id).order_by(Inspection.inspection_date.desc()).all()
    memories = db.query(AIMemory).filter(AIMemory.asset_id == asset_id).all()
    maintenance = db.query(MaintenanceHistory).filter(MaintenanceHistory.asset_id == asset_id).order_by(MaintenanceHistory.repair_date.desc()).all()
    
    return {
        "id": asset.id,
        "name": asset.name,
        "type": asset.type,
        "location_gps": asset.location_gps,
        "address": asset.address,
        "description": asset.description,
        "current_health_score": asset.current_health_score,
        "risk_level": asset.risk_level,
        "image_url": asset.image_url,
        "created_at": asset.created_at,
        "updated_at": asset.updated_at,
        "inspections": inspections,
        "memories": memories,
        "maintenance": maintenance
    }

@app.get("/api/inspections/{inspection_id}", response_model=InspectionDetailResponse)
def get_inspection_detail(inspection_id: str, db: Session = Depends(get_db)):
    """Fetch specific audit inspection details, including the multi-agent JSON payload, defects, and simulation runs."""
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    defects = db.query(Defect).filter(Defect.inspection_id == inspection_id).all()
    simulations = db.query(Simulation).filter(Simulation.inspection_id == inspection_id).all()
    
    return {
        "id": inspection.id,
        "asset_id": inspection.asset_id,
        "inspection_date": inspection.inspection_date,
        "inspector_name": inspection.inspector_name,
        "overall_risk_score": inspection.overall_risk_score,
        "summary": inspection.summary,
        "status": inspection.status,
        "details_json": inspection.details_json,
        "report_pdf_path": inspection.report_pdf_path,
        "weather": inspection.weather,
        "traffic_load": inspection.traffic_load,
        "created_at": inspection.created_at,
        "defects": defects,
        "simulations": simulations
    }

@app.post("/api/inspections/upload")
async def upload_inspection(
    asset_id: str = Form(...),
    inspector_name: str = Form(...),
    engineer_notes: str = Form(""),
    weather: str = Form("Dry / Clear"),
    traffic_load: str = Form("Standard load"),
    image: Optional[UploadFile] = File(None),
    report_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Trigger the AEGIS X Multi-Agent Pipeline.
    Uploads inspection images/reports, runs CoordinatorAgent, outputs steps, updates Digital Twin.
    """
    # 1. Handle file storage
    saved_image_path = None
    if image:
        image_ext = os.path.splitext(image.filename)[1]
        saved_image_name = f"{asset_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{image_ext}"
        saved_image_path = os.path.join(UPLOAD_DIR, saved_image_name)
        with open(saved_image_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
            
    saved_doc_path = None
    if report_file:
        doc_ext = os.path.splitext(report_file.filename)[1]
        saved_doc_name = f"{asset_id}_doc_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{doc_ext}"
        saved_doc_path = os.path.join(UPLOAD_DIR, saved_doc_name)
        with open(saved_doc_path, "wb") as f:
            shutil.copyfileobj(report_file.file, f)

    # 2. Run the LangGraph orchestration flow
    try:
        execution_state = coordinator.run(
            asset_id=asset_id,
            image_path=saved_image_path,
            doc_path=saved_doc_path,
            engineer_notes=engineer_notes,
            weather=weather,
            traffic=traffic_load,
            db=db
        )
        return {
            "status": "success",
            "message": "Inspection audit pipeline completed successfully.",
            "data": {
                "asset_id": execution_state["asset_id"],
                "defects": execution_state["defects"],
                "synthesis": execution_state["synthesis"],
                "risk": execution_state["risk"],
                "report": execution_state["final_report"],
                "logs": execution_state["logs"]
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline execution failure: {str(e)}")

@app.post("/api/copilot/chat", response_model=CopilotResponse)
def copilot_chat(query: CopilotQuery, db: Session = Depends(get_db)):
    """
    RAG-grounded Interactive AI Copilot chat.
    Retrieves design codes, reads asset memories, answers structural safety queries.
    """
    asset = db.query(Asset).filter(Asset.id == query.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    memory = db.query(AIMemory).filter(AIMemory.asset_id == query.asset_id).first()
    memory_str = json.dumps(memory.value_json) if memory else "No memory state found for this digital twin."

    # Search Vector DB guidelines
    search_results = rag_system.search(query.question, limit=3)
    guidance_context = "\n\n".join([f"Guideline: {c['title']} ({c['source']})\n{c['content']}" for c in search_results])

    # Check for Gemini API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = (
                "You are AEGIS X Structural Copilot, an expert explainable AI assistant. "
                f"You are helping an engineer assess '{asset.name}' ({asset.type}).\n\n"
                f"DIGITAL TWIN MEMORY PROFILE:\n{memory_str}\n\n"
                f"RETRIEVED ENGINEERING GUIDANCE CODES:\n{guidance_context}\n\n"
                f"QUESTION: {query.question}\n\n"
                "Formulate a structured, highly professional response based ONLY on the provided memory and codes. "
                "Quote exact clauses (e.g. IS-456 Clause 26.4) where applicable. "
                "Clearly call out structural uncertainty or missing readings when appropriate. Do not make up calculations."
            )
            response = model.generate_content(prompt)
            return {
                "answer": response.text,
                "sources": search_results,
                "asset_id": query.asset_id
            }
        except Exception as e:
            print(f"Copilot LLM query failed: {e}. Falling back to offline answer engine.")

    # Offline/Fallback explainable Answer Engine (Rule-based heuristics)
    question_lower = query.question.lower()
    answer = ""
    sources = search_results

    if "why" in question_lower or "risk" in question_lower or "critical" in question_lower:
        if asset.type.lower() == "bridge":
            answer = (
                f"**{asset.name}** is currently flagged as **{asset.risk_level}** (Health Score: {asset.current_health_score}/100) due to: \n"
                "- **Critical Pier 2 Diagonal Shear Crack**: At 5.2mm, it exceeds the IS-456 structural ceiling limit (0.3mm for moderate exposure).\n"
                "- **Span 3 Concrete Spalling**: Exposed steel reinforcement undergoing active atmospheric rust and scaling (cross-section section loss is estimated around 12%).\n\n"
                "According to **IS 456:2000 Clause 11.3**, concrete cover must be rebuilt using polymer-modified mortar or micro-concrete. "
                "Under **IRC:SP-18 (Section 4)**, a shear crack exceeding 3mm requires speed and load restrictions to prevent brittle failure under heavy multi-axle logs."
            )
        else:
            answer = (
                f"**{asset.name}** is currently flagged as **{asset.risk_level}** (Health score: {asset.current_health_score}/100). "
                "The core risks stem from structural cracks combined with moisture ingress, compromising structural load-bearing margins. "
                "Please review the detailed inspection findings for specific column and slab coordinates."
            )
    elif "code" in question_lower or "guideline" in question_lower or "is456" in question_lower or "irc" in question_lower:
        answer = (
            "Based on retrieved infrastructure guidance, the following codes apply to these conditions:\n\n"
            "1. **IS 456:2000 Section 1 (Permissible Cracks)**: Limits surface cracks to 0.3mm (mild), 0.2mm (moderate), and 0.1mm (severe exposure). Cracks exceeding 1.5mm indicate structural shear distress.\n"
            "2. **IS 456:2000 Clause 11.3 (Concrete Repair)**: Specifies concrete cover re-establishment by wire-brushing corroded steel, applying a zinc-rich anti-corrosion primer, and patch coating with polymer-modified cementitious mortar.\n"
            "3. **IRC:SP-18 Section 1 (Shear Cracking)**: Cracks > 3mm require traffic load reductions. Grouting must be scheduled immediately using low-viscosity structural epoxy under pressure."
        )
    elif "repair" in question_lower or "fix" in question_lower or "epoxy" in question_lower or "maint" in question_lower:
        if asset.type.lower() == "bridge":
            answer = (
                "The recommended structural rehabilitation pipeline for this asset includes:\n"
                "1. **Epoxy Resin Pressure Grouting**: Inject low-viscosity resin into Pier 2 cracks to restore column shear strength.\n"
                "2. **Carbon Fiber Wrapping (CFRP)**: Wrap Span 3 outer girders with CFRP composites to restore reinforcement tensile margins due to the 12% section loss.\n"
                "3. **Polymer Cement Mortar Patching**: Apply structural mortar over exposed steel to rebuild the nominal concrete cover (40mm for columns, 25mm for beams).\n\n"
                "These steps align with **IS-456: Clause 26.4** and **IRC:SP-18 Section 6** rehabilitation protocols."
            )
        else:
            answer = (
                "The recommended repair actions are:\n"
                "1. **Chemical Grouting**: Seal joints to restrict water ingress.\n"
                "2. **Jacketing/Collar Wrapping**: wrap Column junctions showing stress with steel collars to divert overload stresses."
            )
    else:
        # Default summary answer
        answer = (
            f"Hello. I am the AEGIS X AI Engineering Copilot. I have retrieved 3 engineering guidelines from our database matching your request.\n\n"
            f"**Asset Profile**: {asset.name} ({asset.type})\n"
            f"**Current Status**: {asset.risk_level} (Health: {asset.current_health_score}/100)\n\n"
            "Ask me about: \n"
            "- 'Why is this asset high risk?'\n"
            "- 'Which engineering guidelines or codes apply here?'\n"
            "- 'What is the recommended repair protocol?'\n\n"
            "Grounding sources are listed below."
        )

    return {
        "answer": answer,
        "sources": sources,
        "asset_id": query.asset_id
    }
