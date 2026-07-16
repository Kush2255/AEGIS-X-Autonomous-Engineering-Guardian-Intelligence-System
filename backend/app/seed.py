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
        # 1. Ganga Bridge
        ganga_bridge = Asset(
            id="ganga-bridge-sec12",
            name="Ganga Bridge (Sector 12)",
            type="Bridge",
            location_gps="25.3176,83.0062",
            address="National Highway 2, Sector 12 Bypass, Varanasi, UP",
            description="Four-lane prestressed concrete box girder bridge spanning the Ganga River. Built in 2011. Experiences high volume of multi-axle freight vehicles.",
            current_health_score=62.5,
            risk_level="Critical",
            image_url="https://images.unsplash.com/photo-1545624902-863df70e6378?auto=format&fit=crop&w=600&q=80"
        )

        # 2. Metro Tunnel Line 3
        metro_tunnel = Asset(
            id="metro-tunnel-line3",
            name="Metro Tunnel Line 3 (Span 45)",
            type="Tunnel",
            location_gps="18.9560,72.8238",
            address="Colaba-Bandra-Seepz Corridor, Span 45 East, Mumbai, MH",
            description="Underground bored concrete tunnel lined with precast segment blocks. Serves daily passenger transit trains.",
            current_health_score=78.0,
            risk_level="Monitor",
            image_url="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80"
        )

        # 3. Yamuna Reservoir Dam
        yamuna_dam = Asset(
            id="yamuna-reservoir-dam",
            name="Yamuna Reservoir Dam (Sluice Gate C)",
            type="Dam",
            location_gps="30.5844,77.7289",
            address="Yamuna River Hydropower Station, Dakpathar, UK",
            description="Gravity concrete dam constructed for irrigation and power generation. Sluice Gate C controls drainage bypass.",
            current_health_score=94.5,
            risk_level="Safe",
            image_url="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=80"
        )

        # 4. Executive Plaza Complex
        executive_plaza = Asset(
            id="exec-plaza-complex",
            name="Executive Plaza Complex (Main Block)",
            type="Building",
            location_gps="28.5355,77.2639",
            address="Nehru Place Commercial Center, New Delhi, DL",
            description="15-story commercial skyscraper featuring composite concrete and steel frame structures. Built in 1995.",
            current_health_score=68.2,
            risk_level="Warning",
            image_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
        )

        # 5. National Highway 44
        nh44_road = Asset(
            id="nh44-road-sec7",
            name="National Highway 44 (Section 7)",
            type="Road",
            location_gps="31.2580,75.7020",
            address="NH-44 Expressway, Section 7 North, Jalandhar, PB",
            description="Six-lane flexible bituminous asphalt roadway serving high-speed interstate logistics and passenger traffic.",
            current_health_score=81.0,
            risk_level="Monitor",
            image_url="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80"
        )

        db.add_all([ganga_bridge, metro_tunnel, yamuna_dam, executive_plaza, nh44_road])
        db.commit()

        print("Creating mock inspections...")
        
        # --- GANGA BRIDGE INSPECTIONS ---
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
            traffic_load="Standard Highway Load (25,000 PCU/day)",
            details_json={
                "inspector_notes": "Hairline cracks present on Pier 2. Cracks are localized, estimated depth is shallow. Recommended monitoring at next inspection cycles.",
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
            traffic_load="High Traffic Load (32,000 PCU/day)",
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
            traffic_load="Overloaded Traffic (38,000 PCU/day, heavy mining trucks)",
            details_json={
                "inspector_notes": "Active water leaching from cracks. Reinforcement shows active corrosion and scaling. Section loss is visible. Structural integrity is compromised. Heavy loaded multi-axle trucks are putting excessive stress.",
                "agents_involved": ["InspectorAgent", "DocumentAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent", "SimulationAgent", "ReportAgent"]
            }
        )

        db.add_all([ins_gb_2024, ins_gb_2025, ins_gb_2026])
        db.commit()

        # --- METRO TUNNEL INSPECTIONS ---
        ins_mt_current = Inspection(
            id="mt-ins-2026",
            asset_id="metro-tunnel-line3",
            inspection_date=datetime.utcnow() - timedelta(days=12),
            inspector_name="Ir. Sarah Jenkins",
            overall_risk_score=42.0,
            summary="Discovered localized moisture ingress and active water leakage at Segment Joint 45 East. Corrosion starting on steel rail fixtures nearby. Tunnel lining integrity is intact, but joint sealing requires maintenance.",
            status="Completed",
            weather="Dry (Sub-surface)",
            traffic_load="220 trains/day (Standard Transit Load)",
            details_json={
                "inspector_notes": "Active dripping observed, approx 2 liters/hour. Carbonate deposits forming on tunnel floor. Need chemical grouting.",
                "agents_involved": ["InspectorAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent"]
            }
        )

        # --- YAMUNA DAM INSPECTIONS ---
        ins_yd_current = Inspection(
            id="yd-ins-2026",
            asset_id="yamuna-reservoir-dam",
            inspection_date=datetime.utcnow() - timedelta(days=20),
            inspector_name="R. S. Negi (Executive Engineer)",
            overall_risk_score=10.0,
            summary="Bi-annual dam safety inspection. Sluice Gate C structures, hydraulic cylinders, and concrete guides are operating optimally. Minor cosmetic algae growth on spillway walls. No structural defects.",
            status="Completed",
            weather="Dry, 18°C",
            traffic_load="Hydrostatic Head Level: 122.5m (Within limits)",
            details_json={
                "inspector_notes": "Gate operation test successful. Seal friction is within normal parameters. Algae growth does not threaten concrete integrity.",
                "agents_involved": ["InspectorAgent", "RiskAnalystAgent"]
            }
        )

        # --- EXECUTIVE PLAZA INSPECTIONS ---
        ins_ep_current = Inspection(
            id="ep-ins-2026",
            asset_id="exec-plaza-complex",
            inspection_date=datetime.utcnow() - timedelta(days=8),
            inspector_name="Vijay Kapoor (Consulting Structural Engineer)",
            overall_risk_score=68.0,
            summary="Structural assessment of columns on basement parking Level 2. Shear cracks (3.1mm width) found at the junction of main column B4 and concrete girder. Rust staining indicates internal reinforcement oxidation. Fireproofing coating has degraded.",
            status="Completed",
            weather="Dry, 38°C",
            traffic_load="100% building occupancy, heavy basement parking usage",
            details_json={
                "inspector_notes": "Basement dampness is contributing to structural degradation. The shear cracks require immediate polymer-modified mortar repair and steel collar jacket wrapping.",
                "agents_involved": ["InspectorAgent", "KnowledgeAgent", "StructuralEngineerAgent", "RiskAnalystAgent", "SimulationAgent"]
            }
        )

        # --- NH44 ROAD INSPECTIONS ---
        ins_nh_current = Inspection(
            id="nh-ins-2026",
            asset_id="nh44-road-sec7",
            inspection_date=datetime.utcnow() - timedelta(days=15),
            inspector_name="Harpreet Singh (NHAI Inspector)",
            overall_risk_score=38.0,
            summary="Pavement distress evaluation on Sector 7 North lane. Discovered deep potholes (avg depth 85mm) and fatigue 'alligator' cracking covering 150m. Paves way for severe rain ponding.",
            status="Completed",
            weather="Hot/Humid, 41°C",
            traffic_load="45,000 PCU/day (Heavy logistics traffic)",
            details_json={
                "inspector_notes": "Sub-base layer deterioration at specific sections. Micro-surfacing will be insufficient; requires 40mm milling and overlay.",
                "agents_involved": ["InspectorAgent", "RiskAnalystAgent"]
            }
        )

        db.add_all([ins_mt_current, ins_yd_current, ins_ep_current, ins_nh_current])
        db.commit()

        print("Creating mock defects...")
        
        # Ganga Bridge Defects
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

        # Metro Tunnel Defects
        db.add_all([
            Defect(
                id="def-mt-1",
                inspection_id="mt-ins-2026",
                asset_id="metro-tunnel-line3",
                type="Leakage",
                severity="Medium",
                location_description="Segment Joint 45, East Sidewall",
                confidence=0.92,
                description="Active water seepage through the precast lining rubber gasket. Causes moisture buildup on steel rail fixtures.",
                image_url=""
            ),
            Defect(
                id="def-mt-2",
                inspection_id="mt-ins-2026",
                asset_id="metro-tunnel-line3",
                type="Rust",
                severity="Low",
                location_description="Rail Tie Base, adjacent to Joint 45",
                confidence=0.90,
                description="Surface oxidation starting on the rail fasteners due to constant water dripping from Joint 45.",
                image_url=""
            )
        ])

        # Executive Plaza Defects
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

        # NH44 Defects
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
                repair_type="Scaffolding installation & safety netting",
                cost=75000.0,
                status="Completed",
                notes="Installed structural debris nets under Span 3 to prevent loose concrete chunks from falling onto water transit lanes below."
            ),
            MaintenanceHistory(
                id="maint-mt-1",
                asset_id="metro-tunnel-line3",
                repair_date=datetime.utcnow() - timedelta(days=180),
                repair_type="Drainage gutter clearing",
                cost=12000.0,
                status="Completed",
                notes="Cleared carbonate deposits from track bed drainage gutter to prevent water logging."
            )
        ])
        db.commit()

        print("Creating mock simulations...")
        
        # Simulations for Ganga Bridge (Pier 2 / Span 3 cracks)
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
                logic_explanation="Under constant vibrations from heavy overloaded traffic, Pier 2 shear cracks will extend past the 6mm structural limit. Micro-cracking in concrete matrix expands. Postponing repairs permits internal steel to scale more. Cost doubles due to required temporary structural shoring to lift girders while column is repaired."
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
                logic_explanation="Substantial risk of shear failure under peak axle load. Steel section loss increases to 25%, causing loss of mechanical bond between steel and concrete. Heavy vehicles must be banned, restricting bridge to single-lane light traffic. Remediation requires external post-tensioning tendons or structural steel collar plating."
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
                logic_explanation="Increasing the frequency of heavy multi-axle trucks increases cyclic fatigue stress. The cracks on Pier 2 will propagate at an exponential rate. Fatigue limit of shear steel is crossed, leading to brittle concrete failure."
            )
        ])

        # Simulations for Executive Plaza (Column B4 cracks)
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
                logic_explanation="Cracks propagate vertically. Progressive structural settlement in basement parking column causes upper floor slabs to tilt slightly, cracking drywall partitions on floors 1-3. Costs surge due to floor level correction requirements."
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
                    "ingress_rate": "Moderate leakage at Segment Joint 45. Dripping rate of 2 liters/hour.",
                    "secondary_hazards": "Active corrosion of nearby steel rails and rail fasteners. Long-term concrete leaching risks voids.",
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
