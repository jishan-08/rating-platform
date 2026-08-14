const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Rating Platform API is running",
    });
});

app.get("/api/health/db", async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.execute("SELECT 1");

        return res.status(200).json({
            success: true,
            message: "Database is reachable",
        });
    } catch (error) {
        console.error("Database health check failed");

        return res.status(503).json({
            success: false,
            message: "Database is unavailable",
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = app;
