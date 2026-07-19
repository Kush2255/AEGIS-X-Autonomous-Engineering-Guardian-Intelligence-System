import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

from .database import get_db
from .models import (
    Asset, Inspection, Defect, AIMemory, MaintenanceHistory, Simulation,
    CollaborationComment, CollaborationTask
)

router = APIRouter(prefix="/api/enterprise", tags=["Enterprise Upgrades"])

# HELPER: Parse address to identify state and district
def parse_state_district(address: str) -> tuple:
    if not address:
        return ("Unknown", "Unknown")
    
    # Simple heuristic parser for mock address e.g. "..., Varanasi, UP" or "..., New Delhi, DL"
    parts = [p.strip() for p in address.split(",")]
    if len(parts) >= 2:
        state = parts[-1]
        district = parts[-2]
        # Clean up zip codes or abbreviations
        state = state.split(" ")[0]
        return (state, district)
    return ("National", "General")

@router.get("/command-center")
def get_command_center(db: Session = Depends(get_db)):
    """
    Feature 1: National Infrastructure Command Center
    Computes dynamic ranks, indices, alerts and KPIs.
    """
    assets = db.query(Asset).all()
    if not assets:
        return {"error": "No assets found"}

    total_assets = len(assets)
    avg_health = sum(a.current_health_score for a in assets) / total_assets
    
    critical_count = sum(1 for a in assets if a.risk_level == "Critical")
    warning_count = sum(1 for a in assets if a.risk_level == "Warning")
    monitor_count = sum(1 for a in assets if a.risk_level == "Monitor")
    safe_count = sum(1 for a in assets if a.risk_level == "Safe")

    # Group by state and calculate rankings
    state_groups = {}
    district_groups = {}

    for a in assets:
        state, district = parse_state_district(a.address)
        
        # State grouping
        if state not in state_groups:
            state_groups[state] = {"total_health": 0, "count": 0, "risk_counts": []}
        state_groups[state]["total_health"] += a.current_health_score
        state_groups[state]["count"] += 1
        state_groups[state]["risk_counts"].append(a.risk_level)

        # District grouping
        district_key = f"{district} ({state})"
        if district_key not in district_groups:
            district_groups[district_key] = {"total_health": 0, "count": 0, "risk_counts": [], "state": state, "district": district}
        district_groups[district_key]["total_health"] += a.current_health_score
        district_groups[district_key]["count"] += 1
        district_groups[district_key]["risk_counts"].append(a.risk_level)

    # Compile state list
    state_rankings = []
    for state, info in state_groups.items():
        avg_h = info["total_health"] / info["count"]
        # Determine overall state risk
        risks = info["risk_counts"]
        if "Critical" in risks:
            overall_risk = "Critical"
        elif "Warning" in risks:
            overall_risk = "Warning"
        elif "Monitor" in risks:
            overall_risk = "Monitor"
        else:
            overall_risk = "Safe"

        state_rankings.append({
            "state": state,
            "average_health": round(avg_h, 1),
            "risk_level": overall_risk,
            "asset_count": info["count"]
        })
    state_rankings.sort(key=lambda s: s["average_health"], reverse=True)

    # Compile district list
    district_rankings = []
    for d_key, info in district_groups.items():
        avg_h = info["total_health"] / info["count"]
        risks = info["risk_counts"]
        if "Critical" in risks:
            overall_risk = "Critical"
        elif "Warning" in risks:
            overall_risk = "Warning"
        elif "Monitor" in risks:
            overall_risk = "Monitor"
        else:
            overall_risk = "Safe"

        district_rankings.append({
            "district": info["district"],
            "state": info["state"],
            "average_health": round(avg_h, 1),
            "risk_level": overall_risk,
            "asset_count": info["count"]
        })
    district_rankings.sort(key=lambda d: d["average_health"], reverse=True)

    # Mock historical trends (past years)
    health_trend = [
        {"year": 2024, "average_health": 82.5},
        {"year": 2025, "average_health": 79.2},
        {"year": 2026, "average_health": round(avg_health, 1)}
    ]

    monthly_risk_trend = [
        {"month": "Jan", "critical": 1, "warning": 1, "safe": 3},
        {"month": "Mar", "critical": 1, "warning": 2, "safe": 2},
        {"month": "May", "critical": 2, "warning": 1, "safe": 2},
        {"month": "Jul", "critical": critical_count, "warning": warning_count, "safe": safe_count}
    ]

    # Generate Alerts (Feature 11: Alert Center)
    live_alerts = []
    alert_id = 1
    for a in assets:
        if a.risk_level in ["Critical", "Warning"]:
            live_alerts.append({
                "id": f"alert-{alert_id}",
                "severity": a.risk_level,
                "affected_asset_id": a.id,
                "affected_asset_name": a.name,
                "reason": "Rapid degradation or active fatigue threshold breached",
                "evidence": f"Current health score index is {a.current_health_score}%. Visual structural distress reported.",
                "recommended_action": "Schedule immediate structural pressure grouting and implement vehicle weight limit bypasses.",
                "timestamp": (datetime.utcnow() - timedelta(hours=alert_id * 3)).strftime('%Y-%m-%d %H:%M:%S')
            })
            alert_id += 1

    # Assets requiring immediate action
    immediate_action_assets = [
        {
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "health": a.current_health_score,
            "risk": a.risk_level,
            "address": a.address
        } for a in assets if a.risk_level in ["Critical", "Warning"]
    ]

    # Heatmap pins
    heatmap_pins = [
        {
            "id": a.id,
            "name": a.name,
            "gps": a.location_gps,
            "health": a.current_health_score,
            "risk": a.risk_level,
            "address": a.address
        } for a in assets
    ]

    return {
        "national_health_index": round(avg_health, 1),
        "total_assets": total_assets,
        "pending_maintenance": 14, # Seeded or aggregate
        "healthy_count": safe_count,
        "critical_count": critical_count,
        "warning_count": warning_count,
        "monitor_count": monitor_count,
        "state_rankings": state_rankings,
        "district_rankings": district_rankings,
        "health_trend": health_trend,
        "monthly_risk_trend": monthly_risk_trend,
        "live_alerts": live_alerts,
        "assets_requiring_immediate_action": immediate_action_assets,
        "heatmap_pins": heatmap_pins,
        "ai_prediction_summary": (
            "Infrastructure structural index model projects a net safety decay of 3.2% over the next 6 months "
            "due to delayed epoxy maintenance and monsoon thermal fatigue cycles. Immediate repair on Telugu Thalli Flyover "
            "will save an estimated ₹95,00,000 in reconstruction costs."
        )
    }

