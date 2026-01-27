/**
 * HRMS Design System Tokens
 * 
 * This file defines the centralized design tokens for consistent UI across
 * all breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (1024-1440px), Large (>1440px)
 */

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoints = {
  mobile: 640,      // < 640px
  tablet: 1024,     // 640px - 1024px
  desktop: 1440,    // 1024px - 1440px
  large: 1920,      // > 1440px
} as const;

// ============================================
// CONTAINER WIDTHS
// ============================================
export const containerWidths = {
  /** Maximum content width to prevent overly wide layouts on large monitors */
  maxContent: 'max-w-[1400px]',
  /** Full width container with proper padding */
  full: 'w-full',
  /** Standard page container classes */
  page: 'w-full max-w-[1400px] mx-auto',
} as const;

// ============================================
// PAGE PADDING - Applied to PageShell
// ============================================
export const pagePadding = {
  /** Mobile: 16px, Tablet: 24px, Desktop: 32px */
  horizontal: 'px-4 sm:px-6 lg:px-8',
  /** Vertical padding for page content */
  vertical: 'py-4 sm:py-6 lg:py-8',
  /** Combined page padding */
  all: 'px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8',
} as const;

// ============================================
// SPACING SCALE - Only use these values
// ============================================
export const spacing = {
  /** 4px - Minimal spacing */
  xs: 'gap-1',
  /** 8px - Tight spacing */
  sm: 'gap-2',
  /** 12px - Compact spacing */
  md: 'gap-3',
  /** 16px - Standard spacing */
  lg: 'gap-4',
  /** 24px - Comfortable spacing */
  xl: 'gap-6',
  /** 32px - Generous spacing */
  '2xl': 'gap-8',
  /** 48px - Section spacing */
  '3xl': 'gap-12',
} as const;

// Margin versions
export const margins = {
  section: 'mb-6 sm:mb-8',
  content: 'mb-4 sm:mb-6',
  element: 'mb-2 sm:mb-3',
} as const;

// ============================================
// TYPOGRAPHY - Consistent text styles
// ============================================
export const typography = {
  /** Page title - Main heading */
  pageTitle: 'text-xl sm:text-2xl font-semibold tracking-tight text-foreground',
  /** Page subtitle/description */
  pageSubtitle: 'text-sm sm:text-base text-muted-foreground',
  /** Section title within a page */
  sectionTitle: 'text-lg font-medium text-foreground',
  /** Section description */
  sectionDescription: 'text-sm text-muted-foreground',
  /** Card title */
  cardTitle: 'text-base font-medium tracking-tight text-foreground',
  /** Body text */
  body: 'text-sm sm:text-base text-foreground',
  /** Small body text */
  bodySmall: 'text-sm text-foreground',
  /** Helper/caption text */
  helper: 'text-xs text-muted-foreground',
  /** Label text */
  label: 'text-sm font-medium text-foreground',
} as const;

// ============================================
// DIALOG SIZES
// ============================================
export const dialogSizes = {
  /** 384px - Confirmations, simple alerts */
  sm: 'max-w-sm',
  /** 448px - Simple forms */
  md: 'max-w-md',
  /** 512px - Standard forms */
  lg: 'max-w-lg',
  /** 576px - Complex forms */
  xl: 'max-w-xl',
  /** 672px - Wizards, multi-step */
  '2xl': 'max-w-2xl',
  /** 768px - Previews, large content */
  '3xl': 'max-w-3xl',
  /** 896px - Full detail views */
  '4xl': 'max-w-4xl',
} as const;

// ============================================
// CARD STYLES - Consistent card appearance
// ============================================
export const cardStyles = {
  /** Standard card with border and shadow */
  base: 'bg-card text-card-foreground rounded-lg border border-border shadow-sm',
  /** Interactive card with hover state */
  interactive: 'bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  /** Muted card for secondary content */
  muted: 'bg-muted/50 text-card-foreground rounded-lg border border-border',
} as const;

