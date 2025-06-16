-- Remove admin user from clinicians2 table to fix role conflict
-- The admin user should only exist in the admins table, not in clinicians2
DELETE FROM clinicians2 WHERE user_id = '58d83ac4-e027-44a9-a4f8-799d52955a0f';