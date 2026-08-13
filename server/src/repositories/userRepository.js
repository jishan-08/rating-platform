const pool = require("../config/database");

const SAFE_USER_COLUMNS = "id, name, email, address, role, created_at, updated_at";

async function createUser({ name, email, passwordHash, address, role }) {
    const [result] = await pool.execute(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, passwordHash, address, role]
    );

    return findUserById(result.insertId);
}

async function findUserByEmailWithPassword(email) {
    const [rows] = await pool.execute(
        `SELECT ${SAFE_USER_COLUMNS}, password_hash
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [email]
    );

    return rows[0] || null;
}

async function findUserById(id) {
    const [rows] = await pool.execute(
        `SELECT ${SAFE_USER_COLUMNS}
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmailWithPassword,
    findUserById,
};
