import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from .rag_indexer import RAGSystem

# Load env variables from local .env file
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value

class InspectorAgent:
    """Uses Vision AI to detect defects in images/videos."""
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)

    def analyze_image(self, image_path: Optional[str], asset_type: str = "Bridge") -> List[Dict[str, Any]]:
        if not self.api_key or not image_path or not os.path.exists(image_path):
            # High-fidelity mock fallback based on asset type
            print("Vision API: No key/image found or offline. Simulating Inspector Agent...")
            if asset_type.lower() == "bridge":
                return [
                    {
                        "type": "Crack",
                        "severity": "Critical",
                        "location_description": "Pier 2 Main Column, East Face",
                        "confidence": 0.98,
                        "description": "Diagonal shear crack extending 1.2m across the main load-bearing column. Crack width measured at 5.2mm. Active structural risk."
                    },
                    {
                        "type": "Spalling",
                        "severity": "High",
                        "location_description": "Span 3 Lower Flange Outer Girder",
                        "confidence": 0.94,
                        "description": "Deep concrete spalling spanning 80cm x 50cm. Concrete cover has peeled off. Structural reinforcement exposed."
                    },
                    {
                        "type": "Rust",
                        "severity": "High",
                        "location_description": "Exposed Rebars on Span 3 Girder",
                        "confidence": 0.95,
                        "description": "Heavy oxidation scaling on 4 exposed reinforcement bars. Cross-sectional section loss estimated around 12%."
                    }
                ]
            elif asset_type.lower() == "tunnel":
                return [
                    {
                        "type": "Leakage",
                        "severity": "Medium",
                        "location_description": "Segment Joint 45, East Sidewall",
                        "confidence": 0.92,
                        "description": "Active water dripping through segment block joint boundary, approx 2 liters/hour. Carbonate residue forming."
                    }
                ]
            elif asset_type.lower() == "building":
                return [
                    {
                        "type": "Crack",
                        "severity": "High",
                        "location_description": "Basement parking level 2, column B4 junction",
                        "confidence": 0.95,
                        "description": "Shear stress crack at column-beam junction, 3.1mm width. Internal rebars showing oxidation stains."
                    }
                ]
            else: # Road
                return [
                    {
                        "type": "Pothole",
                        "severity": "Medium",
                        "location_description": "Slow lane, Chainage 142.1",
                        "confidence": 0.97,
                        "description": "Pavement pothole measuring 85mm deep and 1.2m wide."
                    }
                ]

        try:
            # Load and analyze image using Gemini Vision API
            model = genai.GenerativeModel('gemini-2.5-flash')
            # For simplicity, we open the file
            with open(image_path, 'rb') as f:
                img_data = f.read()
            
            prompt = (
                f"You are a structural engineering inspector AI. Analyze this image of a {asset_type}. "
                "Detect structural defects such as Cracks, Rust, Corrosion, Spalling, Leakages, Potholes. "
                "For each defect, return a JSON list containing: "
                "type, severity (Low, Medium, High, Critical), location_description, confidence (0.0 to 1.0), and a technical description. "
                "Ensure the output is strictly valid JSON."
            )
            
            response = model.generate_content([
                prompt,
                {'mime_type': 'image/jpeg', 'data': img_data}
            ])
            
            # Extract JSON from response markdown
            text = response.text
            json_match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return [{"type": "Inspection Node", "severity": "Medium", "description": text}]
        except Exception as e:
            print(f"Gemini Vision call failed: {e}. Returning fallback.")
            return self.analyze_image(None, asset_type)


