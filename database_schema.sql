

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "category" character varying(100) NOT NULL,
    "duration" integer DEFAULT 60 NOT NULL,
    "price" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "clinician_id" "uuid" NOT NULL,
    "appointment_type_id" "uuid" NOT NULL,
    "appointment_date" timestamp with time zone NOT NULL,
    "duration" integer DEFAULT 60 NOT NULL,
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "notes" "text",
    "price" numeric(10,2) DEFAULT 0.00 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "appointments_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['Scheduled'::character varying, 'Confirmed'::character varying, 'Arrival'::character varying, 'In Progress'::character varying, 'Completed'::character varying, 'Cancelled'::character varying, 'Paid'::character varying])::"text"[])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "date_of_birth" "date",
    "address" "text",
    "emergency_contact_name" character varying(255),
    "emergency_contact_phone" character varying(20),
    "medical_history" "text",
    "insurance_provider" character varying(255),
    "insurance_policy_number" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


COMMENT ON COLUMN "public"."clients"."user_id" IS 'Foreign key to auth.users table, linking client profile to an authenticated user.';



CREATE TABLE IF NOT EXISTS "public"."clinicians" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(20),
    "specialty" character varying(255),
    "license_number" character varying(100),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinicians" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."appointment_dashboard" AS
 SELECT "a"."id",
    ("a"."id")::"text" AS "external_id",
    "a"."appointment_date" AS "start_time",
    ("a"."appointment_date" + ('00:01:00'::interval * ("a"."duration")::double precision)) AS "end_time",
    "a"."status",
    "a"."price",
        CASE
            WHEN ("a"."price" > (0)::numeric) THEN true
            ELSE false
        END AS "paid",
    "a"."price" AS "amount_paid",
    "a"."notes",
    "concat"("c"."first_name", ' ', "c"."last_name") AS "client_name",
    "c"."phone" AS "client_phone",
    "c"."email" AS "client_email",
    "cl"."name" AS "clinician_name",
    "cl"."specialty" AS "specialization",
    "at"."name" AS "appointment_type",
    "a"."duration" AS "duration_minutes",
    'in-person'::"text" AS "location_type",
    'system'::"text" AS "scheduled_by",
    "a"."created_at" AS "date_scheduled",
    "a"."updated_at" AS "date_rescheduled",
    "at"."category" AS "label"
   FROM ((("public"."appointments" "a"
     JOIN "public"."clients" "c" ON (("a"."client_id" = "c"."id")))
     JOIN "public"."clinicians" "cl" ON (("a"."clinician_id" = "cl"."id")))
     JOIN "public"."appointment_types" "at" ON (("a"."appointment_type_id" = "at"."id")))
  ORDER BY "a"."appointment_date";


ALTER TABLE "public"."appointment_dashboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments2" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "client_id" "uuid",
    "clinician_id" "uuid" NOT NULL,
    "appointment_type_id" "uuid",
    "appointment_date" timestamp with time zone NOT NULL,
    "chosen_slot" "jsonb",
    "personal_details" "jsonb",
    "status" character varying(50) DEFAULT 'scheduled'::character varying,
    "book_status" character varying(50),
    "checked_in_status" boolean DEFAULT false,
    "notes" "text",
    "price" numeric(10,2),
    "duration" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointments2" OWNER TO "postgres";


COMMENT ON TABLE "public"."appointments2" IS 'Stores detailed appointment records for the application.';



CREATE TABLE IF NOT EXISTS "public"."camps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "health_worker_id" "uuid",
    "camp_name" "text" NOT NULL,
    "organizer_name" "text",
    "organizer_phone" "text",
    "organizer_email" "text",
    "camp_start_date" "date" NOT NULL,
    "camp_end_date" "date" NOT NULL,
    "location_address" "text",
    "latitude" numeric,
    "longitude" numeric,
    "target_audience" "text",
    "estimated_attendees" integer,
    "medical_services" "jsonb",
    "camp_images" "text",
    "police_permission" "text",
    "local_auth_permission" "text",
    "other_documents" "text",
    "registration_deadline" "date",
    "camp_status" character varying(50) DEFAULT 'Planned'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_camp_dates_camps" CHECK (("camp_end_date" >= "camp_start_date"))
);


ALTER TABLE "public"."camps" OWNER TO "postgres";


COMMENT ON TABLE "public"."camps" IS 'Stores information about health camps.';



COMMENT ON COLUMN "public"."camps"."health_worker_id" IS 'ID of the authenticated user (health worker) who registered the camp.';



