ALTER TABLE "service" ADD COLUMN "stats" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "intro" jsonb DEFAULT '[]'::jsonb NOT NULL;