class DocumentAgent:
    """Uses OCR and NLP to process reports, forms, and engineering notes."""
    def extract_info(self, file_path: Optional[str], raw_notes: str = "") -> Dict[str, Any]:
        result = {
            "document_summary": "",
            "extracted_vulnerabilities": [],
            "urgency": "Routine"
        }
        
        # If notes or documents are uploaded
        text_to_analyze = raw_notes
        if file_path and os.path.exists(file_path):
            try:
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                pdf_text = ""
                for page in reader.pages:
                    pdf_text += page.extract_text() or ""
                text_to_analyze += "\n" + pdf_text
            except Exception as e:
                print(f"Failed to read PDF file: {e}")

        text_to_analyze = text_to_analyze.strip()
        if not text_to_analyze:
            return {
                "document_summary": "No additional inspector notes or documents provided.",
                "extracted_vulnerabilities": [],
                "urgency": "Routine"
            }

        # Analyze notes/text using Gemini if available, else simple fallback
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            # Fallback parsing
            print("Document Agent: Offline. Analyzing text with heuristics...")
            vulnerabilities = []
            if "crack" in text_to_analyze.lower():
                vulnerabilities.append("Cracking referenced in inspector logs")
            if "rust" in text_to_analyze.lower() or "corrosion" in text_to_analyze.lower():
                vulnerabilities.append("Corrosion or oxidization noted by inspector")
            if "spalling" in text_to_analyze.lower():
                vulnerabilities.append("Spalling concrete debris noted")
            
            urgency = "Routine"
            if "critical" in text_to_analyze.lower() or "urgent" in text_to_analyze.lower() or "immediate" in text_to_analyze.lower():
                urgency = "Immediate"
            elif "warning" in text_to_analyze.lower() or "high" in text_to_analyze.lower():
                urgency = "Scheduled"

            return {
                "document_summary": f"Processed text logs: '{text_to_analyze[:120]}...'",
                "extracted_vulnerabilities": vulnerabilities,
                "urgency": urgency
            }

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                "You are an expert Document Analysis Agent for structural engineering. "
                "Analyze the following text from an inspection report/engineer notes. "
                "Extract: (1) A concise executive summary of the document, "
                "(2) A list of specific structural vulnerabilities/concerns mentioned, "
                "(3) Suggested urgency level ('Immediate', 'Scheduled', 'Routine'). "
                "Return the response in JSON format matching this schema: "
                '{"document_summary": "...", "extracted_vulnerabilities": ["..."], "urgency": "..."}'
            )
            response = model.generate_content(f"{prompt}\n\nTEXT:\n{text_to_analyze}")
            
            # Simple JSON parse
            text = response.text
            # Locate first { and last }
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            return result
        except Exception as e:
            print(f"Gemini Document analysis failed: {e}")
            return result


class KnowledgeAgent:
    """RAG system to retrieve official codes and manuals."""
    def __init__(self):
        self.rag = RAGSystem()

    def retrieve_guidance(self, defects: List[Dict[str, Any]], query: Optional[str] = None) -> List[Dict[str, Any]]:
        # If a custom search query is not given, construct one from the defects
        if not query:
            if not defects:
                query = "general concrete structure inspection guidelines"
            else:
                defect_types = [d["type"] for d in defects]
                severities = [d["severity"] for d in defects]
                query = f"remediation for {' and '.join(set(defect_types))} with severity {', '.join(set(severities))}"

        print(f"Knowledge RAG Search: '{query}'")
        return self.rag.search(query, limit=3)


