CREATE TABLE IF NOT EXISTS "redeemed_transactions" (
	"tx_hash" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "wallet_address" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "redeemed_transactions" ADD CONSTRAINT "redeemed_transactions_user_id_user_progress_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_progress"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_wallet_address_unique" UNIQUE("wallet_address");