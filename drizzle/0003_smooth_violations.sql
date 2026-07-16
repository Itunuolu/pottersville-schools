CREATE TABLE `academic_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academic_sessions_name_unique` ON `academic_sessions` (`name`);--> statement-breakpoint
CREATE TABLE `academic_terms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `academic_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `academic_terms_session_name_unique` ON `academic_terms` (`session_id`,`name`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`audience` text DEFAULT 'all' NOT NULL,
	`class_id` integer,
	`priority` text DEFAULT 'normal' NOT NULL,
	`published_by` text NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `announcements_audience_idx` ON `announcements` (`audience`,`published_at`);--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assignment_id` integer NOT NULL,
	`student_email` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`file_key` text,
	`file_name` text,
	`score` real,
	`feedback` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`graded_at` text,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_student_unique` ON `assignment_submissions` (`assignment_id`,`student_email`);--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`subject_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`teacher_email` text NOT NULL,
	`due_at` text NOT NULL,
	`max_score` integer DEFAULT 10 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignments_class_due_idx` ON `assignments` (`class_id`,`due_at`);--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`student_email` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`marked_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_student_date_unique` ON `attendance_records` (`student_email`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_class_date_idx` ON `attendance_records` (`class_id`,`date`);--> statement-breakpoint
CREATE TABLE `lesson_downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_note_id` integer NOT NULL,
	`student_email` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`lesson_note_id`) REFERENCES `lesson_notes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `report_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_email` text NOT NULL,
	`class_id` integer NOT NULL,
	`term_id` integer NOT NULL,
	`teacher_comment` text DEFAULT '' NOT NULL,
	`principal_comment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`approved_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `academic_terms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `report_student_term_unique` ON `report_cards` (`student_email`,`term_id`);--> statement-breakpoint
CREATE TABLE `result_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_email` text NOT NULL,
	`subject_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`term_id` integer NOT NULL,
	`ca_score` real DEFAULT 0 NOT NULL,
	`exam_score` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`grade` text DEFAULT 'F' NOT NULL,
	`teacher_comment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`entered_by` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `academic_terms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `result_student_subject_term_unique` ON `result_records` (`student_email`,`subject_id`,`term_id`);--> statement-breakpoint
CREATE INDEX `result_class_term_idx` ON `result_records` (`class_id`,`term_id`);--> statement-breakpoint
CREATE TABLE `school_classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`arm` text DEFAULT '' NOT NULL,
	`form_teacher_email` text,
	`capacity` integer DEFAULT 35 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `school_classes_name_unique` ON `school_classes` (`name`);--> statement-breakpoint
CREATE TABLE `school_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`location` text DEFAULT 'School campus' NOT NULL,
	`audience` text DEFAULT 'all' NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`department` text DEFAULT 'General' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_code_unique` ON `subjects` (`code`);--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject` text NOT NULL,
	`category` text DEFAULT 'General' NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`created_by` text NOT NULL,
	`assigned_to` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tickets_status_idx` ON `support_tickets` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `teacher_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_email` text NOT NULL,
	`subject_id` integer NOT NULL,
	`class_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teacher_assignments_unique` ON `teacher_assignments` (`teacher_email`,`subject_id`,`class_id`);--> statement-breakpoint
CREATE TABLE `timetable_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`subject_id` integer NOT NULL,
	`teacher_email` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`room` text DEFAULT 'Classroom' NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `school_classes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `timetable_teacher_day_idx` ON `timetable_entries` (`teacher_email`,`day_of_week`);--> statement-breakpoint
CREATE INDEX `timetable_class_day_idx` ON `timetable_entries` (`class_id`,`day_of_week`);