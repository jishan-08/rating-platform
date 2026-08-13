const pool = require("../config/database");

const USER_COLUMNS = "id, name, email, address, role, created_at, updated_at";
const USER_SORT_COLUMNS = {
    id: "id",
    name: "name",
    email: "email",
    address: "address",
    role: "role",
    created_at: "created_at",
    updated_at: "updated_at",
};
const STORE_SORT_COLUMNS = {
    id: "s.id",
    name: "s.name",
    email: "s.email",
    address: "s.address",
    owner_name: "owner_name",
    created_at: "s.created_at",
    updated_at: "s.updated_at",
    average_rating: "average_rating",
};

function buildUserFilters({ name, email, address, role }) {
    const conditions = [];
    const values = [];

    if (name) {
        conditions.push("name LIKE ?");
        values.push(`%${name}%`);
    }
    if (email) {
        conditions.push("email LIKE ?");
        values.push(`%${email}%`);
    }
    if (address) {
        conditions.push("address LIKE ?");
        values.push(`%${address}%`);
    }
    if (role) {
        conditions.push("role = ?");
        values.push(role);
    }

    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        values,
    };
}

function buildStoreFilters({ name, email, address }) {
    const conditions = [];
    const values = [];

    if (name) {
        conditions.push("s.name LIKE ?");
        values.push(`%${name}%`);
    }
    if (email) {
        conditions.push("s.email LIKE ?");
        values.push(`%${email}%`);
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

async function getDashboardStatistics() {
    const [[userCounts], [storeCounts], [ratingCounts]] = await Promise.all([
        pool.execute(
            `SELECT COUNT(*) AS total_users,
                    SUM(role = 'ADMIN') AS total_admins,
                    SUM(role = 'USER') AS total_normal_users,
                    SUM(role = 'STORE_OWNER') AS total_store_owners
             FROM users`
        ),
        pool.execute("SELECT COUNT(*) AS total_stores FROM stores"),
        pool.execute("SELECT COUNT(*) AS total_ratings FROM ratings"),
    ]);

    return {
        totalUsers: userCounts[0].total_users,
        totalStores: storeCounts[0].total_stores,
        totalRatings: ratingCounts[0].total_ratings,
        roles: {
            admins: userCounts[0].total_admins,
            users: userCounts[0].total_normal_users,
            storeOwners: userCounts[0].total_store_owners,
        },
    };
}

async function listUsers(filters) {
    const { whereClause, values } = buildUserFilters(filters);
    const sortColumn = USER_SORT_COLUMNS[filters.sortBy];
    const sortOrder = filters.sortOrder.toUpperCase();
    const [[countResult]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM users ${whereClause}`,
        values
    );
    const [rows] = await pool.query(
        `SELECT ${USER_COLUMNS}
         FROM users
         ${whereClause}
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...values, filters.limit, filters.offset]
    );

    return { users: rows, total: countResult.total };
}

async function createStore({ name, email, address, ownerId }) {
    const [result] = await pool.execute(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES (?, ?, ?, ?)`,
        [name, email, address, ownerId]
    );

    return findStoreById(result.insertId);
}

async function findStoreById(id) {
    const [rows] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                owner.name AS owner_name, owner.email AS owner_email,
                AVG(r.rating) AS average_rating
         FROM stores s
         INNER JOIN users owner ON owner.id = s.owner_id
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.id = ?
         GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                  owner.name, owner.email`,
        [id]
    );

    return rows[0] || null;
}

async function listStores(filters) {
    const { whereClause, values } = buildStoreFilters(filters);
    const sortColumn = STORE_SORT_COLUMNS[filters.sortBy];
    const sortOrder = filters.sortOrder.toUpperCase();
    const [[countResult]] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM stores s
         ${whereClause}`,
        values
    );
    const [rows] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                owner.name AS owner_name, owner.email AS owner_email,
                AVG(r.rating) AS average_rating
         FROM stores s
         INNER JOIN users owner ON owner.id = s.owner_id
         LEFT JOIN ratings r ON r.store_id = s.id
         ${whereClause}
         GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
                  owner.name, owner.email
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...values, filters.limit, filters.offset]
    );

    return { stores: rows, total: countResult.total };
}

module.exports = {
    getDashboardStatistics,
    listUsers,
    createStore,
    listStores,
};
