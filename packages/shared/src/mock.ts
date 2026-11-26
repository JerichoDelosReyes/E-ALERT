// Mock data for the Phase 1 UI shell. Locations are in the City of Imus, Cavite.
// Replaced by Firestore in Phase 2.

import type {
  ChatMessage,
  ChatThread,
  EvacuationCenter,
  Hotline,
  Incident,
  LatLng,
  Person,
  Responder,
  VerificationRequest,
} from './types';

export const IMUS_CENTER: LatLng = { lat: 14.4297, lng: 120.9367 };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const me = {
  id: 'u-001',
  firstName: 'Jericho',
  name: 'Jericho Delos Reyes',
  initials: 'JD',
  barangay: 'Bayan Luma IV',
  location: { lat: 14.4285, lng: 120.9392 } as LatLng,
  verified: true,
  medical: {
    bloodType: 'O+',
    allergies: ['Penicillin'],
    conditions: ['Asthma'],
    medications: ['Salbutamol inhaler'],
    shareWithResponder: true,
  },
};

export const contacts: Person[] = [
  { id: 'c1', name: 'Maria Delos Reyes', initials: 'MD', phone: '+63 917 555 0142', relation: 'Mother' },
  { id: 'c2', name: 'Paolo Santos', initials: 'PS', phone: '+63 928 555 0187', relation: 'Brother' },
  { id: 'c3', name: 'Andrea Cruz', initials: 'AC', phone: '+63 915 555 0133', relation: 'Partner' },
  { id: 'c4', name: 'Kap. Ramon Villanueva', initials: 'RV', phone: '+63 46 555 0110', relation: 'Barangay Captain' },
];

export const responders: Responder[] = [
  { id: 'r1', name: 'PO2 Mark Bautista', initials: 'MB', department: 'PNP', tier: 1, availability: 'available', location: { lat: 14.4321, lng: 120.9411 }, barangay: 'Poblacion I-A' },
  { id: 'r2', name: 'FO1 Liza Ramos', initials: 'LR', department: 'BFP', tier: 1, availability: 'busy', location: { lat: 14.4198, lng: 120.9352 }, barangay: 'Medicion II-A' },
  { id: 'r3', name: 'Nurse Joy Aquino', initials: 'JA', department: 'Medical', tier: 1, availability: 'available', location: { lat: 14.4262, lng: 120.9441 }, barangay: 'Bayan Luma VII' },
  { id: 'r4', name: 'Arnel Dizon', initials: 'AD', department: 'CDRRMO', tier: 1, availability: 'available', location: { lat: 14.4102, lng: 120.9288 }, barangay: 'Anabu I-B' },
  { id: 'r5', name: 'Tanod Ben Castro', initials: 'BC', department: 'Barangay', tier: 2, availability: 'available', location: { lat: 14.4279, lng: 120.9375 }, barangay: 'Bayan Luma IV' },
  { id: 'r6', name: 'BHW Rosa Mendoza', initials: 'RM', department: 'Barangay', tier: 2, availability: 'off_duty', location: { lat: 14.4355, lng: 120.9321 }, barangay: 'Toclong I-A' },
  { id: 'r7', name: 'SPO1 Carlo Reyes', initials: 'CR', department: 'PNP', tier: 1, availability: 'available', location: { lat: 14.4012, lng: 120.9412 }, barangay: 'Malagasang I-A' },
  { id: 'r8', name: 'EMT Ivy Navarro', initials: 'IN', department: 'Medical', tier: 1, availability: 'busy', location: { lat: 14.4412, lng: 120.9398 }, barangay: 'Alapan I-A' },
];

