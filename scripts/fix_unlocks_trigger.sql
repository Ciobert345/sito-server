-- 1. Create Function to auto-unlock intel based on clearance level
CREATE OR REPLACE FUNCTION public.handle_level_up_unlocks()
RETURNS TRIGGER AS $$
BEGIN
  -- If clearance_level has increased (or it's a new user)
  IF (TG_OP = 'INSERT') OR (NEW.clearance_level > OLD.clearance_level) THEN
    
    -- Insert into user_unlocks all intel with required_clearance <= new level
    INSERT INTO public.user_unlocks (user_id, intel_id)
    SELECT NEW.id, i.id
    FROM public.intel_assets i
    WHERE i.required_clearance <= NEW.clearance_level
    -- Prevent duplicate keys implies existing unlock check
    AND NOT EXISTS (
        SELECT 1 FROM public.user_unlocks u 
        WHERE u.user_id = NEW.id AND u.intel_id = i.id
    );

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger to fire execution on profile changes
DROP TRIGGER IF EXISTS on_profile_level_change ON public.profiles;

CREATE TRIGGER on_profile_level_change
AFTER INSERT OR UPDATE OF clearance_level ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_level_up_unlocks();
