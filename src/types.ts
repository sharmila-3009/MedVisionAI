export interface TimingInfo {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  notes: string;
}

export interface MedicineScan {
  id: string;
  identified?: boolean;
  medicine_name: string;
  generic_name: string;
  dosage: string;
  timing: TimingInfo;
  uses: string;
  expiry: string;
  expiry_status: 'Valid' | 'Expiring Soon' | 'Expired';
  side_effects: string[];
  warning: string;
  drug_interactions: string;
  speech_summary: string;
  scan_time: string;
  image_url?: string;
  confidence?: string;
  latencyMs?: number;
}

export interface ReminderItem {
  id: string;
  medicine_name: string;
  dosage: string;
  time_slot: 'Morning' | 'Afternoon' | 'Night';
  time_exact: string;
  status: 'Completed' | 'Pending' | 'Missed';
  notes: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  blood_group: string;
  emergency_contact: string;
  allergies: string[];
  medical_conditions: string[];
  current_medicines: string[];
  caregiver_email: string;
}

export interface CaregiverAlert {
  id: string;
  level: 'warning' | 'info' | 'danger';
  message: string;
  timestamp: string;
}

export interface FamilyMonitoringData {
  elderly_name: string;
  compliance_rate: number;
  weekly_adherence: { day: string; taken: number; missed: number }[];
  todays_schedule: {
    medicine: string;
    time: string;
    status: 'Completed' | 'Pending' | 'Missed';
    time_taken?: string | null;
  }[];
  recent_alerts: CaregiverAlert[];
}
