from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any

# General Base Schemas
class DefectBase(BaseModel):
    id: str
    inspection_id: str
    asset_id: str
    type: str
    severity: str
    location_description: Optional[str] = None
    confidence: float
    description: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class MaintenanceBase(BaseModel):
    id: str
    asset_id: str
    repair_date: datetime
    repair_type: str
    cost: float
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class SimulationBase(BaseModel):
    id: str
    inspection_id: str
    asset_id: str
    scenario_name: str
    projected_health: float
    projected_risk: str
    estimated_repair_cost: float
    code_reference: Optional[str] = None
    logic_explanation: Optional[str] = None

    class Config:
        from_attributes = True

class AIMemoryBase(BaseModel):
    id: str
    asset_id: str
    key: str
    value_json: Dict[str, Any]
    updated_at: datetime

    class Config:
        from_attributes = True

# Inspection Schemas
class InspectionBase(BaseModel):
    id: str
    asset_id: str
    inspection_date: datetime
    inspector_name: str
    overall_risk_score: float
    summary: Optional[str] = None
    status: str
    details_json: Optional[Dict[str, Any]] = None
    report_pdf_path: Optional[str] = None
    weather: Optional[str] = None
    traffic_load: Optional[str] = None

    class Config:
        from_attributes = True

class InspectionDetailResponse(InspectionBase):
    defects: List[DefectBase] = []
    simulations: List[SimulationBase] = []

# Asset Schemas
class AssetBase(BaseModel):
    id: str
    name: str
    type: str
    location_gps: str
    address: Optional[str] = None
    description: Optional[str] = None
    current_health_score: float
    risk_level: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetDetailResponse(AssetBase):
    inspections: List[InspectionBase] = []
    memories: List[AIMemoryBase] = []
    maintenance: List[MaintenanceBase] = []

class CopilotQuery(BaseModel):
    asset_id: str
    question: str
    chat_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class CopilotResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    asset_id: str

class SimulationRequest(BaseModel):
    asset_id: str
    inspection_id: str
    scenario: str # "Delay 3M", "Delay 6M", "Heavy Rain", "Traffic Increase", "Repair Now"
