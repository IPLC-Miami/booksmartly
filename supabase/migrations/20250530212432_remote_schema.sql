

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
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


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


ALTER TABLE ONLY "public"."appointment_types"
    ADD CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinicians"
    ADD CONSTRAINT "clinicians_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clinicians"
    ADD CONSTRAINT "clinicians_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointments_app_date_clinician" ON "public"."appointments" USING "btree" ("appointment_date", "clinician_id");



CREATE INDEX "idx_appointments_client_id" ON "public"."appointments" USING "btree" ("client_id");



CREATE INDEX "idx_appointments_clinician_app_date" ON "public"."appointments" USING "btree" ("clinician_id", "appointment_date");



CREATE INDEX "idx_appointments_clinician_id" ON "public"."appointments" USING "btree" ("clinician_id");



CREATE INDEX "idx_appointments_date" ON "public"."appointments" USING "btree" ("appointment_date");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clinicians_email" ON "public"."clinicians" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "update_appointment_types_updated_at" BEFORE UPDATE ON "public"."appointment_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_clinicians_updated_at" BEFORE UPDATE ON "public"."clinicians" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_appointment_type_id_fkey" FOREIGN KEY ("appointment_type_id") REFERENCES "public"."appointment_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "public"."clinicians"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can read appointment_types" ON "public"."appointment_types" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Clinicians can read their own profile" ON "public"."clinicians" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Clinicians can update their own profile" ON "public"."clinicians" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Enable clinicians to read their own appointments" ON "public"."appointments" FOR SELECT USING (("clinician_id" = "auth"."uid"()));



CREATE POLICY "Enable clinicians to update their own appointments" ON "public"."appointments" FOR UPDATE USING (("clinician_id" = "auth"."uid"())) WITH CHECK (("clinician_id" = "auth"."uid"()));



CREATE POLICY "Enable full access for staff or admin" ON "public"."appointments" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Staff or Admin full access to appointment_types" ON "public"."appointment_types" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Staff or Admin full access to clients" ON "public"."clients" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Staff or Admin full access to clinicians" ON "public"."clinicians" USING ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"))) WITH CHECK ((((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'staff'::"text") OR ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



ALTER TABLE "public"."appointment_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinicians" ENABLE ROW LEVEL SECURITY;




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
