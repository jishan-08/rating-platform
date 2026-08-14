/**
 * Owner Controller
 * Handles HTTP requests for Store Owner workspace endpoints.
 */

const ownerService = require("../services/ownerService");

async function getDashboard(req, res) {
    try {
        const data = await ownerService.getDashboard(req.user.id);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Store owner dashboard query failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve store owner dashboard information",
        });
    }
}

async function getMyStore(req, res) {
    try {
        const data = await ownerService.getMyStore(req.user.id);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Store owner store profile query failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve store profile",
        });
    }
}

async function getRatings(req, res) {
    try {
        const data = await ownerService.getRatings(req.user.id);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Store owner ratings query failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve store ratings",
        });
    }
}

module.exports = {
    getDashboard,
    getMyStore,
    getRatings,
};
