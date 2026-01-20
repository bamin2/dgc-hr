/**
 * Static organization data for forms and dropdowns.
 * This data is used when database values aren't available or as fallbacks.
 */

export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
] as const;

export type DepartmentName = typeof departments[number];

export const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Designer',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Coordinator',
  'Financial Analyst',
  'Operations Manager',
  'Customer Support Specialist',
] as const;

export type JobTitle = typeof jobTitles[number];

export const workLocations = [
  'Remote',
  'New York Office',
  'San Francisco Office',
  'London Office',
  'Singapore Office',
] as const;

export type WorkLocationName = typeof workLocations[number];
