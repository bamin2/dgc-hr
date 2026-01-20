/**
 * Static hiring data for forms and dropdowns.
 */

export const offerTemplates = [
  { id: 'standard', name: 'Standard Offer Letter' },
  { id: 'executive', name: 'Executive Offer Letter' },
  { id: 'contractor', name: 'Contractor Agreement' },
  { id: 'internship', name: 'Internship Offer' },
] as const;

export type OfferTemplateId = typeof offerTemplates[number]['id'];