export const incidents: Incident[] = [
  {
    id: 'INC-2611-0042',
    category: 'medical',
    status: 'en_route',
    location: { lat: 14.4285, lng: 120.9392 },
    barangay: 'Bayan Luma IV',
    landmark: 'Beside Imus Cathedral, blue gate',
    reporterName: 'Jericho Delos Reyes',
    reportCount: 1,
    confirmations: 2,
    priority: 72,
    createdAt: minutesAgo(4),
    responderId: 'r3',
    etaMinutes: 3,
    distanceKm: 0.9,
    events: [
      { at: minutesAgo(4), status: 'sent', note: 'SOS sent with your location' },
      { at: minutesAgo(3.6), status: 'assigned', note: 'Nurse Joy Aquino accepted' },
      { at: minutesAgo(3.2), status: 'en_route', note: 'Responder is on the way' },
    ],
  },
  {
    id: 'INC-2611-0041',
    category: 'fire',
    status: 'arrived',
    location: { lat: 14.4198, lng: 120.9352 },
    barangay: 'Medicion II-A',
    landmark: 'Row houses behind the public market',
    reporterName: 'Lorna Pascual',
    reportCount: 5,
    confirmations: 9,
    priority: 94,
    createdAt: minutesAgo(18),
    responderId: 'r2',
    distanceKm: 1.4,
    events: [
      { at: minutesAgo(18), status: 'sent', note: 'SOS sent' },
      { at: minutesAgo(17), status: 'assigned', note: 'FO1 Liza Ramos accepted' },
      { at: minutesAgo(9), status: 'arrived', note: 'Responder on scene' },
    ],
  },
  {
    id: 'INC-2611-0040',
    category: 'police',
    status: 'sent',
    location: { lat: 14.4301, lng: 120.9403 },
    barangay: 'Bayan Luma IV',
    landmark: 'Near 7-Eleven, Nueno Ave',
    reporterName: 'Dennis Uy',
    reportCount: 2,
    confirmations: 1,
    priority: 61,
    createdAt: minutesAgo(1),
    distanceKm: 0.2,
    events: [{ at: minutesAgo(1), status: 'sent', note: 'Finding the nearest responder' }],
  },
  {
    id: 'INC-2611-0039',
    category: 'disaster',
    status: 'escalated',
    location: { lat: 14.4071, lng: 120.9261 },
    barangay: 'Anabu II-D',
    landmark: 'Flooded underpass, knee-deep',
    reporterName: 'Grace Lim',
    reportCount: 7,
    confirmations: 14,
    priority: 88,
    createdAt: minutesAgo(26),
    distanceKm: 3.1,
    events: [
      { at: minutesAgo(26), status: 'sent', note: 'SOS sent' },
      { at: minutesAgo(25), status: 'escalated', note: 'No Tier 1 accepted in time, escalated to Tier 2' },
    ],
  },
  {
    id: 'INC-2611-0038',
    category: 'medical',
    status: 'resolved',
    location: { lat: 14.4415, lng: 120.9312 },
    barangay: 'Toclong II-A',
    landmark: 'Basketball court',
    reporterName: 'Mika Torres',
    reportCount: 1,
    confirmations: 0,
    priority: 40,
    createdAt: minutesAgo(64),
    responderId: 'r8',
    events: [
      { at: minutesAgo(64), status: 'sent', note: 'SOS sent' },
      { at: minutesAgo(63), status: 'assigned', note: 'EMT Ivy Navarro accepted' },
      { at: minutesAgo(52), status: 'arrived', note: 'Responder on scene' },
      { at: minutesAgo(31), status: 'resolved', note: 'Patient brought to hospital' },
    ],
  },
];

/** The offer the responder screen shows (thesis Scope 4). */
export const pendingOffer: Incident = {
  id: 'INC-2611-0043',
  category: 'medical',
  status: 'sent',
  location: { lat: 14.4251, lng: 120.9418 },
  barangay: 'Bayan Luma VII',
  landmark: 'Green sari-sari store, corner of Nueno Ave',
  reporterName: 'Elena Garcia',
  reportCount: 2,
  confirmations: 3,
  priority: 79,
  createdAt: minutesAgo(0.2),
  distanceKm: 1.2,
  etaMinutes: 4,
  events: [{ at: minutesAgo(0.2), status: 'sent', note: 'SOS sent' }],
};

export const evacuationCenters: EvacuationCenter[] = [
  { id: 'e1', name: 'Imus Sports Complex', location: { lat: 14.4247, lng: 120.9407 }, capacity: 800, occupied: 312 },
  { id: 'e2', name: 'Imus Pilot Elementary School', location: { lat: 14.4302, lng: 120.9388 }, capacity: 450, occupied: 418 },
  { id: 'e3', name: 'Anabu Covered Court', location: { lat: 14.4089, lng: 120.9301 }, capacity: 250, occupied: 64 },
];

export const hotlines: Hotline[] = [
  { id: 'h1', name: 'Emergency hotline', number: '911', category: 'general' },
  { id: 'h2', name: 'Imus CDRRMO', number: '(046) 471 6066', category: 'disaster' },
  { id: 'h3', name: 'BFP Imus', number: '(046) 471 0062', category: 'fire' },
  { id: 'h4', name: 'PNP Imus', number: '(046) 471 2264', category: 'police' },
  { id: 'h5', name: 'Imus Doctors Hospital', number: '(046) 471 3333', category: 'medical' },
];

