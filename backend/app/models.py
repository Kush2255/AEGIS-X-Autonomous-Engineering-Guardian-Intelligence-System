from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Bridge, Building, Tunnel, Dam, Road, Railway
    location_gps = Column(String, nullable=False) # "lat,lng"
    address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    current_health_score = Column(Float, default=100.0)
    risk_level = Column(String, default="Safe") # Safe, Monitor, Warning, Critical
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inspections = relationship("Inspection", back_populates="asset", cascade="all, delete-orphan")
    memories = relationship("AIMemory", back_populates="asset", cascade="all, delete-orphan")
    maintenance = relationship("MaintenanceHistory", back_populates="asset", cascade="all, delete-orphan")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    inspection_date = Column(DateTime, default=datetime.utcnow)
    inspector_name = Column(String, nullable=False)
    overall_risk_score = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    status = Column(String, default="Draft") # Draft, Completed
    details_json = Column(JSON, nullable=True) # Full structured agent output payload
    report_pdf_path = Column(String, nullable=True)
    weather = Column(String, nullable=True)
    traffic_load = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="inspections")
    defects = relationship("Defect", back_populates="inspection", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="inspection", cascade="all, delete-orphan")

class Defect(Base):
    __tablename__ = "defects"

    id = Column(String, primary_key=True, index=True)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=False)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    type = Column(String, nullable=False) # Crack, Rust, Spalling, Pothole, Leakage, Deformation
    severity = Column(String, nullable=False) # Low, Medium, High, Critical
    location_description = Column(String, nullable=True)
    confidence = Column(Float, default=1.0)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    # Relationships
    inspection = relationship("Inspection", back_populates="defects")

class AIMemory(Base):
    __tablename__ = "ai_memories"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    key = Column(String, nullable=False, index=True)
    value_json = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="memories")

class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    repair_date = Column(DateTime, default=datetime.utcnow)
    repair_type = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    status = Column(String, default="Completed") # Planned, Completed
    notes = Column(Text, nullable=True)

    # Relationships
    asset = relationship("Asset", back_populates="maintenance")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String, primary_key=True, index=True)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=False)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    scenario_name = Column(String, nullable=False) # Delay 3M, Delay 6M, Heavy Rain, Traffic Increase, Repair Now
    projected_health = Column(Float, nullable=False)
    projected_risk = Column(String, nullable=False) # Safe, Monitor, Warning, Critical
    estimated_repair_cost = Column(Float, nullable=False)
    code_reference = Column(String, nullable=True)
    logic_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    inspection = relationship("Inspection", back_populates="simulations")
