CREATE TABLE `assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`assessment_type` text NOT NULL,
	`subject` text NOT NULL,
	`class_name` text NOT NULL,
	`duration_minutes` integer DEFAULT 15 NOT NULL,
	`pass_mark` integer DEFAULT 50 NOT NULL,
	`created_by` text NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assessments_class_idx` ON `assessments` (`class_name`);--> statement-breakpoint
CREATE INDEX `assessments_created_idx` ON `assessments` (`created_at`);--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`student_email` text NOT NULL,
	`answers_json` text NOT NULL,
	`score` integer NOT NULL,
	`total_points` integer NOT NULL,
	`percentage` integer NOT NULL,
	`passed` integer NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempts_assessment_idx` ON `attempts` (`assessment_id`);--> statement-breakpoint
CREATE INDEX `attempts_student_idx` ON `attempts` (`student_email`,`submitted_at`);--> statement-breakpoint
CREATE TABLE `lesson_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`subject` text NOT NULL,
	`class_name` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`uploaded_by` text NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_notes_file_key_unique` ON `lesson_notes` (`file_key`);--> statement-breakpoint
CREATE INDEX `lesson_notes_class_idx` ON `lesson_notes` (`class_name`);--> statement-breakpoint
CREATE INDEX `lesson_notes_created_idx` ON `lesson_notes` (`created_at`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assessment_id` integer NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text NOT NULL,
	`correct_option` integer NOT NULL,
	`points` integer DEFAULT 1 NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_assessment_idx` ON `questions` (`assessment_id`,`position`);