COMMENT ON COLUMN "public"."camps"."medical_services" IS 'JSON array of medical services provided at the camp.';



COMMENT ON COLUMN "public"."camps"."camp_images" IS 'URL to the primary image for the camp.';



COMMENT ON COLUMN "public"."camps"."camp_status" IS 'Current status of the camp (e.g., Planned, Active, Completed).';



CREATE TABLE IF NOT EXISTS "public"."campsxclinicians" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "camp_id" "uuid" NOT NULL,
    "clinician_id" "uuid" NOT NULL,
    "camp_start_date" "date" NOT NULL,
    "camp_end_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_camp_dates" CHECK (("camp_end_date" >= "camp_start_date"))
);


ALTER TABLE "public"."campsxclinicians" OWNER TO "postgres";


COMMENT ON TABLE "public"."campsxclinicians" IS 'Join table linking clinicians to health camps they volunteer for, including their volunteer dates.';



COMMENT ON COLUMN "public"."campsxclinicians"."camp_id" IS 'Foreign key to the camps table (to be created).';



COMMENT ON COLUMN "public"."campsxclinicians"."clinician_id" IS 'Foreign key to the clinicians2 table.';



COMMENT ON COLUMN "public"."campsxclinicians"."camp_start_date" IS 'Start date of the clinician''s volunteering period for the camp.';



COMMENT ON COLUMN "public"."campsxclinicians"."camp_end_date" IS 'End date of the clinician''s volunteering period for the camp.';



CREATE TABLE IF NOT EXISTS "public"."clinicians2" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reception_id" "uuid",
    "specialty" "text",
    "experience_years" "text",
    "hospital_name" "text",
    "available_from" time without time zone,
    "available_to" time without time zone,
    "license_number" "text",
    "is_active" boolean DEFAULT true,
    "bio" "text",
    "office_address" "text",
    "consultation_fees" numeric(10,2),
    "working_hours" "jsonb",
    "education" "text",
    "experience" "text",
    "profile_picture_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinicians2" OWNER TO "postgres";


COMMENT ON TABLE "public"."clinicians2" IS 'Stores detailed profile and operational data for clinicians, linked to auth.users via user_id.';



CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "clinician_id" "uuid",
    "message" "text" NOT NULL,
    "rating" integer,
    "tags" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."feedback" IS 'Stores feedback submitted by users for appointments and clinicians.';



COMMENT ON COLUMN "public"."feedback"."appointment_id" IS 'Foreign key to appointments2 table.';



COMMENT ON COLUMN "public"."feedback"."user_id" IS 'Foreign key to auth.users, identifies the user who submitted the feedback.';



COMMENT ON COLUMN "public"."feedback"."clinician_id" IS 'Foreign key to clinicians2, identifies the clinician the feedback is about.';



COMMENT ON COLUMN "public"."feedback"."message" IS 'The textual content of the feedback.';



COMMENT ON COLUMN "public"."feedback"."rating" IS 'Optional star rating (1-5).';



COMMENT ON COLUMN "public"."feedback"."tags" IS 'JSONB field to store tags or categories related to the feedback.';



CREATE TABLE IF NOT EXISTS "public"."healthcheckups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "camp_id" "uuid",
    "health_worker_id" "uuid",
    "checkup_date" timestamp with time zone DEFAULT "now"(),
    "height_cm" numeric,
    "weight_kg" numeric,
    "bmi" numeric,
    "temperature_celsius" numeric,
    "blood_pressure_systolic" integer,
    "blood_pressure_diastolic" integer,
    "heart_rate_bpm" integer,
    "respiratory_rate_bpm" integer,
    "oxygen_saturation_percent" numeric,
    "chief_complaint" "text",
    "medical_history" "text",
    "current_medications" "text",
    "allergies" "text",
    "speech_clarity_rating" integer,
    "language_comprehension_notes" "text",
    "fluency_notes" "text",
    "voice_quality_notes" "text",
    "swallowing_concerns" boolean,
    "fine_motor_skills_notes" "text",
    "gross_motor_skills_notes" "text",
    "adl_assistance_level" character varying(100),
    "sensory_processing_notes" "text",
    "observations" "text",
    "recommendations" "text",
    "referral_needed" boolean,
    "referred_to" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "healthcheckups_speech_clarity_rating_check" CHECK ((("speech_clarity_rating" >= 1) AND ("speech_clarity_rating" <= 5)))
);


