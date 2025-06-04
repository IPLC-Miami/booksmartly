const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const verifyToken = require("../config/verifyToken");
const { getCache, setCache } = require('../config/redisClient');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js'); // Renamed to avoid conflict if 'supabase' is used elsewhere for anon client
// Removed problematic import - using verifyToken instead
const sendOtp = require("../services/OtpService");
const validateOtp = require("../services/validateOtpService");

const frontend_url = process.env.frontend_url;

// Helper function to get user profile from appropriate table
// FIXED: Prioritizes clinicians over clients for users who exist in both tables
async function getUserProfile(userId) {
  try {
    // FIRST check if user exists in clinicians2 table (PRIORITY)
    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (clinicianData && !clinicianError) {
      // Get email and name from auth.users since clinicians2 doesn't have these fields
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      const email = authUser?.user?.email || '';
      let derivedAuthUserName = email; // Fallback if no name metadata
      if (authUser?.user?.user_metadata) {
          derivedAuthUserName = authUser.user.user_metadata.full_name || authUser.user.user_metadata.name || email;
      }

      return {
        data: {
          id: clinicianData.user_id,
          email: email,
          name: derivedAuthUserName, // Corrected: Use name from auth.users
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
      .select("*")
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

// Helper function to get all user profiles (clients + clinicians)
async function getAllUserProfiles() {
  try {
    // Get all clients
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*");

    // Get all clinicians
    const { data: cliniciansData, error: cliniciansError } = await supabase
      .from("clinicians2")
      .select("*");

    if (clientsError || cliniciansError) {
      return { data: null, error: clientsError || cliniciansError };
    }

    // Transform and combine data
    const allUsers = [];

    // Add clients
    if (clientsData) {
      clientsData.forEach(client => {
        allUsers.push({
          id: client.user_id || client.id,
          email: client.email,
          name: `${client.first_name} ${client.last_name}`,
          first_name: client.first_name,
          last_name: client.last_name,
          phone: client.phone,
          phone_number: client.phone,
          user_type: 'client',
          role: 'client',
          ...client
        });
      });
    }

    // Add clinicians
    if (cliniciansData) {
      cliniciansData.forEach(clinician => {
        allUsers.push({
          id: clinician.user_id || clinician.id,
          email: clinician.email || '',
          name: clinician.name || '',
          phone: clinician.phone || '',
          phone_number: clinician.phone || '',
          user_type: 'clinician',
          role: 'clinician',
          specialty: clinician.specialty,
          ...clinician
        });
      });
    }

    return { data: allUsers, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Helper function to check if email exists in either table
async function checkEmailExists(email) {
  try {
    // Check clients table
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (clientData && !clientError) {
      return { exists: true, user_type: 'client' };
    }

    // Check clinicians2 table (note: clinicians2 might not have email field)
    // For now, we'll focus on clients table for email checks
    return { exists: false, user_type: null };
  } catch (error) {
    throw error;
  }
}

// Helper function to check if phone exists in either table
async function checkPhoneExists(phone) {
  try {
    // Check clients table
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    if (clientData && !clientError) {
      return { exists: true, user_type: 'client' };
    }

    // Check clinicians2 table
    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .select("phone")
      .eq("phone", phone)
      .maybeSingle();

    if (clinicianData && !clinicianError) {
      return { exists: true, user_type: 'clinician' };
    }

    return { exists: false, user_type: null };
  } catch (error) {
    throw error;
  }
}
// const verifyToken = async (req, res, next) => {
//   // console.log(req.headers.authorization);
//   const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
//   console.log("in verify token", token);
//   // console.log("in access token");
//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }

//   try {
//     const { data: user, error } = await supabase.auth.getUser(token);

//     if (error || !user) {
//       return res.status(401).json({ error: "Unauthorized: Invalid token" });
//     }

//     req.user = user; // Attach user info to request
//     next(); // Proceed to next middleware or route
//   } catch (error) {
//     res.status(500).json({ error: "Server error verifying token" });
//   }
// };

// router.post("/register", async (req, res) => {
//   console.log("Hit /register route");
//   const { email, mobile, password, name, role } = req.body;
//   if (!email || !mobile || !password || !name || !role) {
//     console.log("Missing fields in request body");
//     return res.status(400).json({ error: "All fields are required" });
//   }
//   console.log("Request body:", req.body);
//   try {
//     const { data, error } = await supabase.from("users").insert([
//       {
//         email: email,
//         full_name: name,
//         role: role,
//         phone_number: mobile,
//       },
//     ]).select("*").single();
//     if (error) {
//       console.error("Error inserting user into Supabase:", error);
//       return res.status(400).json({ error: error.message });
//     }
//     console.log("Inserted user:", data);
//     res.status(201).json({ message: "User registered successfully", user: data });
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     res.status(500).json({ error: "Internal server error" });
// const User = require("../models/user");

// const { createClient } = require("@supabase/supabase-js");
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );
//later this route can be used as forgot password route
router.get("/sendOtp/:id", async (req, res) => {
  const { id } = req.params;
  const info = await sendOtp(id);
  res.json({ info });
});
//later this route can be used with forgot password route
router.get("/validateOtp/:id", async (req, res) => {
  const id = req.params.id;
  const { otp } = req.query;
  const info = await validateOtp(id, otp);
  res.json({ info });
});
router.get("/allusers", async (req, res) => {
  try {
    const { data, error } = await getAllUserProfiles();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userById/:Id", async (req, res) => {
  const { Id } = req.params;
  
  try {
    const { data, error } = await getUserProfile(Id);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  try {
    const result = await checkEmailExists(email);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/check-verified", async (req, res) => {
  const { email } = req.body;
  
  try {
    // For now, we'll check clients table for email verification
    // Note: clinicians2 table might not have email_verified field
    const { data, error } = await supabase
      .from("clients")
      .select("email_verified")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: "Error checking email verification" });
    }

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure text values are correctly converted to boolean
    const isVerified = data.email_verified === "true" || data.email_verified === true;

    return res.status(200).json({ verified: isVerified });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/check-phone", async (req, res) => {
  const { phone } = req.body;
  console.log(phone);

  try {
    const result = await checkPhoneExists(phone);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-auth-email-pass", async (req, res) => {
  const { old_email, new_email, new_password } = req.body;
  console.log(old_email, " ", new_email);

  try {
    // Fetch the user ID from auth.users based on the phone number
    const { data: users, error: fetchError } =
      await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error(fetchError);
      return res.status(400).json({ error: "Error fetching user list" });
    }
    //FINDING OL EMAIL's D USER ID
    const user = users.users.find((u) => u.email === old_email);
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User with this email not found" });
    }
    // Use Supabase Admin API to update the email in auth.user table
    const { data, error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        email: new_email,
        password: new_password,
        // email_confirm: false,
        // user_metadata: { force_email_confirmation: true },
      });

    if (updateError) {
      // console.log(updateError);
      console.error(updateError);
      return res.status(400).json({ error: "Error updating email" });
    }
    // return res
    //   .status(200)
    //   .json({ message: "Email updated successfully", data });

    // Update email in both clients and clinicians2 tables
    // First try clients table
    const { error: clientUpdateError } = await supabase
      .from("clients")
      .update({ email: new_email })
      .eq("user_id", user.id);

    // Then try clinicians2 table (note: clinicians2 might not have email field)
    const { error: clinicianUpdateError } = await supabase
      .from("clinicians2")
      .update({ email: new_email })
      .eq("user_id", user.id);

    // If both updates failed, return error
    if (clientUpdateError && clinicianUpdateError) {
      console.error("Client update error:", clientUpdateError);
      console.error("Clinician update error:", clinicianUpdateError);
      return res.status(400).json({ error: "Error updating profile in database" });
    }

    // //update user by id
    // const { data: updateData, error: updateErrorr } =
    //   await supabaseAdmin.auth.admin.updateUserById(user.id, {
    //     email_confirm: false,
    //     user_metadata: { ...userData.user.user_metadata, force_reverify: true },
    //   });
    // if (updateErrorr) throw updateErrorr;

    //send email
    // const { data1, error } = await supabase.auth.resend({
    //   type: "signup", // This is for email verification
    //   email: new_email,
    //   // options: {
    //   //   emailRedirectTo: '' // Optional redirect URL
    //   // }
    // });

    // if (error) {
    //   return res
    //     .status(400)
    //     .json({ error: "Error sending verification email" });
    // } else {
    //   console.log(data1);
    // }

    return res
      .status(200)
      .json({ message: "Email and password updated successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/user", async (req, res) => {
  try {
    const { data, error } = await getAllUserProfiles();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-user-details", async (req, res) => {
  try {
    // Extract fields from the request body
    const { id, age, gender, phoneNumber, phone_verified, name, first_name, last_name } = req.body;

    // Validate that 'id' is provided
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if there are fields to update
    const hasUpdates = age !== undefined || gender !== undefined || phoneNumber !== undefined ||
                      phone_verified !== undefined || name !== undefined || first_name !== undefined || last_name !== undefined;
    
    if (!hasUpdates) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Try to update clients table first
    let clientUpdateFields = {};
    if (age !== undefined) clientUpdateFields.age = age;
    if (gender !== undefined) clientUpdateFields.gender = gender;
    if (phoneNumber !== undefined) clientUpdateFields.phone = phoneNumber;
    if (phone_verified !== undefined) clientUpdateFields.phone_verified = phone_verified;
    if (first_name !== undefined) clientUpdateFields.first_name = first_name;
    if (last_name !== undefined) clientUpdateFields.last_name = last_name;

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .update(clientUpdateFields)
      .eq("user_id", id);

    // Try to update clinicians2 table
    let clinicianUpdateFields = {};
    if (name !== undefined) clinicianUpdateFields.name = name;
    if (phoneNumber !== undefined) clinicianUpdateFields.phone = phoneNumber;

    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .update(clinicianUpdateFields)
      .eq("user_id", id);

    // If both updates failed, return error
    if (clientError && clinicianError) {
      console.error("Client update error:", clientError);
      console.error("Clinician update error:", clinicianError);
      return res.status(500).json({ message: "Database update failed", error: clientError || clinicianError });
    }

    res.json({ message: "User details updated successfully", data: clientData || clinicianData });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/addUserIfNotExist", async (req, res) => {
  console.log("in backendP");
  console.log(req.body);
  const {
    id,
    email,
    name,
    first_name,
    last_name,
    phoneNumber,
    password,
    aadhaarNumber,
    emailVerified,
    createdAt,
    user_type = 'client' // Default to client if not specified
  } = req.body;

  try {
    let data, error;

    if (user_type === 'client') {
      // Insert into clients table
      const insertData = {
        user_id: id,
        email,
        first_name: first_name || name?.split(' ')[0] || '',
        last_name: last_name || name?.split(' ').slice(1).join(' ') || '',
        phone: phoneNumber,
        email_verified: emailVerified,
        created_at: createdAt || new Date().toISOString(),
      };

      if (aadhaarNumber) {
        insertData.aadhar_number = aadhaarNumber;
      }

      const result = await supabase.from("clients").insert([insertData]);
      data = result.data;
      error = result.error;
    } else if (user_type === 'clinician') {
      // Insert into clinicians2 table
      const result = await supabase.from("clinicians2").insert([
        {
          user_id: id,
          name: name || `${first_name} ${last_name}`,
          phone: phoneNumber,
          created_at: createdAt || new Date().toISOString(),
        },
      ]);
      data = result.data;
      error = result.error;
    } else {
      return res.status(400).json({ error: "Invalid user_type. Must be 'client' or 'clinician'" });
    }

    console.log(data, " ", error);

    if (error) {
      console.error("Insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: "Profile created successfully", data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  console.log("in rsend email");

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Get all users (requires Service Role Key)
    const { data: users, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      return res.status(400).json({ error: "Error retrieving users" });
    }

    // Find the user by email manually
    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Resend email confirmation
    // const { data, error } = await supabase.auth.admin.resendEmail(email);
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      console.error("Error resending email:", error);
    } else {
      console.log("Confirmation email resent:", data);
    }

    if (error) {
      throw error;
    }

    res.json({ message: "Verification email resent successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
  should return an object containing
    1)email
    2)name
    3)profile pic
    4)address
    5)age
    6)gender
    7)phone 
    8)phone confirmed or not
*/

router.get("/getUserById/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  const id = userId;
  console.log(req.params);
  console.log(userId);

  try {
    // Use helper function to get user profile
    const { data: profile, error: profileError } = await getUserProfile(id);
    
    if (profileError) {
      return res.status(500).json({ error: "Profile fetch failed" });
    }
    
    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }
    
    return res.json({ profile });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updateDetails/:id", verifyToken, async (req, res) => {
  const id = req.params;
  const userId = id.id;
  console.log(userId);

  const { name, address, age, gender, first_name, last_name } = req.body;
  console.log(
    "jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj"
  );
  console.log("in update user backend", userId);

  try {
    console.log("request to update user received");
    
    // Try to update clients table first
    let clientUpdateFields = {};
    if (first_name !== undefined) clientUpdateFields.first_name = first_name;
    if (last_name !== undefined) clientUpdateFields.last_name = last_name;
    if (address !== undefined) clientUpdateFields.address = address;
    if (age !== undefined) clientUpdateFields.age = age;
    if (gender !== undefined) clientUpdateFields.gender = gender;

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .update(clientUpdateFields)
      .eq("user_id", userId);

    // Try to update clinicians2 table
    let clinicianUpdateFields = {};
    if (name !== undefined) clinicianUpdateFields.name = name;

    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .update(clinicianUpdateFields)
      .eq("user_id", userId);

    console.log("request to update user completed");

    // If both updates failed, return error
    if (clientError && clinicianError) {
      console.log("Client error:", clientError);
      console.log("Clinician error:", clinicianError);
      throw clientError || clinicianError;
    }

    const data = clientData || clinicianData;
    console.log(data);
    return res.json({ data });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD: Explicit /getRole/:id route to match frontend expectations (will be mounted as /api/users/getRole/:id)
router.get("/getRole/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const cacheKey = `role:${id}`;

  // 1) Try Redis cache first
  try {
    const cachedRoleInfo = await getCache(cacheKey);
    if (cachedRoleInfo) {
      return res.json(cachedRoleInfo);
    }
  } catch (redisErr) {
    console.error(`Redis GET error for ${cacheKey}:`, redisErr.message);
  }

  // 2) Supabase lookup
  try {
    const supabaseServiceUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceUrl || !supabaseServiceKey) {
      console.error("Supabase service account credentials not found in .env for role lookup.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const serviceSupabase = createSupabaseClient(supabaseServiceUrl, supabaseServiceKey);

    // Use helper function to get user profile
    const { data: profile, error: profileError } = await getUserProfile(id);
    
    if (profileError) {
      return res.status(500).json({ error: "Profile fetch failed" });
    }
    
    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const roleInfo = {
      role: profile.role || profile.user_type,
      user_type: profile.user_type,
      id: profile.id,
      name: profile.name,
      email: profile.email
    };

    // 3) Cache the result for 5 minutes
    try {
      await setCache(cacheKey, roleInfo, 300);
    } catch (redisErr) {
      console.error(`Redis SET error for ${cacheKey}:`, redisErr.message);
    }

    return res.json(roleInfo);
  } catch (err) {
    console.error("Error in getRole:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
