import { describe, it, expect } from 'vitest';
import {
  sanitizeCSVCell,
  validateCSVFile,
  detectDuplicateRows,
  containsSQLInjectionPatterns,
  containsXSSPatterns,
  sanitizeCSVRow,
  checkDangerousContent,
} from './sanitization';

describe('CSV Sanitization', () => {
  describe('sanitizeCSVCell - String fields', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeCSVCell('<script>alert("xss")</script>', 'string');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should remove dangerous event handlers', () => {
      const result = sanitizeCSVCell('<img src=x onerror="alert(\'xss\')">', 'string');
      expect(typeof result).toBe('string');
      expect(result).not.toContain('onerror');
    });

    it('should escape single quotes for SQL safety', () => {
      const result = sanitizeCSVCell("It's dangerous", 'string');
      expect(result).toContain("''"); // Escaped as two single quotes
    });

    it('should escape double quotes for SQL safety', () => {
      const result = sanitizeCSVCell('He said "hello"', 'string');
      expect(result).toContain('""'); // Escaped as two double quotes
    });

    it('should remove SQL keywords', () => {
      const result = sanitizeCSVCell("'; DROP TABLE users--", 'string');
      expect(result).not.toContain('DROP');
      expect(result).not.toContain('--');
    });

    it('should remove semicolons', () => {
      const result = sanitizeCSVCell('test;', 'string');
      expect(result).not.toContain(';');
    });

    it('should remove backticks', () => {
      const result = sanitizeCSVCell('`column_name`', 'string');
      expect(result).not.toContain('`');
    });

    it('should handle normal text safely', () => {
      const result = sanitizeCSVCell('Normal text', 'string');
      expect(result).toBe('Normal text');
    });

    it('should remove control characters', () => {
      const result = sanitizeCSVCell('text\x00with\x1Fcontrol', 'string');
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x1F');
    });
  });

  describe('sanitizeCSVCell - Numeric fields', () => {
    it('should parse valid integers', () => {
      expect(sanitizeCSVCell('123', 'number')).toBe(123);
      expect(sanitizeCSVCell('0', 'number')).toBe(0);
      expect(sanitizeCSVCell('-50', 'number')).toBe(-50);
    });

    it('should parse decimal numbers', () => {
      expect(sanitizeCSVCell('123.45', 'number')).toBe(123.45);
      expect(sanitizeCSVCell('0.01', 'number')).toBe(0.01);
    });

    it('should handle Brazilian currency format', () => {
      const result = sanitizeCSVCell('R$ 1.234,56', 'currency');
      expect(result).toBe(1234.56);
    });

    it('should handle invalid numbers', () => {
      expect(sanitizeCSVCell('not a number', 'number')).toBe(0);
      expect(sanitizeCSVCell('', 'number')).toBe(0);
      expect(sanitizeCSVCell('abc123', 'number')).toBe(0);
    });

    it('should clamp extremely large numbers', () => {
      const result = sanitizeCSVCell('999999999999999999999', 'number');
      expect(result).toBe(0); // Returns 0 for numbers > MAX_SAFE_INTEGER
    });
  });

  describe('sanitizeCSVCell - Date fields', () => {
    it('should accept YYYY-MM-DD format', () => {
      const result = sanitizeCSVCell('2026-02-27', 'date');
      expect(result).toBe('2026-02-27');
    });

    it('should accept DD/MM/YYYY format', () => {
      const result = sanitizeCSVCell('27/02/2026', 'date');
      expect(result).not.toBeNull();
    });

    it('should reject invalid dates', () => {
      expect(sanitizeCSVCell('not a date', 'date')).toBeNull();
      expect(sanitizeCSVCell('13/13/2026', 'date')).toBeNull();
    });

    it('should reject invalid format', () => {
      expect(sanitizeCSVCell('2026/02/27', 'date')).toBeNull();
    });
  });

  describe('sanitizeCSVCell - Boolean fields', () => {
    it('should parse true values', () => {
      expect(sanitizeCSVCell('true', 'boolean')).toBe(true);
      expect(sanitizeCSVCell('1', 'boolean')).toBe(true);
      expect(sanitizeCSVCell('sim', 'boolean')).toBe(true);
      expect(sanitizeCSVCell('yes', 'boolean')).toBe(true);
    });

    it('should parse false values', () => {
      expect(sanitizeCSVCell('false', 'boolean')).toBe(false);
      expect(sanitizeCSVCell('0', 'boolean')).toBe(false);
      expect(sanitizeCSVCell('não', 'boolean')).toBe(false);
    });
  });

  describe('validateCSVFile', () => {
    it('should accept valid CSV file', () => {
      const file = new File(['test'], 'data.csv', { type: 'text/csv' });
      const result = validateCSVFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject files > 10MB', () => {
      const largeData = new ArrayBuffer(11 * 1024 * 1024);
      const file = new File([largeData], 'large.csv', { type: 'text/csv' });
      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('muito grande');
    });

    it('should reject non-CSV files', () => {
      const file = new File(['test'], 'data.xlsx', { type: 'application/xlsx' });
      const result = validateCSVFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should accept text/plain type', () => {
      const file = new File(['test'], 'data.csv', { type: 'text/plain' });
      const result = validateCSVFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('detectDuplicateRows', () => {
    it('should detect duplicate rows', () => {
      const rows = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' }, // duplicate
      ];
      const result = detectDuplicateRows(rows);
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates).toContain(2);
    });

    it('should handle no duplicates', () => {
      const rows = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const result = detectDuplicateRows(rows);
      expect(result.hasDuplicates).toBe(false);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('containsSQLInjectionPatterns', () => {
    it('should detect "OR 1=1" injection', () => {
      expect(containsSQLInjectionPatterns("' OR '1'='1")).toBe(true);
      expect(containsSQLInjectionPatterns("' OR 1=1--")).toBe(true);
    });

    it('should detect UNION SELECT injection', () => {
      expect(containsSQLInjectionPatterns("UNION SELECT * FROM users")).toBe(true);
    });

    it('should detect DROP TABLE injection', () => {
      expect(containsSQLInjectionPatterns("'; DROP TABLE users--")).toBe(true);
    });

    it('should detect SQL comments', () => {
      expect(containsSQLInjectionPatterns("test--comment")).toBe(true);
      expect(containsSQLInjectionPatterns("test/* comment */")).toBe(true);
    });

    it('should not flag normal SQL names', () => {
      expect(containsSQLInjectionPatterns('my_table')).toBe(false);
      expect(containsSQLInjectionPatterns('user_id')).toBe(false);
    });
  });

  describe('containsXSSPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXSSPatterns('<script>alert("xss")</script>')).toBe(true);
      expect(containsXSSPatterns('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXSSPatterns('<img src=x onerror="alert(1)">')).toBe(true);
      expect(containsXSSPatterns('onclick="hack()"')).toBe(true);
    });

    it('should detect javascript protocol', () => {
      expect(containsXSSPatterns('<a href="javascript:alert(1)">link</a>')).toBe(true);
      expect(containsXSSPatterns('javascript:void(0)')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsXSSPatterns('<iframe src="http://attacker.com"></iframe>')).toBe(true);
    });

    it('should not flag normal HTML content', () => {
      expect(containsXSSPatterns('normal text')).toBe(false);
      expect(containsXSSPatterns('https://example.com')).toBe(false);
    });
  });

  describe('sanitizeCSVRow', () => {
    it('should sanitize entire row with field types', () => {
      const row = {
        name: '<script>xss</script>',
        amount: '1.234,56',
        date: '2026-02-27',
        active: 'true'
      };

      const fieldTypes = {
        name: 'string' as const,
        amount: 'currency' as const,
        date: 'date' as const,
        active: 'boolean' as const
      };

      const result = sanitizeCSVRow(row, fieldTypes);

      expect(typeof result.name).toBe('string');
      expect(result.name).not.toContain('<script>');
      expect(result.amount).toBe(1234.56);
      expect(result.date).toBe('2026-02-27');
      expect(result.active).toBe(true);
    });

    it('should default to string type if not specified', () => {
      const row = { unknown_field: 'test' };
      const result = sanitizeCSVRow(row);
      expect(result.unknown_field).toBe('test');
    });
  });

  describe('checkDangerousContent', () => {
    it('should detect SQL injection attempts', () => {
      const result = checkDangerousContent("'; DROP TABLE--");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('SQL');
    });

    it('should detect XSS attempts', () => {
      const result = checkDangerousContent('<script>alert(1)</script>');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('XSS');
    });

    it('should allow safe content', () => {
      const result = checkDangerousContent('Normal safe text');
      expect(result.safe).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });
});
