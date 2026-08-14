/**
 * Owner Repository
 * Data access layer for Store Owner queries.
 * Strictly resolves stores and ratings using the authenticated owner's user ID.
 */

const pool = require("../config/database");

/**
 * Find store record belonging to a specific owner user ID.
 */
async function getOwnerStore(ownerUserId) {
    const [rows] = await pool.execute(
        `SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            s.created_at,
            s.updated_at,
            u.name AS owner_name,
            u.email AS owner_email,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
            COUNT(r.id) AS total_ratings
         FROM stores s
         JOIN users u ON s.owner_id = u.id
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at, u.name, u.email
         LIMIT 1`,
        [Number(ownerUserId)]
    );

    if (rows.length === 0) {
        return null;
    }

    const row = rows[0];
    return {
        id: Number(row.id),
        name: row.name,
        email: row.email,
        address: row.address,
        ownerId: Number(row.owner_id),
        ownerName: row.owner_name,
        ownerEmail: row.owner_email,
        averageRating: Number(parseFloat(row.average_rating).toFixed(2)),
        totalRatings: Number(row.total_ratings),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/**
 * Get rating count breakdown (5★, 4★, 3★, 2★, 1★) for a given store ID.
 */
async function getOwnerRatingDistribution(storeId) {
    const [rows] = await pool.execute(
        `SELECT
            rating,
            COUNT(*) AS count
         FROM ratings
         WHERE store_id = ?
         GROUP BY rating`,
        [Number(storeId)]
    );

    const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };

    for (const row of rows) {
        const r = Number(row.rating);
        if (distribution[r] !== undefined) {
            distribution[r] = Number(row.count);
        }
    }

    return distribution;
}

/**
 * Get list of ratings submitted by customers for the owner's store.
 */
async function getOwnerStoreRatings(storeId) {
    const [rows] = await pool.execute(
        `SELECT
            r.id,
            r.rating,
            r.created_at,
            r.updated_at,
            u.name AS customer_name,
            u.email AS customer_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = ?
         ORDER BY r.created_at DESC`,
        [Number(storeId)]
    );

    return rows.map((row) => ({
        id: Number(row.id),
        rating: Number(row.rating),
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

module.exports = {
    getOwnerStore,
    getOwnerRatingDistribution,
    getOwnerStoreRatings,
};
