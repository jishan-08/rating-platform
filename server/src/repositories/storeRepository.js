/**
 * Store Repository
 * Data access layer for store listing, filtering, search, and rating aggregations.
 */

const pool = require("../config/database");

const STORE_SORT_COLUMNS = {
    name: "s.name",
    address: "s.address",
    average_rating: "average_rating",
    total_ratings: "total_ratings",
    created_at: "s.created_at",
};

function buildStoreFilters({ search, address }) {
    const conditions = [];
    const values = [];

    if (search) {
        conditions.push("s.name LIKE ?");
        values.push(`%${search}%`);
    }

    if (address) {
        conditions.push("s.address LIKE ?");
        values.push(`%${address}%`);
    }

    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        values,
    };
}

/**
 * List stores with aggregate rating metrics and current user's individual rating.
 */
async function listStoresWithRatings(userId, filters) {
    const { whereClause, values: filterValues } = buildStoreFilters(filters);
    const sortColumn = STORE_SORT_COLUMNS[filters.sortBy] || "s.name";
    const sortOrder = filters.sortOrder.toUpperCase();

    // 1. Get total matching count for pagination
    const [[countResult]] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM stores s
         ${whereClause}`,
        filterValues
    );

    // 2. Fetch paginated stores with rating aggregations
    // my_r.user_id = ? is passed as the first parameter
    const queryParams = [Number(userId), ...filterValues, Number(filters.limit), Number(filters.offset)];

    const [rows] = await pool.query(
        `SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.created_at,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
            COUNT(r.id) AS total_ratings,
            my_r.rating AS my_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         LEFT JOIN ratings my_r ON my_r.store_id = s.id AND my_r.user_id = ?
         ${whereClause}
         GROUP BY s.id, s.name, s.email, s.address, s.created_at, my_r.rating
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT ? OFFSET ?`,
        queryParams
    );

    // Map rows to clean, camelCase structure
    const stores = rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        email: row.email,
        address: row.address,
        averageRating: Number(parseFloat(row.average_rating).toFixed(2)),
        totalRatings: Number(row.total_ratings),
        myRating: row.my_rating !== null ? Number(row.my_rating) : null,
        createdAt: row.created_at,
    }));

    return {
        stores,
        total: Number(countResult.total),
    };
}

module.exports = {
    listStoresWithRatings,
};