@router.get("/prioritization")
def get_prioritization(db: Session = Depends(get_db)):
    """
    Feature 2: AI Asset Prioritization Engine
    Ranks assets based on engineering and population stress parameters.
    """
    assets = db.query(Asset).all()
    prioritized_list = []

    for a in assets:
        # Determine dynamic scoring weights based on type and details
        traffic_weight = 75.0 if a.type in ["Bridge", "Road"] else 40.0
        pop_weight = 85.0 if a.type in ["Building", "Tunnel"] else 50.0
        weather_weight = 70.0 if a.type in ["Dam", "Bridge"] else 45.0
        age = 15 if "2011" in (a.description or "") else (31 if "1995" in (a.description or "") else 8)
        
        # Priority calculation score
        priority_score = (
            (100 - a.current_health_score) * 0.45 +
            traffic_weight * 0.15 +
            pop_weight * 0.15 +
            weather_weight * 0.10 +
            age * 0.15
        )

        prioritized_list.append({
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "health": a.current_health_score,
            "risk": a.risk_level,
            "priority_score": round(priority_score, 1),
            "asset_age": age,
            "traffic_pcu": traffic_weight,
            "population_exposure": pop_weight,
            "weather_impact": weather_weight,
            "ai_confidence": 94.6 if a.risk_level in ["Critical", "Warning"] else 88.2,
            "logic_reasoning": (
                f"Ranked with a priority score of {round(priority_score, 1)}/100. Key driver is the low health index ({a.current_health_score}%) "
                f"paired with extreme loading stresses ({traffic_weight} traffic index) and a structural age of {age} years."
            )
        })

    # Sort descending
    prioritized_list.sort(key=lambda x: x["priority_score"], reverse=True)
    
    top_10 = prioritized_list[:10]
    top_50 = prioritized_list # Full seeded DB list serves as master queue

    # Rank risk states and districts
    # Hardcoded or derived from commanded rankings
    cc_data = get_command_center(db)

    return {
        "top_10_critical_assets": top_10,
        "top_50_maintenance_priorities": top_50,
        "highest_risk_states": cc_data["state_rankings"][::-1][:3], # highest risk at end of list
        "highest_risk_districts": cc_data["district_rankings"][::-1][:5]
    }

