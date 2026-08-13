-- Migration: Update chk_users_name_length check constraint to accept names with 2-60 characters

USE rating_platform;

ALTER TABLE users DROP CHECK chk_users_name_length;

ALTER TABLE users
  ADD CONSTRAINT chk_users_name_length
  CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 2 AND 60);
