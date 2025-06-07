const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_...");

// Import auth middleware
const {
  jwtValidation,
  roleExtraction,
  requireRole,
  requireClinician,
  requireAdmin,
  requireOwnership
} = require("../middleware/auth");

// Create invoice - Only clinicians and admins can create invoices
router.post("/create-invoice", jwtValidation, roleExtraction, requireRole(['clinician', 'admin']), async (req, res) => {
  try {
    const { appointmentId, clientId, clinicianId, amount, description } = req.body;

    // Validate required fields
    if (!appointmentId || !clientId || !clinicianId || !amount) {
      return res.status(400).json({ 
        error: "Missing required fields: appointmentId, clientId, clinicianId, amount" 
      });
    }

    // Get client details for Stripe customer
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select(`
        *,
        user_id,
        users!inner(email, name)
      `)
      .eq("id", clientId)
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Create or get Stripe customer
    let stripeCustomer;
    try {
      const customers = await stripe.customers.list({
        email: clientData.users.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      } else {
        stripeCustomer = await stripe.customers.create({
          email: clientData.users.email,
          name: clientData.users.name,
          metadata: {
            client_id: clientId,
            user_id: clientData.user_id
          }
        });
      }
    } catch (stripeError) {
      console.error("Stripe customer error:", stripeError);
      return res.status(500).json({ error: "Failed to create Stripe customer" });
    }

    // Create Stripe invoice
    let stripeInvoice;
    try {
      stripeInvoice = await stripe.invoices.create({
        customer: stripeCustomer.id,
        description: description || `Medical consultation - Appointment ${appointmentId}`,
        metadata: {
          appointment_id: appointmentId,
          client_id: clientId,
          clinician_id: clinicianId
        }
      });

      // Add invoice item
      await stripe.invoiceItems.create({
        customer: stripeCustomer.id,
        invoice: stripeInvoice.id,
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description: description || "Medical consultation"
      });

      // Finalize the invoice
      stripeInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    } catch (stripeError) {
      console.error("Stripe invoice error:", stripeError);
      return res.status(500).json({ error: "Failed to create Stripe invoice" });
    }

    // Save invoice to database
    const { data: invoice, error: dbError } = await supabase
      .from("invoices")
      .insert({
        appointment_id: appointmentId,
        client_id: clientId,
        clinician_id: clinicianId,
        stripe_invoice_id: stripeInvoice.id,
        amount: amount,
        currency: "USD",
        status: "pending"
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({ error: "Failed to save invoice to database" });
    }

    res.json({
      success: true,
      invoice: {
        ...invoice,
        stripe_invoice_url: stripeInvoice.hosted_invoice_url,
        stripe_payment_url: stripeInvoice.invoice_pdf
      }
    });

  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create Stripe checkout session - All authenticated users can create payment sessions
router.post("/create-session", jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ error: "Invoice ID is required" });
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        appointments2!inner(
          personal_details,
          appointment_date,
          chosen_slot
        ),
        clients!inner(
          users!inner(email, name)
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: "Medical Consultation",
              description: `Appointment on ${invoice.appointments2.appointment_date}`,
            },
            unit_amount: Math.round(invoice.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancelled?invoice_id=${invoiceId}`,
      customer_email: invoice.clients.users.email,
      metadata: {
        invoice_id: invoiceId,
        appointment_id: invoice.appointment_id
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get invoices for a clinician - Only clinicians can view their own invoices, admins can view all
router.get("/clinician/:clinicianId", jwtValidation, roleExtraction, requireRole(['clinician', 'admin']), requireOwnership('clinician'), async (req, res) => {
  try {
    const { clinicianId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("invoices")
      .select(`
        *,
        appointments2!inner(
          personal_details,
          appointment_date,
          chosen_slot
        ),
        clients!inner(
          users!inner(email, name)
        )
      `)
      .eq("clinician_id", clinicianId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }

    res.json({
      success: true,
      invoices: invoices || []
    });

  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all invoices (for reception staff) - Admin only access
router.get("/all", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search } = req.query;

    let query = supabase
      .from("invoices")
      .select(`
        *,
        appointments2!inner(
          personal_details,
          appointment_date,
          chosen_slot
        ),
        clients!inner(
          users!inner(email, name)
        ),
        clinicians2!inner(
          users!inner(name)
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }

    // Filter by search term if provided
    let filteredInvoices = invoices || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice => 
        invoice.clients.users.name.toLowerCase().includes(searchLower) ||
        invoice.clients.users.email.toLowerCase().includes(searchLower) ||
        invoice.clinicians2.users.name.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      invoices: filteredInvoices
    });

  } catch (error) {
    console.error("Get all invoices error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update invoice status - Admin only access
router.put("/update-status/:invoiceId", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "cancelled", "refunded"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update invoice" });
    }

    res.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error("Update invoice status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stripe webhook handler
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const invoiceId = session.metadata.invoice_id;
      
      if (invoiceId) {
        // Update invoice status to paid
        await supabase
          .from("invoices")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", invoiceId);

        // Update appointment status to paid
        const { data: invoice } = await supabase
          .from("invoices")
          .select("appointment_id")
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          await supabase
            .from("appointments2")
            .update({ status: "Paid" })
            .eq("id", invoice.appointment_id);
        }
      }
      break;

    case "invoice.payment_succeeded":
      const paidInvoice = event.data.object;
      const appointmentId = paidInvoice.metadata.appointment_id;
      
      if (appointmentId) {
        await supabase
          .from("invoices")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_invoice_id", paidInvoice.id);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;