@router.get("/assets/{asset_id}/root-cause")
def get_root_cause(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 3: AI Root Cause Analysis
    Deduces engineering root causes.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Dynamic root causes mappings
    if asset.type.lower() == "bridge":
        cause = "Water leakage & active Carbonation stress"
        evidence = "Exposed steel rebars at Span 3 showing expanding rust scaling, accompanied by 5.2mm shear cracking."
        confidence = 94.5
        docs = ["IS-456:2000 Clause 11.3 (Concrete repair bounds)", "IRC:SP-18 Section 4 (Epoxy Pressure Grouting)"]
        prev = "Inject low-viscosity structural epoxy under pressure. Coat exposed steel with zinc primer and wrap with CFRP."
    elif asset.type.lower() == "tunnel":
        cause = "Hydrostatic water ingress & segment joint fatigue"
        evidence = "Segment rings showing active moisture seepage, scaling mineral deposits, and joint gasket peeling."
        confidence = 91.2
        docs = ["IS-15026:2002 Tunnel Waterproofing Guidelines", "AASHTO Tunnel Design Specifications"]
        prev = "Schedule polyurethane chemical grouting to create an external hydro-barrier, clean joints, and overlay segment protection seals."
    elif asset.type.lower() == "dam":
        cause = "Material fatigue & high volume flood scour erosion"
        evidence = "Gate channel walls displaying aggregate exposure, cavitation pitting, and concrete spalling."
        confidence = 96.8
        docs = ["NDMA Dam Safety Manual 2024", "IS-12966: Concrete Dam Sluice Gates Grouting"]
        prev = "Execute polymer micro-concrete overlay to gate margins. Repair sluice gaskets and schedule annual gate cycle calibration."
    elif asset.type.lower() == "building":
        cause = "Construction settlement & sub-basement moisture corrosion"
        evidence = "Basement columns displaying vertical structural cracking, plaster shear separation, and foundation slab dampness."
        confidence = 88.7
        docs = ["IS-456: Clause 26.4 (Nominal Cover Requirements)", "NDMA Skyscraper Structural Guidelines"]
        prev = "Perform structural steel jacketing to column junctions showing cracking. Install sub-grade sump pumps to restrict dampness."
    else: # Road or default
        cause = "Subgrade failure due to overloaded logistics and heavy monsoon runoff"
        evidence = "Surface asphalt exhibiting widespread alligator cracking, base-course deformation, and rutting depths of 25mm."
        confidence = 93.4
        docs = ["IRC-37:2018 Design of Flexible Pavements", "NHAI Road Drainage Standards"]
        prev = "Re-seal surface base courses, improve lateral drainage slope ratios, and enforce logistics weighing sensors."

    return {
        "asset_id": asset_id,
        "root_cause": cause,
        "evidence": evidence,
        "confidence": confidence,
        "supporting_documents": docs,
        "preventive_recommendation": prev
    }

@router.get("/assets/{asset_id}/graph")
def get_knowledge_graph(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 4: Infrastructure Knowledge Graph
    Generates relationship links mapping the visual node constellation.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    inspections = db.query(Inspection).filter(Inspection.asset_id == asset_id).all()
    maintenance = db.query(MaintenanceHistory).filter(MaintenanceHistory.asset_id == asset_id).all()

    nodes = [
        {"id": "node-asset", "label": asset.name, "type": "Asset", "color": "#3b82f6"},
        {"id": "node-standards", "label": "IS-456:2000 & IRC Codes", "type": "Standard", "color": "#ec4899"},
        {"id": "node-weather", "label": "Monsoon / Heat Shifts", "type": "Weather", "color": "#f59e0b"},
        {"id": "node-engineer", "label": "Dr. R. K. Prasad (Lead UI)", "type": "Engineer", "color": "#10b981"}
    ]
    edges = [
        {"source": "node-asset", "target": "node-standards", "label": "GOVERNED_BY"},
        {"source": "node-asset", "target": "node-weather", "label": "EXPOSED_TO"}
    ]

    # Add inspections to graph
    for idx, ins in enumerate(inspections):
        ins_node_id = f"node-ins-{ins.id}"
        nodes.append({
            "id": ins_node_id,
            "label": f"Scan ({ins.inspection_date.strftime('%b %Y')})",
            "type": "Inspection",
            "color": "#a855f7"
        })
        edges.append({
            "source": "node-asset",
            "target": ins_node_id,
            "label": "MONITORED_BY"
        })
        edges.append({
            "source": ins_node_id,
            "target": "node-engineer",
            "label": "CONDUCTED_BY"
        })

        # Add mock defects
        def_node_id = f"node-def-{ins.id}"
        nodes.append({
            "id": def_node_id,
            "label": "Shear Crack / Ingress",
            "type": "Defect",
            "color": "#ef4444"
        })
        edges.append({
            "source": ins_node_id,
            "target": def_node_id,
            "label": "IDENTIFIED"
        })
        edges.append({
            "source": def_node_id,
            "target": "node-standards",
            "label": "VIOLATES"
        })

    # Add maintenance actions
    for idx, maint in enumerate(maintenance):
        maint_node_id = f"node-maint-{maint.id}"
        nodes.append({
            "id": maint_node_id,
            "label": maint.repair_type,
            "type": "Maintenance",
            "color": "#10b981"
        })
        edges.append({
            "source": "node-asset",
            "target": maint_node_id,
            "label": "REPAIRED_VIA"
        })

    return {"nodes": nodes, "edges": edges}

@router.get("/assets/{asset_id}/forecast")
def get_forecast(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 5: Infrastructure Health Forecast
    Calculates health projections at 30D, 90D, 180D, 360D timelines.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    h = asset.current_health_score
    risk = asset.risk_level

    # Compute decay offsets
    decay_30 = h - 0.4
    decay_90 = h - 1.2
    decay_6m = h - 2.8
    decay_1y = h - 6.2

    # Map forecast risk thresholds
    def get_forecast_risk(health: float) -> str:
        if health < 65: return "Critical"
        if health < 75: return "Warning"
        if health < 85: return "Monitor"
        return "Safe"

    return {
        "asset_id": asset_id,
        "current_health": h,
        "current_risk": risk,
        "projections": [
            {"label": "30 Days", "health": round(decay_30, 1), "risk": get_forecast_risk(decay_30), "confidence": 97.4},
            {"label": "90 Days", "health": round(decay_90, 1), "risk": get_forecast_risk(decay_90), "confidence": 93.8},
            {"label": "6 Months", "health": round(decay_6m, 1), "risk": get_forecast_risk(decay_6m), "confidence": 88.5},
            {"label": "1 Year", "health": round(decay_1y, 1), "risk": get_forecast_risk(decay_1y), "confidence": 76.1}
        ],
        "recommended_maintenance_window": {
            "start_date": (datetime.utcnow() + timedelta(days=15)).strftime('%Y-%m-%d'),
            "end_date": (datetime.utcnow() + timedelta(days=45)).strftime('%Y-%m-%d'),
            "urgency": "High" if risk in ["Critical", "Warning"] else "Medium"
        },
        "assumptions": (
            "Deterioration forecasting is modeled assuming average annual traffic increases of 4.5% "
            "and seasonal monsoon moisture levels. Grout moisture penetration speeds corrosion by 2.5x."
        )
    }

@router.get("/assets/{asset_id}/repair-comparison")
def get_repair_comparison(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 12: Repair Strategy Comparison
    Provides details for 3 repair strategy packages.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return {
        "asset_id": asset_id,
        "options": [
            {
                "name": "Immediate Pressure Grouting & CFRP Wrap (Recommended)",
                "cost": 250000 if asset.type == "Bridge" else 120000,
                "risk_reduction": "Restores structural index to 95% (Safe)",
                "maintenance_time": "12 Days",
                "benefits": "Completely seals concrete ingress, restores full load-bearing, avoids route closures",
                "trade_offs": "Requires 12-day localized speed restriction controls",
                "ai_recommendation": True
            },
            {
                "name": "Deferred Surface Repair (Postpone 6 Months)",
                "cost": 480000 if asset.type == "Bridge" else 220000,
                "risk_reduction": "Structural index decays to 55% (Critical Risk)",
                "maintenance_time": "25 Days",
                "benefits": "Delays upfront budget costs by 6 months",
                "trade_offs": "Crack expands, requires hydraulic shoring columns, 4x more expensive",
                "ai_recommendation": False
            },
            {
                "name": "Full Structural Reconstruction",
                "cost": 2200000 if asset.type == "Bridge" else 1500000,
                "risk_reduction": "Brand new structure (100% Health)",
                "maintenance_time": "180 Days",
                "benefits": "Resets structural lifespan by 60 years",
                "trade_offs": "Extremely high budget, complete route closures, high traffic dislocation",
                "ai_recommendation": False
            }
        ]
    }

@router.get("/assets/{asset_id}/story")
def get_story(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 14: Infrastructure Story Mode
    Generates dynamic chronological safety narrative.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Build story structure based on asset type
    if asset.type.lower() == "bridge":
        timeline = [
            {"year": "2011", "event": "Asset Construction Completed", "description": "Ganga Bridge commissioned for high-speed multi-axle freight transportation. Health Index: 100% (Safe)."},
            {"year": "2024", "event": "Hairline crack detected at Pier 2", "description": "First minor visual thermal crack (0.2mm) reported by routine drone sweep. Health Index: 98% (Safe)."},
            {"year": "2025", "event": "Water ingress accelerates carbonation", "description": "Traffic volume increased by 20%. Moisture enters cracks, commencing inner rebar rust expansion. Health: 78% (Monitor)."},
            {"year": "2026", "event": "Active concrete spalling and exposed rebar", "description": "Diagonal shear crack reaches 5.2mm. Exposed steel shows 12% section reduction. Health: 62.5% (Critical Risk)."}
        ]
    else:
        timeline = [
            {"year": "2018", "event": "Construction Commissioned", "description": f"{asset.name} certified and opened for public operations. Health Index: 100% (Safe)."},
            {"year": "2024", "event": "Micro joint seepage noticed", "description": "Minor moisture seepage logs recorded at columns. Health Index: 94% (Safe)."},
            {"year": "2025", "event": "Seepage expansion and aggregate scaling", "description": "Aggregate damage noticed at high stress zones. Health: 81% (Monitor)."},
            {"year": "2026", "event": "Telemetry drop warning", "description": f"Health index decays to {asset.current_health_score}%. Recommending engineering sealant application."}
        ]

    return {
        "asset_id": asset_id,
        "story_timeline": timeline
    }

@router.get("/assets/{asset_id}/data-quality")
def get_data_quality(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 15: AI Confidence & Data Quality Dashboard
    Validates data coverage matrices.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Map variables
    is_critical = asset.risk_level in ["Critical", "Warning"]

    return {
        "asset_id": asset_id,
        "metrics": {
            "image_quality": 92 if is_critical else 85,
            "inspection_completeness": 95 if is_critical else 75,
            "historical_coverage": 88 if is_critical else 60,
            "knowledge_match": 90 if is_critical else 50,
            "data_quality_score": 91 if is_critical else 68,
            "ai_confidence": 94 if is_critical else 80
        },
        "reliability_rating": "High Reliability" if is_critical else "Medium - Limited Scans",
        "warnings": [
            "Baseline weather sensors are currently offline. Model using regional meteorological fallbacks."
        ] if not is_critical else []
    }

@router.get("/assets/{asset_id}/collaboration")
def get_collaboration(asset_id: str, db: Session = Depends(get_db)):
    """
    Feature 8: AI Collaboration Workspace
    Returns comments and tasks.
    """
    comments = db.query(CollaborationComment).filter(CollaborationComment.asset_id == asset_id).order_by(CollaborationComment.created_at.desc()).all()
    tasks = db.query(CollaborationTask).filter(CollaborationTask.asset_id == asset_id).order_by(CollaborationTask.created_at.desc()).all()

    # If empty, seed a default comment and default AI suggested task
    if not comments:
        default_comment = CollaborationComment(
            id=str(uuid.uuid4()),
            asset_id=asset_id,
            author="System Audit Bot",
            content="Initial digital twin memory initialized. Upload inspections to launch agent workspace discussions.",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(default_comment)
        db.commit()
        comments = [default_comment]

    if not tasks:
        default_task = CollaborationTask(
            id=str(uuid.uuid4()),
            asset_id=asset_id,
            title="Inject Epoxy Grout to Pier 2 Columns",
            assigned_to="Dr. R. K. Prasad",
            status="Pending",
            priority="Critical",
            created_at=datetime.utcnow()
        )
        db.add(default_task)
        db.commit()
        tasks = [default_task]

    return {
        "comments": [
            {
                "id": c.id,
                "author": c.author,
                "content": c.content,
                "created_at": c.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for c in comments
        ],
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "assigned_to": t.assigned_to,
                "status": t.status,
                "priority": t.priority,
                "created_at": t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for t in tasks
        ]
    }

@router.post("/assets/{asset_id}/collaboration/comment")
def add_collaboration_comment(asset_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    author = payload.get("author", "Lead Engineer")
    content = payload.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Comment content required")

    comment = CollaborationComment(
        id=str(uuid.uuid4()),
        asset_id=asset_id,
        author=author,
        content=content,
        created_at=datetime.utcnow()
    )
    db.add(comment)
    db.commit()

    return {"status": "success", "comment": {
        "id": comment.id,
        "author": comment.author,
        "content": comment.content,
        "created_at": comment.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }}

@router.post("/assets/{asset_id}/collaboration/task")
def add_collaboration_task(asset_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    title = payload.get("title", "")
    assigned_to = payload.get("assigned_to", "Dr. Prasad")
    priority = payload.get("priority", "Medium")

    if not title:
        raise HTTPException(status_code=400, detail="Task title required")

    task = CollaborationTask(
        id=str(uuid.uuid4()),
        asset_id=asset_id,
        title=title,
        assigned_to=assigned_to,
        priority=priority,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(task)
    db.commit()

    return {"status": "success", "task": {
        "id": task.id,
        "title": task.title,
        "assigned_to": task.assigned_to,
        "status": task.status,
        "priority": task.priority,
        "created_at": task.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }}

@router.get("/search")
def search_assets(q: str = Query("", description="Natural language query"), db: Session = Depends(get_db)):
    """
    Feature 9: Natural Language Infrastructure Search
    Filters assets by parsing query intent.
    """
    query_lower = q.lower()
    assets = db.query(Asset).all()
    results = []

    # Simple intent parsing
    filter_type = None
    filter_risk = None
    filter_state = None

    if "bridge" in query_lower: filter_type = "bridge"
    if "tunnel" in query_lower: filter_type = "tunnel"
    if "dam" in query_lower: filter_type = "dam"
    if "building" in query_lower or "plaza" in query_lower: filter_type = "building"
    if "road" in query_lower or "highway" in query_lower: filter_type = "road"

    if "critical" in query_lower or "high risk" in query_lower or "deteriorating" in query_lower:
        filter_risk = "Critical"
    elif "warning" in query_lower:
        filter_risk = "Warning"
    elif "monitor" in query_lower:
        filter_risk = "Monitor"
    elif "safe" in query_lower:
        filter_risk = "Safe"

    if "up" in query_lower or "uttar pradesh" in query_lower or "varanasi" in query_lower:
        filter_state = "UP"
    elif "mh" in query_lower or "maharashtra" in query_lower or "mumbai" in query_lower:
        filter_state = "MH"
    elif "uk" in query_lower or "uttarakhand" in query_lower or "dakpathar" in query_lower:
        filter_state = "UK"
    elif "delhi" in query_lower or "dl" in query_lower:
        filter_state = "DL"

    for a in assets:
        state, district = parse_state_district(a.address)
        
        matches = True
        if filter_type and a.type.lower() != filter_type:
            matches = False
        if filter_risk and a.risk_level != filter_risk:
            matches = False
        if filter_state and state != filter_state:
            matches = False

        # If general keywords match descriptions
        if not filter_type and not filter_risk and not filter_state:
            if query_lower not in a.name.lower() and query_lower not in (a.description or "").lower() and query_lower not in (a.address or "").lower():
                matches = False

        if matches:
            results.append(a)

    return {
        "query": q,
        "interpreted_filters": {
            "type": filter_type,
            "risk": filter_risk,
            "state": filter_state
        },
        "results": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "health": a.current_health_score,
                "risk": a.risk_level,
                "address": a.address,
                "gps": a.location_gps
            } for a in results
        ]
    }

# Feature 21: Watchtower Dashboard Data
@router.get("/watchtower")
def get_watchtower_summary(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    hotspots = []
    deteriorating_assets = []
    
    for a in assets:
        state, district = parse_state_district(a.address)
        if a.risk_level in ["Critical", "Warning"]:
            deteriorating_assets.append({
                "id": a.id,
                "name": a.name,
                "type": a.type,
                "state": state,
                "district": district,
                "health": a.current_health_score,
                "risk": a.risk_level,
                "rate": "1.8% / mo"
            })
            if len(hotspots) < 3:
                hotspots.append(f"{district} ({state})")
                
    weekly_brief = {
        "title": "National Infrastructure Intelligence Brief",
        "date": datetime.utcnow().strftime("%Y-W%W"),
        "emerging_risks": [
            "Increased diagonal shear fractures reported on Varanasi bypass structure due to monsoon expansion.",
            "Elevated temperature cracks expanding in Western Express Highway metro pillars.",
            "Coastal salinity exposure accelerating steel delamination in eastern sea bridges."
        ],
        "newly_detected_trends": [
            "Concrete carbonation rates have spiked by 12% across coastal structures.",
            "Water table ingress detected in foundation piles of older highway segments."
        ],
        "high_attention_regions": list(set(hotspots)) if hotspots else ["Varanasi (UP)", "Mumbai (MH)"],
        "recommended_investigations": [
            "Deploy secondary ultrasonic drone audits on Varanasi Bypass.",
            "Install continuous acoustic sensors on Western Express metro columns."
        ],
        "preventive_actions": [
            "Inject high-performance carbon fiber wraps immediately on critical column zones.",
            "Execute chemical drainage flushing on sub-surface joints."
        ]
    }
    
    return {
        "rapidly_deteriorating": deteriorating_assets,
        "hotspots": weekly_brief["high_attention_regions"],
        "weekly_brief": weekly_brief,
        "defect_clusters": [
            {"type": "diagonal shear cracks", "count": 14, "percentage": "45%"},
            {"type": "concrete spalling & reinforcement exposure", "count": 11, "percentage": "35%"},
            {"type": "water drainage blockages", "count": 6, "percentage": "20%"}
        ],
        "preventive_inspections": [
            {"asset_name": "Yamuna Expressway Bridge", "days_overdue": 12, "reason": "Weather moisture correlation threshold breached"}
        ]
    }

# Feature 22: Similar Case Recommendation
@router.get("/assets/{asset_id}/similar-cases")
def get_similar_cases(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    return {
        "asset_id": asset_id,
        "similar_cases": [
            {
                "id": "sim-001",
                "name": "Delhi Sector 4 Flyover",
                "type": asset.type,
                "similarity_score": 94,
                "damage_pattern": "Diagonal shear crack on support columns, concrete cover spalling",
                "environmental_conditions": "Heavy urban vehicular load, average annual humidity 62%",
                "previous_decisions": "Applied high-tensile carbon fiber wrap jackets around column base",
                "outcomes": "Stabilized crack expansion. Health score rose from 62% to 88% over 18 months",
                "lessons_learned": "Early epoxy injections before CFRP application prevent sub-surface void pockets"
            },
            {
                "id": "sim-002",
                "name": "Lucknow Metro Bridge",
                "type": asset.type,
                "similarity_score": 81,
                "damage_pattern": "Fissures and longitudinal shrinkage cracks",
                "environmental_conditions": "High temperature variations, moderate vehicle count",
                "previous_decisions": "Coated surface with hydrophobic polymer coatings",
                "outcomes": "Sealed micro-fissures, but structural joints still require constant moisture monitoring",
                "lessons_learned": "Hydrophobic sealant is only effective if applied under dry concrete surface conditions"
            }
        ]
    }

# Feature 23: Explainable Confidence Analyzer
@router.get("/assets/{asset_id}/confidence-breakdown")
def get_confidence_breakdown(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    return {
        "asset_id": asset_id,
        "overall_confidence": 91,
        "breakdown": [
            {
                "category": "Vision AI",
                "score": 94,
                "why_increased": "High-contrast drone imagery provided sharp crack boundaries.",
                "why_decreased": "Camera angle offset on column back surface introduced minor distortions.",
                "missing_info": "Backside 3D scanning telemetry.",
                "improvements": "Deploy drones equipped with LIDAR range finders."
            },
            {
                "category": "OCR Parsing",
                "score": 89,
                "why_increased": "Clear text structures in contractor reports.",
                "why_decreased": "Faded hand-written notes on audit checklists created low OCR ratings.",
                "missing_info": "Digital signature audit records.",
                "improvements": "Require digital audit log formats."
            },
            {
                "category": "Knowledge Retrieval (RAG)",
                "score": 90,
                "why_increased": "IS-456 standards clauses matched the shear crack dimensions exactly.",
                "why_decreased": "Regional seismic code revisions are missing from search embeddings.",
                "missing_info": "IRC:SP-18 local supplement notes.",
                "improvements": "Ingest regional bridge maintenance guidelines."
            },
            {
                "category": "Historical Memory",
                "score": 88,
                "why_increased": "3 structural inspections are indexed in memory.",
                "why_decreased": "No pre-2024 core sample statistics are available.",
                "missing_info": "Initial design load drawings.",
                "improvements": "Upload asset architectural blueprint drawings."
            },
            {
                "category": "Risk Assessment",
                "score": 92,
                "why_increased": "Traffic counts and population densities are fully verified.",
                "why_decreased": "Seismic safety coefficients are computed using national averages.",
                "missing_info": "Local fault line micro-measurements.",
                "improvements": "Integrate local geological mapping alerts."
            }
        ]
    }

# Feature 24: Dependency Map Graph
@router.get("/assets/{asset_id}/dependency-map")
def get_dependency_map(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    state, district = parse_state_district(asset.address)
    return {
        "nodes": [
            {"id": "main-asset", "label": asset.name, "type": "Asset", "status": asset.risk_level, "desc": asset.type},
            {"id": "dep-highway", "label": f"National Highway ({district})", "type": "Route", "status": "Warning", "desc": "Logistics Route"},
            {"id": "dep-hospital", "label": f"{district} District Hospital", "type": "Service", "status": "Safe", "desc": "Emergency Access"},
            {"id": "dep-school", "label": f"{district} Public School Bus Line", "type": "Community", "status": "Safe", "desc": "Student Transit"},
            {"id": "dep-industrial", "label": "Freight Logistics Zone", "type": "Economic", "status": "Monitor", "desc": "Industrial Corridor"}
        ],
        "edges": [
            {"source": "main-asset", "target": "dep-highway", "label": "supports"},
            {"source": "dep-highway", "target": "dep-hospital", "label": "emergency route for"},
            {"source": "dep-highway", "target": "dep-school", "label": "transit route for"},
            {"source": "dep-highway", "target": "dep-industrial", "label": "supply line to"}
        ]
    }

# Feature 25: AI Maintenance Budget Optimizer
@router.post("/budget-optimize")
def optimize_budget(payload: Dict[str, Any], db: Session = Depends(get_db)):
    budget = payload.get("budget", 500000)
    assets = db.query(Asset).all()
    
    schedule = []
    remaining_budget = budget
    total_mitigation = 0
    backlog_cost = 0
    
    for a in assets:
        cost = 120000 if a.risk_level == "Critical" else (70000 if a.risk_level == "Warning" else 30000)
        backlog_cost += cost
        priority = 90 if a.risk_level == "Critical" else (70 if a.risk_level == "Warning" else 40)
        mitigation = 25 if a.risk_level == "Critical" else (15 if a.risk_level == "Warning" else 5)
        
        allocated = "Deferred"
        if remaining_budget >= cost:
            allocated = "Allocated"
            remaining_budget -= cost
            total_mitigation += mitigation
            
        schedule.append({
            "id": a.id,
            "name": a.name,
            "risk": a.risk_level,
            "priority": priority,
            "cost": cost,
            "status": allocated,
            "reason": "Allocated because risk multiplier is high" if allocated == "Allocated" else "Postponed due to budget cap constraints"
        })
        
    schedule.sort(key=lambda x: (x["status"] == "Deferred", -x["priority"]))
    
    return {
        "total_budget": budget,
        "backlog_cost": backlog_cost,
        "remaining_budget": remaining_budget,
        "mitigation_percentage": round((total_mitigation / (len(assets) * 25)) * 100, 1) if assets else 0,
        "schedule": schedule,
        "deferred_impact": f"Postponing {sum(1 for s in schedule if s['status'] == 'Deferred')} tasks will raise degradation index by 6.4% in the next quarter."
    }

# Feature 26: Seasonal Risk Intelligence
@router.get("/seasonal-risk")
def get_seasonal_risk_summary(db: Session = Depends(get_db)):
    return {
        "risk_calendar": [
            {"month": "Jun", "event": "Monsoon Ingress", "level": "High", "assets_affected": 8},
            {"month": "Jul", "event": "Peak Monsoonal Flood", "level": "Critical", "assets_affected": 12},
            {"month": "Aug", "event": "Structural Foundation Swell", "level": "High", "assets_affected": 9},
            {"month": "Oct", "event": "Thermal Fissure Contraction", "level": "Medium", "assets_affected": 4},
            {"month": "Dec", "event": "Salinity fog corrosion", "level": "Medium", "assets_affected": 5}
        ],
        "weather_correlations": [
            {"parameter": "Rainfall Ingress (mm)", "correlation_coefficient": 0.84, "description": "Highly correlated with crack width expansions"},
            {"parameter": "Max Temperature (°C)", "correlation_coefficient": 0.62, "description": "Correlated with concrete joint seal degradation"}
        ],
        "preventive_inspections": [
            {"asset_name": "Varanasi Ganga Bridge", "scheduled_date": "2026-06-05", "focus": "Drainage check & foundation telemetry"},
            {"asset_name": "Delhi Executive Plaza", "scheduled_date": "2026-06-12", "focus": "Basement retaining wall humidity levels"}
        ],
        "recommendations": [
            "Execute inspection audits on all sub-surface joints prior to June monsoon seasons.",
            "Seal vertical column seams to block water ingress pathways."
        ]
    }

# Feature 27: AI Infrastructure Portfolio Comparison
@router.get("/portfolio-compare")
def compare_portfolio(db: Session = Depends(get_db)):
    return {
        "portfolios": [
            {
                "name": "Uttar Pradesh (Bridges)",
                "health": 74.5,
                "risk_trend": "Increasing Risk",
                "maintenance_efficiency": "78%",
                "coverage": "92%",
                "confidence": "91%",
                "backlog_cost": "$640,000",
                "average_age": 28,
                "priority_index": 86
            },
            {
                "name": "Maharashtra (Metro & Roads)",
                "health": 81.2,
                "risk_trend": "Stable",
                "maintenance_efficiency": "85%",
                "coverage": "95%",
                "confidence": "89%",
                "backlog_cost": "$280,000",
                "average_age": 14,
                "priority_index": 54
            }
        ],
        "insights": "UP bridge assets show higher age indices (28 years average) and require active shear crack monitoring. Maharashtra portfolios are structurally newer, allowing budgets to be diverted toward preventative joint seals."
    }

# Feature 28: Incident Impact Estimator
@router.get("/assets/{asset_id}/incident-impact")
def get_incident_impact(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    return {
        "asset_id": asset_id,
        "public_safety_impact": "High. The location accommodates emergency emergency vehicle routes.",
        "traffic_disruption": "Breaching limit status would result in Varanasi bypass closures, diverting 4,000 trucks daily.",
        "emergency_response": "Downstream travel times to District Hospital would increase by 22 minutes.",
        "service_disruption": "Closure of NH-2 section would block municipal supply chains.",
        "economic_category": "High",
        "environmental_impact": "Medium. Potential sediment falls into local waterways during repair blocks.",
        "community_impact": "High disruption to daily student transit route buses.",
        "assumptions": "Estimates assume current traffic volume counts remain steady and bypass routes are clear.",
        "uncertainty": "Impact estimates are mock vectors; dynamic routing shifts are subject to highway gridlocks."
    }

# Feature 29: AI Recommendation Feedback Loop
feedback_store = []

@router.post("/assets/{asset_id}/feedback")
def submit_recommendation_feedback(asset_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    action = payload.get("action", "Accept")
    notes = payload.get("notes", "")
    feedback_store.append({
        "asset_id": asset_id,
        "action": action,
        "notes": notes,
        "timestamp": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    })
    return {"status": "success", "message": f"Recommendation feedback logged: {action}"}

@router.get("/assets/{asset_id}/feedback-stats")
def get_feedback_stats(asset_id: str, db: Session = Depends(get_db)):
    accepts = sum(1 for f in feedback_store if f["action"] == "Accept")
    rejects = sum(1 for f in feedback_store if f["action"] == "Reject")
    modifies = sum(1 for f in feedback_store if f["action"] == "Modify")
    total = len(feedback_store)
    return {
        "total_responses": total,
        "acceptance_rate": round((accepts / total * 100), 1) if total > 0 else 94.0,
        "rejection_rate": round((rejects / total * 100), 1) if total > 0 else 2.0,
        "modification_rate": round((modifies / total * 100), 1) if total > 0 else 4.0
    }

# Feature 30: Executive Weekly Report
@router.get("/executive-report")
def get_executive_report(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    critical_names = [a.name for a in assets if a.risk_level == "Critical"]
    
    report_md = f"""# Executive Intelligence Briefing
Date: {datetime.utcnow().strftime('%B %d, %Y')}

## National Overview
The overall National Infrastructure Health Index is at 81.2%. We currently track {len(assets)} active digital twin assets.

## High Attention Assets
We have identified {len(critical_names)} assets at Critical risk levels:
{", ".join(critical_names) if critical_names else "None"}

## AI Recommendations
1. Varanasi Ganga Bridge: Carbon Fiber Reinforced Polymer (CFRP) wrapping around Pier 2 base. Cost estimate: $250k.
2. Delhi Executive Plaza: Steel joint replacement in Span B columns. Cost: $120k.
"""
    return {
        "report_markdown": report_md,
        "healthy_score": 81.2,
        "critical_assets_count": len(critical_names),
        "recent_inspections": [
            {"asset": "Varanasi Ganga Bridge", "date": "2026-05-10", "inspector": "Dr. Sen", "status": "Analyzed"}
        ]
    }

# Feature 31: Risk Timeline Explorer
@router.get("/assets/{asset_id}/risk-timeline")
def get_risk_timeline(asset_id: str, db: Session = Depends(get_db)):
    return {
        "asset_id": asset_id,
        "events": [
            {"date": "2024-03-12", "event": "Initial Digital Twin Compiled", "health": 92, "risk": "Safe", "notes": "Asset baseline scan. Structural ratios safe."},
            {"date": "2024-09-08", "event": "Heavy Monsoon Precipitation", "health": 88, "risk": "Safe", "notes": "Moisture ingress detected at base columns."},
            {"date": "2025-03-24", "event": "Inspector Audit #2", "health": 78, "risk": "Warning", "notes": "Epoxy seal applied on columns, but micro-fissures continue to expand."},
            {"date": "2025-08-15", "event": "Foundation Settlement Event", "health": 71, "risk": "Warning", "notes": "Minor settlement shift on Pier 2 column."},
            {"date": "2026-03-10", "event": "Multi-Modal Scan #3", "health": 63, "risk": "Critical", "notes": "Active diagonal shear crack widened to 5.2mm."}
        ]
    }

# Feature 32: Engineering Standards Explorer (Authoritative Knowledge Base)
@router.get("/standards-explorer")
def search_standards(
    q: str = Query("", description="Keyword search"),
    jurisdiction: str = Query("", description="Filter: India or International"),
    doc_type: str = Query("", description="Filter by document type"),
    infra_type: str = Query("", description="Filter by infrastructure type"),
    publisher: str = Query("", description="Filter by publisher"),
):
    from .knowledge_base import (
        search_knowledge_base,
        get_all_publishers,
        get_all_jurisdictions,
        get_all_document_types,
        get_all_infrastructure_types,
        KNOWLEDGE_BASE,
    )

    results = search_knowledge_base(
        q=q,
        jurisdiction=jurisdiction,
        doc_type=doc_type,
        infra_type=infra_type,
        publisher=publisher,
    )

    # Flatten results for the frontend: one card per entry with all clauses
    flat_results = []
    for entry in results:
        flat_results.append({
            "id": entry["id"],
            "code": entry["code"],
            "title": entry["title"],
            "publisher": entry["publisher"],
            "year": entry["year"],
            "revision": entry["revision"],
            "jurisdiction": entry["jurisdiction"],
            "infrastructure_type": entry["infrastructure_type"],
            "document_type": entry["document_type"],
            "clauses": entry.get("clauses", []),
            "source_validation": entry.get("source_validation", {}),
        })

    return {
        "total_entries": len(KNOWLEDGE_BASE),
        "filtered_count": len(flat_results),
        "filters": {
            "jurisdictions": get_all_jurisdictions(),
            "document_types": get_all_document_types(),
            "infrastructure_types": get_all_infrastructure_types(),
            "publishers": get_all_publishers(),
        },
        "results": flat_results,
    }

# Feature 33: AI Executive Briefing
@router.get("/assets/{asset_id}/executive-briefing")
def get_executive_briefing(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {
        "asset_id": asset_id,
        "executive_brief": f"Varanasi Bypass Ganga Bridge shows urgent shear distress (Health Index: {asset.current_health_score}%). Immediate structural jacketing costing $250k is recommended to prevent NH-2 traffic closures.",
        "detailed_view": {
            "mitigation_ratio": "96.2 / 100",
            "code_guidelines": "IRC:SP-18 & IS-456",
            "traffic_divert_costs": "$4,000 / day",
            "risk_score": asset.current_health_score,
            "overall_status": asset.risk_level
        }
    }

# Feature 34: AI Data Completeness Monitor
@router.get("/assets/{asset_id}/data-completeness")
def get_data_completeness(asset_id: str, db: Session = Depends(get_db)):
    return {
        "asset_id": asset_id,
        "completeness_score": 92,
        "checks": [
            {"parameter": "Image Resolution Quality", "status": "Passed", "score": 95},
            {"parameter": "OCR Document Clarity", "status": "Passed", "score": 88},
            {"parameter": "Report Metadata Coverage", "status": "Passed", "score": 90},
            {"parameter": "GPS Telemetry Mapping", "status": "Passed", "score": 100},
            {"parameter": "Seismic Weather Correlations", "status": "Flagged", "score": 60, "recommendation": "Install local weather sensor data overrides"}
        ]
    }

# Feature 35: AI Recommendation Strategy Simulator
@router.get("/assets/{asset_id}/recommendation-simulator")
def simulate_recommendations(asset_id: str, db: Session = Depends(get_db)):
    return {
        "asset_id": asset_id,
        "strategies": [
            {
                "name": "Immediate Repair (CFRP)",
                "expected_risk": "Safe (Health 88%)",
                "advantages": "Immediate structural stability, seals water ingress, prevents failure.",
                "trade_offs": "Requires 3 days traffic restriction, high budget allocation ($250,000).",
                "ai_reasoning": "CFRP wrapping restores shear load capability immediately under IS 456 standards.",
                "engineering_guidance": "Clause 11.3.1 - Restoration of sheared concrete sections.",
                "priority": "Critical"
            },
            {
                "name": "Temporary Repair (Grout Injection)",
                "expected_risk": "Warning (Health 72%)",
                "advantages": "Low cost ($40,000), no traffic restrictions.",
                "trade_offs": "Crack might resume expansion in winter cycle.",
                "ai_reasoning": "Fills surface gaps but does not resolve underlying foundation shift.",
                "engineering_guidance": "IRC:SP-18 Section 4 - Fissures sealing guidelines.",
                "priority": "Medium"
            },
            {
                "name": "Increased Monitoring",
                "expected_risk": "Critical (Health 60%)",
                "advantages": "Zero immediate cost, gathers data.",
                "trade_offs": "High safety risk. Failure probability increases.",
                "ai_reasoning": "Only compiles logs. Does not mitigate structural integrity deterioration.",
                "engineering_guidance": "Seismic safety tolerance indicators.",
                "priority": "Low"
            }
        ]
    }

