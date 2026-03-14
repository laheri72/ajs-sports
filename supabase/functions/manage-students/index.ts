import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a client with the caller's token to verify their identity
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ 
        error: "Invalid token or unauthorized", 
        detail: authError?.message || "User not found" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("tr_number")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (profileError || !adminProfile) {
       return new Response(JSON.stringify({ 
         error: "Forbidden: profile missing or error", 
         detail: profileError?.message || "Profile not found for caller",
         caller_id: caller.id
       }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("student_tr", adminProfile.tr_number)
      .eq("role", "admin");

    if (roleError || !roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Forbidden: admin only", 
        detail: roleError,
        tr_number: adminProfile.tr_number
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, students } = await req.json();

    if (action === "create") {
      // students is an array of student objects
      const results: { success: boolean; edu_email: string; error?: string }[] = [];

      for (const student of students) {
        try {
          // Create auth user with edu_email (Google OAuth, random password as placeholder)
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

          // Upsert profile - insert if handle_new_user didn't create one, update if it did
          const profilePayload = {
            user_id: authData.user.id,
            full_name: student.full_name,
            tr_number: student.tr_number || null,
            its_number: student.its_number || null,
            house_id: student.house_id || null,
            hizb_id: student.hizb_id || null,
            darajah: student.darajah || null,
            class_name: student.class_name || null,
            edu_email: student.edu_email,
            birth_date: student.birth_date || null,
            is_under_18: student.is_under_18 || false,
            age_category: student.age_category || null,
          };

          // Check if profile already exists (created by trigger matching edu_email)
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("tr_number")
            .eq("user_id", authData.user.id)
            .maybeSingle();

          let profileError;
          if (existingProfile) {
            const { error } = await supabaseAdmin
              .from("profiles")
              .update(profilePayload)
              .eq("tr_number", existingProfile.tr_number);
            profileError = error;
          } else {
            const { error } = await supabaseAdmin
              .from("profiles")
              .insert(profilePayload);
            profileError = error;
          }

          if (profileError) {
            results.push({ success: false, edu_email: student.edu_email, error: profileError.message });
            continue;
          }

          // Ensure student role exists
          await supabaseAdmin
            .from("user_roles")
            .upsert({ student_tr: profilePayload.tr_number, role: "student" }, { onConflict: "student_tr,role" });

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

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*, houses(name, color), hizb(name)")
        .order("full_name");
      if (error) throw error;
      return new Response(JSON.stringify({ students: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    if (action === "reset-password") {
      const { user_id, new_password } = students;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: new_password || generatePassword(),
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { tr_number, user_id } = students;
      // Delete the auth user (cascades to profile via trigger or we clean up)
      if (user_id) {
        await supabaseAdmin.auth.admin.deleteUser(user_id);
      }
      // Also delete the profile directly in case user_id was a placeholder
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
