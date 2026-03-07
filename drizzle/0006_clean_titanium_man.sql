ALTER TABLE "user_subscription" ADD COLUMN "crypto_subscription_id" text;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "crypto_payment_tx_hash" text;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "crypto_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD COLUMN "is_crypto_subscription" boolean DEFAULT false;