export const verificationQueue: VerificationRequest[] = [
  { id: 'v1', name: 'Kristine Joy Manalo', initials: 'KM', kind: 'resident_id', document: 'PhilSys National ID', submittedAt: minutesAgo(12), state: 'pending' },
  { id: 'v2', name: 'Rogelio Ferrer', initials: 'RF', kind: 'responder_credential', document: 'Red Cross First Aid Certificate', department: 'Barangay', submittedAt: minutesAgo(48), state: 'pending' },
  { id: 'v3', name: 'Janelle Ocampo', initials: 'JO', kind: 'resident_id', document: "Driver's License", submittedAt: minutesAgo(95), state: 'pending' },
  { id: 'v4', name: 'FO2 Daniel Yap', initials: 'DY', kind: 'responder_credential', document: 'BFP Service ID', department: 'BFP', submittedAt: minutesAgo(130), state: 'pending' },
];

/** Synthetic historical points for the dashboard heatmap and analytics. */
export function historicalPoints(count = 400, seed = 7): (LatLng & { category: Incident['category']; hour: number; barangay: string })[] {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const hubs = [
    { lat: 14.4198, lng: 120.9352, w: 0.3, b: 'Medicion II-A' },
    { lat: 14.4285, lng: 120.9392, w: 0.25, b: 'Bayan Luma IV' },
    { lat: 14.4071, lng: 120.9261, w: 0.2, b: 'Anabu II-D' },
    { lat: 14.4415, lng: 120.9312, w: 0.15, b: 'Toclong II-A' },
    { lat: 14.4012, lng: 120.9412, w: 0.1, b: 'Malagasang I-A' },
  ];
  const cats: Incident['category'][] = ['medical', 'medical', 'police', 'fire', 'disaster'];
  return Array.from({ length: count }, () => {
    let r = rand();
    const hub = hubs.find((h) => (r -= h.w) <= 0) ?? hubs[0];
    const spread = 0.006;
    const hour = Math.floor((rand() + rand() + rand()) / 3 * 24);
    return {
      lat: hub.lat + (rand() - 0.5) * spread * 2,
      lng: hub.lng + (rand() - 0.5) * spread * 2,
      category: cats[Math.floor(rand() * cats.length)],
      hour,
      barangay: hub.b,
    };
  });
}

/* ───────── Chat (thesis Scope 3: in-app chat with the assigned responder) ───────── */

export const chatThreads: ChatThread[] = [
  { id: 't-0042', incidentId: 'INC-2611-0042', residentName: 'Jericho Delos Reyes', residentInitials: 'JD', responderId: 'r3', category: 'medical', active: true },
  { id: 't-0038', incidentId: 'INC-2611-0038', residentName: 'Jericho Delos Reyes', residentInitials: 'JD', responderId: 'r8', category: 'medical', active: false },
];

export const chatMessages: ChatMessage[] = [
  { id: 'm1', threadId: 't-0042', from: 'system', text: 'Nurse Joy Aquino accepted your alert', at: minutesAgo(3.6), read: true },
  { id: 'm2', threadId: 't-0042', from: 'resident', text: 'Please help ASAP!', at: minutesAgo(3.4), read: true },
  { id: 'm3', threadId: 't-0042', from: 'responder', text: 'On my way. Is the person conscious and breathing?', at: minutesAgo(3), read: false },
  { id: 'm4', threadId: 't-0038', from: 'system', text: 'EMT Ivy Navarro accepted your alert', at: minutesAgo(63), read: true },
  { id: 'm5', threadId: 't-0038', from: 'responder', text: 'We are at the basketball court now.', at: minutesAgo(52), read: true },
  { id: 'm6', threadId: 't-0038', from: 'resident', text: 'Thank you so much!', at: minutesAgo(31), read: true },
];

export const quickReplies = {
  resident: ['Please help ASAP!', 'I’m safe now', 'Need more time', 'I can’t talk, text only', 'The gate is blue'],
  responder: ['I’m 2 min away', 'Stay where you are', 'Can you come outside?', 'Is the person breathing?'],
} as const;

/** Demo-only canned replies, so the thread feels alive before Phase 2. */
export const demoReplies = {
  resident: ['Okay, thank you!', 'Yes, still here.', 'I’ll wait outside.'],
  responder: ['Got it. Stay on the line.', 'I’m almost there.', 'Keep the person still. Don’t give food or water.'],
} as const;
