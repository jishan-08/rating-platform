const mysql = require("mysql2/promise");

function getPositiveInteger(value, fallback) {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: getPositiveInteger(process.env.DB_PORT, 3306),
    database: process.env.DB_NAME || "rating_platform",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: getPositiveInteger(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: 0,
});

module.exports = pool;
