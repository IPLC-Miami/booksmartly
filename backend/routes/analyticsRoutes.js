const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");
const { jwtValidation, roleExtraction, requireAdmin } = require("../middleware/auth");

// Get appointments per clinician
router.get("/appointments-per-clinician", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, clinicianId } = req.query;

    // Build the query
    let query = supabase
      .from("appointments2")
      .select(`
        id,
        appointment_date,
        status,
        clinician_id,
        clinicians2!inner(
          users!inner(name)
        )
      `);

    // Add date filters if provided
    if (startDate) {
      query = query.gte("appointment_date", startDate);
    }
    if (endDate) {
      query = query.lte("appointment_date", endDate);
    }
    if (clinicianId) {
      query = query.eq("clinician_id", clinicianId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch appointments data" });
    }

    // Group appointments by clinician
    const clinicianStats = {};
    appointments.forEach(appointment => {
      const clinicianName = appointment.clinicians2.users.name;
      const clinicianId = appointment.clinician_id;
      
      if (!clinicianStats[clinicianId]) {
        clinicianStats[clinicianId] = {
          name: clinicianName,
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
          paid: 0
        };
      }
      
      clinicianStats[clinicianId].total++;
      
      switch (appointment.status?.toLowerCase()) {
        case "completed":
          clinicianStats[clinicianId].completed++;
          break;
        case "pending":
          clinicianStats[clinicianId].pending++;
          break;
        case "cancelled":
          clinicianStats[clinicianId].cancelled++;
          break;
        case "paid":
          clinicianStats[clinicianId].paid++;
          break;
      }
    });

    // Convert to array format for charts
    const chartData = Object.values(clinicianStats);

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error("Get appointments per clinician error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get revenue analytics
router.get("/revenue", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    let query = supabase
      .from("invoices")
      .select(`
        amount,
        currency,
        status,
        created_at,
        appointment_id,
        appointments2!inner(
          appointment_date,
          price
        )
      `)
      .eq("status", "paid");

    // Add date filters if provided
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch revenue data" });
    }

    // Group revenue by time period
    const revenueData = {};
    let totalRevenue = 0;

    invoices.forEach(invoice => {
      const date = new Date(invoice.created_at);
      let key;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!revenueData[key]) {
        revenueData[key] = {
          period: key,
          revenue: 0,
          count: 0
        };
      }

      revenueData[key].revenue += parseFloat(invoice.amount);
      revenueData[key].count++;
      totalRevenue += parseFloat(invoice.amount);
    });

    // Convert to array and sort by period
    const chartData = Object.values(revenueData).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    res.json({
      success: true,
      data: {
        chartData,
        totalRevenue,
        totalInvoices: invoices.length
      }
    });

  } catch (error) {
    console.error("Get revenue analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get patient demographics
router.get("/patient-demographics", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from("appointments2")
      .select(`
        personal_details,
        appointment_date,
        status
      `);

    // Add date filters if provided
    if (startDate) {
      query = query.gte("appointment_date", startDate);
    }
    if (endDate) {
      query = query.lte("appointment_date", endDate);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch patient demographics" });
    }

    // Analyze demographics
    const ageGroups = {
      "0-18": 0,
      "19-30": 0,
      "31-45": 0,
      "46-60": 0,
      "60+": 0
    };

    const genderDistribution = {
      "Male": 0,
      "Female": 0,
      "Other": 0,
      "Not specified": 0
    };

    appointments.forEach(appointment => {
      try {
        const details = typeof appointment.personal_details === "string" 
          ? JSON.parse(appointment.personal_details) 
          : appointment.personal_details;

        // Age analysis
        const age = parseInt(details.age);
        if (!isNaN(age)) {
          if (age <= 18) ageGroups["0-18"]++;
          else if (age <= 30) ageGroups["19-30"]++;
          else if (age <= 45) ageGroups["31-45"]++;
          else if (age <= 60) ageGroups["46-60"]++;
          else ageGroups["60+"]++;
        }

        // Gender analysis
        const gender = details.gender || "Not specified";
        if (genderDistribution.hasOwnProperty(gender)) {
          genderDistribution[gender]++;
        } else {
          genderDistribution["Other"]++;
        }
      } catch (parseError) {
        console.error("Error parsing personal_details:", parseError);
      }
    });

    // Convert to chart format
    const ageChartData = Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count
    }));

    const genderChartData = Object.entries(genderDistribution).map(([gender, count]) => ({
      gender,
      count
    }));

    res.json({
      success: true,
      data: {
        ageDistribution: ageChartData,
        genderDistribution: genderChartData,
        totalPatients: appointments.length
      }
    });

  } catch (error) {
    console.error("Get patient demographics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get appointment trends
router.get("/appointment-trends", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.query;

    let query = supabase
      .from("appointments2")
      .select(`
        appointment_date,
        status,
        created_at
      `);

    // Add date filters if provided
    if (startDate) {
      query = query.gte("appointment_date", startDate);
    }
    if (endDate) {
      query = query.lte("appointment_date", endDate);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch appointment trends" });
    }

    // Group appointments by time period
    const trendsData = {};

    appointments.forEach(appointment => {
      const date = new Date(appointment.appointment_date);
      let key;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!trendsData[key]) {
        trendsData[key] = {
          period: key,
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0
        };
      }

      trendsData[key].total++;
      
      switch (appointment.status?.toLowerCase()) {
        case "completed":
          trendsData[key].completed++;
          break;
        case "pending":
          trendsData[key].pending++;
          break;
        case "cancelled":
          trendsData[key].cancelled++;
          break;
      }
    });

    // Convert to array and sort by period
    const chartData = Object.values(trendsData).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error("Get appointment trends error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get dashboard summary
router.get("/dashboard-summary", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { clinicianId } = req.query;
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Base queries
    let appointmentsQuery = supabase.from("appointments2").select("*");
    let invoicesQuery = supabase.from("invoices").select("*");

    // Filter by clinician if specified
    if (clinicianId) {
      appointmentsQuery = appointmentsQuery.eq("clinician_id", clinicianId);
      invoicesQuery = invoicesQuery.eq("clinician_id", clinicianId);
    }

    // Get appointments data
    const [
      { data: todayAppointments },
      { data: monthAppointments },
      { data: totalAppointments },
      { data: paidInvoices }
    ] = await Promise.all([
      appointmentsQuery.eq("appointment_date", today),
      appointmentsQuery.gte("appointment_date", thisMonth + "-01"),
      appointmentsQuery,
      invoicesQuery.eq("status", "paid")
    ]);

    // Calculate metrics
    const totalRevenue = paidInvoices?.reduce((sum, invoice) => 
      sum + parseFloat(invoice.amount), 0) || 0;

    const completedAppointments = totalAppointments?.filter(apt => 
      apt.status?.toLowerCase() === "completed").length || 0;

    const pendingAppointments = totalAppointments?.filter(apt => 
      apt.status?.toLowerCase() === "pending").length || 0;

    res.json({
      success: true,
      data: {
        todayAppointments: todayAppointments?.length || 0,
        monthAppointments: monthAppointments?.length || 0,
        totalAppointments: totalAppointments?.length || 0,
        completedAppointments,
        pendingAppointments,
        totalRevenue,
        totalInvoices: paidInvoices?.length || 0
      }
    });

  } catch (error) {
    console.error("Get dashboard summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;