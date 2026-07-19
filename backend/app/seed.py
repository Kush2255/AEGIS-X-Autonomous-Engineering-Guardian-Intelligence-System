import sys
import os
from datetime import datetime, timedelta
from .database import engine, Base, SessionLocal
from .models import Asset, Inspection, Defect, AIMemory, MaintenanceHistory, Simulation

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Creating mock assets...")
        # 1. Telugu Thalli Flyover (Hyderabad)
        ganga_bridge = Asset(
            id="ganga-bridge-sec12",
            name="Telugu Thalli Flyover (Hyderabad)",
            type="Bridge",
            location_gps="17.4095,78.4735",
            address="Near Secretariat, Lower Tank Bund, Hyderabad, Telangana",
            description="Multi-span concrete girder flyover linking Secretariat to Lower Tank Bund. Completed in 2005. Experiences heavy urban passenger traffic.",
            current_health_score=62.5,
            risk_level="Critical",
            image_url="http://localhost:8000/static/ganga_bridge.png",
            district="Hyderabad",
            last_inspection_date="2026-07-14",
            inspection_frequency="Annually",
            responsible_department="Telangana Roads & Buildings Department",
            asset_age=21,
            current_status="Structural shear cracks monitored at Pier 2"
        )

        # 2. Begumpet Stormwater Nala (Hyderabad)
        metro_tunnel = Asset(
            id="metro-tunnel-line3",
            name="Begumpet Stormwater Nala (Hyderabad)",
            type="Drainage",
            location_gps="17.4374,78.4612",
            address="Arterial Canal, Begumpet Central Basin, Secunderabad, Telangana",
            description="Arterial reinforced concrete stormwater drainage channel serving the central catchment basin of Hyderabad.",
            current_health_score=78.0,
            risk_level="Monitor",
            image_url="http://localhost:8000/static/metro_tunnel.png",
            district="Hyderabad",
            last_inspection_date="2026-07-07",
            inspection_frequency="Biannually",
            responsible_department="Greater Hyderabad Municipal Corporation (GHMC)",
            asset_age=12,
            current_status="Joint gasket seepage under monitor"
        )

        # 3. Mission Bhagiratha Water Treatment Plant
        yamuna_dam = Asset(
            id="yamuna-reservoir-dam",
            name="Mission Bhagiratha Water Treatment Plant",
            type="Water Utility",
            location_gps="17.0500,79.2700",
            address="Purification Plant, Nalgonda Division, Nalgonda, Telangana",
            description="Gravity water purification and storage facility supplying clean drinking water. Safe, operating at peak hydraulic head.",
            current_health_score=94.5,
            risk_level="Safe",
            image_url="http://localhost:8000/static/yamuna_dam.png",
            district="Nalgonda",
            last_inspection_date="2026-06-29",
            inspection_frequency="Quarterly",
            responsible_department="Mission Bhagiratha Division",
            asset_age=8,
            current_status="Operational - Safe"
        )

        # 4. Osmania General Hospital (Heritage Block)
        executive_plaza = Asset(
            id="exec-plaza-complex",
            name="Osmania General Hospital (Heritage Block)",
            type="Building",
            location_gps="17.3785,78.4760",
            address="Afzal Gunj Medical Complex, Hyderabad Metropolitan Area, Telangana",
            description="Three-story heritage masonry and concrete structure built in 1919. Houses critical medical wards.",
            current_health_score=68.2,
            risk_level="Warning",
            image_url="http://localhost:8000/static/executive_plaza.png",
            district="Hyderabad",
            last_inspection_date="2026-07-11",
            inspection_frequency="Biannually",
            responsible_department="Telangana Health & Family Welfare Department",
            asset_age=107,
            current_status="Masonry degradation - Warning alert"
        )

        # 5. Telangana State Highway 1 (Siddipet Bypass)
        nh44_road = Asset(
            id="nh44-road-sec7",
            name="Telangana State Highway 1 (Siddipet Bypass)",
            type="Road",
            location_gps="18.1010,78.8520",
            address="State Highway 1 Corridor, Siddipet Outer Ring, Siddipet, Telangana",
            description="Four-lane flexible bituminous asphalt roadway serving high-density freight logistics and intercity passenger traffic.",
            current_health_score=81.0,
            risk_level="Monitor",
            image_url="http://localhost:8000/static/nh44_highway.png",
            district="Siddipet",
            last_inspection_date="2026-07-04",
            inspection_frequency="Quarterly",
            responsible_department="Telangana State Road Development Corporation (TSRDC)",
            asset_age=15,
            current_status="Pavement alligator cracking reported"
        )

        db.add(ganga_bridge)
        db.add(metro_tunnel)
        db.add(yamuna_dam)
        db.add(executive_plaza)
        db.add(nh44_road)
        db.commit()

        # Dynamic Generation of 245 Additional Telangana Pilot Assets
        import random
        random.seed(42)

        districts = [
            "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam", 
            "Nalgonda", "Mahabubnagar", "Adilabad", "Rangareddy", "Siddipet", 
            "Medak", "Jagitial", "Mancherial", "Peddapalli", "Suryapet", 
            "Sangareddy", "Vikarabad", "Bhadradri Kothagudem"
        ]

        infra_types = [
            ("Roads", "Road", "Telangana State Road Development Corporation (TSRDC)"),
            ("State Highways", "Road", "Telangana Roads & Buildings Department"),
            ("Bridges", "Bridge", "Telangana Roads & Buildings Department"),
            ("Flyovers", "Bridge", "Greater Hyderabad Municipal Corporation (GHMC)"),
            ("Government Buildings", "Building", "Telangana Roads & Buildings Department"),
            ("Hospitals", "Building", "Telangana Health & Family Welfare Department"),
            ("Schools", "Building", "Telangana School Education Department"),
            ("Universities", "Building", "Telangana Higher Education Department"),
            ("Railway Infrastructure", "Railway", "South Central Railway (SCR)"),
            ("Water Utilities", "Water Utility", "Mission Bhagiratha Division"),
            ("Drainage Systems", "Drainage", "GHMC Stormwater Department"),
            ("Smart City Assets", "Building", "Telangana Smart Cities Mission"),
            ("Public Utilities", "Utility", "Telangana State Southern Power Distribution (TSSPDCL)")
        ]

        for i in range(1, 246):
            district = random.choice(districts)
            infra_display_type, db_type, dept = random.choice(infra_types)
            
            # Programmatic coordinates bounded inside Telangana
            # Latitude: 15.8 to 19.8, Longitude: 77.2 to 81.8
            lat = round(random.uniform(16.2, 19.5), 5)
            lng = round(random.uniform(77.5, 81.2), 5)
            gps = f"{lat},{lng}"
            
            address = f"Sector {random.randint(1,12)} Bypass, {district}, Telangana"
            
            # Asset naming templates based on class
            if infra_display_type == "Roads":
                name = f"{district} Bypass Link Road {i}"
            elif infra_display_type == "State Highways":
                name = f"Telangana SH-{random.randint(2, 120)} ({district} Section)"
            elif infra_display_type == "Bridges":
                name = f"{district} Concrete River Bridge {i}"
            elif infra_display_type == "Flyovers":
                name = f"{district} Flyover Bypass {i}"
            elif infra_display_type == "Government Buildings":
                name = f"{district} District Collectorate Complex"
            elif infra_display_type == "Hospitals":
                name = f"{district} Area Civil Hospital"
            elif infra_display_type == "Schools":
                name = f"{district} Zilla Parishad High School {i}"
            elif infra_display_type == "Universities":
                name = f"{district} State College Campus"
            elif infra_display_type == "Railway Infrastructure":
                name = f"SCR Overhead Rail Bridge Block {i} ({district})"
            elif infra_display_type == "Water Utilities":
                name = f"Mission Bhagiratha Intake Well ({district})"
            elif infra_display_type == "Drainage Systems":
                name = f"{district} Stormwater Nala Link {i}"
            elif infra_display_type == "Smart City Assets":
                name = f"{district} Municipal Smart City Hub"
            else:
                name = f"{district} TSSPDCL Substation Block {i}"

            health = round(random.uniform(40.0, 98.0), 1)
            
            if health < 65.0:
                risk = "Critical"
                status = random.choice([
                    "Severe concrete cracking & shear deflection reported",
                    "Reinforcement steel exposed with active rusting",
                    "Foundation scouring detected post-monsoon"
                ])
            elif health < 75.0:
                risk = "Warning"
                status = random.choice([
                    "Minor concrete peeling & plaster cracking observed",
                    "Dampness and efflorescence leaching on joints",
                    "Potholes and fatigue deformation on surface"
                ])
            elif health < 85.0:
                risk = "Monitor"
                status = random.choice([
                    "Hairline cracking under normal surveillance",
                    "Standard structural deflection observed",
                    "Minor vegetation growth on concrete guides"
                ])
            else:
                risk = "Safe"
                status = "Operational - Optimal performance parameters"

            # Image mapping based on type
            if db_type == "Bridge":
                image = "http://localhost:8000/static/ganga_bridge.png"
            elif db_type == "Drainage":
                image = "http://localhost:8000/static/metro_tunnel.png"
            elif db_type == "Water Utility":
                image = "http://localhost:8000/static/yamuna_dam.png"
            elif db_type == "Road":
                image = "http://localhost:8000/static/nh44_highway.png"
            else:
                image = "http://localhost:8000/static/executive_plaza.png"

            last_ins_date = (datetime.utcnow() - timedelta(days=random.randint(2, 90))).strftime("%Y-%m-%d")
            ins_freq = random.choice(["Quarterly", "Biannually", "Annually"])
            age = random.randint(2, 60)

            asset = Asset(
                id=f"asset-gen-{i}",
                name=name,
                type=db_type,
                location_gps=gps,
                address=address,
                description=f"Representative pilot asset monitoring structural safety under the PRAHARI AI telemetry network. Class: {infra_display_type}.",
                current_health_score=health,
                risk_level=risk,
                image_url=image,
                district=district,
                last_inspection_date=last_ins_date,
                inspection_frequency=ins_freq,
                responsible_department=dept,
                asset_age=age,
                current_status=status
            )
            db.add(asset)

        db.commit()

        print("Creating mock inspections...")
        
        # --- TELUGU THALLI FLYOVER INSPECTIONS ---
        # 2024 Inspection (2 years ago)
        date_2024 = datetime.utcnow() - timedelta(days=730)
        ins_gb_2024 = Inspection(
            id="gb-ins-2024",
            asset_id="ganga-bridge-sec12",
            inspection_date=date_2024,
            inspector_name="Dr. R. K. Prasad (Lead Inspector)",
            overall_risk_score=20.0,
            summary="Routine visual inspection completed. Found minor temperature-induced hairline cracking on Pier 2 surface. No structural danger observed.",
            status="Completed",
            weather="Dry / Clear, 32°C",
            traffic_load="Standard Urban Flyover Load (20,000 PCU/day)",
            details_json={
                "inspector_notes": "Hairline cracks present on Pier 2 column face. Cracks are localized, estimated depth is shallow. Recommended monitoring at next inspection cycles.",
                "agents_involved": ["InspectorAgent", "RiskAnalystAgent"]
            }
        )
        
        # 2025 Inspection (1 year ago)
        date_2025 = datetime.utcnow() - timedelta(days=365)
        ins_gb_2025 = Inspection(
            id="gb-ins-2025",
            asset_id="ganga-bridge-sec12",
            inspection_date=date_2025,
            inspector_name="Dr. R. K. Prasad (Lead Inspector)",
            overall_risk_score=45.0,
            summary="Annual structural audit. Pier 2 hairline cracks have expanded. Discovered minor concrete spalling and aggregate exposure on the lower flange of Span 3.",
            status="Completed",
            weather="Humid / Light Rain, 28°C",
            traffic_load="High Traffic Load (28,000 PCU/day)",
            details_json={
                "inspector_notes": "Pier 2 cracks are widening, now measured around 1.8mm. Span 3 exhibits concrete cover peeling. Need to seal cracks.",
                "agents_involved": ["InspectorAgent", "DocumentAgent", "RiskAnalystAgent"]
            }
        )

        # 2026 Inspection (Current)
        date_2026 = datetime.utcnow() - timedelta(days=5)
        ins_gb_2026 = Inspection(
            id="gb-ins-2026",
            asset_id="ganga-bridge-sec12",
            inspection_date=date_2026,
            inspector_name="Dr. Amit Sen (Senior structural auditor)",
            overall_risk_score=85.0,
            summary="Urgent structural inspection triggered. Significant structural cracks discovered on Pier 2 (5.2mm width). Extensive spalling and reinforcement bars are fully exposed on Span 3, showing advanced rust scaling and cross-sectional reduction.",
            status="Completed",
            weather="Heavy Monsoon Rain, 24°C",
            traffic_load="Overloaded Traffic (34,000 PCU/day, heavy double-decker buses and logs)",
            details_json={
                "inspector_notes": "Active water leaching from cracks. Reinforcement shows active corrosion and scaling. Section loss is visible. Structural integrity is compromised. Heavy loaded multi-axle buses are putting excessive stress.",
                "agents_involved": ["InspectorAgent", "DocumentAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent", "SimulationAgent", "ReportAgent"]
            }
        )

        db.add_all([ins_gb_2024, ins_gb_2025, ins_gb_2026])
        db.commit()

        # --- BEGUMPET STORMWATER NALA INSPECTIONS ---
        ins_mt_current = Inspection(
            id="mt-ins-2026",
            asset_id="metro-tunnel-line3",
            inspection_date=datetime.utcnow() - timedelta(days=12),
            inspector_name="Ir. Sarah Jenkins",
            overall_risk_score=42.0,
            summary="Discovered localized moisture ingress and active water leakage at concrete lining Joint 45. Joint sealant has degraded, allowing water leakage behind nala walls.",
            status="Completed",
            weather="Dry (Sub-surface)",
            traffic_load="Monsoonal drainage load (40% capacity)",
            details_json={
                "inspector_notes": "Active water seepage observed. Carbonate efflorescence deposits forming on nala walls. Joint sealing requires maintenance.",
                "agents_involved": ["InspectorAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent"]
            }
        )

        # --- MISSION BHAGIRATHA WATER TREATMENT PLANT INSPECTIONS ---
        ins_yd_current = Inspection(
            id="yd-ins-2026",
            asset_id="yamuna-reservoir-dam",
            inspection_date=datetime.utcnow() - timedelta(days=20),
            inspector_name="R. S. Negi (Executive Engineer)",
            overall_risk_score=10.0,
            summary="Bi-annual water plant safety inspection. Spillway gates, control valves, and concrete guides are operating optimally. Minor cosmetic algae growth on spillway walls. No structural defects.",
            status="Completed",
            weather="Dry, 18°C",
            traffic_load="Hydrostatic Head Level: 122.5m (Within limits)",
            details_json={
                "inspector_notes": "Valves operation test successful. Seal friction is within normal parameters. Algae growth does not threaten concrete integrity.",
                "agents_involved": ["InspectorAgent", "RiskAnalystAgent"]
            }
        )

        # --- OSMANIA GENERAL HOSPITAL INSPECTIONS ---
        ins_ep_current = Inspection(
            id="ep-ins-2026",
            asset_id="exec-plaza-complex",
            inspection_date=datetime.utcnow() - timedelta(days=8),
            inspector_name="Vijay Kapoor (Consulting Structural Engineer)",
            overall_risk_score=68.0,
            summary="Structural assessment of columns on basement Level 2. Shear cracks (3.1mm width) found at the junction of main column B4 and concrete girder. Rust staining indicates internal reinforcement oxidation. Fireproofing coating has degraded.",
            status="Completed",
            weather="Dry, 38°C",
            traffic_load="100% building occupancy, heavy basement usage",
            details_json={
                "inspector_notes": "Basement dampness is contributing to structural degradation. The shear cracks require immediate polymer-modified mortar repair and steel collar jacket wrapping.",
                "agents_involved": ["InspectorAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent", "SimulationAgent"]
            }
        )

        # --- SH-1 ROAD INSPECTIONS ---
        ins_nh_current = Inspection(
            id="nh-ins-2026",
            asset_id="nh44-road-sec7",
            inspection_date=datetime.utcnow() - timedelta(days=15),
            inspector_name="Harpreet Singh (State R&B Inspector)",
            overall_risk_score=38.0,
            summary="Pavement distress evaluation on Siddipet bypass lane. Discovered deep potholes (avg depth 85mm) and fatigue 'alligator' cracking covering 150m. Paves way for severe rain ponding.",
            status="Completed",
            weather="Hot/Humid, 41°C",
            traffic_load="25,000 PCU/day (Heavy logistics traffic)",
            details_json={
                "inspector_notes": "Sub-base layer deterioration at specific sections. Micro-surfacing will be insufficient; requires 40mm milling and overlay.",
                "agents_involved": ["InspectorAgent", "RiskAnalystAgent"]
            }
        )

        db.add_all([ins_mt_current, ins_yd_current, ins_ep_current, ins_nh_current])
        db.commit()

        print("Creating mock defects...")
        
        # Telugu Thalli Flyover Defects
        db.add_all([
            Defect(
                id="def-gb-1",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                type="Crack",
                severity="Critical",
                location_description="Pier 2 Main Concrete Column, East Face",
                confidence=0.98,
                description="Diagonal shear crack extending 1.2m across the main load-bearing column. Crack width measured at 5.2mm. Significant active structural load-carrying hazard.",
                image_url="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80"
            ),
            Defect(
                id="def-gb-2",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                type="Spalling",
                severity="High",
                location_description="Span 3 Lower Flange Outer Girder",
                confidence=0.94,
                description="Deep concrete spalling spanning 80cm x 50cm. Concrete cover has completely fallen away. Rebars are exposed and showing scaling rust.",
                image_url="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
            ),
            Defect(
                id="def-gb-3",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                type="Rust",
                severity="High",
                location_description="Exposed Rebars on Span 3 Girder",
                confidence=0.95,
                description="Heavy rust oxidation scaling on 4 exposed reinforcement bars. Section loss estimated around 12%. Reduces tensile strength capacity.",
                image_url="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=400&q=80"
            ),
            Defect(
                id="def-gb-4",
                inspection_id="gb-ins-2025",
                asset_id="ganga-bridge-sec12",
                type="Crack",
                severity="Medium",
                location_description="Pier 2 Main Concrete Column, East Face",
                confidence=0.88,
                description="Horizontal temperature crack widening to 1.8mm. Shows signs of moisture ingress.",
                image_url=""
            ),
            Defect(
                id="def-gb-5",
                inspection_id="gb-ins-2024",
                asset_id="ganga-bridge-sec12",
                type="Crack",
                severity="Low",
                location_description="Pier 2 Main Concrete Column, East Face",
                confidence=0.85,
                description="Minor hairline crack of width 0.2mm on concrete surface. Currently stable.",
                image_url=""
            )
        ])

        # Begumpet Stormwater Nala Defects
        db.add_all([
            Defect(
                id="def-mt-1",
                inspection_id="mt-ins-2026",
                asset_id="metro-tunnel-line3",
                type="Leakage",
                severity="Medium",
                location_description="Joint 45, East Sidewall",
                confidence=0.92,
                description="Active water seepage through the concrete joint lining. Causes moisture buildup and concrete leaching.",
                image_url=""
            ),
            Defect(
                id="def-mt-2",
                inspection_id="mt-ins-2026",
                asset_id="metro-tunnel-line3",
                type="Rust",
                severity="Low",
                location_description="Structural Steel Bracket, adjacent to Joint 45",
                confidence=0.90,
                description="Surface oxidation starting on the steel wall brackets due to constant water dripping from Joint 45.",
                image_url=""
            )
        ])

        # Osmania General Hospital Defects
        db.add_all([
            Defect(
                id="def-ep-1",
                inspection_id="ep-ins-2026",
                asset_id="exec-plaza-complex",
                type="Crack",
                severity="High",
                location_description="Basement Parking Level 2, Column B4",
                confidence=0.96,
                description="Shear crack at column-beam junction, 3.1mm width. Represents structural overloading of the joint.",
                image_url=""
            ),
            Defect(
                id="def-ep-2",
                inspection_id="ep-ins-2026",
                asset_id="exec-plaza-complex",
                type="Rust",
                severity="Medium",
                location_description="Column B4 outer face",
                confidence=0.89,
                description="Rust bleeding and carbonation staining on concrete surface, indicating internal reinforcement bars are corroding.",
                image_url=""
            )
        ])

        # State Highway 1 Defects
        db.add_all([
            Defect(
                id="def-nh-1",
                inspection_id="nh-ins-2026",
                asset_id="nh44-road-sec7",
                type="Pothole",
                severity="Medium",
                location_description="Slow lane, Chainage 142.1",
                confidence=0.97,
                description="Severe pavement pothole measuring 85mm deep and 1.2m wide. Damages vehicle axles and creates traffic hazards.",
                image_url=""
            ),
            Defect(
                id="def-nh-2",
                inspection_id="nh-ins-2026",
                asset_id="nh44-road-sec7",
                type="Crack",
                severity="Medium",
                location_description="Slow & Middle lanes, Chainage 142.0 to 142.15",
                confidence=0.91,
                description="Fatigue 'alligator' cracking pattern. Indicates sub-base layer settlement and moisture saturation.",
                image_url=""
            )
        ])
        db.commit()

        print("Creating mock maintenance logs...")
        
        # Maintenance logs
        db.add_all([
            MaintenanceHistory(
                id="maint-gb-1",
                asset_id="ganga-bridge-sec12",
                repair_date=datetime.utcnow() - timedelta(days=600),
                repair_type="Acrylic crack sealing",
                cost=45000.0,
                status="Completed",
                notes="Applied superficial acrylic elastomeric seal to Pier 2 cracks. Did not perform structural chemical grouting."
            ),
            MaintenanceHistory(
                id="maint-gb-2",
                asset_id="ganga-bridge-sec12",
                repair_date=datetime.utcnow() - timedelta(days=40),
                repair_type="Safety netting & scaffolding installation",
                cost=75000.0,
                status="Completed",
                notes="Installed structural debris nets under Span 3 to prevent loose concrete chunks from falling onto road transit lanes below."
            ),
            MaintenanceHistory(
                id="maint-mt-1",
                asset_id="metro-tunnel-line3",
                repair_date=datetime.utcnow() - timedelta(days=180),
                repair_type="Drainage channel desilting",
                cost=12000.0,
                status="Completed",
                notes="Cleared carbonate deposits from track bed drainage gutter to prevent water logging."
            )
        ])
        db.commit()

        print("Creating mock simulations...")
        
        # Simulations for Telugu Thalli Flyover (Pier 2 / Span 3 cracks)
        db.add_all([
            Simulation(
                id="sim-gb-now",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                scenario_name="Repair Now",
                projected_health=88.0,
                projected_risk="Safe",
                estimated_repair_cost=250000.0,
                code_reference="IS-456: Clause 26.5 & Cl 32",
                logic_explanation="Immediate epoxy grout injection of the 5.2mm cracks on Pier 2, along with polymer mortar patching and wrapping Span 3 with carbon-fiber reinforced polymer (CFRP) jackets. Arrests oxygen and moisture access, stopping further steel oxidation. Restores 95% of original shear capacity."
            ),
            Simulation(
                id="sim-gb-3m",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                scenario_name="Delay 3 Months",
                projected_health=52.0,
                projected_risk="Warning",
                estimated_repair_cost=480000.0,
                code_reference="IRC:SP-18 (Section 4 - Repair)",
                logic_explanation="Under constant vibrations from heavy urban traffic, Pier 2 shear cracks will extend past the 6mm structural limit. Micro-cracking in concrete matrix expands. Postponing repairs permits internal steel to scale more. Cost doubles due to required temporary structural shoring to lift girders while column is repaired."
            ),
            Simulation(
                id="sim-gb-6m",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                scenario_name="Delay 6 Months",
                projected_health=38.0,
                projected_risk="Critical",
                estimated_repair_cost=1200000.0,
                code_reference="IRC:SP-18 (Section 6 - Rehabilitation)",
                logic_explanation="Substantial risk of shear failure under peak axle load. Steel section loss increases to 25%, causing loss of mechanical bond between steel and concrete. Heavy vehicles must be banned, restricting flyover to light traffic. Remediation requires external post-tensioning tendons or structural steel collar plating."
            ),
            Simulation(
                id="sim-gb-rain",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                scenario_name="Heavy Rainfall Event",
                projected_health=45.0,
                projected_risk="Critical",
                estimated_repair_cost=750000.0,
                code_reference="IS-456 Clause 32.1 (Durability)",
                logic_explanation="Heavy monsoon precipitation causes massive water ingress. Acidic rainwater dissolves free calcium hydroxide in concrete (leaching), increasing internal void size. Advanced rust expansion forces spalling of the remaining concrete cover on Span 3, leading to severe bond slip."
            ),
            Simulation(
                id="sim-gb-traffic",
                inspection_id="gb-ins-2026",
                asset_id="ganga-bridge-sec12",
                scenario_name="Traffic Increase 40%",
                projected_health=48.0,
                projected_risk="Critical",
                estimated_repair_cost=900000.0,
                code_reference="IRC:6-2016 (Standard Live Loads)",
                logic_explanation="Increasing the frequency of heavy multi-axle buses increases cyclic fatigue stress. The cracks on Pier 2 will propagate at an exponential rate. Fatigue limit of shear steel is crossed, leading to brittle concrete failure."
            )
        ])

        # Simulations for Osmania Hospital (Column B4 cracks)
        db.add_all([
            Simulation(
                id="sim-ep-now",
                inspection_id="ep-ins-2026",
                asset_id="exec-plaza-complex",
                scenario_name="Repair Now",
                projected_health=90.0,
                projected_risk="Safe",
                estimated_repair_cost=120000.0,
                code_reference="IS-456 Cl 32 (Mortar Repairs)",
                logic_explanation="Inject low-viscosity structural epoxy into Column B4 joints and apply steel plate jacketing. Resolves shear concentration."
            ),
            Simulation(
                id="sim-ep-6m",
                inspection_id="ep-ins-2026",
                asset_id="exec-plaza-complex",
                scenario_name="Delay 6 Months",
                projected_health=50.0,
                projected_risk="Warning",
                estimated_repair_cost=350000.0,
                code_reference="IS-456 Cl 26 (Structural Safety)",
                logic_explanation="Cracks propagate vertically. Progressive structural settlement in column B4 causes upper floor slabs to tilt slightly. Costs surge due to historical structural preservation care protocols required."
            )
        ])
        db.commit()

        print("Creating mock AI memory profiles...")
        
        # AI Memories
        db.add_all([
            AIMemory(
                id="mem-gb-1",
                asset_id="ganga-bridge-sec12",
                key="structural_profile",
                value_json={
                    "deterioration_summary": "Deterioration rate has accelerated. The asset's health score has dropped from 92.0 in 2024 to 78.0 in 2025, and now stands at 62.5 in 2026.",
                    "structural_criticality": "Pier 2 column shear cracking is structural and requires immediate mechanical repairs. Span 3 cover loss exposes reinforcement bars to active monsoonal oxidation.",
                    "applied_codes": ["IS-456:2000 Clause 26.5", "IRC:SP-18 Clause 4"],
                    "maintenance_warning": "Previous acrylic crack seal in 2024 failed to prevent water ingress. Future repairs must utilize structural epoxy injection rather than paint coatings."
                }
            ),
            AIMemory(
                id="mem-mt-1",
                asset_id="metro-tunnel-line3",
                key="water_ingress_profile",
                value_json={
                    "ingress_rate": "Moderate leakage at Concrete Joint 45. Dripping rate of 2 liters/hour.",
                    "secondary_hazards": "Active corrosion of nearby steel braces and joint reinforcement. Long-term concrete leaching risks voids.",
                    "remediation_guideline": "Specify polyurethane chemical grout injection at joint boundaries to re-establish seal integrity."
                }
            ),
            AIMemory(
                id="mem-ep-1",
                asset_id="exec-plaza-complex",
                key="basement_criticality_profile",
                value_json={
                    "structural_criticality": "Column B4 shows signs of loading stress combined with dampness. Column-girder junction cracks are structural.",
                    "remediation_guideline": "Corrosion inhibitor primer, micro-concrete patching, and steel jacket casing."
                }
            )
        ])
        db.commit()
        print("Mock database successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