ALTER TABLE "public"."healthcheckups" OWNER TO "postgres";


COMMENT ON TABLE "public"."healthcheckups" IS 'Stores data collected during health checkups, potentially at camps or clinics.';



COMMENT ON COLUMN "public"."healthcheckups"."client_id" IS 'Identifier for the client/patient.';



COMMENT ON COLUMN "public"."healthcheckups"."camp_id" IS 'Optional: Identifier for the camp where the checkup took place.';



COMMENT ON COLUMN "public"."healthcheckups"."health_worker_id" IS 'Identifier for the health worker who conducted/recorded the checkup.';



CREATE TABLE IF NOT EXISTS "public"."receptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "qrcode" "text"
);


ALTER TABLE "public"."receptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."receptions" IS 'Stores information about reception locations/desks.';



COMMENT ON COLUMN "public"."receptions"."qrcode" IS 'Stores the encrypted QR code string for reception check-in or identification.';



CREATE TABLE IF NOT EXISTS "public"."test_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "clinician_id" "uuid",
    "test_name" "text",
    "test_date" "date" NOT NULL,
    "report_url" "text" NOT NULL,
    "uploaded_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_reports" OWNER TO "postgres";


COMMENT ON TABLE "public"."test_reports" IS 'Stores metadata and links to test report files.';



COMMENT ON COLUMN "public"."test_reports"."appointment_id" IS 'Foreign key to the appointments2 table.';



COMMENT ON COLUMN "public"."test_reports"."client_id" IS 'Denormalized client ID for easier access.';



COMMENT ON COLUMN "public"."test_reports"."clinician_id" IS 'Denormalized clinician ID for easier access.';



COMMENT ON COLUMN "public"."test_reports"."report_url" IS 'Path/URL to the report file in Supabase Storage.';



COMMENT ON COLUMN "public"."test_reports"."uploaded_by" IS 'User ID of the person who uploaded the report.';



ALTER TABLE ONLY "public"."appointment_types"
    ADD CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments2"
    ADD CONSTRAINT "appointments2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."camps"
    ADD CONSTRAINT "camps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campsxclinicians"
    ADD CONSTRAINT "campsxclinicians_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinicians2"
    ADD CONSTRAINT "clinicians2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinicians2"
    ADD CONSTRAINT "clinicians2_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."clinicians"
    ADD CONSTRAINT "clinicians_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clinicians"
    ADD CONSTRAINT "clinicians_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."healthcheckups"
    ADD CONSTRAINT "healthcheckups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receptions"
    ADD CONSTRAINT "receptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_reports"
    ADD CONSTRAINT "test_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campsxclinicians"
    ADD CONSTRAINT "uq_camp_clinician_start_date" UNIQUE ("camp_id", "clinician_id", "camp_start_date");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "uq_clients_user_id" UNIQUE ("user_id");



CREATE INDEX "idx_appointments_app_date_clinician" ON "public"."appointments" USING "btree" ("appointment_date", "clinician_id");



CREATE INDEX "idx_appointments_client_id" ON "public"."appointments" USING "btree" ("client_id");



CREATE INDEX "idx_appointments_clinician_app_date" ON "public"."appointments" USING "btree" ("clinician_id", "appointment_date");



CREATE INDEX "idx_appointments_clinician_id" ON "public"."appointments" USING "btree" ("clinician_id");



