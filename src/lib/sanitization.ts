/**
 * CSV Sanitization Utility
 * Prevents XSS and SQL injection attacks through CSV upload
 * STORY-SYS-009: CSV Input Sanitization
 */

import DOMPurify from 'dompurify';

// Configuration constants
export const CSV_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['text/csv', 'application/csv', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.csv'],
};

// SQL dangerous keywords that could indicate injection
const SQL_DANGEROUS_KEYWORDS = [
  'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'EXEC',
  'EXECUTE', 'SELECT', 'UNION', 'DECLARE', '--', ';', '/*', '*/'
];

// HTML dangerous characters that could indicate XSS
const HTML_DANGEROUS_CHARS = /[<>'"`;]/g;

/**
 * Sanitize a CSV cell value for XSS/SQL injection
 * @param value The raw cell value
 * @param fieldType The expected data type for this field
 * @returns Sanitized value
 */
export function sanitizeCSVCell(
  value: string | number | null,
  fieldType: 'string' | 'number' | 'date' | 'boolean' | 'currency' = 'string'
): string | number | boolean | null {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return fieldType === 'number' || fieldType === 'currency' ? 0 : null;
  }

  const stringValue = String(value).trim();

  // String fields: Full sanitization
  if (fieldType === 'string') {
    return sanitizeStringField(stringValue);
  }

  // Numeric fields: Parse and validate
  if (fieldType === 'number' || fieldType === 'currency') {
    return sanitizeNumericField(stringValue);
  }

  // Date fields: Validate format
  if (fieldType === 'date') {
    return sanitizeDateField(stringValue);
  }

  // Boolean fields: Validate true/false
  if (fieldType === 'boolean') {
    return sanitizeBooleanField(stringValue);
  }

  return stringValue;
}

/**
 * Sanitize string field: Remove dangerous characters and XSS payloads
 */
function sanitizeStringField(value: string): string {
  // Remove HTML tags and scripts
  let sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });

  // Remove dangerous SQL keywords
  for (const keyword of SQL_DANGEROUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  // Escape single/double quotes for SQL safety
  sanitized = sanitized
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/"/g, '""'); // Escape double quotes

  // Remove backticks (for identifier escaping)
  sanitized = sanitized.replace(/`/g, '');

  // Remove semicolons (statement terminator)
  sanitized = sanitized.replace(/;/g, '');

  // Remove control characters (newlines, tabs, null bytes)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Sanitize numeric field: Parse and validate as number
 */
function sanitizeNumericField(value: string): number {
  // Remove common currency symbols and formatting
  let cleaned = value
    .replace(/[R$£€¥]/g, '')  // Remove currency symbols
    .replace(/[.,]/g, match => match === ',' ? '.' : '') // Handle comma as decimal separator
    .replace(/\s/g, ''); // Remove whitespace

  const num = parseFloat(cleaned);

  // Return 0 for invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  // Prevent extremely large numbers that could overflow
  if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
    return 0;
  }

  return num;
}

/**
 * Sanitize date field: Validate date format
 */
function sanitizeDateField(value: string): string | null {
  // Accept common date formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
  ];

  const isValidFormat = datePatterns.some(pattern => pattern.test(value));

  if (!isValidFormat) {
    return null;
  }

  // Try to parse as date to ensure it's valid
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }

  // Return normalized format (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
}

/**
 * Sanitize boolean field: Convert to true/false
 */
function sanitizeBooleanField(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'sim' || normalized === 'yes';
}

/**
 * Validate CSV file
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > CSV_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${CSV_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB, Atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file extension
  const hasValidExtension = CSV_CONFIG.ALLOWED_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Use arquivo .csv`
    };
  }

  // Check MIME type
  const hasValidType = CSV_CONFIG.ALLOWED_TYPES.includes(file.type) || file.type === '';

  if (!hasValidType) {
    return {
      valid: false,
      error: `Tipo MIME inválido: ${file.type}. Use arquivo CSV válido.`
    };
  }

  return { valid: true };
}

/**
 * Validate CSV encoding (should be UTF-8)
 */
export async function validateCSVEncoding(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    // Check for valid UTF-8 (BOM is optional)
    const cleaned = text.replace(/^\uFEFF/, '');
    // If we can read it as text, encoding is valid
    return cleaned.length > 0;
  } catch {
    return false;
  }
}

/**
 * Detect duplicate rows in CSV
 */
export function detectDuplicateRows(rows: Record<string, unknown>[]): { hasDuplicates: boolean; duplicates: number[] } {
  const seen = new Set<string>();
  const duplicates: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const key = JSON.stringify(rows[i]);
    if (seen.has(key)) {
      duplicates.push(i);
    } else {
      seen.add(key);
    }
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates
  };
}

/**
 * Check if a string contains SQL injection patterns
 */
export function containsSQLInjectionPatterns(value: string): boolean {
  const injectionPatterns = [
    /('|")?\s*(OR|AND)\s*('|")?\s*1\s*=\s*1/gi, // OR 1=1
    /(\bUNION\b.*\bSELECT\b)/gi, // UNION SELECT
    /(\bDROP\b.*\bTABLE\b)/gi, // DROP TABLE
    /(;\s*DELETE\b)/gi, // ; DELETE
    /(-{2}|\/\*)/gi, // SQL comments
  ];

  return injectionPatterns.some(pattern => pattern.test(value));
}

/**
 * Check if a string contains XSS patterns
 */
export function containsXSSPatterns(value: string): boolean {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi, // Script tags
    /on\w+\s*=\s*["']?[^"']*["']?/gi, // Event handlers
    /javascript:/gi, // Javascript protocol
    /data:text\/html/gi, // Data URI with HTML
    /<iframe[^>]*>/gi, // IFrame tags
    /<object[^>]*>/gi, // Object tags
    /<embed[^>]*>/gi, // Embed tags
  ];

  return xssPatterns.some(pattern => pattern.test(value));
}

/**
 * Get error message for dangerous content
 */
export function checkDangerousContent(value: string): { safe: boolean; reason?: string } {
  if (containsSQLInjectionPatterns(value)) {
    return { safe: false, reason: 'Padrão de SQL injection detectado' };
  }

  if (containsXSSPatterns(value)) {
    return { safe: false, reason: 'Padrão de XSS detectado' };
  }

  return { safe: true };
}

/**
 * Sanitize entire CSV row
 */
export function sanitizeCSVRow(
  row: Record<string, unknown>,
  fieldTypes?: Record<string, 'string' | 'number' | 'date' | 'boolean' | 'currency'>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const fieldType = fieldTypes?.[key] || 'string';
    sanitized[key] = sanitizeCSVCell(value, fieldType);
  }

  return sanitized;
}
