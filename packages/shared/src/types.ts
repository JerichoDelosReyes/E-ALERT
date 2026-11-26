// Domain types, from thesis Scope 1–8.

export type Role = 'resident' | 'responder' | 'hospital' | 'admin';

/** Tier 1 = official, Tier 2 = vetted volunteer, Tier 3 = citizen. */
export type Tier = 1 | 2 | 3;

export type Category = 'police' | 'fire' | 'medical' | 'disaster';

export type Department = 'PNP' | 'BFP' | 'Medical' | 'CDRRMO' | 'Barangay';

export type IncidentStatus =
  | 'sent'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'resolved'
  | 'escalated';

export type Availability = 'available' | 'busy' | 'off_duty';

export type VerificationState = 'pending' | 'approved' | 'rejected';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  /** Short label such as "Mother" or "Barangay Captain". */
  relation?: string;
  initials: string;
}

export interface Responder {
  id: string;
  name: string;
  initials: string;
  department: Department;
  tier: Exclude<Tier, 3>;
  availability: Availability;
  location: LatLng;
  barangay: string;
}

export interface IncidentEvent {
  at: string; // ISO time
  status: IncidentStatus;
  note: string;
}

export interface Incident {
  id: string;
  category: Category;
  status: IncidentStatus;
  location: LatLng;
  barangay: string;
  landmark: string;
  reporterName: string;
  reportCount: number;
  confirmations: number;
  priority: number; // 0–100
  createdAt: string;
  responderId?: string;
  etaMinutes?: number;
  distanceKm?: number;
  events: IncidentEvent[];
}

export interface EvacuationCenter {
  id: string;
  name: string;
  location: LatLng;
  capacity: number;
  occupied: number;
}

export interface VerificationRequest {
  id: string;
  name: string;
  initials: string;
  kind: 'resident_id' | 'responder_credential';
  document: string;
  department?: Department;
  submittedAt: string;
  state: VerificationState;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: Category | 'general';
}

export type ChatSender = 'resident' | 'responder' | 'system';

export interface ChatMessage {
  id: string;
  threadId: string;
  from: ChatSender;
  text: string;
  at: string;
  read?: boolean;
}

export interface ChatThread {
  id: string;
  incidentId: string;
  residentName: string;
  residentInitials: string;
  responderId: string;
  category: Category;
  active: boolean;
}