CREATE INDEX "idx_appointments_date" ON "public"."appointments" USING "btree" ("appointment_date");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clinicians_email" ON "public"."clinicians" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "update_appointment_types_updated_at" BEFORE UPDATE ON "public"."appointment_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_appointments2_updated_at" BEFORE UPDATE ON "public"."appointments2" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_camps_updated_at" BEFORE UPDATE ON "public"."camps" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campsxclinicians_updated_at" BEFORE UPDATE ON "public"."campsxclinicians" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clinicians2_updated_at" BEFORE UPDATE ON "public"."clinicians2" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clinicians_updated_at" BEFORE UPDATE ON "public"."clinicians" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_feedback_updated_at" BEFORE UPDATE ON "public"."feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_healthcheckups_updated_at" BEFORE UPDATE ON "public"."healthcheckups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_receptions_updated_at" BEFORE UPDATE ON "public"."receptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_test_reports_updated_at" BEFORE UPDATE ON "public"."test_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."appointments2"
    ADD CONSTRAINT "appointments2_appointment_type_id_fkey" FOREIGN KEY ("appointment_type_id") REFERENCES "public"."appointment_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments2"
    ADD CONSTRAINT "appointments2_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments2"
    ADD CONSTRAINT "appointments2_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_appointment_type_id_fkey" FOREIGN KEY ("appointment_type_id") REFERENCES "public"."appointment_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."camps"
    ADD CONSTRAINT "camps_health_worker_id_fkey" FOREIGN KEY ("health_worker_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campsxclinicians"
    ADD CONSTRAINT "campsxclinicians_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinicians2"
    ADD CONSTRAINT "clinicians2_reception_id_fkey" FOREIGN KEY ("reception_id") REFERENCES "public"."receptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clinicians2"
    ADD CONSTRAINT "clinicians2_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians2"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campsxclinicians"
    ADD CONSTRAINT "fk_campsxclinicians_camp_id" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "fk_campsxclinicians_camp_id" ON "public"."campsxclinicians" IS 'Ensures camp_id in campsxclinicians refers to a valid camp in the camps table.';



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "fk_clients_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."healthcheckups"
    ADD CONSTRAINT "healthcheckups_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."healthcheckups"
    ADD CONSTRAINT "healthcheckups_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."healthcheckups"
    ADD CONSTRAINT "healthcheckups_health_worker_id_fkey" FOREIGN KEY ("health_worker_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."test_reports"
    ADD CONSTRAINT "test_reports_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."test_reports"
    ADD CONSTRAINT "test_reports_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."test_reports"
    ADD CONSTRAINT "test_reports_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians2"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."test_reports"
    ADD CONSTRAINT "test_reports_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated can view camp clinician associations" ON "public"."campsxclinicians" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated can view camps" ON "public"."camps" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can create appointments" ON "public"."appointments2" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can insert camps" ON "public"."camps" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "health_worker_id"));



CREATE POLICY "Authenticated users can read appointment_types" ON "public"."appointment_types" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can read reception info" ON "public"."receptions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authorized users can insert test reports" ON "public"."test_reports" FOR INSERT TO "authenticated" WITH CHECK ((((EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "test_reports"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1))) AND ("uploaded_by" = "auth"."uid"())));



CREATE POLICY "Camp creators or admin can delete camps" ON "public"."camps" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "health_worker_id") OR (( SELECT "pg_roles"."rolname"
   FROM "pg_roles"
  WHERE ("pg_roles"."oid" = ("auth"."role"())::"oid")) = 'service_role'::"name")));



CREATE POLICY "Camp creators or admin can update camps" ON "public"."camps" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "health_worker_id") OR (( SELECT "pg_roles"."rolname"
   FROM "pg_roles"
  WHERE ("pg_roles"."oid" = ("auth"."role"())::"oid")) = 'service_role'::"name"))) WITH CHECK ((("auth"."uid"() = "health_worker_id") OR (( SELECT "pg_roles"."rolname"
   FROM "pg_roles"
  WHERE ("pg_roles"."oid" = ("auth"."role"())::"oid")) = 'service_role'::"name")));



CREATE POLICY "Clients can delete their own data" ON "public"."clients" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Clients can insert their own data" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Clients can update their own data" ON "public"."clients" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Clients can view their own data" ON "public"."clients" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Clients can view their own health checkups" ON "public"."healthcheckups" FOR SELECT TO "authenticated" USING (("client_id" = ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE ("clients"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Clients can view their own test reports" ON "public"."test_reports" FOR SELECT TO "authenticated" USING (("client_id" = ( SELECT "clients"."id"
   FROM "public"."clients"
  WHERE ("clients"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Clinicians can read their own profile" ON "public"."clinicians" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Clinicians can update appointments they are assigned to" ON "public"."appointments2" FOR UPDATE USING (("auth"."uid"() = ( SELECT "clinicians2"."user_id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."id" = "appointments2"."clinician_id")))) WITH CHECK (("auth"."uid"() = ( SELECT "clinicians2"."user_id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."id" = "appointments2"."clinician_id"))));



CREATE POLICY "Clinicians can update their own clinicians2 profile" ON "public"."clinicians2" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Clinicians can update their own profile" ON "public"."clinicians" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Clinicians can view feedback for their appointments" ON "public"."feedback" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "feedback"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1))));



CREATE POLICY "Clinicians can view relevant test reports" ON "public"."test_reports" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "test_reports"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1))));



CREATE POLICY "Clinicians can view their own clinicians2 profile" ON "public"."clinicians2" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable clinicians to read their own appointments" ON "public"."appointments" FOR SELECT USING (("clinician_id" = "auth"."uid"()));



