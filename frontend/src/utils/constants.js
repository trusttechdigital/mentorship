// frontend/src/utils/constants.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  STAFF: '/staff',
  MENTEES: '/mentees',
  DOCUMENTS: '/documents',
  RECEIPTS: '/receipts',
  INVOICES: '/invoices',
  INVENTORY: '/inventory',
  DASHBOARD: '/dashboard'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  MENTOR: 'mentor',
  STAFF: 'staff'
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const RECEIPT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const MENTEE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  DROPPED: 'dropped'
};

export const DOCUMENT_CATEGORIES = {
  WEEKLY_PLAN: 'weekly-plan',
  POLICY: 'policy',
  TRAINING: 'training',
  TEMPLATE: 'template',
  OTHER: 'other'
};

export const FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif'],
  RECEIPTS: ['.pdf', '.jpg', '.jpeg', '.png']
};

export const MAX_FILE_SIZES = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024,     // 5MB
  RECEIPT: 5 * 1024 * 1024    // 5MB
};