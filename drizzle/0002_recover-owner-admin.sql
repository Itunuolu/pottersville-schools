INSERT INTO `portal_users` (
  `email`,
  `display_name`,
  `role`,
  `status`,
  `class_name`,
  `school_id`,
  `created_by`
) VALUES (
  'itunuoluwaakinkugbe@gmail.com',
  'Itunuoluwa Akinkugbe',
  'admin',
  'active',
  NULL,
  'POTTERSVILLE',
  'system:owner-recovery'
)
ON CONFLICT(`email`) DO UPDATE SET
  `role` = 'admin',
  `status` = 'active',
  `class_name` = NULL,
  `updated_at` = CURRENT_TIMESTAMP;
