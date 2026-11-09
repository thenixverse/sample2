/*
# Tighten table privileges

1. Summary
- Tables were carrying the platform's default "all privileges" grants. Row rules already blocked
  misuse, but this narrows each role to exactly what the website and admin panel use.

2. Changes
- Visitors (anon): read-only on public content tables; INSERT on enquiries limited to the form
  columns (they cannot set status or timestamps); no access to admin_users.
- Signed-in users (authenticated): full access on content tables (row rules still require
  is_admin()); enquiries: SELECT/DELETE, INSERT on form columns, UPDATE on status only;
  admin_users: SELECT only (own row via policy).
- business_settings: UPDATE only for authenticated (no insert/delete; the single row is seeded).

3. Notes
- No data is changed. All existing row level security policies remain in force.
*/

REVOKE ALL ON admin_users, business_settings, enquiries, gallery_images, membership_plans, testimonials, training_programs FROM anon, authenticated;

GRANT SELECT ON business_settings, gallery_images, membership_plans, testimonials, training_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON gallery_images, membership_plans, testimonials, training_programs TO authenticated;
GRANT SELECT, UPDATE ON business_settings TO authenticated;
GRANT SELECT ON admin_users TO authenticated;

GRANT INSERT (enquiry_type, full_name, phone, email, interested_plan, preferred_contact, subject, message) ON enquiries TO anon, authenticated;
GRANT SELECT, DELETE ON enquiries TO authenticated;
GRANT UPDATE (status) ON enquiries TO authenticated;