CREATE POLICY "Enable clinicians to update their own appointments" ON "public"."appointments" FOR UPDATE USING (("clinician_id" = "auth"."uid"())) WITH CHECK (("clinician_id" = "auth"."uid"()));



CREATE POLICY "Enable full access for staff or admin" ON "public"."appointments" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Health workers can insert health checkups" ON "public"."healthcheckups" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "health_worker_id"));



CREATE POLICY "Recorders can delete their health checkups" ON "public"."healthcheckups" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "health_worker_id"));



CREATE POLICY "Recorders can update their health checkups" ON "public"."healthcheckups" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "health_worker_id")) WITH CHECK (("auth"."uid"() = "health_worker_id"));



CREATE POLICY "Service role can manage camp clinician associations" ON "public"."campsxclinicians" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Staff or Admin full access to appointment_types" ON "public"."appointment_types" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Staff or Admin full access to clients" ON "public"."clients" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Staff or Admin full access to clinicians" ON "public"."clinicians" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Uploaders or relevant clinicians can delete test reports" ON "public"."test_reports" FOR DELETE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "test_reports"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1))));



CREATE POLICY "Uploaders or relevant clinicians can update test reports" ON "public"."test_reports" FOR UPDATE TO "authenticated" USING ((("uploaded_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "test_reports"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1)))) WITH CHECK ((("uploaded_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clinicians2" "cl" ON (("a"."clinician_id" = "cl"."id")))
  WHERE (("a"."id" = "test_reports"."appointment_id") AND ("cl"."user_id" = "auth"."uid"())))) OR ("clinician_id" = ( SELECT "clinicians2"."id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."user_id" = "auth"."uid"())
 LIMIT 1))));



CREATE POLICY "Users can insert feedback for their appointments" ON "public"."feedback" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."appointments2" "a"
     JOIN "public"."clients" "c" ON (("a"."client_id" = "c"."id")))
  WHERE (("a"."id" = "feedback"."appointment_id") AND ("c"."user_id" = "auth"."uid"())))) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can view their own appointments (clients or clinicians)" ON "public"."appointments2" FOR SELECT USING ((("auth"."uid"() = "client_id") OR ("auth"."uid"() = ( SELECT "clinicians2"."user_id"
   FROM "public"."clinicians2"
  WHERE ("clinicians2"."id" = "appointments2"."clinician_id")))));



CREATE POLICY "Users can view their own submitted feedback" ON "public"."feedback" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."appointment_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments2" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."camps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campsxclinicians" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinicians" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinicians2" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."healthcheckups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."receptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_reports" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointment_types" TO "anon";
GRANT ALL ON TABLE "public"."appointment_types" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_types" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."clinicians" TO "anon";
GRANT ALL ON TABLE "public"."clinicians" TO "authenticated";
GRANT ALL ON TABLE "public"."clinicians" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_dashboard" TO "anon";
GRANT ALL ON TABLE "public"."appointment_dashboard" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_dashboard" TO "service_role";



GRANT ALL ON TABLE "public"."appointments2" TO "anon";
GRANT ALL ON TABLE "public"."appointments2" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments2" TO "service_role";



GRANT ALL ON TABLE "public"."camps" TO "anon";
GRANT ALL ON TABLE "public"."camps" TO "authenticated";
GRANT ALL ON TABLE "public"."camps" TO "service_role";



GRANT ALL ON TABLE "public"."campsxclinicians" TO "anon";
GRANT ALL ON TABLE "public"."campsxclinicians" TO "authenticated";
GRANT ALL ON TABLE "public"."campsxclinicians" TO "service_role";



GRANT ALL ON TABLE "public"."clinicians2" TO "anon";
GRANT ALL ON TABLE "public"."clinicians2" TO "authenticated";
GRANT ALL ON TABLE "public"."clinicians2" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."healthcheckups" TO "anon";
GRANT ALL ON TABLE "public"."healthcheckups" TO "authenticated";
GRANT ALL ON TABLE "public"."healthcheckups" TO "service_role";



GRANT ALL ON TABLE "public"."receptions" TO "anon";
GRANT ALL ON TABLE "public"."receptions" TO "authenticated";
GRANT ALL ON TABLE "public"."receptions" TO "service_role";



GRANT ALL ON TABLE "public"."test_reports" TO "anon";
GRANT ALL ON TABLE "public"."test_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."test_reports" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
