import os

guidelines_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "guidelines")
os.makedirs(guidelines_dir, exist_ok=True)

collections_data = {
    "collection_01_engineering_standards.md": """# Collection 01: Engineering Standards
Source: Bureau of Indian Standards (BIS) / Indian Roads Congress (IRC)
Year: 2000-2021
Version: IS 456:2000, IRC:112-2020
Domain: Civil & Structural Engineering
Applicable Infrastructure: Bridges, Buildings, Flyovers

## IS 456 Clause 35.3.2 - Permissible Crack Widths in RMC members
For durability, surface cracks under SLS must not exceed:
- Mild Exposure: 0.3 mm (e.g., standard indoor beams/slabs)
- Moderate Exposure: 0.2 mm (structures exposed to monsoons, damp basements)
- Severe Exposure: 0.1 mm (concrete exposed to aggressive chemicals, marine zones)
- Critical Limit: > 1.5 mm indicates active structural shear stress requiring epoxy resin grouting.

## IRC 112 Clause 12.3 - Shear Reinforcement and Crack Limits
Prestressed concrete box girders must have vertical stirrups spacing checked against Class 2 crack criteria. Surface cracks at shear zones near pier junctions must not exceed 0.2mm to prevent aggregate lock slip.
""",

    "collection_02_infrastructure_assets.md": """# Collection 02: Infrastructure Assets
Source: TSRDC / GHMC Assets Inventory Manual
Year: 2024
Version: Asset-Inv-V2.1
Domain: Lifecycle Management
Applicable Infrastructure: State Highways, Bridges, Drainage Networks, Water utilities

## Section 1: Pilot Assets Inventory Specifications
Assets monitored under the pilot program:
- Roads & State Highways (e.g., Telangana State Highway 1 Siddipet Section)
- Flyovers & Bridges (e.g., Telugu Thalli Flyover Hyderabad)
- Public Buildings & Heritage Blocks (e.g., Osmania General Hospital)
- Stormwater Drainage Networks (e.g., Begumpet Nala Canal)
- Water Supply Utilities (e.g., Mission Bhagiratha Water Treatment Plant)

## Section 2: Scale expansion strategy
The inventory system architecture coordinates state metadata. Future extension to National Highways, airports, metro systems, and reservoirs requires only assigning a state identifier prefix without changes to data schema.
""",

    "collection_03_defect_library.md": """# Collection 03: Defect Library
Source: MoRTH Bridge Inspectors Reference Manual
Year: 2018
Version: MoRTH-BIRM-Ed3
Domain: Defect Diagnostics
Applicable Infrastructure: All structures

## Section 1: Concrete Spalling & Reinforcement Exposure
Concrete spalling is characterized by detaching concrete pieces, exposing steel reinforcement bars. It is driven by rust expansion.
- Severity Rating:
  - Cosmetic: Superficial peeling < 20mm depth. Rebars unexposed.
  - High: Exposed steel rebars, surface rust scaling.
  - Critical: Rebar section loss > 10% with active monsoonal leaching.

## Section 2: Bituminous Asphalt Alligator Cracking
Fatigue or alligator cracking occurs in bituminous pavement due to load overloading and subgrade moisture saturation. Indicates sub-base layer settlement and requires milling and overlay (40mm thickness) rather than simple seal coats.
""",

    "collection_04_inspection_manuals.md": """# Collection 04: Inspection Manuals
Source: CPWD Maintenance Manual & RDSO Bridge Rules
Year: 2023
Version: CPWD-MM-2023
Domain: Quality Assurance & Inspections
Applicable Infrastructure: Government Buildings, Railway Bridges

## Section 1: Visual Inspection Checklists
Inspectors must check:
- Beams & Columns: Shear crack presence, diagonal cracking at beam-column junctions, moisture staining, spalling.
- Drainage systems: Clogging, weep hole blockages in retaining structures.
- Foundation structures: Erosion, soil scours near bridge piers.

## Section 2: Non-Destructive Testing (NDT) Protocol
Perform Ultrasonic Pulse Velocity (UPV) tests and rebound hammer tests to evaluate concrete compressive strength when surface defects exceed warning thresholds.
""",

    "collection_05_maintenance_procedures.md": """# Collection 05: Maintenance Procedures
Source: TSRDC Road Maintenance Schedule Manual
Year: 2022
Version: TSRDC-MSM-2022
Domain: Operations
Applicable Infrastructure: State Highways, Municipal Roads

## Section 1: Routine Pavement Crack Sealing
Bituminous road cracks must be sealed before pre-monsoon showers using polymer-modified hot-pour sealants to prevent subgrade water ponding and sub-base softening.

## Section 2: Drainage Clearing & Desiltation
Desiltation of Begumpet stormwater channels must be finalized by April 30 annually. Concrete channel side linings must be patched with cement mortar to avoid soil erosion at joint walls.
""",

    "collection_06_repair_methods.md": """# Collection 06: Repair Methods
Source: CPWD Guidelines for Structural Rehabilitation & IRC:SP-18
Year: 2021
Version: CPWD-SR-2021
Domain: Structural Repairs
Applicable Infrastructure: Bridges, Buildings, Flyovers

## Section 1: Epoxy Resin Pressure Grouting
Inject low-viscosity epoxy resin under pressure (0.2 to 0.7 MPa) for cracks between 0.3mm and 5.0mm. Epoxy binds concrete surfaces and restores monolithic strength.

## Section 2: Carbon Fiber Reinforced Polymer (CFRP) Wrapping
For columns with steel section loss between 10% and 25%:
- Expose steel, clean rust, apply zinc primer.
- Patch profile using polymer-modified structural mortar.
- Wrap column with high-tensile CFRP sheets using epoxy saturant to restore girder shear strength.
""",

    "collection_07_risk_assessment.md": """# Collection 07: Risk Assessment
Source: NDMA Structural Risk Evaluation Guidelines
Year: 2023
Version: NDMA-SR-2023
Domain: Risk Management
Applicable Infrastructure: All assets

## Section 1: Structural Health Score Calculation
Asset health index rating is computed as:
- Health = 100 - (Defect Severity Score * Exposure Weight * Age Multiplier)
- Risk levels:
  - Safe: Health Score 90 - 100
  - Monitor: Health Score 75 - 89 (requires biannual check)
  - Warning: Health Score 60 - 74 (requires immediate inspection)
  - Critical: Health Score < 60 (immediate repair needed, load restrictions)
""",

    "collection_08_weather_environmental.md": """# Collection 08: Weather & Environmental Effects
Source: Indian Meteorological Department (IMD) / CRRI
Year: 2024
Version: IMD-ENV-2024
Domain: Climatology
Applicable Infrastructure: Roads, Bridges, Drainage

## Section 1: Monsoon Rainfall Runoff Impact
High rainfall events in Telangana (exceeding 80mm/day) surge water velocity in urban nalas, causing high-volume scour at bridge pier bases. IMD flood forecasting metrics should trigger alert levels.

## Section 2: Thermal Expansion Stress
Summer heat waves in Hyderabad and Karimnagar (temperatures > 42C) induce thermal stress on concrete expansion joints, causing joint lock and hairline cracking on deck slabs.
""",

    "collection_09_disaster_management.md": """# Collection 09: Disaster Management
Source: National Disaster Management Authority (NDMA) / TSDMA
Year: 2022
Version: NDMA-DM-2022
Domain: Emergency Response
Applicable Infrastructure: All assets

## Section 1: Rapid Post-Flood Structural Assessment
In the event of flash flooding in Hyderabad, structural engineers must execute:
- Visual inspection of bridge pier settlements.
- Inspection of drainage conduits for blocks.
- Building basement dampness checking to verify foundation safety.
""",

    "collection_10_historical_case_studies.md": """# Collection 10: Historical Case Studies
Source: CRRI Infrastructure Failure Case Books
Year: 2019
Version: CRRI-FCB-2019
Domain: Forensic Engineering
Applicable Infrastructure: Bridges, Buildings

## Section 1: Mahad Bridge Collapse Analysis (2016)
The collapse of the historic bridge on the Savitri River was driven by foundation scouring that went undetected due to turbid water. Lesson learned: underwater ultrasonic scour measurements must be scheduled post-monsoon.
""",

    "collection_11_government_policies.md": """# Collection 11: Government Policies
Source: Ministry of Housing and Urban Affairs (MoHUA) / Smart Cities Mission
Year: 2023
Version: SCM-AP-2023
Domain: Governance & Compliance
Applicable Infrastructure: Smart City Assets, Utilities

## Section 1: Municipal Infrastructure Asset Management
Smart City guidelines require digital twins for municipal roads and buildings, linking geographic coordinates with condition ratings to optimize budget allocations.
""",

    "collection_12_engineering_glossary.md": """# Collection 12: Engineering Glossary
Source: CPWD Engineering Terminology Manual
Year: 2020
Version: CPWD-ETM-2020
Domain: Terminology
Applicable Infrastructure: All assets

## Section 1: Glossary of Terms
- **Carbonation**: Chemical reaction where atmospheric CO2 diffuses into concrete, lowering pH and depassivating steel reinforcement.
- **Efflorescence**: White powdery calcium carbonate deposits forming on concrete surfaces due to water leaching.
- **CFRP**: Carbon Fiber Reinforced Polymer composites used for structural wrapping.
""",

    "collection_13_ai_reasoning_knowledge.md": """# Collection 13: AI Reasoning Knowledge
Source: PRAHARI AI Explainable Decision Architecture
Year: 2026
Version: PRAHARI-AI-R1
Domain: Explainable AI
Applicable Infrastructure: All assets

## Section 1: AI Decision Chains & Confidence Rating
AI Agents assess risk by combining visual defect confidence metrics (from Vision Agent) with structural codes (Knowledge Agent). Confidence is rated high (>90%) when visual spalling coordinates match code references for exposed rebar cover limits.
""",

    "collection_14_materials_engineering.md": """# Collection 14: Materials Engineering
Source: BIS Concrete & Steel Specifications
Year: 2021
Version: BIS-MAT-2021
Domain: Material Durability
Applicable Infrastructure: Bridges, Buildings

## Section 1: Concrete Durability & Cover Chemistry
Alkaline concrete cover (pH 12.5) protects steel rebars by forming a passive oxide film. When carbonation front reaches steel, active corrosion initiates, causing concrete cracking.
""",

    "collection_15_sensors_iot.md": """# Collection 15: Sensors & IoT
Source: Structural Health Monitoring (SHM) Standards
Year: 2024
Version: SHM-IOT-V1.2
Domain: IoT Telemetry
Applicable Infrastructure: Flyovers, Bridges, Dams

## Section 1: Displacement & Vibration Limits
Crack displacement sensors (LVDTs) alert engineers if crack movement exceeds 0.5mm over 30 days. Accelerometers monitor bridge deck natural frequency; changes indicate loss of stiffness.
""",

    "collection_16_gis_geospatial.md": """# Collection 16: GIS & Geospatial
Source: ISRO / Telangana State Spatial Data Infrastructure
Year: 2023
Version: TS-GIS-2023
Domain: GIS & Mapping
Applicable Infrastructure: Roads, State Highways

## Section 1: Geospatial Risk Indexing
Assets are mapped in EPSG:4326 coordinate systems. Spatial clustering analyzes risk levels to highlight high-priority maintenance hot zones in Hyderabad and Warangal districts.
""",

    "collection_17_predictive_maintenance.md": """# Collection 17: Predictive Maintenance
Source: CRRI Pavement Remaining Useful Life Models
Year: 2023
Version: CRRI-RUL-2023
Domain: Predictive Analytics
Applicable Infrastructure: Roads, Bridges

## Section 1: Asset Condition Deterioration Curves
Pavement deterioration follows a sigmoidal decay curve. Once health score falls below 75%, decay accelerates, requiring structural overlay repairs to prevent subgrade base failure.
""",

    "collection_18_budget_planning.md": """# Collection 18: Budget Planning
Source: HMDA Municipal Capital Budgeting Rules
Year: 2024
Version: HMDA-CB-2024
Domain: Cost Optimization
Applicable Infrastructure: Municipal Assets

## Section 1: Capital Asset Allocation Priority
Maintenance priority is given to assets where delay penalties (cost multipliers) are highest. Delaying repair on a Critical bridge doubles restoration costs due to shoring requirements.
""",

    "collection_19_safety_regulations.md": """# Collection 19: Safety Regulations
Source: CPWD Worksite Safety Code
Year: 2022
Version: CPWD-WSC-2022
Domain: Worksite Safety
Applicable Infrastructure: All construction sites

## Section 1: Highway Work Zone Layouts
Work zone maintenance on State Highway 1 must set up advanced warning signs, safety cones, and traffic diversions according to MoRTH guidelines before initiating concrete patching.
""",

    "collection_20_executive_intelligence.md": """# Collection 20: Executive Intelligence
Source: Smart Cities Mission KPI Matrix
Year: 2023
Version: SCM-KPI-2023
Domain: Decision Support
Applicable Infrastructure: All assets

## Section 1: District Health Indicators
District ratings are calculated as the mean health index of all registered public assets in that district. Ranks are generated to guide state funding distributions.
""",

    "collection_21_telangana_state_knowledge.md": """# Collection 21: Telangana State Knowledge
Source: Telangana R&B Department / GHMC / HMDA / TSRDC / Mission Bhagiratha
Year: 2021-2025
Version: TS-ENG-2025-Ed1
Domain: Regional Engineering Guidelines
Applicable Infrastructure: All Pilot Infrastructure

## Section 1: Mission Bhagiratha Water Network Inspection
Water utility inspections must check:
- Concrete treatment tanks for signs of alkali-silica reaction (ASR).
- Leakage at gravity pipeline joints to ensure municipal supply pressure is maintained.
- Concrete guides on control valves for wear.

## Section 2: GHMC Begumpet Stormwater Channel Rules
Begumpet Nala drainage walls are subject to localized monsoonal runoff. Concrete retaining linings must be built to withstand peak discharge velocity of 3.5 m/s, with base concrete anchor piling.

## Section 3: TSRDC State Highway Maintenance Guidelines
TSRDC guidelines require regular visual scanning of State Highway 1 (SH-1) bypass pavements. Alligator cracking must be treated within 15 days using polymer asphalt slurry seals to prevent deep subgrade structural decay.
"""
}

for filename, content in collections_data.items():
    filepath = os.path.join(guidelines_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created guideline file: {filename}")
