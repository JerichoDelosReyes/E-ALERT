import type { IconName } from './Icon';

export type TabSpec = { name: string; label: string; icon: IconName };

/** Bottom padding so scroll content clears the floating tab bar. */
export const TAB_BAR_CLEARANCE = 110;
