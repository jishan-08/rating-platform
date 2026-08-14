const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function checkAndResetUsers() {
    try {
        const emails = [
            "david@example.com",
            "alice@example.com",
            "bob@example.com",
            "charlie@example.com"
        ];

        console.log("Checking users in database...");
        const [rows] = await pool.execute(
            `SELECT id, name, email, role, password_hash FROM users WHERE email IN (?, ?, ?, ?)`,
            emails
        );

        console.log("Found users:", rows.map(r => ({ id: r.id, email: r.email, role: r.role })));

        // Let's reset their passwords to 'Password123!' with a fresh bcrypt hash
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash("Password123!", salt);

        for (const user of rows) {
            await pool.execute(
                `UPDATE users SET password_hash = ? WHERE id = ?`,
                [newHash, user.id]
            );
            console.log(`Updated password for ${user.email} (Role: ${user.role}) to 'Password123!'`);
        }

        // If any of the 4 don't exist in DB, let's create them!
        const existingEmails = new Set(rows.map(r => r.email));
        
        if (!existingEmails.has("alice@example.com")) {
            await pool.execute(
                `INSERT INTO users (name, email, password_hash, role, address) VALUES (?, ?, ?, ?, ?)`,
                ["Alice Johnson", "alice@example.com", newHash, "USER", "123 Main St, Springfield"]
            );
            console.log("Created missing user alice@example.com");
        }

        if (!existingEmails.has("bob@example.com")) {
            await pool.execute(
                `INSERT INTO users (name, email, password_hash, role, address) VALUES (?, ?, ?, ?, ?)`,
                ["Bob Smith", "bob@example.com", newHash, "USER", "456 Oak Ave, Springfield"]
            );
            console.log("Created missing user bob@example.com");
        }

        if (!existingEmails.has("charlie@example.com")) {
            await pool.execute(
                `INSERT INTO users (name, email, password_hash, role, address) VALUES (?, ?, ?, ?, ?)`,
                ["Charlie Brown", "charlie@example.com", newHash, "USER", "789 Pine Rd, Springfield"]
            );
            console.log("Created missing user charlie@example.com");
        }

        if (!existingEmails.has("david@example.com")) {
            const [ownerRes] = await pool.execute(
                `INSERT INTO users (name, email, password_hash, role, address) VALUES (?, ?, ?, ?, ?)`,
                ["David Miller", "david@example.com", newHash, "STORE_OWNER", "101 Market St, Springfield"]
            );
            console.log("Created missing user david@example.com");

            // Also ensure David has a store if needed
            const [storeRows] = await pool.execute(`SELECT id FROM stores WHERE owner_id = ?`, [ownerRes.insertId]);
            if (storeRows.length === 0) {
                await pool.execute(
                    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
                    ["David's Fresh Market", "david.store@example.com", "101 Market St, Springfield", ownerRes.insertId]
                );
                console.log("Created store for David Miller");
            }
        }

        console.log("All 4 accounts are now verified with password 'Password123!'");
        process.exit(0);
    } catch (err) {
        console.error("Error checking/resetting users:", err);
        process.exit(1);
    }
}

checkAndResetUsers();