// ============================================
// BUTTON SIZES - Touch-friendly on mobile
// ============================================
export const buttonSizes = {
  /** Standard button height */
  default: 'h-10',
  /** Small button */
  sm: 'h-9',
  /** Large/touch-friendly button (44px min for mobile) */
  lg: 'h-11',
  /** Icon button */
  icon: 'h-10 w-10',
  /** Mobile-optimized icon */
  iconLg: 'h-11 w-11',
} as const;

// ============================================
// INPUT STYLES - Consistent form inputs
// ============================================
export const inputStyles = {
  /** Standard input height */
  height: 'h-10',
  /** Label spacing above input */
  labelSpacing: 'mb-2',
  /** Helper text spacing below input */
  helperSpacing: 'mt-1.5',
  /** Error text style */
  errorText: 'text-xs text-destructive mt-1.5',
  /** Required field indicator */
  required: "after:content-['*'] after:ml-0.5 after:text-destructive",
} as const;

// ============================================
// TABLE STYLES
// ============================================
export const tableStyles = {
  /** Table header cell */
  headerCell: 'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
  /** Table body cell */
  bodyCell: 'p-4 align-middle',
  /** Table row hover */
  rowHover: 'hover:bg-muted/50 transition-colors',
  /** Minimum row height */
  rowHeight: 'h-14',
} as const;

// ============================================
// GRID LAYOUTS
// ============================================
export const gridLayouts = {
  /** Standard responsive grid */
  responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  /** Two column on desktop */
  twoColumn: 'grid grid-cols-1 md:grid-cols-2',
  /** Form grid - 2 columns on desktop */
  form: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
  /** Dashboard cards grid */
  dashboard: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
} as const;

// ============================================
// LAYOUT GRID - 8-Column Desktop System
// ============================================
export const layoutGrid = {
  /** Header height */
  headerHeight: {
    mobile: 'h-14',       // 56px
    tablet: 'h-16',       // 64px
    desktop: 'h-20',      // 80px
  },
  /** Sidebar width */
  sidebarWidth: {
    collapsed: 'w-20',    // 80px
    expanded: 'w-60',     // 240px
  },
  /** App outer padding */
  appPadding: 'px-4 sm:px-6',  // 16px mobile, 24px desktop
  /** Grid container max width */
  gridMaxWidth: 'max-w-[1152px]',
  /** Column specifications */
  columns: {
    count: 8,
    width: '130px',
    gap: '16px',          // gap-4
  },
} as const;

// ============================================
// GRID COLUMN SPANS
// ============================================
export const gridSpans = {
  /** Full width: 8 columns */
  full: 'col-span-1 sm:col-span-6 lg:col-span-8',
  /** Half: 4 columns */
  half: 'col-span-1 sm:col-span-3 lg:col-span-4',
  /** Third: ~3 columns (rounded) */
  third: 'col-span-1 sm:col-span-2 lg:col-span-3',
  /** Two-thirds: 5 columns */
  twoThirds: 'col-span-1 sm:col-span-4 lg:col-span-5',
  /** Quarter: 2 columns */
  quarter: 'col-span-1 sm:col-span-2 lg:col-span-2',
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  dropdown: 'z-50',
  sticky: 'z-40',
  modal: 'z-50',
  tooltip: 'z-[100]',
} as const;

// ============================================
// SHADOWS
// ============================================
export const shadows = {
  /** Subtle shadow for cards */
  sm: 'shadow-sm',
  /** Standard shadow */
  md: 'shadow-md',
  /** Elevated elements */
  lg: 'shadow-lg',
  /** Modals and dropdowns */
  xl: 'shadow-xl',
} as const;

// ============================================
// ANIMATIONS
// ============================================
export const animations = {
  /** Fast transition for hovers */
  fast: 'transition-all duration-150',
  /** Standard transition */
  normal: 'transition-all duration-200',
  /** Slower transition for larger elements */
  slow: 'transition-all duration-300',
} as const;
