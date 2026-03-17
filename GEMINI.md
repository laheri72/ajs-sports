# Critical Architecture & Auth Context (March 17, 2026)

This document records essential fixes and architectural decisions made to the Student Management system to ensure future sessions maintain correct state.

---

## 1. Edge Function Auth Strategy
**Problem:** Supabase Gateway frequently rejected valid JWTs with "Invalid JWT" (401) before they reached Edge Functions.
**Solution:** 
- In `supabase/config.toml`, critical functions like `manage-students` now have `verify_jwt = false`.
- **Frontend Strategy:** All calls to `supabase.functions.invoke` MUST manually include the session token in the headers:
  ```typescript
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.functions.invoke("function-name", {
    headers: { Authorization: `Bearer ${session?.access_token}` }
  });
  ```
- **Function Logic:** Verification is handled inside the function using `supabaseAdmin.auth.getUser(token)`.

## 2. User Roles & Identity Anchor
**Anchor:** The primary anchor for student identity is `profiles.tr_number` (BIGINT).
**Schema fix (user_roles):**
- The `user_roles` table uses `student_tr` (BIGINT) as the link, NOT `user_id`.
- **Database Trigger:** The `handle_new_user_linking()` function on `auth.users` has been refactored to:
    1. Search for a profile by email.
    2. Link `profiles.user_id` to `NEW.id`.
    3. Insert into `user_roles` using `student_tr = v_tr_number`.
    4. **Warning:** Do NOT use `user_id` in the `INSERT` to `user_roles`; it will fail with "Database error".

## 3. Student Creation Workflow (Edge Function)
To avoid race conditions and trigger failures:
1. **Pre-Create:** The Edge Function now `upserts` the profile into `public.profiles` using `tr_number` **BEFORE** calling `auth.admin.createUser`.
2. **Auth Creation:** Once the profile exists, create the Auth user.
3. **Manual Link:** The function performs a final `UPDATE` on the profile to ensure `user_id` is linked, acting as a fallback for the database trigger.

## 4. Specific Data Conflicts
- **Conflict Resolution:** TR 25689 was found using the email `25686@jameasaifiyah.edu`. This was manually resolved by prefixing the email with `conflict_`. Always check for email/TR mismatches before adding new batches.
