// Design tokens shared by the mobile app and the dashboard.
// Brand = coral (from the reference). Urgency = Apple system colors.

import type { Category, IncidentStatus, Availability } from './types';

export const palette = {
  light: {
    bg: '#F5F3F0',
    bgGrouped: '#EFEDEA',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    fill: 'rgba(120,120,128,0.12)',
    fillStrong: 'rgba(120,120,128,0.20)',
    separator: 'rgba(60,60,67,0.18)',
    label: '#111114',
    secondaryLabel: 'rgba(60,60,67,0.72)',
    tertiaryLabel: 'rgba(60,60,67,0.45)',
    inverse: '#FFFFFF',
    brand: '#F0623F',
    brandSoft: '#FCE3DA',
    brandInk: '#B93B1D',
    /** Own chat bubble. White text = 4.78:1 (AA). */
    bubble: '#D03E24',
    sosFrom: '#F47A57',
    sosTo: '#E2482B',
    critical: '#FF3B30',
    warning: '#FF9500',
    safe: '#34C759',
    action: '#007AFF',
    info: '#5856D6',
    shadow: 'rgba(40,24,16,0.10)',
  },
  dark: {
    bg: '#000000',
    bgGrouped: '#0B0B0C',
    surface: '#1C1C1E',
    surfaceRaised: '#2C2C2E',
    fill: 'rgba(120,120,128,0.24)',
    fillStrong: 'rgba(120,120,128,0.36)',
    separator: 'rgba(84,84,88,0.55)',
    label: '#FFFFFF',
    secondaryLabel: 'rgba(235,235,245,0.68)',
    tertiaryLabel: 'rgba(235,235,245,0.38)',
    inverse: '#000000',
    brand: '#FF7552',
    brandSoft: '#3A1E16',
    brandInk: '#FFB39E',
    bubble: '#D03E24',
    sosFrom: '#FF8A66',
    sosTo: '#E5502F',
    critical: '#FF453A',
    warning: '#FF9F0A',
    safe: '#30D158',
    action: '#0A84FF',
    info: '#5E5CE6',
    shadow: 'rgba(0,0,0,0.5)',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type Palette = { [K in keyof (typeof palette)['light']]: string };

/** iOS type ramp (points). */
export const type = {
  largeTitle: { size: 34, line: 41, weight: '700' },
  title1: { size: 28, line: 34, weight: '700' },
  title2: { size: 22, line: 28, weight: '700' },
  title3: { size: 20, line: 25, weight: '600' },
  headline: { size: 17, line: 22, weight: '600' },
  body: { size: 17, line: 22, weight: '400' },
  callout: { size: 16, line: 21, weight: '400' },
  subhead: { size: 15, line: 20, weight: '400' },
  footnote: { size: 13, line: 18, weight: '400' },
  caption: { size: 12, line: 16, weight: '500' },
} as const;

export type TypeStyle = keyof typeof type;

export const radius = { sm: 12, md: 20, lg: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

/** Minimum hit target (Apple HIG). */
export const HIT = 44;

type Meta = { label: string; sf: string; ion: string; color: keyof Palette };

export const categoryMeta: Record<Category, Meta> = {
  police: { label: 'Police', sf: 'shield.lefthalf.filled', ion: 'shield-half', color: 'action' },
  fire: { label: 'Fire', sf: 'flame.fill', ion: 'flame', color: 'critical' },
  medical: { label: 'Medical', sf: 'cross.case.fill', ion: 'medkit', color: 'safe' },
  disaster: { label: 'Disaster', sf: 'water.waves', ion: 'water', color: 'info' },
};

export const statusMeta: Record<IncidentStatus, Meta> = {
  sent: { label: 'Alert sent', sf: 'paperplane.fill', ion: 'paper-plane', color: 'warning' },
  assigned: { label: 'Responder assigned', sf: 'person.fill.checkmark', ion: 'person', color: 'action' },
  en_route: { label: 'On the way', sf: 'car.fill', ion: 'car', color: 'action' },
  arrived: { label: 'Arrived', sf: 'mappin.circle.fill', ion: 'location', color: 'safe' },
  resolved: { label: 'Resolved', sf: 'checkmark.circle.fill', ion: 'checkmark-circle', color: 'safe' },
  escalated: { label: 'Escalated', sf: 'exclamationmark.triangle.fill', ion: 'warning', color: 'critical' },
};

export const availabilityMeta: Record<Availability, Meta> = {
  available: { label: 'Available', sf: 'checkmark.circle.fill', ion: 'checkmark-circle', color: 'safe' },
  busy: { label: 'On a call', sf: 'clock.fill', ion: 'time', color: 'warning' },
  off_duty: { label: 'Off duty', sf: 'moon.fill', ion: 'moon', color: 'secondaryLabel' },
};

/** Thesis Scope 11. */
export const ASSIGNMENT = {
  acceptTimeoutSec: 30,
  tier1RadiusKm: 10,
  tier2RadiusKm: 3,
  mergeRadiusM: 200,
  mergeWindowMin: 2,
  confirmRadiusM: 300,
  sosTaps: 3,
  sosCancelSec: 5,
} as const;

/**
 * Chart identity colors per category. Order is fixed (police, medical,
 * disaster, fire) so red never sits beside green. Validated with the dataviz
 * palette checker in both modes (all checks PASS).
 */
export const chartCategory = {
  order: ['police', 'medical', 'disaster', 'fire'] as Category[],
  light: { police: '#007AFF', medical: '#248A3D', disaster: '#5856D6', fire: '#FF3B30' },
  dark: { police: '#0A84FF', medical: '#2FB04F', disaster: '#5E5CE6', fire: '#FF453A' },
} as const;
