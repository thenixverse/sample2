/*
# MR. THANOS FITNESS - core schema

Plain English: creates every table the public website and the admin dashboard need.
Public visitors can read published website content and submit enquiries. Only
signed-in administrators (listed in admin_users) can read enquiries or change content.

1. New Tables
- `admin_users` - which signed-in accounts are administrators
  - `user_id` (uuid, pk, references auth.users)
  - `created_at`
- `enquiries` - membership / personal training / program / contact enquiries
  - `id`, `enquiry_type`, `full_name`, `phone`, `email`, `interested_plan`,
    `preferred_contact`, `subject`, `message`, `status`, `created_at`, `updated_at`
- `membership_plans` - pricing cards (`name`, `duration_label`, `price_label`,
  `benefits` text[], `is_featured`, `is_enabled`, `sort_order`)
- `training_programs` - program cards (`name`, `description`, `image_url`,
  `is_confirmed`, `is_enabled`, `sort_order`)
- `gallery_images` - gallery (`title`, `alt_text`, `category`, `image_url`,
  `storage_path`, `is_placeholder`, `sort_order`)
- `testimonials` - (`customer_name`, `rating`, `review`, `photo_url`, `is_sample`,
  `is_published`, `sort_order`)
- `business_settings` - single row (id = 1) with phone, WhatsApp, address, maps,
  opening hours (jsonb), email and social links

2. Functions
- `is_admin()` SECURITY DEFINER - true if caller is in admin_users (authenticated only)
- `admin_setup_required()` SECURITY DEFINER - true when no admin exists yet (anon + authenticated)
- `claim_first_admin()` SECURITY DEFINER - makes the caller the first admin, only when none exist
- `prevent_duplicate_enquiry()` trigger - rejects an identical enquiry from the same phone within 10 minutes
- `touch_updated_at()` trigger - keeps updated_at current

3. Security
- RLS enabled on every table; 4 separate policies per verb where used.
- anon + authenticated may INSERT enquiries (content columns only; status is forced to 'new').
- Only admins may SELECT/UPDATE/DELETE enquiries; UPDATE limited to `status` column.
- Public read of enabled plans/programs, published testimonials, all gallery images, settings.
- All content writes require is_admin().
- admin_users is not directly writable by any client role.

4. Important notes
1. Sign-ups are open in Supabase, so being signed in is NOT enough: every admin check uses is_admin().
2. The first account to complete admin setup becomes the administrator; later accounts cannot.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON admin_users TO authenticated;
DROP POLICY IF EXISTS "admins_read_self" ON admin_users;
CREATE POLICY "admins_read_self" ON admin_users FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()); $$;
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION admin_setup_required()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT NOT EXISTS (SELECT 1 FROM admin_users); $$;
REVOKE EXECUTE ON FUNCTION admin_setup_required() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_setup_required() TO anon, authenticated;

CREATE OR REPLACE FUNCTION claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  LOCK TABLE admin_users IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM admin_users) THEN
    RETURN false;
  END IF;
  INSERT INTO admin_users (user_id) VALUES (auth.uid());
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_type text NOT NULL CHECK (enquiry_type IN ('membership','personal_training','program','contact')),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (phone ~ '^\+?[0-9 ]{10,16}$'),
  email text CHECK (email IS NULL OR (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  interested_plan text CHECK (interested_plan IS NULL OR char_length(interested_plan) <= 120),
  preferred_contact text CHECK (preferred_contact IS NULL OR preferred_contact IN ('phone','whatsapp','email')),
  subject text CHECK (subject IS NULL OR char_length(subject) <= 150),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','in_progress','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_type_idx ON enquiries (enquiry_type);
CREATE INDEX IF NOT EXISTS enquiries_phone_idx ON enquiries (phone);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

GRANT INSERT (enquiry_type, full_name, phone, email, interested_plan, preferred_contact, subject, message)
  ON enquiries TO anon, authenticated;
GRANT SELECT, DELETE ON enquiries TO authenticated;
GRANT UPDATE (status) ON enquiries TO authenticated;

DROP POLICY IF EXISTS "public_insert_enquiries" ON enquiries;
CREATE POLICY "public_insert_enquiries" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'new');
DROP POLICY IF EXISTS "admin_select_enquiries" ON enquiries;
CREATE POLICY "admin_select_enquiries" ON enquiries FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_update_enquiries" ON enquiries;
CREATE POLICY "admin_update_enquiries" ON enquiries FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_enquiries" ON enquiries;
CREATE POLICY "admin_delete_enquiries" ON enquiries FOR DELETE
  TO authenticated USING (is_admin());

CREATE OR REPLACE FUNCTION prevent_duplicate_enquiry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM enquiries
    WHERE phone = NEW.phone
      AND enquiry_type = NEW.enquiry_type
      AND coalesce(message,'') = coalesce(NEW.message,'')
      AND coalesce(interested_plan,'') = coalesce(NEW.interested_plan,'')
      AND created_at > now() - interval '10 minutes'
  ) THEN
    RAISE EXCEPTION 'duplicate_enquiry' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION prevent_duplicate_enquiry() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enquiries_no_duplicates ON enquiries;
CREATE TRIGGER enquiries_no_duplicates BEFORE INSERT ON enquiries
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_enquiry();
DROP TRIGGER IF EXISTS enquiries_touch ON enquiries;
CREATE TRIGGER enquiries_touch BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Membership plans
CREATE TABLE IF NOT EXISTS membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  duration_label text NOT NULL DEFAULT '' CHECK (char_length(duration_label) <= 80),
  price_label text NOT NULL DEFAULT '₹[OWNER TO CONFIRM]' CHECK (char_length(price_label) <= 60),
  benefits text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON membership_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON membership_plans TO authenticated;
DROP POLICY IF EXISTS "anon_select_plans" ON membership_plans;
CREATE POLICY "anon_select_plans" ON membership_plans FOR SELECT TO anon USING (is_enabled);
DROP POLICY IF EXISTS "auth_select_plans" ON membership_plans;
CREATE POLICY "auth_select_plans" ON membership_plans FOR SELECT TO authenticated USING (is_enabled OR is_admin());
DROP POLICY IF EXISTS "admin_insert_plans" ON membership_plans;
CREATE POLICY "admin_insert_plans" ON membership_plans FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_plans" ON membership_plans;
CREATE POLICY "admin_update_plans" ON membership_plans FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_plans" ON membership_plans;
CREATE POLICY "admin_delete_plans" ON membership_plans FOR DELETE TO authenticated USING (is_admin());
DROP TRIGGER IF EXISTS plans_touch ON membership_plans;
CREATE TRIGGER plans_touch BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Training programs
CREATE TABLE IF NOT EXISTS training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 600),
  image_url text NOT NULL DEFAULT '' CHECK (char_length(image_url) <= 1000),
  is_confirmed boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON training_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_programs TO authenticated;
DROP POLICY IF EXISTS "anon_select_programs" ON training_programs;
CREATE POLICY "anon_select_programs" ON training_programs FOR SELECT TO anon USING (is_enabled);
DROP POLICY IF EXISTS "auth_select_programs" ON training_programs;
CREATE POLICY "auth_select_programs" ON training_programs FOR SELECT TO authenticated USING (is_enabled OR is_admin());
DROP POLICY IF EXISTS "admin_insert_programs" ON training_programs;
CREATE POLICY "admin_insert_programs" ON training_programs FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_programs" ON training_programs;
CREATE POLICY "admin_update_programs" ON training_programs FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_programs" ON training_programs;
CREATE POLICY "admin_delete_programs" ON training_programs FOR DELETE TO authenticated USING (is_admin());
DROP TRIGGER IF EXISTS programs_touch ON training_programs;
CREATE TRIGGER programs_touch BEFORE UPDATE ON training_programs FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Gallery
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 120),
  alt_text text NOT NULL DEFAULT '' CHECK (char_length(alt_text) <= 250),
  category text NOT NULL DEFAULT 'Gym Interior' CHECK (char_length(category) BETWEEN 1 AND 60),
  image_url text NOT NULL CHECK (char_length(image_url) BETWEEN 1 AND 1000),
  storage_path text,
  is_placeholder boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gallery_sort_idx ON gallery_images (sort_order);
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON gallery_images TO authenticated;
DROP POLICY IF EXISTS "public_select_gallery" ON gallery_images;
CREATE POLICY "public_select_gallery" ON gallery_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery_images;
CREATE POLICY "admin_insert_gallery" ON gallery_images FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_gallery" ON gallery_images;
CREATE POLICY "admin_update_gallery" ON gallery_images FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery_images;
CREATE POLICY "admin_delete_gallery" ON gallery_images FOR DELETE TO authenticated USING (is_admin());

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 100),
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review text NOT NULL CHECK (char_length(review) BETWEEN 1 AND 1200),
  photo_url text CHECK (photo_url IS NULL OR char_length(photo_url) <= 1000),
  is_sample boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON testimonials TO authenticated;
DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT TO anon USING (is_published);
DROP POLICY IF EXISTS "auth_select_testimonials" ON testimonials;
CREATE POLICY "auth_select_testimonials" ON testimonials FOR SELECT TO authenticated USING (is_published OR is_admin());
DROP POLICY IF EXISTS "admin_insert_testimonials" ON testimonials;
CREATE POLICY "admin_insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (is_admin());

-- Business settings (single row)
CREATE TABLE IF NOT EXISTS business_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL DEFAULT 'MR. THANOS FITNESS',
  phone text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '' CHECK (whatsapp_number ~ '^[0-9]*$'),
  address text NOT NULL DEFAULT '',
  maps_url text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  instagram_url text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON business_settings TO anon;
GRANT SELECT, UPDATE ON business_settings TO authenticated;
DROP POLICY IF EXISTS "public_select_settings" ON business_settings;
CREATE POLICY "public_select_settings" ON business_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_settings" ON business_settings;
CREATE POLICY "admin_update_settings" ON business_settings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP TRIGGER IF EXISTS settings_touch ON business_settings;
CREATE TRIGGER settings_touch BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
