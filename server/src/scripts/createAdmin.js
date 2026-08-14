/**
 * Admin Provisioning Script
 * Safely creates an initial administrator account with hashed password and 'ADMIN' role.
 *
 * Usage:
 *   node src/scripts/createAdmin.js <name> <email> <password> <address>
 * Or via env variables:
 *   ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." ADMIN_ADDRESS="..." node src/scripts/createAdmin.js
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function createInitialAdmin() {
    const args = process.argv.slice(2);
    const name = (args[0] || process.env.ADMIN_NAME || "Platform Administrator").trim();
    const email = (args[1] || process.env.ADMIN_EMAIL || "admin@ratingplatform.com").trim().toLowerCase();
    const password = args[2] || process.env.ADMIN_PASSWORD || "AdminPass123!";
    const address = (args[3] || process.env.ADMIN_ADDRESS || "Corporate Headquarters, Suite 100").trim();

    if (!name || name.length < 2 || name.length > 60) {
        console.error("Error: Admin name must be between 2 and 60 characters.");
        process.exit(1);
    }

    if (!email || !email.includes("@")) {
        console.error("Error: Valid admin email address is required.");
        process.exit(1);
    }

    if (!password || password.length < 8 || password.length > 16) {
        console.error("Error: Admin password must be between 8 and 16 characters.");
        process.exit(1);
    }

    if (!address || address.length < 1 || address.length > 400) {
        console.error("Error: Admin address must be between 1 and 400 characters.");
        process.exit(1);
    }

    try {
        // Check if user already exists
        const [existing] = await pool.execute("SELECT id, email, role FROM users WHERE email = ? LIMIT 1", [email]);
        if (existing.length > 0) {
            console.log(`User with email '${email}' already exists with role: ${existing[0].role}.`);
            if (existing[0].role !== "ADMIN") {
                console.log("Upgrading existing user role to ADMIN...");
                await pool.execute("UPDATE users SET role = 'ADMIN' WHERE id = ?", [existing[0].id]);
                console.log("Successfully upgraded user to ADMIN.");
            }
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash, address, role)
             VALUES (?, ?, ?, ?, 'ADMIN')`,
            [name, email, passwordHash, address]
        );

        console.log("--------------------------------------------------");
        console.log("Initial ADMIN account created successfully!");
        console.log(`ID:      ${result.insertId}`);
        console.log(`Name:    ${name}`);
        console.log(`Email:   ${email}`);
        console.log(`Role:    ADMIN`);
        console.log("--------------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Failed to create admin user:", error.message);
        process.exit(1);
    }
}

createInitialAdmin();
