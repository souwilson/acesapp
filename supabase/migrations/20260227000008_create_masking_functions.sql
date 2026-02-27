-- Create masking functions for PII protection
-- STORY-DB-004: Mask Sensitive Data (PII Protection)
-- Sprint 1 / STORY-DB-004

-- ============================================================================
-- CREATE EMAIL MASKING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mask_email(email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF email IS NULL THEN
    RETURN NULL;
  END IF;

  -- Return first character + *** + @ + domain
  -- Example: john.doe@example.com → j***@example.com
  RETURN SUBSTRING(email, 1, 1) || '***@' || SUBSTRING(email FROM POSITION('@' IN email));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- CREATE SENSITIVE TEXT MASKING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mask_sensitive_text(text_value TEXT, visible_chars INT DEFAULT 4)
RETURNS TEXT AS $$
DECLARE
  v_masked_length INT;
BEGIN
  IF text_value IS NULL THEN
    RETURN NULL;
  END IF;

  -- Return masked version with visible_chars characters visible at the end
  -- Example with visible_chars=4: 12345678901234 → ***-****-****
  IF LENGTH(text_value) <= visible_chars THEN
    RETURN REPLICATE('*', LENGTH(text_value));
  ELSE
    RETURN REPLICATE('*', LENGTH(text_value) - visible_chars) || SUBSTRING(text_value, LENGTH(text_value) - visible_chars + 1);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- CREATE CREDIT CARD MASKING FUNCTION (for future use)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mask_credit_card(card_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF card_number IS NULL THEN
    RETURN NULL;
  END IF;

  -- Mask credit card: show only last 4 digits
  -- Example: 1234567890123456 → ****-****-****-3456
  IF LENGTH(card_number) >= 4 THEN
    RETURN REPLICATE('*', LENGTH(card_number) - 4) || SUBSTRING(card_number, LENGTH(card_number) - 3);
  ELSE
    RETURN REPLICATE('*', LENGTH(card_number));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- CREATE SSN MASKING FUNCTION (for future use)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mask_ssn(ssn TEXT)
RETURNS TEXT AS $$
BEGIN
  IF ssn IS NULL THEN
    RETURN NULL;
  END IF;

  -- Mask SSN: show only last 4 digits
  -- Example: 123-45-6789 → ***-**-6789
  IF LENGTH(ssn) >= 4 THEN
    RETURN '***-**-' || SUBSTRING(ssn, LENGTH(ssn) - 3);
  ELSE
    RETURN REPLICATE('*', LENGTH(ssn));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Masking Functions:
-- - mask_email: Shows first character and domain only
-- - mask_sensitive_text: Shows last N characters (default 4)
-- - mask_credit_card: Shows last 4 digits only
-- - mask_ssn: Shows last 4 digits only
--
-- All functions are:
-- - IMMUTABLE: Same input always produces same output (safe for indexes)
-- - NULL-safe: NULL input returns NULL
-- - Used by views for safe data export and backup
--
-- GDPR Compliance:
-- - Art. 32: Personal data protection (technical measures)
-- - Art. 5: Data minimization (limit exposure)
-- - Art. 18: Right to erasure (audit trail with masked data)
--
