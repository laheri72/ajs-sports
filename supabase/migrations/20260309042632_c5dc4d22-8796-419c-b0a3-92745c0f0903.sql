
-- Re-apply parts that failed in migration 3

-- === Certificate sequence ===
CREATE SEQUENCE IF NOT EXISTS public.certificate_seq START 1;

-- === Fix certificate number generation with atomic sequence ===
CREATE OR REPLACE FUNCTION public.generate_certificate_number(p_year integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_seq bigint;
BEGIN
  v_seq := nextval('public.certificate_seq');
  RETURN 'AJS-SP-' || p_year::text || '-' || LPAD(v_seq::text, 4, '0');
END;
$$;

-- === Certificate immutability trigger ===
CREATE OR REPLACE FUNCTION public.prevent_certificate_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.status = 'issued' AND NEW.status <> 'revoked') THEN
      RAISE EXCEPTION 'Issued certificates cannot be modified except for revocation';
    END IF;
    IF (OLD.status = 'issued' AND NEW.status = 'revoked') THEN
      NEW.student_id := OLD.student_id;
      NEW.sport_id := OLD.sport_id;
      NEW.score_snapshot := OLD.score_snapshot;
      NEW.proficiency_level := OLD.proficiency_level;
      NEW.certificate_number := OLD.certificate_number;
      NEW.issued_by := OLD.issued_by;
      NEW.issued_at := OLD.issued_at;
      NEW.valid_year := OLD.valid_year;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'issued') THEN
      RAISE EXCEPTION 'Issued certificates cannot be deleted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_certificates ON public.certifications;
CREATE TRIGGER trg_protect_certificates
BEFORE UPDATE OR DELETE ON public.certifications
FOR EACH ROW
EXECUTE FUNCTION public.prevent_certificate_modification();
