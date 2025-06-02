// Fixed getUserProfile function that prioritizes clinicians over clients
// This fixes the issue where admin users exist in both tables

async function getUserProfile(userId) {
  try {
    // FIRST check if user exists in clinicians2 table (PRIORITY)
    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .select("*, 'clinician' as user_type")
      .eq("user_id", userId)
      .maybeSingle();

    if (clinicianData && !clinicianError) {
      // Get email from auth.users since clinicians2 doesn't have email
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      const email = authUser?.user?.email || '';

      return {
        data: {
          id: clinicianData.user_id,
          email: email,
          name: clinicianData.name || '',
          phone: clinicianData.phone || '',
          phone_number: clinicianData.phone || '',
          specialty: clinicianData.specialty,
          user_type: 'clinician',
          role: 'clinician',
          ...clinicianData
        },
        error: null
      };
    }

    // SECOND check if user exists in clients table (FALLBACK)
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*, 'client' as user_type")
      .eq("user_id", userId)
      .maybeSingle();

    if (clientData && !clientError) {
      return {
        data: {
          id: clientData.user_id,
          email: clientData.email,
          name: `${clientData.first_name} ${clientData.last_name}`,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
          phone_number: clientData.phone,
          date_of_birth: clientData.date_of_birth,
          address: clientData.address,
          user_type: 'client',
          role: 'client',
          ...clientData
        },
        error: null
      };
    }

    return { data: null, error: { message: "User profile not found" } };
  } catch (error) {
    return { data: null, error };
  }
}
