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

async function findRatingsByUserId(userId) {
    const [rows] = await pool.query(
        `SELECT
            r.id,
            r.user_id,
            r.store_id,
            r.rating,
            r.created_at,
            r.updated_at,
            s.name AS store_name,
            s.address AS store_address,
            s.email AS store_email
         FROM ratings r
         INNER JOIN stores s ON s.id = r.store_id
         WHERE r.user_id = ?
         ORDER BY r.updated_at DESC, r.created_at DESC`,
        [Number(userId)]
    );

    return rows.map((row) => ({
        id: Number(row.id),
        userId: Number(row.user_id),
        storeId: Number(row.store_id),
        storeName: row.store_name,
        storeAddress: row.store_address,
        storeEmail: row.store_email,
        rating: Number(row.rating),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

module.exports = {
    createUser,
    findUserByEmailWithPassword,
    findUserById,
    findRatingsByUserId,
};
