DO $$ BEGIN
 CREATE TYPE "public"."match_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "type" ADD VALUE 'CODE';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenge_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer,
	"player_one_id" text NOT NULL,
	"player_two_id" text,
	"player_one_code" text,
	"player_two_code" text,
	"status" "match_status" DEFAULT 'pending' NOT NULL,
	"winner_id" text,
	"started_at" timestamp,
	"ended_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "problem_description" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "test_cases" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "stub_code_py" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "stub_code_js" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "stub_code_java" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "stub_code_cpp" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_player_one_id_user_progress_user_id_fk" FOREIGN KEY ("player_one_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_player_two_id_user_progress_user_id_fk" FOREIGN KEY ("player_two_id") REFERENCES "public"."user_progress"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_winner_id_user_progress_user_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."user_progress"("user_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