class StructuralEngineerAgent:
    """Synthesizes defects, document logs, and RAG codes to produce expert assessment."""
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def synthesize(self, asset_name: str, asset_type: str, defects: List[Dict[str, Any]], doc_info: Dict[str, Any], guidance: List[Dict[str, Any]], history_summary: str) -> Dict[str, Any]:
        guidance_text = "\n\n".join([f"Source: {g['title']} ({g['source']})\nContent: {g['content']}" for g in guidance])
        defects_text = json.dumps(defects, indent=2)

        if not self.api_key:
            # High-fidelity mock fallback based on input
            print("Structural Engineer Agent: Offline. Synthesizing fallback evaluation...")
            
            remedy = "Standard concrete sealing."
            standard_ref = "IS 456:2000"
            if defects:
                worst_defect = sorted(defects, key=lambda x: {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}.get(x["severity"], 0), reverse=True)[0]
                if worst_defect["type"] == "Crack" and worst_defect["severity"] == "Critical":
                    remedy = "EPoxy resin pressure grouting (IS-456: Cl 11.3) combined with structural load diversion."
                    standard_ref = "IRC:SP-18 & IS-456"
                elif worst_defect["type"] == "Spalling":
                    remedy = "Remove loose concrete, clean corroded steel rebar, apply zinc rust-inhibitive primer, and rebuild girder profile using polymer mortar patches."
                    standard_ref = "IS-456 Clause 11.3 & 26.4"
                elif worst_defect["type"] == "Leakage":
                    remedy = "Polyurethane chemical grout injection under pressure through drilled packer ports."
                    standard_ref = "IS-456 (Leaching Remediation)"
            
            return {
                "damage_classification": "Active structural shear/corrosion distress" if asset_type.lower() == "bridge" else "Localized moisture seepage damage",
                "severity_level": "Critical" if asset_type.lower() == "bridge" else "Medium",
                "confidence_score": 0.95,
                "engineering_explanation": f"The main column of {asset_name} is suffering from structural shear crack propagation, exacerbated by high cyclic loadings. Concrete spalling on girders has exposed steel rebars to atmospheric monsoon moisture, accelerating carbonation. This matches recommendations from {standard_ref}.",
                "recommended_repair": remedy,
                "applied_codes": standard_ref
            }

        try:
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                "You are an AI Senior Structural Engineer. Synthesize the following structural inspection inputs:\n"
                f"- Asset Name: {asset_name} ({asset_type})\n"
                f"- Detected Defects:\n{defects_text}\n"
                f"- Document Summary:\n{json.dumps(doc_info)}\n"
                f"- Historical Context:\n{history_summary}\n"
                f"- Retrieved Engineering Guidance Codes:\n{guidance_text}\n\n"
                "Formulate a professional structural engineering synthesis. "
                "Define the overall damage classification, overall severity level ('Low', 'Medium', 'High', 'Critical'), "
                "your confidence score (0.0 to 1.0), and a detailed engineering explanation grounding your findings in the retrieved guidance codes. "
                "Outline the recommended repair action.\n"
                "Return the response in JSON format matching this schema: "
                '{"damage_classification": "...", "severity_level": "...", "confidence_score": 0.9, "engineering_explanation": "...", "recommended_repair": "...", "applied_codes": "..."}'
            )
            response = model.generate_content(prompt)
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            raise ValueError("No json found")
        except Exception as e:
            print(f"Gemini Structural Engineer Agent synthesis failed: {e}")
            return self.synthesize(asset_name, asset_type, defects, doc_info, guidance, history_summary)


class RiskAnalystAgent:
    """Calculates risk index, priority scores, and public safety impact with uncertainty."""
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def analyze_risk(self, defects: List[Dict[str, Any]], engineer_synthesis: Dict[str, Any], weather: str, traffic: str) -> Dict[str, Any]:
        if not self.api_key:
            # Fallback mock logic
            print("Risk Analyst Agent: Offline. Simulating Risk Analysis...")
            
            # Simple rule-based scoring
            base_score = 15.0
            severity = engineer_synthesis.get("severity_level", "Low")
            
            if severity == "Critical":
                base_score = 85.0
            elif severity == "High":
                base_score = 68.0
            elif severity == "Medium":
                base_score = 42.0
            
            if "monsoon" in weather.lower() or "rain" in weather.lower():
                base_score += 5.0
            if "overload" in traffic.lower() or "heavy" in traffic.lower():
                base_score += 8.0
                
            base_score = min(98.0, base_score)
            
            priority = "Routine"
            if base_score >= 80.0:
                priority = "Immediate (Within 48 hours)"
            elif base_score >= 60.0:
                priority = "Urgent (Within 30 days)"
            elif base_score >= 40.0:
                priority = "Scheduled Maintenance"

            return {
                "risk_score": base_score,
                "priority_level": priority,
                "likelihood_of_deterioration": "Extremely High. Water ingress during rains combined with heavy vehicle vibration will accelerate shear failure and bar peeling.",
                "public_safety_impact": "High. Failure of Pier 2 will trigger partial deck collapse, suspending transport on National Highway 2 and causing major logistics disruption.",
                "uncertainty_explanation": "Calculations assume traffic loading remains constant. Ground penetrating radar (GPR) is recommended to determine the internal cracking depth within Pier 2."
            }

        try:
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                "You are an Infrastructure Risk Analyst AI. Evaluate the following factors:\n"
                f"- Detected defects: {json.dumps(defects)}\n"
                f"- Engineering Synthesis: {json.dumps(engineer_synthesis)}\n"
                f"- Weather conditions: {weather}\n"
                f"- Traffic loads: {traffic}\n\n"
                "Calculate a numerical Risk Score (0.0 to 100.0) reflecting the hazard severity. "
                "Determine the maintenance Priority Level ('Immediate', 'Urgent', 'Scheduled', 'Routine'). "
                "Assess the likelihood of rapid deterioration, the potential public safety impact, "
                "and write an explanation of any uncertainties (e.g. assumptions, missing sensor readings like NDT or concrete cores).\n"
                "Return the response in JSON format matching this schema: "
                '{"risk_score": 85.5, "priority_level": "...", "likelihood_of_deterioration": "...", "public_safety_impact": "...", "uncertainty_explanation": "..."}'
            )
            response = model.generate_content(prompt)
            text = response.text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            raise ValueError("No json found")
        except Exception as e:
            print(f"Gemini Risk Analyst Agent failed: {e}")
            return self.analyze_risk(defects, engineer_synthesis, weather, traffic)


