CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"insurer" text NOT NULL,
	"claim_amount" numeric NOT NULL,
	"rejection_date" date NOT NULL,
	"claim_type" text NOT NULL,
	"rejection_doc_path" text,
	"policy_doc_path" text,
	"bills_doc_path" text,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"ai_status" text DEFAULT 'pending' NOT NULL,
	"verdict_json" jsonb,
	"dispute_status" text,
	"amount_recovered" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"otpless_user_id" text,
	"phone" text,
	"email" text,
	"name" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_otpless_user_id_unique" UNIQUE("otpless_user_id"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;