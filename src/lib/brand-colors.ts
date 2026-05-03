/**
 * DGC CORE Brand Colors Utility
 * 
 * Official color palette for the DGC internal HR system.
 * Use these constants and Tailwind classes for consistent styling.
 */

// =============================================================================
// CORE BRAND COLORS (Hex Values)
// =============================================================================

export const DGC_COLORS = {
  // Primary Brand Colors
  deepGreen: '#0F2A28',
  gold: '#C6A45E',
  offWhite: '#F7F7F5',
  
  // Extended Palette
  teal: '#14B8A6',
  sage: '#6B8E7B',
  coral: '#F87171',
  amber: '#F59E0B',
  stone: '#78716C',
  rose: '#FB7185',
  emerald: '#10B981',
  
  // Muted Variants (for backgrounds)
  goldMuted: '#C6A45E33', // 20% opacity
  tealMuted: '#14B8A633',
  sageMuted: '#6B8E7B33',
  
  // Dark Gold (for text on gold backgrounds)
  goldDark: '#8B7035',
} as const;

// =============================================================================
// TAILWIND CLASS MAPPINGS
// =============================================================================

/**
 * Recommended Tailwind classes for each brand color.
 * Use these for consistent styling across components.
 */
export const BRAND_CLASSES = {
  // DGC Gold - Primary accent, CTAs, active states
  gold: {
    bg: 'bg-[#C6A45E]',
    bgMuted: 'bg-[#C6A45E]/20',
    text: 'text-[#C6A45E]',
    textDark: 'text-[#8B7035]',
    border: 'border-[#C6A45E]',
    ring: 'ring-[#C6A45E]',
  },
  
  // Teal - Info, scheduled, secondary accent
  teal: {
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-100',
    bgMuted: 'bg-teal-50',
    text: 'text-teal-600',
    textDark: 'text-teal-700',
    textLight: 'text-teal-800',
    border: 'border-teal-500',
    ring: 'ring-teal-500',
  },
  
  // Sage - Muted accents, documents, success states
  sage: {
    bg: 'bg-[#6B8E7B]',
    bgMuted: 'bg-[#6B8E7B]/20',
    text: 'text-[#6B8E7B]',
    border: 'border-[#6B8E7B]',
  },
  
  // Amber - Warnings, pending states, buddy icons
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-100',
    bgMuted: 'bg-amber-50',
    text: 'text-amber-600',
    textDark: 'text-amber-700',
    border: 'border-amber-500',
  },
  
  // Stone - Neutral info, employee counts
  stone: {
    bg: 'bg-stone-500',
    bgLight: 'bg-stone-100',
    bgMuted: 'bg-stone-50',
    text: 'text-stone-600',
    textDark: 'text-stone-700',
    border: 'border-stone-500',
  },
  
  // Rose/Coral - Soft accents for benefits, loans
  rose: {
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-100',
    bgMuted: 'bg-rose-50',
    text: 'text-rose-600',
    textDark: 'text-rose-700',
    border: 'border-rose-500',
  },
  
  // Emerald - Success states
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-100',
    bgMuted: 'bg-emerald-50',
    text: 'text-emerald-600',
    textDark: 'text-emerald-700',
    border: 'border-emerald-500',
  },
} as const;

// =============================================================================
// STATUS COLOR MAPPINGS
// =============================================================================

/**
 * Semantic status colors following DGC brand guidelines.
 * Use these for consistent status indicators across the app.
 */
export const STATUS_COLORS = {
  // Positive States
  success: BRAND_CLASSES.emerald,
  approved: BRAND_CLASSES.emerald,
  active: BRAND_CLASSES.emerald,
  completed: BRAND_CLASSES.emerald,
  
  // Warning States
  warning: BRAND_CLASSES.amber,
  pending: BRAND_CLASSES.amber,
  inProgress: BRAND_CLASSES.amber,
  
  // Info States
  info: BRAND_CLASSES.teal,
  scheduled: BRAND_CLASSES.teal,
  draft: BRAND_CLASSES.teal,
  
  // Neutral States
  inactive: BRAND_CLASSES.stone,
  cancelled: BRAND_CLASSES.stone,
  
  // Accent States
  highlight: BRAND_CLASSES.gold,
  primary: BRAND_CLASSES.gold,
} as const;

// =============================================================================
// CHART COLORS
// =============================================================================

/**
 * Color palette for charts and data visualizations.
 * Ordered by visual distinction for optimal chart readability.
 */
export const CHART_COLORS = [
  DGC_COLORS.gold,      // #C6A45E - Primary
  DGC_COLORS.teal,      // #14B8A6 - Secondary
  DGC_COLORS.sage,      // #6B8E7B - Tertiary
  DGC_COLORS.coral,     // #F87171 - Accent
  DGC_COLORS.amber,     // #F59E0B - Highlight
  DGC_COLORS.stone,     // #78716C - Neutral
  DGC_COLORS.emerald,   // #10B981 - Success
  DGC_COLORS.rose,      // #FB7185 - Soft accent
] as const;

// =============================================================================
// FORBIDDEN COLORS
// =============================================================================

/**
 * Colors that should NOT be used in the DGC CORE application.
 * These violate brand guidelines.
 */
export const FORBIDDEN_COLORS = [
  'purple', 'violet', 'fuchsia', 'indigo',
  'blue-400', 'blue-500', 'blue-600', 'blue-700',
  '#8b5cf6', '#6366f1', '#3b82f6', '#a855f7',
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Brand color class set type */
type BrandColorClasses = {
  bg: string;
  bgLight?: string;
  bgMuted: string;
  text: string;
  textDark?: string;
  border: string;
};

/**
 * Get the appropriate status color classes for a given status string.
 */
export function getStatusClasses(status: string): BrandColorClasses {
  const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '');
  
  const statusMap: Record<string, BrandColorClasses> = {
    success: BRAND_CLASSES.emerald,
    approved: BRAND_CLASSES.emerald,
    active: BRAND_CLASSES.emerald,
    completed: BRAND_CLASSES.emerald,
    paid: BRAND_CLASSES.emerald,
    
    warning: BRAND_CLASSES.amber,
    pending: BRAND_CLASSES.amber,
    inprogress: BRAND_CLASSES.amber,
    pendingapproval: BRAND_CLASSES.amber,
    pendinghr: BRAND_CLASSES.amber,
    pendingmanager: BRAND_CLASSES.amber,
    
    info: BRAND_CLASSES.teal,
    scheduled: BRAND_CLASSES.teal,
    draft: BRAND_CLASSES.teal,
    
    inactive: BRAND_CLASSES.stone,
    cancelled: BRAND_CLASSES.stone,
    rejected: BRAND_CLASSES.rose,
    error: BRAND_CLASSES.rose,
  };
  
  return statusMap[normalizedStatus] || BRAND_CLASSES.stone;
}

/**
 * Get a chart color by index (cycles through the palette).
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
