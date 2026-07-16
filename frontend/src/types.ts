export interface Asset {
  id: string;
  name: string;
  type: string;
  location_gps: string;
  address?: string;
  description?: string;
  current_health_score: number;
  risk_level: 'Safe' | 'Monitor' | 'Warning' | 'Critical';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  asset_id: string;
  inspection_date: string;
  inspector_name: string;
  overall_risk_score: number;
  summary?: string;
  status: string;
  details_json?: any;
  report_pdf_path?: string;
  weather?: string;
  traffic_load?: string;
  created_at: string;
  defects?: Defect[];
  simulations?: Simulation[];
}

export interface Defect {
  id: string;
  inspection_id: string;
  asset_id: string;
  type: 'Crack' | 'Rust' | 'Spalling' | 'Pothole' | 'Leakage' | 'Deformation';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location_description?: string;
  confidence: number;
  description?: string;
  image_url?: string;
}

export interface AIMemory {
  id: string;
  asset_id: string;
  key: string;
  value_json: {
    deterioration_summary?: string;
    structural_criticality?: string;
    applied_codes?: string[];
    maintenance_warning?: string;
    last_inspection_logs?: Array<{
      timestamp: string;
      agent: string;
      message: string;
    }>;
  };
  updated_at: string;
}

export interface MaintenanceHistory {
  id: string;
  asset_id: string;
  repair_date: string;
  repair_type: string;
  cost: number;
  status: string;
  notes?: string;
}

export interface Simulation {
  id: string;
  inspection_id: string;
  asset_id: string;
  scenario_name: string;
  projected_health: number;
  projected_risk: string;
  estimated_repair_cost: number;
  code_reference?: string;
  logic_explanation?: string;
}

export interface AssetDetails extends Asset {
  inspections: Inspection[];
  memories: AIMemory[];
  maintenance: MaintenanceHistory[];
}