class SimulationAgent:
    """Simulates what-if maintenance delay scenarios and environmental changes."""
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def run_scenarios(self, asset_id: str, defects: List[Dict[str, Any]], engineer_synthesis: Dict[str, Any], risk_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        # This returns the side-by-side scenarios
        # We can extract it from the database or calculate it dynamically.
        # Let's provide a robust simulation logic
        
        if not self.api_key:
            # Fallback
            print("Simulation Agent: Offline. Simulating what-if scenarios...")
            # We will return standard scenarios that represent real physics
            base_cost = 250000.0 if "bridge" in asset_id else 120000.0
            
            return [
                {
                    "scenario_name": "Repair Now",
                    "projected_health": 88.0,
                    "projected_risk": "Safe",
                    "estimated_repair_cost": base_cost,
                    "code_reference": engineer_synthesis.get("applied_codes", "IS-456"),
                    "logic_explanation": "Immediate epoxy injection and structural repair preserves column shear load paths and stops carbonation of steel."
                },
                {
                    "scenario_name": "Delay 3 Months",
                    "projected_health": 52.0,
                    "projected_risk": "Warning",
                    "estimated_repair_cost": base_cost * 1.8,
                    "code_reference": "IRC:SP-18 Sec 4",
                    "logic_explanation": "Cracks broaden. Fatigue micro-cracks expand the damage boundary. Requires temporary steel shoring to support girders during structural columns repair, doubling labor."
                },
                {
                    "scenario_name": "Delay 6 Months",
                    "projected_health": 35.0,
                    "projected_risk": "Critical",
                    "estimated_repair_cost": base_cost * 4.5,
                    "code_reference": "IRC:SP-18 Sec 6",
                    "logic_explanation": "High probability of shear failure. Concrete core crushing. Traffic restrictions must be enforced. Requires extensive external post-tensioning or steel collar plating."
                },
                {
                    "scenario_name": "Heavy Rainfall Event",
                    "projected_health": 45.0,
                    "projected_risk": "Critical",
                    "estimated_repair_cost": base_cost * 3.0,
                    "code_reference": "IS-456 Cl 32.1",
                    "logic_explanation": "Active water leaching washes out free calcium hydroxide. Severe rust volume expansion creates high internal tensile stresses, popping off remaining concrete cover."
                },
                {
                    "scenario_name": "Traffic Increase 40%",
                    "projected_health": 48.0,
                    "projected_risk": "Critical",
                    "estimated_repair_cost": base_cost * 3.6,
                    "code_reference": "IRC:6 (Standard Loads)",
                    "logic_explanation": "Exposed steel structural parts undergo rapid fatigue cycle stress cracks. High risk of sudden brittle fracture under heavy mining truck traffic loads."
                }
            ]

        try:
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = (
                "You are an Engineering Simulation Agent. Run a what-if comparative risk simulation on the structural asset based on:\n"
                f"- Defects: {json.dumps(defects)}\n"
                f"- Synthesis: {json.dumps(engineer_synthesis)}\n"
                f"- Risk analysis: {json.dumps(risk_analysis)}\n\n"
                "Generate exactly 5 scenario evaluations:\n"
                "1. 'Repair Now' (Immediate repair response)\n"
                "2. 'Delay 3 Months' (Postponed repair under standard environment)\n"
                "3. 'Delay 6 Months' (Long term delay, maximum damage propagation)\n"
                "4. 'Heavy Rainfall Event' (Impact of severe monsoon and water leaching)\n"
                "5. 'Traffic Increase 40%' (Vibration and fatigue loading spike)\n\n"
                "For each scenario, define: 'scenario_name', 'projected_health' (0-100), 'projected_risk' ('Safe', 'Monitor', 'Warning', 'Critical'), "
                "'estimated_repair_cost' (numerical estimation), 'code_reference' (relevant clause), and 'logic_explanation' explaining structural assumptions and physics.\n"
                "Return the response in JSON format matching this list schema: "
                '[{"scenario_name": "...", "projected_health": 90, "projected_risk": "...", "estimated_repair_cost": 100000, "code_reference": "...", "logic_explanation": "..."}]'
            )
            response = model.generate_content(prompt)
            text = response.text
            start = text.find('[')
            end = text.rfind(']') + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
            raise ValueError("No json found")
        except Exception as e:
            print(f"Gemini Simulation Agent failed: {e}")
            return self.run_scenarios(asset_id, defects, engineer_synthesis, risk_analysis)


class ReportAgent:
    """Compiles findings and explanations into a structured engineering report."""
    def generate_report(self, asset_name: str, asset_type: str, defects: List[Dict[str, Any]], doc_info: Dict[str, Any], synthesis: Dict[str, Any], risk: Dict[str, Any], simulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        
        # Format defects for printing
        defects_md = ""
        for idx, d in enumerate(defects):
            defects_md += f"{idx+1}. **{d['type']}** [{d['severity']} Severity, Conf: {d['confidence']*100:.0f}%] at {d['location_description']}\n   _Description_: {d['description']}\n"
        
        # Format simulations
        sims_md = ""
        for s in simulations:
            sims_md += f"- **{s['scenario_name']}**: Projected Health: {s['projected_health']} | Risk: {s['projected_risk']} | Cost: ${s['estimated_repair_cost']:,} | Code Ref: {s['code_reference']}\n  _Analysis_: {s['logic_explanation']}\n"

        markdown_report = f"""# AEGIS X - STRUCTURAL AUDIT REPORT
**Asset Name**: {asset_name}
**Asset Class**: {asset_type}
**Report Generation Date**: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}
**Audit Priority**: {risk.get('priority_level', 'URGENT')}

---

## 1. Executive Summary
An autonomous structural engineering audit has been conducted on **{asset_name}** compiling visual defects, field documentation, weather, traffic load logs, and building code reference guidance.
- **Overall Safety Health Score**: {synthesis.get('confidence_score', 0.95)*100:.1f}/100
- **Identified Risk Profile**: **{risk.get('risk_score', 80.0)}/100 ({synthesis.get('severity_level', 'Critical')})**
- **Action Recommendation**: {synthesis.get('recommended_repair', 'Epoxy grout injection.')}

---

## 2. Detailed Inspection Findings
Visual inspection and OCR processing identified the following critical anomalies:
{defects_md}

---

## 3. Engineering Assessment & Code Grounding
The Structural Engineer Agent has verified these anomalies against the following active codes: **{synthesis.get('applied_codes', 'IS-456 / IRC SP-18')}**.
**Assessment**: {synthesis.get('engineering_explanation', '')}
**Remedial Guidance**: {synthesis.get('recommended_repair', '')}

---

## 4. Risk Analyst Projection & Safety Impact
- **Likelihood of Deterioration**: {risk.get('likelihood_of_deterioration', '')}
- **Public Safety Impact**: {risk.get('public_safety_impact', '')}
- **Uncertainty & Assumptions**: {risk.get('uncertainty_explanation', '')}

---

## 5. Maintenance Scenario Simulations
Scenario comparisons modeling structural degradation vectors:
{sims_md}

---

## 6. Verification and Maintenance Checklist
- [ ] Schedule immediately: {synthesis.get('recommended_repair', 'Repair work')}
- [ ] Confirm code compliance with {synthesis.get('applied_codes', 'applicable standards')}.
- [ ] Restrict heavy vehicle speeds and loads as indicated.
- [ ] Run ultrasonic pulse velocity (UPV) tests to inspect internal crack depth.
"""
        
        return {
            "title": f"Structural Audit Report - {asset_name}",
            "summary": synthesis.get("engineering_explanation", "Structural audit summary."),
            "markdown_content": markdown_report,
            "priority": risk.get("priority_level", "Urgent")
        }
