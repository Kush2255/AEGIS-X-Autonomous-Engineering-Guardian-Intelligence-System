import os
from typing import Dict, Any, List, TypedDict, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

# Import our agents
from .agents import (
    InspectorAgent,
    DocumentAgent,
    KnowledgeAgent,
    StructuralEngineerAgent,
    RiskAnalystAgent,
    SimulationAgent,
    ReportAgent
)
from .models import Asset, Inspection, Defect, AIMemory, Simulation

# Define state structure
class AgentState(TypedDict):
    asset_id: str
    asset_name: str
    asset_type: str
    image_path: Optional[str]
    doc_path: Optional[str]
    engineer_notes: str
    weather: str
    traffic: str
    history_summary: str
    
    # Node outputs
    defects: List[Dict[str, Any]]
    doc_info: Dict[str, Any]
    guidance: List[Dict[str, Any]]
    synthesis: Dict[str, Any]
    risk: Dict[str, Any]
    simulations: List[Dict[str, Any]]
    final_report: Dict[str, Any]
    
    # Progress logs
    logs: List[Dict[str, str]]

class CoordinatorAgent:
    def __init__(self):
        self.inspector = InspectorAgent()
        self.document = DocumentAgent()
        self.knowledge = KnowledgeAgent()
        self.engineer = StructuralEngineerAgent()
        self.risk_analyst = RiskAnalystAgent()
        self.simulation = SimulationAgent()
        self.report_compiler = ReportAgent()

    def run(self, 
            asset_id: str, 
            image_path: Optional[str], 
            doc_path: Optional[str], 
            engineer_notes: str, 
            weather: str, 
            traffic: str, 
            db: Session,
            progress_callback = None) -> Dict[str, Any]:
        
        # 1. Fetch asset details & history
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise ValueError(f"Asset with ID '{asset_id}' not found.")

        # Compile historical inspections for context
        past_inspections = db.query(Inspection).filter(
            Inspection.asset_id == asset_id
        ).order_by(Inspection.inspection_date.desc()).all()
        
        history_summary = ""
        if past_inspections:
            history_summary = "Past inspection summary:\n"
            for ins in past_inspections[:3]:
                history_summary += f"- {ins.inspection_date.strftime('%Y-%m')}: Risk Score: {ins.overall_risk_score}/100. Summary: {ins.summary}\n"
        else:
            history_summary = "No previous inspection history found. This is the first audit."

        # Initialize State
        state: AgentState = {
            "asset_id": asset_id,
            "asset_name": asset.name,
            "asset_type": asset.type,
            "image_path": image_path,
            "doc_path": doc_path,
            "engineer_notes": engineer_notes,
            "weather": weather,
            "traffic": traffic,
            "history_summary": history_summary,
            "defects": [],
            "doc_info": {},
            "guidance": [],
            "synthesis": {},
            "risk": {},
            "simulations": [],
            "final_report": {},
            "logs": []
        }

        def add_log(agent: str, msg: str):
            log_entry = {
                "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
                "agent": agent,
                "message": msg
            }
            state["logs"].append(log_entry)
            print(f"[{agent}] {msg}")
            if progress_callback:
                progress_callback(log_entry, state)

        # Node 1: Inspector Agent (Vision AI)
        add_log("InspectorAgent", f"Analyzing uploaded asset images/footage for {asset.name}...")
        state["defects"] = self.inspector.analyze_image(image_path, asset.type)
        add_log("InspectorAgent", f"Vision processing complete. Detected {len(state['defects'])} structural anomalies.")

        # Node 2: Document Agent (OCR & Text Extraction)
        add_log("DocumentAgent", "Extracting logs, text entries, and report attachments...")
        state["doc_info"] = self.document.extract_info(doc_path, engineer_notes)
        add_log("DocumentAgent", f"OCR complete. Identified urgency hint: '{state['doc_info'].get('urgency', 'Routine')}'")

        # Node 3: Knowledge Agent (RAG Retrieval)
        add_log("KnowledgeAgent", "Querying engineering codes (IS 456, IRC SP-18, NDMA guidelines) in vector store...")
        state["guidance"] = self.knowledge.retrieve_guidance(state["defects"], None)
        add_log("KnowledgeAgent", f"Retrieved {len(state['guidance'])} code guidelines grounded in the structural context.")

        # Node 4: Structural Engineer Agent (Cognitive Synthesis)
        add_log("StructuralEngineerAgent", "Synthesizing defects, history, and engineering codes for structural evaluation...")
        state["synthesis"] = self.engineer.synthesize(
            asset.name, asset.type, state["defects"], state["doc_info"], state["guidance"], history_summary
        )
        add_log("StructuralEngineerAgent", f"Assessment complete. Classification: '{state['synthesis'].get('damage_classification')}'")

        # Node 5: Risk Analyst Agent (Safety Quantification)
        add_log("RiskAnalystAgent", "Calculating safety risk index, priority rating, and public safety impact vector...")
        state["risk"] = self.risk_analyst.analyze_risk(
            state["defects"], state["synthesis"], weather, traffic
        )
        add_log("RiskAnalystAgent", f"Risk assessment finalized. Safety Risk Score: {state['risk'].get('risk_score')}/100. Priority: {state['risk'].get('priority_level')}")

        # Node 6: Simulation Agent (What-If Forecaster)
        add_log("SimulationAgent", "Modeling side-by-side deterioration simulations (epoxy repair vs delays, heavy rain, traffic expansion)...")
        state["simulations"] = self.simulation.run_scenarios(
            asset_id, state["defects"], state["synthesis"], state["risk"]
        )
        add_log("SimulationAgent", "Deterioration scenario model runs successfully compiled.")

        # Node 7: Report Agent (Audit Compilation)
        add_log("ReportAgent", "Compiling executive engineering report with checklists and code anchors...")
        state["final_report"] = self.report_compiler.generate_report(
            asset.name, asset.type, state["defects"], state["doc_info"], state["synthesis"], state["risk"], state["simulations"]
        )
        add_log("ReportAgent", "Structural audit report successfully compiled.")

        # Write results to database
        add_log("System", "Saving inspection records and updating digital twin memory...")
        self.persist_to_db(state, db)
        add_log("System", "Inspection pipeline finalized successfully!")

        return state

    def persist_to_db(self, state: AgentState, db: Session):
        # 1. Create the main inspection entry
        inspection_id = f"ins-{uuid.uuid4().hex[:8]}"
        
        # Extract risk score
        risk_score = state["risk"].get("risk_score", 50.0)
        
        # Calculate asset health score from risk
        new_health_score = max(5.0, 100.0 - risk_score)
        
        # Determine risk level
        risk_level = "Safe"
        if risk_score >= 80.0:
            risk_level = "Critical"
        elif risk_score >= 60.0:
            risk_level = "Warning"
        elif risk_score >= 35.0:
            risk_level = "Monitor"

        new_inspection = Inspection(
            id=inspection_id,
            asset_id=state["asset_id"],
            inspection_date=datetime.utcnow(),
            inspector_name=state["doc_info"].get("inspector_name", "AI Inspector Agent"),
            overall_risk_score=risk_score,
            summary=state["synthesis"].get("engineering_explanation", "Routine AI structural audit."),
            status="Completed",
            weather=state["weather"],
            traffic_load=state["traffic"],
            report_pdf_path="", # In a real system, this points to Vercel/Supabase storage
            details_json={
                "defects": state["defects"],
                "synthesis": state["synthesis"],
                "risk": state["risk"],
                "report": state["final_report"],
                "logs": state["logs"]
            }
        )
        db.add(new_inspection)

        # 2. Add detected defects
        for idx, d in enumerate(state["defects"]):
            defect_obj = Defect(
                id=f"def-{uuid.uuid4().hex[:8]}",
                inspection_id=inspection_id,
                asset_id=state["asset_id"],
                type=d.get("type", "Crack"),
                severity=d.get("severity", "Medium"),
                location_description=d.get("location_description", "N/A"),
                confidence=d.get("confidence", 0.9),
                description=d.get("description", ""),
                image_url=d.get("image_url", "")
            )
            db.add(defect_obj)

        # 3. Add simulations
        for sim in state["simulations"]:
            sim_obj = Simulation(
                id=f"sim-{uuid.uuid4().hex[:8]}",
                inspection_id=inspection_id,
                asset_id=state["asset_id"],
                scenario_name=sim.get("scenario_name"),
                projected_health=sim.get("projected_health", 50.0),
                projected_risk=sim.get("projected_risk", "Safe"),
                estimated_repair_cost=sim.get("estimated_repair_cost", 0.0),
                code_reference=sim.get("code_reference", ""),
                logic_explanation=sim.get("logic_explanation", "")
            )
            db.add(sim_obj)

        # 4. Update asset state
        asset = db.query(Asset).filter(Asset.id == state["asset_id"]).first()
        if asset:
            asset.current_health_score = new_health_score
            asset.risk_level = risk_level
            asset.updated_at = datetime.utcnow()

        # 5. Update Digital Twin Memory
        memory_key = "structural_profile"
        existing_memory = db.query(AIMemory).filter(
            AIMemory.asset_id == state["asset_id"],
            AIMemory.key == memory_key
        ).first()

        memory_val = {
            "deterioration_summary": f"Deterioration analysis updated. Health score adjusted to {new_health_score:.1f}/100. Risk level is {risk_level}.",
            "structural_criticality": state["synthesis"].get("damage_classification", "Structural assessment logged."),
            "applied_codes": [c.strip() for c in state["synthesis"].get("applied_codes", "IS-456").split("&")],
            "maintenance_warning": f"Recommended action: {state['synthesis'].get('recommended_repair')}. Priority level: {state['risk'].get('priority_level')}.",
            "last_inspection_logs": state["logs"]
        }

        if existing_memory:
            existing_memory.value_json = memory_val
            existing_memory.updated_at = datetime.utcnow()
        else:
            new_memory = AIMemory(
                id=f"mem-{uuid.uuid4().hex[:8]}",
                asset_id=state["asset_id"],
                key=memory_key,
                value_json=memory_val,
                updated_at=datetime.utcnow()
            )
            db.add(new_memory)

        db.commit()
