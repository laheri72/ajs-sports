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

    // 1. Get Token and Verify Caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to get user from token safely
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ 
        error: "Unauthorized", 
        detail: authError?.message || "User not found" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get Caller's Profile (to get TR Number)
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("tr_number")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (profileError || !adminProfile) {
       return new Response(JSON.stringify({ 
         error: "Forbidden: profile missing", 
         detail: "No profile found for user_id: " + caller.id 
       }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check Admin Role using TR Number
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("student_tr", adminProfile.tr_number)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ 
        error: "Forbidden: admin only", 
        detail: "User (TR: " + adminProfile.tr_number + ") does not have admin role"
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Handle Actions
    const { action, students } = await req.json();

    if (action === "create") {
      const results: { success: boolean; edu_email: string; error?: string }[] = [];

      for (const student of students) {
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: student.edu_email,
            password: generatePassword(),
            email_confirm: true,
            user_metadata: { full_name: student.full_name },
          });

          if (authError) {
            results.push({ success: false, edu_email: student.edu_email, error: authError.message });
            continue;
          }

          const profilePayload = {
            user_id: authData.user.id,
            full_name: student.full_name,
            tr_number: student.tr_number,
            its_number: student.its_number || null,
            house_id: student.house_id || null,
            hizb_id: student.hizb_id || null,
            darajah: student.darajah || null,
            class_name: student.class_name || null,
            edu_email: student.edu_email,
            birth_date: student.birth_date || null,
            is_under_18: student.is_under_18 || false,
          };

          // The handle_new_user trigger might have already linked the profile
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert(profilePayload, { onConflict: 'tr_number' });

          if (profileError) {
            results.push({ success: false, edu_email: student.edu_email, error: profileError.message });
            continue;
          }

          // Ensure student role exists
          await supabaseAdmin
            .from("user_roles")
            .upsert({ student_tr: student.tr_number, role: "student" }, { onConflict: "student_tr,role" });

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

    // Handle other actions (update, delete) using tr_number...
    if (action === "update") {
      const { tr_number, updates } = students;
      const { error } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("tr_number", tr_number);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { tr_number, user_id } = students;
      if (user_id) {
        await supabaseAdmin.auth.admin.deleteUser(user_id);
      }
      const { error } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("tr_number", tr_number);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
