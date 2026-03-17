import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // 1. Verify Caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) throw new Error("Unauthorized");

    // 2. Check Admin Role
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("tr_number")
      .eq("user_id", caller.id)
      .maybeSingle();

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("student_tr", adminProfile?.tr_number)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Forbidden: admin only");

    // 3. Handle Actions
    const { action, students } = await req.json();

    if (action === "create") {
      const results = [];

      for (const student of students) {
        try {
          // A. PRE-CREATE PROFILE AND ROLE
          // This ensures constraints are met before Auth triggers run
          const { error: preProfError } = await supabaseAdmin
            .from("profiles")
            .upsert({
              tr_number: student.tr_number,
              full_name: student.full_name,
              edu_email: student.edu_email,
              its_number: student.its_number || null,
              house_id: student.house_id || null,
              hizb_id: student.hizb_id || null,
              darajah: student.darajah || null,
              class_name: student.class_name || null,
              birth_date: student.birth_date || null,
              is_under_18: student.is_under_18 || false,
            }, { onConflict: 'tr_number' });

          if (preProfError) throw new Error(`Profile setup failed: ${preProfError.message}`);

          // Ensure student role exists for this TR
          await supabaseAdmin
            .from("user_roles")
            .upsert({ student_tr: student.tr_number, role: "student" }, { onConflict: "student_tr,role" });

          // B. CREATE AUTH USER
          // The handle_new_user trigger will attempt to link via email
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: student.edu_email,
            password: generatePassword(),
            email_confirm: true,
            user_metadata: { full_name: student.full_name, tr_number: student.tr_number },
          });

          if (authError) {
            // If auth creation fails with "Database error", it's likely a trigger failing.
            // We'll try one more time by ensuring user_id is null on profile first.
            if (authError.message.includes("Database error")) {
               await supabaseAdmin.from("profiles").update({ user_id: null }).eq("tr_number", student.tr_number);
               const retry = await supabaseAdmin.auth.admin.createUser({
                  email: student.edu_email,
                  password: generatePassword(),
                  email_confirm: true,
                  user_metadata: { full_name: student.full_name, tr_number: student.tr_number },
               });
               if (retry.error) throw retry.error;
               authData.user = retry.data.user;
            } else {
               throw authError;
            }
          }

          // C. FINAL LINKING (Manual backup for trigger)
          await supabaseAdmin
            .from("profiles")
            .update({ user_id: authData.user.id })
            .eq("tr_number", student.tr_number);

          results.push({ success: true, edu_email: student.edu_email });
        } catch (e: any) {
          results.push({ success: false, edu_email: student.edu_email, error: e.message });
        }
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      const { tr_number, updates } = students;
      const { error } = await supabaseAdmin.from("profiles").update(updates).eq("tr_number", tr_number);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { tr_number, user_id } = students;
      if (user_id) await supabaseAdmin.auth.admin.deleteUser(user_id);
      const { error } = await supabaseAdmin.from("profiles").delete().eq("tr_number", tr_number);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
