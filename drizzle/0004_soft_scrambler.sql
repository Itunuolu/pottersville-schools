ALTER TABLE `assessments` ADD `opens_at` text;--> statement-breakpoint
ALTER TABLE `assessments` ADD `closes_at` text;--> statement-breakpoint
ALTER TABLE `assessments` ADD `attempt_limit` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `randomize_questions` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `status` text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE `lesson_notes` ADD `term_id` integer;--> statement-breakpoint
ALTER TABLE `lesson_notes` ADD `week` integer;--> statement-breakpoint
ALTER TABLE `lesson_notes` ADD `topic` text DEFAULT '' NOT NULL;