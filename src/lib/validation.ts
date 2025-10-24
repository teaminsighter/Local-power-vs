import { z } from 'zod';

// Email validation with sanitization
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Admin authentication schema
export const adminAuthSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

// Lead creation validation
export const leadFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .trim()
    .optional(),
  preferredContact: z.enum(['email', 'phone', 'both'], {
    errorMap: () => ({ message: 'Preferred contact must be email, phone, or both' })
  }),
  bestTimeToCall: z
    .string()
    .max(100, 'Best time to call must not exceed 100 characters')
    .optional(),
  installationTimeframe: z
    .string()
    .max(50, 'Installation timeframe must not exceed 50 characters')
    .optional(),
  additionalNotes: z
    .string()
    .max(1000, 'Additional notes must not exceed 1000 characters')
    .trim()
    .optional(),
  marketingConsent: z
    .boolean()
    .optional()
    .default(false),
  systemDetails: z.object({
    systemSize: z
      .number()
      .min(1, 'System size must be at least 1 kW')
      .max(100, 'System size cannot exceed 100 kW'),
    estimatedCost: z
      .number()
      .min(1000, 'Estimated cost must be at least €1,000')
      .max(500000, 'Estimated cost cannot exceed €500,000'),
    annualSavings: z
      .number()
      .min(0, 'Annual savings must be positive')
      .max(50000, 'Annual savings cannot exceed €50,000'),
    paybackPeriod: z
      .number()
      .min(1, 'Payback period must be at least 1 year')
      .max(50, 'Payback period cannot exceed 50 years'),
    panelCount: z
      .number()
      .min(1, 'Panel count must be at least 1')
      .max(200, 'Panel count cannot exceed 200'),
    address: z
      .string()
      .max(200, 'Address must not exceed 200 characters')
      .optional()
  }).optional(),
  source: z
    .string()
    .max(50, 'Source must not exceed 50 characters')
    .optional()
    .default('website'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTE_SENT', 'WON', 'LOST'], {
    errorMap: () => ({ message: 'Status must be a valid lead status' })
  }).optional()
});

// API ID parameter validation
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a valid number')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'ID must be greater than 0')
});

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a valid number')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Page must be greater than 0')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a valid number')
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10')
});

// Search query validation
export const searchSchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long')
    .trim()
    .regex(/^[a-zA-Z0-9\s\-@._]+$/, 'Search query contains invalid characters'),
  category: z
    .string()
    .max(50, 'Category too long')
    .optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
});

// Configuration update schema
export const configUpdateSchema = z.object({
  key: z
    .string()
    .min(1, 'Configuration key is required')
    .max(100, 'Configuration key too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Configuration key contains invalid characters'),
  value: z
    .string()
    .max(1000, 'Configuration value too long')
    .trim(),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional()
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters'),
  mimetype: z
    .string()
    .regex(/^(image\/(jpeg|jpg|png|webp|gif)|application\/pdf|text\/(csv|plain))$/, 
           'File type not allowed'),
  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB') // 10MB limit
});

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional()
});

// Utility function for safe parsing with detailed error messages
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => {
    const path = err.path.length > 0 ? ` at ${err.path.join('.')}` : '';
    return `${err.message}${path}`;
  });
  
  return { success: false, errors };
}

// Sanitize HTML content (basic XSS prevention)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize for SQL injection prevention (additional layer)
export function sanitizeForSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}