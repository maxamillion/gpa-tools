/**
 * MetricCategory Enum and Metadata
 * Defines the 5 metric categories with display information
 */

export const MetricCategory = {
  ACTIVITY: 'activity',
  COMMUNITY: 'community',
  MAINTENANCE: 'maintenance',
  DOCUMENTATION: 'documentation',
  SECURITY: 'security',
};

export const METRIC_CATEGORIES = [
  {
    id: 'activity',
    name: 'Activity Metrics',
    description: 'Measures development activity and project momentum',
    order: 1,
  },
  {
    id: 'community',
    name: 'Community Metrics',
    description: 'Evaluates community engagement and contributor diversity',
    order: 2,
  },
  {
    id: 'maintenance',
    name: 'Maintenance Metrics',
    description: 'Assesses responsiveness to issues and maintenance quality',
    order: 3,
  },
  {
    id: 'documentation',
    name: 'Documentation Metrics',
    description: 'Measures documentation quality and completeness',
    order: 4,
  },
  {
    id: 'security',
    name: 'Security & Governance',
    description: 'Evaluates security practices and governance structures',
    order: 5,
  },
];
