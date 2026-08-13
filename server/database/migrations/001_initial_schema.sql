-- Rating Platform initial schema (MySQL 9.7)
-- This migration intentionally contains schema only; it does not insert seed data.

CREATE DATABASE IF NOT EXISTS rating_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE rating_platform;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_users PRIMARY KEY (id),
  -- The database stores password hashes only; plaintext passwords have no column.
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_name_length
    CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 2 AND 60),
  CONSTRAINT chk_users_email_not_blank
    CHECK (CHAR_LENGTH(TRIM(email)) > 0),
  CONSTRAINT chk_users_password_hash_not_blank
    CHECK (CHAR_LENGTH(TRIM(password_hash)) > 0),
  CONSTRAINT chk_users_address_length
    CHECK (CHAR_LENGTH(TRIM(address)) BETWEEN 1 AND 400),
  CONSTRAINT chk_users_role
    CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
  INDEX idx_users_name (name),
  INDEX idx_users_role (role)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS stores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(254) NOT NULL,
  address VARCHAR(400) NOT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_stores PRIMARY KEY (id),
  -- A store owner may own more than one store; owner_id is intentionally not unique.
  CONSTRAINT chk_stores_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT chk_stores_email_not_blank
    CHECK (CHAR_LENGTH(TRIM(email)) > 0),
  CONSTRAINT chk_stores_address_not_blank
    CHECK (CHAR_LENGTH(TRIM(address)) BETWEEN 1 AND 400),
  CONSTRAINT fk_stores_owner
    FOREIGN KEY (owner_id) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_stores_name (name),
  INDEX idx_stores_email (email),
  INDEX idx_stores_address (address),
  INDEX idx_stores_owner_id (owner_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_ratings PRIMARY KEY (id),
  -- One row per user/store pair lets users update an existing rating rather than duplicate it.
  CONSTRAINT uq_ratings_user_store UNIQUE (user_id, store_id),
  CONSTRAINT chk_ratings_value CHECK (rating BETWEEN 1 AND 5),
  -- Removing a user or store removes only ratings that can no longer have a valid parent.
  CONSTRAINT fk_ratings_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_store
    FOREIGN KEY (store_id) REFERENCES stores (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  -- uq_ratings_user_store already indexes user_id as its leftmost column.
  INDEX idx_ratings_store_id (store_id)
) ENGINE = InnoDB;
