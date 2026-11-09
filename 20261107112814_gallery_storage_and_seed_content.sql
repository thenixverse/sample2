/*
# Gallery storage bucket + starter content

1. Storage
- Creates public bucket `gallery` (website photos are meant to be public).
- 5 MB limit; only JPEG, PNG, WebP and AVIF images accepted.
- Only administrators (is_admin()) may upload, replace or delete files.

2. Seed data (placeholders only)
- business_settings row with the verified address, phone and hours.
- Three membership plans with ₹[OWNER TO CONFIRM] prices and placeholder benefits.
- Six proposed training program cards marked as NOT confirmed.
- Temporary stock gallery photos flagged `is_placeholder = true`.
- Three clearly labelled SAMPLE testimonials (`is_sample = true`).

3. Notes
1. Seeds use ON CONFLICT / NOT EXISTS so re-running does not duplicate rows.
2. Nothing here claims real prices, reviews or photos of the gym.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif'];

DROP POLICY IF EXISTS "gallery_admin_insert" ON storage.objects;
CREATE POLICY "gallery_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "gallery_admin_update" ON storage.objects;
CREATE POLICY "gallery_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "gallery_admin_delete" ON storage.objects;
CREATE POLICY "gallery_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "gallery_admin_select" ON storage.objects;
CREATE POLICY "gallery_admin_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

INSERT INTO business_settings (id, phone, whatsapp_number, address, maps_url, hours)
VALUES (1, '+91 82489 07533', '918248907533',
  E'33A, 40, Promenade Road,\nMelapudur, Cantonment,\nTiruchirappalli, Tamil Nadu – 620001',
  'https://maps.app.goo.gl/pqPcLKy5FYNvTsTA8',
  '[{"day":"Monday – Saturday","times":"5:30 AM – 11:00 AM, 4:30 PM – 10:00 PM"},{"day":"Sunday","times":"6:00 AM – 9:00 AM"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO membership_plans (name, duration_label, price_label, benefits, is_featured, sort_order)
SELECT * FROM (VALUES
  ('Monthly Membership', '1 Month', '₹[OWNER TO CONFIRM]', ARRAY['[Benefit 1 – owner to confirm]','[Benefit 2 – owner to confirm]','[Benefit 3 – owner to confirm]'], false, 1),
  ('Quarterly Membership', '3 Months', '₹[OWNER TO CONFIRM]', ARRAY['[Benefit 1 – owner to confirm]','[Benefit 2 – owner to confirm]','[Benefit 3 – owner to confirm]'], true, 2),
  ('Yearly Membership', '12 Months', '₹[OWNER TO CONFIRM]', ARRAY['[Benefit 1 – owner to confirm]','[Benefit 2 – owner to confirm]','[Benefit 3 – owner to confirm]'], false, 3)
) AS v(name, duration_label, price_label, benefits, is_featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM membership_plans);

INSERT INTO training_programs (name, description, image_url, sort_order)
SELECT * FROM (VALUES
  ('Strength Training', 'Build foundational strength with compound movements and progressive training.', 'https://images.pexels.com/photos/5327456/pexels-photo-5327456.jpeg', 1),
  ('Weight Training', 'Train with free weights and machines to develop muscle and control.', 'https://images.pexels.com/photos/2261481/pexels-photo-2261481.jpeg', 2),
  ('General Fitness', 'Stay active and improve overall fitness with a balanced routine.', 'https://images.pexels.com/photos/3931061/pexels-photo-3931061.jpeg', 3),
  ('Personal Training', 'One-to-one guidance tailored to your goals and pace.', 'https://images.pexels.com/photos/33846716/pexels-photo-33846716.jpeg', 4),
  ('Fitness Conditioning', 'Improve stamina, endurance and work capacity with conditioning work.', 'https://images.pexels.com/photos/7371360/pexels-photo-7371360.jpeg', 5),
  ('Beginner Training', 'A comfortable starting point to learn the basics with confidence.', 'https://images.pexels.com/photos/6455906/pexels-photo-6455906.jpeg', 6)
) AS v(name, description, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM training_programs);

INSERT INTO gallery_images (title, alt_text, category, image_url, is_placeholder, sort_order)
SELECT * FROM (VALUES
  ('Training floor', 'Moody gym interior with pull-up bars and ropes (stock photo)', 'Gym Interior', 'https://images.pexels.com/photos/6388373/pexels-photo-6388373.jpeg', true, 1),
  ('Dumbbell rack', 'Neat row of heavy dumbbells on a rack (stock photo)', 'Training Equipment', 'https://images.pexels.com/photos/3916766/pexels-photo-3916766.jpeg', true, 2),
  ('Strength session', 'Athlete lifting weights in a gym (stock photo)', 'Fitness Activities', 'https://images.pexels.com/photos/4720773/pexels-photo-4720773.jpeg', true, 3),
  ('Functional area', 'Industrial-style gym room with functional equipment (stock photo)', 'Gym Interior', 'https://images.pexels.com/photos/6390225/pexels-photo-6390225.jpeg', true, 4),
  ('Loaded barbell', 'Close-up of a barbell loaded with a weight plate (stock photo)', 'Training Equipment', 'https://images.pexels.com/photos/15373907/pexels-photo-15373907.jpeg', true, 5),
  ('Rope training', 'Woman performing rope training indoors (stock photo)', 'Workout Environment', 'https://images.pexels.com/photos/2294400/pexels-photo-2294400.jpeg', true, 6),
  ('Battle ropes', 'Athlete training with battle ropes (stock photo)', 'Fitness Activities', 'https://images.pexels.com/photos/40405169/pexels-photo-40405169.jpeg', true, 7),
  ('Gym rings', 'Wooden gym rings hanging in a dim gym (stock photo)', 'Gym Interior', 'https://images.pexels.com/photos/5497493/pexels-photo-5497493.jpeg', true, 8),
  ('Weightlifting zone', 'Spacious gym with barbells and ropes (stock photo)', 'Workout Environment', 'https://images.pexels.com/photos/9958668/pexels-photo-9958668.jpeg', true, 9),
  ('Chrome dumbbells', 'Set of dumbbells arranged on a rack (stock photo)', 'Training Equipment', 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg', true, 10),
  ('Kettlebell work', 'Man exercising with kettlebells (stock photo)', 'Fitness Activities', 'https://images.pexels.com/photos/14898427/pexels-photo-14898427.jpeg', true, 11),
  ('Guided session', 'Trainer guiding two members during a session (stock photo)', 'Workout Environment', 'https://images.pexels.com/photos/7444444/pexels-photo-7444444.jpeg', true, 12)
) AS v(title, alt_text, category, image_url, is_placeholder, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_images);

INSERT INTO testimonials (customer_name, rating, review, is_sample, is_published, sort_order)
SELECT * FROM (VALUES
  ('[Sample Member Name]', 5, 'Sample placeholder review. Replace with a real member review once publication permission has been obtained.', true, true, 1),
  ('[Sample Member Name]', 5, 'Sample placeholder review describing the training environment. Not a genuine customer review.', true, true, 2),
  ('[Sample Member Name]', 5, 'Sample placeholder review about trainer guidance. To be replaced with an approved testimonial.', true, true, 3)
) AS v(customer_name, rating, review, is_sample, is_published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);
